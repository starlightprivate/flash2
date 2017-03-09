require('babel-register');
require('@risingstack/trace');

const winston = require('winston');
const http = require('http');
const config = require('./server-config.js');
const app = require('./app.js');

if (config.ENV === 'development') {
  winston.cli();
} else {
  winston.remove(winston.transports.Console);
}

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
