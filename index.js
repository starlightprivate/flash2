require('babel-register');
require('@risingstack/trace');

const winston = require('winston');
const http = require('http');
const config = require('./server-config.js');
const app = require('./app.js');
const Sentry = require('winston-sentry');

require('winston-loggly-bulk');

if (config.ENV === 'development') {
  winston.cli();
  winston.level = 'silly';
} else {
  winston.remove(winston.transports.Console);
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
    winston.verbose('HTTP Server Started at %s:%s', config.HOST, config.PORT);
  });
