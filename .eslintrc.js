//this is eslint config file for backend
//Anatolij promise to make it compatible with frontend

module.exports = {
  // 'extends': 'eslint:recommended',
  'extends': 'airbnb-base',
  'parser': 'babel-eslint',
  // 'plugins': ['async-await','babel','import'],
  'plugins': ['babel','import'],
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
    'no-undef': 1,
    'babel/new-cap': 1,
    // 'babel/object-curly-spacing': 1,
    'no-await-in-loop': 1,
    // 'babel/no-invalid-this': 1,
    'require-await':[
      2
    ],
    'no-console': [
      1
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
    // 'async-await/space-after-async': 2,
    // 'async-await/space-after-await': 2
  },
  rulePaths: ['./eslint-rules'],
};
