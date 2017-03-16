/* eslint-disable */

'use strict';

require('babel-core/register');
const serverConfig = require('./server-config');

exports.config = {
  framework: 'mocha',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./frontend/test/**/*.spec.js'],
  baseUrl: 'http://localhost:' + serverConfig.PORT,
  mochaOpts: {
    reporter: 'spec',
    timeout: 300000
  },
  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': require('phantomjs-prebuilt').path,
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  }
}