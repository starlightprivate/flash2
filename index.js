/* global process */
require('babel-register');
require('@risingstack/trace');

const winston = require('winston');
const http = require('http');
const os = require('os');
const config = require('./server-config.js');
const app = require('./app.js');
const Sentry = require('winston-sentry');

require('winston-loggly-bulk');

winston.cli();
if (config.ENV === 'development') {
  winston.level = 'silly';
} else {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    name: 'production-console',
    level: 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false,
  });
}

winston.add(Sentry, {
  level: 'warn',
  dsn: config.sentryDSN,
});

winston.add(winston.transports.Loggly, {
  level: 'verbose',
  token: config.loggly.token,
  subdomain: config.loggly.subdomain,
  json: true,
});

process.title = 'flash2';
process.on('SIGINT', () => {
  process.exit();
});

http
  .createServer(app)
  .listen(config.PORT, config.HOST, (error) => {
    if (error) {
      throw error;
    }
    winston.verbose('HTTP Server Started at %s:%s', config.HOST, config.PORT, {
      buildId: config.buildId,
      type: 'server:start',
      nodejs: process.version,
      arch: process.arch,
      hostname: os.hostname(),
      osType: os.type(),
      osPlatform: os.platform(),
      osRelease: os.release(),
    });
  });
