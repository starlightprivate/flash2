//this is eslint config file for backend
//Anatolij promise to make it compatible with frontend

module.exports = {
  // 'extends': 'eslint:recommended',
  'extends': 'airbnb-base',
  'parser': 'babel-eslint',
  'plugins': ['async-await','babel','import','no-unsafe-regex'],
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node':true
  },
  'parserOptions': {
    'sourceType': 'module'
  },
  'rules': {
    'no-undef': 2,
    'babel/new-cap': 2,
    'no-await-in-loop': 2,
    'import/extensions': ["off", "never"],
    'require-await':[
      2
    ],
    'no-plusplus': ["error", { "allowForLoopAfterthoughts": false }],
    'no-console': [
      2
    ],
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'async-await/space-after-async': 2,
    'async-await/space-after-await': 2
  },
  rulePaths: ['./eslint-rules'],
};
