'use strict';

/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

let _ = require('lodash'),
  path = require('path'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  // sass = require('gulp-sass'),
  cleanCSS = require('gulp-clean-css'),
  // uglify = require('gulp-uglify'),
  // rename = require('gulp-rename'),
  del = require('del'),
  // concat = require('gulp-concat'),
  // cache = require('gulp-cache'),
  size = require('gulp-size'),
  // plumber = require('gulp-plumber'),
  purify = require('gulp-purifycss'),
  newer = require('gulp-newer'),
  runSequence = require('run-sequence'),
  // CSSfilter = require('cssfilter'),
  // validator = require('validator'),
  // safe = require('safe-regex'),
  debug = require('gulp-debug'),
  stripCssComments = require('gulp-strip-css-comments');

const config = {
  src: 'frontend', // source directory
  dist: 'public', // destination directory
};

/*
 * Tests tasks - they are performed as part of unit tests
 */

//run eslint against frontend code
gulp.task('eslint', function () {
  //i require gulp-eslint here for reason - so i can only `npm install --only=prod` and `gulp-eslint` is not installed
  const eslint = require('gulp-eslint');
  return gulp.src([
    config.src + '/scripts/app/pages/*.js',
    config.src + '/scripts/app/utils.js',
    config.src + '/scripts/app/storage-wrapper.js'
  ])
    .pipe(debug({title: 'Eslint this file:'}))
    .pipe(eslint({ //this is CUSTOM eslint rules for frontend code - `.eslintrc.js` is ignored for now!
      'root': true, //http://eslint.org/docs/user-guide/configuring#using-configuration-files
      'extends': 'airbnb-base',
      'plugins': [
        'import'
      ],
      'rules': {
        'no-undef': 'off',
        'no-console': 1,
        'no-evil-regex-rule': 1,
      },
      rulePaths: ['./eslint-rules'],
      envs: ['browser']
    }))
    .pipe(eslint.format());
//    .pipe(eslint.failAfterError()); //TODO - it have to fail on errors, not report only
});

//run html lint agaist frontend code
gulp.task('html-lint', function () {
  //i require gulp-html-lint here for reason - so i can only `npm install --only=prod` and it is not installed
  //because it is development dependency, required for tests only
  const htmlLint = require('gulp-html-lint');
  return gulp
    .src([config.src + '/html/*.html'])
    .pipe(debug({title: 'HTML linting this file:'}))
    .pipe(htmlLint()) //TODO - implement options - https://www.npmjs.com/package/gulp-html-lint#options
    .pipe(htmlLint.format());
  // .pipe(htmlLint.failOnError());  //TODO - it have to fail on errors, not report only
});

// Test Task !
gulp.task('test', ['eslint', 'html-lint'], function (cb) {
  console.log('Test finished!');
  process.nextTick(cb);
});

/*
 * End of tests tasks
 */

/*
 * Build tasks
 */

// Fonts
gulp.task('fonts', function () {
  return gulp.src(_.flatten([config.src + '/fonts/**/*']))
    .pipe(newer(config.dist + '/assets/fonts'))
    .pipe(gulp.dest(config.dist + '/assets/fonts'));
});

// Images
gulp.task('images', function () {
  return gulp.src([config.src + '/images/**/*'])
    .pipe(gulp.dest(config.dist + '/assets/images'))
    .pipe(size());
});

// HTML
gulp.task('html', function () {
  return gulp.src([config.src + '/html/**/*.html', config.src + '/html/favicon.ico'])
    .pipe(newer(config.dist, '.html'))
    .pipe(gulp.dest(config.dist));
});



/*
 * JS related tasks
 */

// Copy JS libraries
gulp.task('libcopy', function () {
  return gulp.src([config.src + '/scripts/libs/**/*'], {base: config.src + '/scripts/libs'})
    .pipe(newer(config.dist + '/assets/libs'))
    .pipe(gulp.dest(config.dist + '/assets/libs'));
});

//copy validator library???
gulp.task('jscopy', function () {
  return gulp.src([
    'node_modules/validator/validator.min.js'
  ])
    .pipe(newer(config.dist + '/assets/js'))
    .pipe(gulp.dest(config.dist + '/assets/js'));
});


// Copy Custom JS
gulp.task('transpile-and-jscopy', function() {
  return gulp.src([
    config.src + '/scripts/app/pages/*.js',
    config.src + '/scripts/app/config.js' ,
    config.src + '/scripts/app/utils.js' ,
    config.src + '/scripts/app/storage-wrapper.js' ,
    config.src + '/scripts/app/safty-overrides.js' ,
    config.src + '/scripts/libs/xss.js' ,
    config.src + '/scripts/vendor/addclear.js',
    config.src + '/scripts/vendor/xss.js',
  ])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(newer(config.dist + '/assets/js'))
    .pipe(gulp.dest(config.dist + '/assets/js'));
});

/*
 * End of JS related tasks
 */

/*
 * CSS related tasks
 */

// Copy Css
gulp.task('csscopy', function () {
  return gulp.src([config.src + '/styles/style.css'])
    .pipe(newer(config.dist + '/assets/temp'))
    .pipe(gulp.dest(config.dist + '/assets/temp'));
});

// Strip comments from CSS using strip-css-comments
gulp.task('stripcss', function () {
  return gulp.src(config.dist + '/assets/temp/style.css')
    .pipe(stripCssComments())
    .pipe(gulp.dest(config.dist + '/assets/temp/'));
});

// Remove unnecessary css
gulp.task('csspurify', function () {
  return gulp.src(config.dist + '/assets/temp/style.css')
    .pipe(purify([
      config.src + '/scripts/app/config.js',
      config.src + '/scripts/app/utils.js',
      config.src + '/scripts/app/pages/*.js',
      config.src + '/html/*.html'
    ]))
    .pipe(gulp.dest(config.dist + '/assets/css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(config.dist + '/assets/css'))
    .pipe(size());
});

/*
 * End CSS related tasks
 */


// Clean-all
gulp.task('clean-all', function (cb) {
  return del([
    path.join(config.dist,'assets'),
    path.join(config.dist,'*.html'),
    path.join(config.dist,'*.ico'),
  ], cb);
});

// Clean Temp Dir
gulp.task('cleantemp', function (cb) {
  del([config.dist + '/assets/temp'], cb);
});

// String Validation and Sanitization
// https://www.npmjs.com/package/validator


// CSSFilter
// gulp.task('cssfilter', function() {
//   var files = glob.sync(config.src+'/scripts/app/**/*.css');
//   files.forEach(function(file) {
//     var warnings = CSSFilter.run(file);
//     warnings.forEach(function(warning) {
//       console.error(file + ':' + warning.line + ': possibly XSS-able `' + warning.method + '` style');
//     });
//   });
// });

// Build Task !
gulp.task('build', ['clean-all'], function (done) {
  runSequence(
    // 'jshint', //this all is called in `test` task
    // 'xsslint',

//process js
    'libcopy',
    'transpile-and-jscopy',
    'jscopy',

//process other assets
    'fonts',
    'images',
    'html',

// css
    'csscopy',
    'stripcss',
    'csspurify',
//???
    'cleantemp',
    function () {
      console.log('Build successful!');
      done();
    }
  );
});

// Default task
gulp.task('default', ['build']);
