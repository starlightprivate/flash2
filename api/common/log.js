'use strict';

const through = require('through');
const winston = require('winston');

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({filename: 'server-log.log'}),
  ],
});

logger.asStream = function asStream(level) {
  return through(function (data) {
    logger.log(level, String(data));
  });
};


module.exports = logger;


// This file is never used - Anatolij
