/* global __dirname */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */


import path from 'path';

import winston from 'winston';
import express from 'express';
import bodyParser from 'body-parser';
import expressPromiseRouter from 'express-promise-router';
import expressContentLength from 'express-content-length-validator';
import expressWinston from 'express-winston';

// proper session implementation
// https://starlightgroup.atlassian.net/browse/SG-5
import expressSession from 'express-session'; // initialize sessions
import connectRedis from 'connect-redis';// store session data in redis database
import csurf from 'csurf'; // add CSRF protection https://www.npmjs.com/package/csurf
import helmet from 'helmet';
import hpp from 'hpp';

import trace from './risingStack';

import config from './server-config';
import redis from './config/redis'; // load redis client
import csp from './api/middlewares/csp'; // CSP middleware

import routes from './config/routes/v2';

// https://starlightgroup.atlassian.net/browse/SG-8
// protect /api/v2/ from session tampering
import security from './api/middlewares/security';

// Rate limiter
import rateLimiter from './api/middlewares/rateLimiter';

const app = express();
console.log('Currently Running On : ', config.ENV);
const isProtectedByCloudflare = ['production', 'staging'].indexOf(config.ENV) !== -1;

app.use(expressWinston.logger({
  transports: [
    winston,
  ],
  meta: true,
  level: 'verbose',
  expressFormat: true,
  colorize: false,
  dynamicMeta: ((req, res) => ({
    type: 'http:ok',
    buildId: config.buildId,
    env: config.ENV,
    ip: security.getIp(req),
    method: req.method,
    entryPoint: req.session ? req.session.entryPoint : null,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
    sessionId: req.session ? req.sessionID : null,
    isBot: req.session ? req.session.isBot : null,
    userAgent: req.get('User-Agent'),
    status: res.statusCode,
  })),
}));


// verify that site is requested from Cloudflare
// all other sources will get error
// https://starlightgroup.atlassian.net/projects/SG/issues/SG-35
if (isProtectedByCloudflare) {
  app.use(security.verifyThatSiteIsAccessedFromCloudflare); // ####
}

// hemlet headers - do not remove
app.use(helmet());
app.use(helmet.referrerPolicy());
app.use(helmet.frameguard({ action: 'deny' }));

app.use(csp);


app.use(helmet.hpkp({
  maxAge: 2592000, // 30 days
  sha256s: [
// new - generated here - https://report-uri.io/home/pkp_hash
    'EZpO1a5wa3q9eyxOxvTaSVciRXlm57R6fYJ2gsIbrJg=',
    'x9SZw6TwIqfmvrLZ/kz1o0Ossjmn728BnBKpUFqGNVM=',
    '58qRu/uxh4gFezqAcERupSkRYBlBAvfcw7mEjGPLnNU=',
    'lCppFqbkrlJ3EcVFAkeip0+44VaoJUymbnOaEUk7tEU=',
//old
//     'AbCdEfSeTyLBvTjEOhGD1627853=',
//     'ZyXwYuBdQsPIUVxNGRDAKGgxhJVu456='
  ],
}));


// app.use(helmet.noCache());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// this strange thing is made for reason
// it is endpoint that recieves CSP rules violation info
// from hemlet-csp middleware - see `./api/middlewares/csp.js`
// app.post('/a434819b5a5f4bfeeaa5d47c8af8ac87', (req, res) => {
//   console.log(req.body); // temporary solution - i need to verify it actually sends data
//   winston.error('error:csp', {
//     buildId: config.buildId,
//     env: config.ENV,
//     type: 'error:csp',
//     ip: security.getIp(req),
//     path: req.originalUrl,
//     userAgent: req.get('User-Agent'),
//     error: JSON.stringify(req.body, null, 2),
//   });
//   trace.incrementMetric('error/csp');
//   res.status(200).send('ok');
// });

// Protect from parameter pollution
// https://www.npmjs.com/package/hpp

app.use(hpp());

// TODO
// how do we plan to serve assets using nodejs,
// if there is 9 kbytes limit on returned data? - Anatolij
// Or, i'm not sure what does this middleware do....
const MAX_CONTENT_LENGTH_ACCEPTED = 9999;
app.use(expressContentLength.validateMax({
  max: MAX_CONTENT_LENGTH_ACCEPTED,
  status: 400,
  message: 'stop max size for the content-length!',
})); // max size accepted for the content-length


// https://starlightgroup.atlassian.net/browse/SG-5
// secure cookie based sessions being stored in redis
// setup redis powered sessions
// https://github.com/vodolaz095/hunt/blob/master/lib/http/expressApp.js#L236-L244
const RedisSessionStore = connectRedis(expressSession);
if (isProtectedByCloudflare) {
  app.enable('trust proxy'); // http://expressjs.com/en/4x/api.html#trust.proxy.options.table
}

app.use(expressSession({
  key: 'PHPSESSID',
  // LOL, let they waste some time hacking in assumption
  // this as PHP application, at least it will be detected by Cloudfare :-)
  store: new RedisSessionStore({
    prefix: 'starlight_session_',
    client: redis,
  }),
  expireAfterSeconds: 3 * 60 * 60, // session is valid for 3 hours
  secret: config.secret,
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  cookie: { // http://stackoverflow.com/a/14570856/1885921
    secure: isProtectedByCloudflare, //https://github.com/expressjs/session#cookiesecure
  },
}));
// end of SG-5


// allow sessions and stuff to work with cookies disabled
// https://gist.github.com/j-mcnally/1155365

app.use((req, res, next) => {
  const sessionId = req.header('PHPSESSID'); // they will feel like %-)
  if (!sessionId) {
    return next();
  }
  return req.sessionStore.load(sessionId, (err, sess) => {
    if (err) {
      console.error('error getting session', err);
      // TODO more testing what errors can bubble up
    }
    if (sess) {
      req.session = sess; // eslint-disable-line no-param-reassign
      return next();
    }
    return req.session.regenerate(next);
  });
});


// protect from tampering session - basic example
// it saves IP and entry point into session.
// if IP changes, it is likely to be bot or somebody using tor
// if entryPoint is the api endpoint being called now, it is likely to be bot
// UPD this middleware only saves data, it do not punish bots yet)
// https://starlightgroup.atlassian.net/browse/SG-5
// https://starlightgroup.atlassian.net/browse/SG-8
// https://starlightgroup.atlassian.net/browse/SG-9
app.use((req, res, next) => {
  res.set('X-Powered-By', 'TacticalMastery');
  // do not expose, that it is expressJS application
  // https://www.npmjs.com/package/express-session#reqsessionid-1
  if (req.session) {
    res.set('PHPSESSID', req.sessionID);
    if (!req.session.ip) {
      req.session.ip = security.getIp(req); // eslint-disable-line no-param-reassign
    }
    if (!req.session.entryPoint) {
      // http://expressjs.com/en/api.html#req.originalUrl
      req.session.entryPoint = req.originalUrl; // eslint-disable-line no-param-reassign
    }
    if (!req.session.userAgent) {
      req.session.userAgent = req.get('User-Agent'); // eslint-disable-line no-param-reassign
    }
  }
  return next();
});

// please, it have to be false, do not touch it --Anatolij
app.use(csurf({ cookie: false }));


// CSRF protection middleware with cookies
// provide CSRF token in Anatolij's way - it works with angular 1.x from the box
// https://starlightgroup.atlassian.net/browse/SG-14
app.use((req, res, next) => {
  // if (req.originalUrl === '/robots.txt' || req.originalUrl.indexOf('/api/v2/') === 0) {
  if (req.session) {
    const token = req.csrfToken();
    res.locals.csrf = token; // eslint-disable-line no-param-reassign
    res.cookie('XSRF-TOKEN', token, { secure: isProtectedByCloudflare });
    res.set('XSRF-TOKEN', token);
  }
  // }
  next();
});
// END of SG-14


// https://starlightgroup.atlassian.net/browse/SG-8
// secure /api/ from access by bots
// for additional info see function `sessionTamperingProtectionMiddleware` above
if (isProtectedByCloudflare) {
  app.use('/api', security.punishForChangingIP);
}
app.use('/api', security.punishForChangingUserAgent);
app.use('/api', security.punishForEnteringSiteFromBadLocation);

app.use('/api', rateLimiter);

// route with appropriate version prefix
Object.keys(routes).forEach((r) => {
  const router = expressPromiseRouter();
  // pass promise route to route assigner
  routes[r](router);
  app.use(`/api/${r}`, router);
});

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: (config.ENV === 'development') ? -1 : 31557600,
}));
app.use('/tacticalsales/', express.static(path.join(__dirname, 'public'), {
  maxAge: (config.ENV === 'development') ? -1 : 31557600,
}));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    if (config.ENV === 'development') {
      res.set('X-PUNISHED_BY', 'CSRF');
    }
    return res.status(403).send('Invalid API Key');
  }
  winston.error('expressjs error : %s', err.message, {
    buildId: config.buildId,
    type: 'http:error',
    env: config.ENV,
    ip: security.getIp(req),
    method: req.method,
    entryPoint: req.session ? req.session.entryPoint : null,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
    isBot: req.session ? req.session.isBot : null,
    sessionId: req.session ? req.sessionID : null,
    userAgent: req.get('User-Agent'),
    code: err.code,
    message: err.message,
    status: err.status,
  });
  trace.incrementMetric('error/express');
  return res
    .status(500)
    .send('server error');
});

module.exports = app;
