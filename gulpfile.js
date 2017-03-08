'use strict';

/*eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

let _ = require('lodash'),
  path = require('path'),
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  cleanCSS = require('gulp-clean-css'),
  del = require('del'),
  size = require('gulp-size'),
  purify = require('gulp-purifycss'),
  newer = require('gulp-newer'),
  runSequence = require('run-sequence'),
  glob        = require('glob'),
  XSSLint     = require("xsslint"),
  debug = require('gulp-debug'),
  stripCssComments = require('gulp-strip-css-comments'),
  htmlhint = require("gulp-htmlhint");

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
    config.src + '/scripts/app/**/*.js',
    'api/**/*.js',
    '*.js',
    'config/redis.js',
    'config/**/*.js',
    'test/**/*.js'
  ])
    .pipe(debug({title: 'Eslint this file:'}))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()); //TODO - it have to fail on errors, not report only
});

gulp.task('html-lint', function () {
  gulp.src('frontend/html/**/*.html')
      .pipe(htmlhint('.htmlhintrc'))
      .pipe(htmlhint.reporter())
      .pipe(htmlhint.failReporter());
});

// XSSLint - Find potential XSS vulnerabilities
gulp.task('xsslint', function() {
  var files = glob.sync(config.src + '/scripts/app/**/*.js');
  files.forEach(function(file) {
    var warnings = XSSLint.run(file);
    warnings.forEach(function(warning) {
      if (warning.method != '+' && warning.method != 'html()')
        console.error(file + ":" + warning.line + ": possibly XSS-able `" + warning.method + "` call");
    });
  });
});

// Test Task !
gulp.task('test', ['eslint', 'xsslint', 'html-lint'], function (cb) {
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
