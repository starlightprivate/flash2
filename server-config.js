/* global process */

import util from 'util';
// import fs from 'fs';
// import path from 'path';

// const buildIdPath = path.join(__dirname, 'public', 'buildId.txt');
// let buildId = 'unknown';
//
// if (fs.existsSync(buildIdPath)) {
//   buildId = fs.readFileSync(buildIdPath);
// }

let redisUrl = 'redis://localhost:6379/';

if (process.env.REDIS_URL) {
  redisUrl = process.env.REDIS_URL;
}

// for docker compose setup
if (process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT) {
  redisUrl = util.format('redis://%s:%s/', process.env.REDIS_PORT_6379_TCP_ADDR, process.env.REDIS_PORT_6379_TCP_PORT);
}

// for secured docker compose setup
if (
  process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT
  && process.env.REDIS_AUTH) {
  redisUrl = util.format('redis://redis:%s@%s:%s/',
    process.env.REDIS_AUTH,
    process.env.REDIS_PORT_6379_TCP_ADDR,
    process.env.REDIS_PORT_6379_TCP_PORT);
}

module.exports = {
  ENV: process.env.NODE_ENV || 'development',
// ENV can be production - live server
// ENV can be staging - testing server

  PORT: process.env.PORT || 8000,
  HOST: process.env.HOST || '0.0.0.0',

// to prevent from tampering with sessions
// related to https://starlightgroup.atlassian.net/browse/SG-5
  secret: process.env.SECRET || 'deb7cc729f0990c68f8cf6be740256be35ff23a7b1052b7ef9b3cefcf479b60b',

  autopilot: {
    key: process.env.AUTOPILOT_KEY || '7d72a72715de40668977c638c01273c8',
    clientlist: process.env.CLIENT_LIST || 'contactlist_59EA0BF8-46D0-4733-B6C5-4F2EB7C890AA',
  },
  konnective: {
// used on dev environment
    proxy: 'https://starlightproxy.herokuapp.com/',
    proxyApiKey: '28a0b53d26c78fc3519c860d58bdd367',
// used on staging and production environment.
    loginId: process.env.KONNECTIVE_LOGIN_ID || 'konnective_api_user',
    password: process.env.KONNECTIVE_PASSWORD || 'e0853de70514661cd9d2da853bf690b9', //generated on 24 march by Anatolij - not known by Kenji - have to be revoked
// NOTE THAT loginId, password have to be loaded from ENVIRONMENT
// NOT STORED IN SOURCE CODE!!!!
// --Anatolij
// can be changed on https://crm.konnektive.com/admin/users/
  },
  redis: {
    REDIS_URL: redisUrl,
  },
  leadoutpost: {
    apiKey: process.env.LEADOUTPOST_API_KEY || 'CITg0XHH3kGJQ4kkjZizRxzUEINR2nZaLRRstUyHs',
    campaignId: process.env.LEADOUTPOST_CAMPAIGN_ID || 5,
  },
  email: process.env.ADMIN_EMAIL || 'support@tacticalmastery.com',

// https://sentry.io/starlight-group/node-api/settings/keys/
  sentryDSN: process.env.SENTRY_DSN || 'https://68ae2c197a6440efac407117aec0326f:f64d954adde3493ab03f86d94815e814@sentry.io/133524',

  loggly: { // https://starlightgroup.loggly.com/tokens
    token: process.env.LOGGLY_TOKEN || '5eef4adb-a47a-4c51-af84-a9b6b41bab11',
    subdomain: process.env.LOGGLY_SUBDOMAIN || 'starlightgroup',
  },
  segmentWriteKey: process.env.SEGMENT_WRITE_KEY || '7FMBWsjMCbyWvbx4UuGCovr1SYyokQYd', // https://segment.com/docs/sources/server/node/
  buildId: 'heroku', //util.format('https://github.com/starlightgroup/flash2/commit/%s', buildId),
};
