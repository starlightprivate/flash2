// Middleware for security
// Entry points, ip tampering, and so on
// it makes api return 403 error and sets `req.session.isBot` to true

import util from 'util';
import xss from 'xss';
import util from 'util';
import winston from 'winston';
import rangeCheck from 'range_check';
import config from './../../server-config';

import trace from './../../risingStack';

// This is first pages of site, that real users usually visits
// TODO - verify that nothing is missing
const validEntryPoints = [
  '/',
  '/index.html',
  '/checkout.html',
  '/us_headlampoffer.html',
  '/customercare.html',
  '/partner.html',
  '/press.html',
  '/privacy.html',
  '/receipt.html',
  '/terms.html',
  '/tm3.html',
  '/us_batteryoffer.html',
];


// https://www.cloudflare.com/ips/
const cloudFlareIp4Range = [
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '104.16.0.0/12',
  '108.162.192.0/18',
  '131.0.72.0/22',
  '141.101.64.0/18',
  '162.158.0.0/15',
  '172.64.0.0/13',
  '173.245.48.0/20',
  '188.114.96.0/20',
  '190.93.240.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
];

const cloudFlareIp6Range = [
  '2400:cb00::/32',
  '2405:8100::/32',
  '2405:b500::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2c0f:f248::/32',
  '2a06:98c0::/29',
];

// this middleware have to be the first!!!
// https://starlightgroup.atlassian.net/projects/SG/issues/SG-35
function verifyThatSiteIsAccessedFromCloudflare(req, res, next) {
  let rIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  rIp = xss(rIp);
// https://github.com/keverw/range_check#check-if-ip-is-within-range
  let isOk = false;
// it helped me
// http://jodies.de/ipcalc?host=103.21.244.0&mask1=22&mask2=
  cloudFlareIp4Range.map((ipRange) => {
    if (isOk) return null;
    isOk = rangeCheck.inRange(rIp, ipRange);
    return null;
  });
  if (isOk) {
    return next();
  }
// https://www.ultratools.com/tools/ipv6CIDRToRangeResult?ipAddress=2400%3Acb00%3A%3A%2F32
  cloudFlareIp6Range.map((ipRange) => {
    if (isOk) {
      return null;
    }
    isOk = rangeCheck.inRange(rIp, ipRange);
    return null;
  });
  if (isOk) {
    return next();
  }

  winston.info('[SECURITY] non cloudflare access %s', rIp, {
    method: req.method,
    ip: rIp,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
    type: 'security:nonCloudflareAccess',
    userAgent: req.headers['User-Agent'],
  });
  trace.incrementMetric('security/NonCloudflareAccess');
  return res
    .status(500)
    .end('NOT OK');
}

function getIp(req) {
// https://support.cloudflare.com/hc/en-us/articles/200170986-How-does-CloudFlare-handle-HTTP-Request-headers-
  if (config.ENV !== 'development' && req.headers['cf-connecting-ip']) {
    return xss(req.headers['cf-connecting-ip']);
  }
// http://stackoverflow.com/a/10849772/1885921
  if (req.headers['x-forwarded-for']) {
    return xss(req.headers['x-forwarded-for']);
  }
  return req.connection.remoteAddress;
}


function logBotAction(req, punishReason) {
  const ip = getIp(req);
  trace.incrementMetric(util.format('security/BotPunished/%s', punishReason));
  return winston.info('[SECURITY] bot punished %s - %s', ip, punishReason, {
    env: config.ENV,
    ip: getIp(req),
    method: req.method,
    entryPoint: req.session ? req.session.entryPoint : null,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
    userAgent: req.get('User-Agent'),
    punishedBy: punishReason,
    type: util.format('security:botPunished:%s', punishReason),
    timestamp: new Date(),
  });
}


// related issues for punishing middlewares:
// https://starlightgroup.atlassian.net/browse/SG-5
// https://starlightgroup.atlassian.net/browse/SG-8
// https://starlightgroup.atlassian.net/browse/SG-9

function punishForEnteringSiteFromBadLocation(req, res, next) {
  if (req.session) {
    if (validEntryPoints.indexOf(req.session.entryPoint) === -1) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD LOCATION');
      }
      logBotAction(req, 'BAD_LOCATION');
      req.session.isBot = true;  // eslint-disable-line no-param-reassign
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
}


function punishForChangingIP(req, res, next) {
  if (req.session) {
    const rIp = getIp(req);
    if (req.session.ip !== rIp) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD_IP');
      }
      logBotAction(req, 'BAD_IP');
      req.session.isBot = true; // eslint-disable-line no-param-reassign
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
}

function punishForChangingUserAgent(req, res, next) {
  if (req.session) {
    const ua = req.get('User-Agent');
    if (req.session.userAgent !== ua) {
      if (config.ENV !== 'production') {
        res.set('X-PUNISHEDBY', 'BAD_UA');
      }
      logBotAction(req, 'BAD_UA');
      req.session.isBot = true; // eslint-disable-line no-param-reassign
      return res.status(403).send('Invalid API Key');
    }
    return next();
  }
  return res.status(403).send('Invalid API Key');
}


export default {
  verifyThatSiteIsAccessedFromCloudflare,
  getIp,
  punishForEnteringSiteFromBadLocation,
  punishForChangingIP,
  punishForChangingUserAgent,
};
