/* eslint-disable */

'use strict';

require('babel-core/register');
const serverConfig = require('./server-config');

exports.config = {
  framework: 'mocha',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./frontend/test/**/*.spec.js'],
  baseUrl: 'http://' + serverConfig.HOST + ':' + serverConfig.PORT,
  mochaOpts: {
    reporter: 'spec',
    timeout: 300000
  }
}