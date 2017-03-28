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
  htmlhint = require("gulp-htmlhint"),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  sassLint = require('gulp-sass-lint'),
  concat = require('gulp-concat'),
  autoprefixer = require('gulp-autoprefixer');

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
    '!gulpfile.js',
    'config/redis.js',
    'config/**/*.js',
    'test/**/*.js',
    '!gulpfile.js'
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

gulp.task('sasslint', function() {
  return gulp.src(config.src + '/styles/**/*.s+(a|c)ss')
    .pipe(sassLint({
      rules: {
        'nesting-depth': 0
      }}))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});

// Test Task !
gulp.task('test', ['eslint', 'xsslint', 'html-lint', 'sasslint'], function (cb) {
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

// // Copy JS libraries
gulp.task('libcopy', function () {
  return gulp.src([
    config.src + '/scripts/libs/purify.min.js',
    config.src + '/scripts/libs/jpurify.js',
    config.src + '/scripts/libs/formvalidation/js/formValidation.min.js',
    config.src + '/scripts/libs/formvalidation/js/framework/bootstrap4.min.js',
    config.src + '/scripts/libs/store.everything.min.js',
    config.src + 'node_modules/validator/validator.min.js',
    config.src + '/scripts/app/storage-wrapper.js',
    config.src + '/scripts/app/utils.js',
    config.src + '/scripts/app/safty-overrides.js',
  ])
  .pipe(concat('libs.js'))
  .pipe(babel({
      babelrc: false,
			presets: ['es2015']
		}))
  .pipe(gulp.dest(config.dist + '/assets/js'));
});

// Copy Custom JS
gulp.task('jscopy', function() {
  return gulp.src([
    config.src + '/scripts/app/pages/*.js',
  ])
  .pipe(newer(config.dist + '/assets/js'))
  .pipe(babel({
      babelrc: false,
			presets: ['es2015']
		}))
  .pipe(gulp.dest(config.dist + '/assets/js'));
});

/*
 * End of JS related tasks
 */

/*
 * CSS related tasks
 */

// Copy Css
gulp.task('compile-sass-and-copy', function () {
  // return gulp.src([config.src + '/styles/style.css'])
  return gulp.src(config.src + '/styles/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(newer(config.dist + '/assets/temp'))
    .pipe(gulp.dest(config.dist + '/assets/temp'));
});

// Strip comments from CSS using strip-css-comments
gulp.task('stripcss', function () {
  return gulp.src(config.dist + '/assets/temp/**/*.css')
    .pipe(stripCssComments())
    .pipe(gulp.dest(config.dist + '/assets/temp/'));
});

// Remove unnecessary css
gulp.task('csspurify', function () {
  return gulp.src(config.dist + '/assets/temp/**/*.css')
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

gulp.task('autoprefix', () =>
  gulp.src(config.dist + '/assets/css/style.css')
    .pipe(autoprefixer({
        browsers: ['last 5 versions'],
        cascade: false
    }))
    .pipe(gulp.dest(config.dist + '/assets/css'))
);

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
  return del([config.dist + '/assets/temp'], cb);
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
    'jscopy',
    // 'jscopy',

//process other assets
    'fonts',
    'images',
    'html',

// css
    'compile-sass-and-copy',
    'stripcss',
    'csspurify',
    'autoprefix',
//???
    'cleantemp',
    function () {
      console.log('Build successful!');
      done();
    }
  );
});

gulp.task('watch', ['build'], function() {
  gulp.watch('frontend/**/*', ['build']);
});

// Default task
gulp.task('default', ['watch']);
