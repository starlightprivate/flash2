require('babel-register');
require('@risingstack/trace');

/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

const http = require('http');
const config = require('./server-config.js');
const app = require('./app.js');

process.title = 'myserver';
process.on('SIGINT', () => {
  process.exit();
});

http
  .createServer(app)
  .listen(config.PORT, config.HOST, (error) => {
    if (error) {
      throw error;
    }
    console.log('HTTP Server Started at %s:%s', config.HOST, config.PORT);
  });
