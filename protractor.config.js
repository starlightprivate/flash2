/* eslint-disable */

'use strict';

require('babel-core/register');

exports.config = {
  framework: 'mocha',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./frontend/test/**/*.spec.js'],
  mochaOpts: {
    reporter: 'spec',
    timeout: 30000
  }
}