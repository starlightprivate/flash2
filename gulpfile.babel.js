/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

import _ from 'lodash';
import path from 'path';
import gulp from 'gulp';
import babel from 'gulp-babel';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import size from 'gulp-size';
import purify from 'gulp-purifycss';
import newer from 'gulp-newer';
import runSequence from 'run-sequence';
import glob from 'glob';
import XSSLint from 'xsslint';
import debug from 'gulp-debug';
import stripCssComments from 'gulp-strip-css-comments';
import htmlhint from 'gulp-htmlhint';
import watch from 'gulp-watch'; // eslint-disable-line
import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import imagemin from 'gulp-imagemin';

const config = {
  src: 'frontend', // source directory
  dist: 'public', // destination directory
};

/*
 * Tests tasks - they are performed as part of unit tests
 */

// run eslint against frontend code
gulp.task('eslint', () => {
  // i require gulp-eslint here for reason -
  // so i can only `npm install --only=prod` and `gulp-eslint` is not installed
  const eslint = require('gulp-eslint'); // eslint-disable-line
  return gulp.src([
    `${config.src}/scripts/app/**/*.js`,
    'api/**/*.js',
    '*.js',
    'config/redis.js',
    'config/**/*.js',
    'test/**/*.js',
    'eslint/rules',
  ])
    .pipe(debug({ title: 'Eslint this file:' }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('html-lint', () => {
  gulp.src('frontend/html/**/*.html')
      .pipe(htmlhint('.htmlhintrc'))
      .pipe(htmlhint.reporter())
      .pipe(htmlhint.failReporter());
});

// XSSLint - Find potential XSS vulnerabilities
gulp.task('xsslint', () => {
  const files = glob.sync(`${config.src}/scripts/app/**/*.js`);
  files.forEach((file) => {
    const warnings = XSSLint.run(file);
    warnings.forEach((warning) => {
      if (warning.method !== '+' && warning.method !== 'html()') {
        console.error(`${file}:${warning.line}: possibly XSS-able \`${warning.method}\` call`);
      }
    });
  });
});

gulp.task('sasslint', () => gulp.src(`${config.src}/styles/**/*.s+(a|c)ss`)
    .pipe(sassLint({
      rules: {
        'nesting-depth': 0,
      } }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError()));

// Test Task !
gulp.task('test', ['eslint', 'xsslint', 'html-lint', 'sasslint'], (cb) => {
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
gulp.task('fonts', () => {
  gulp.src(_.flatten([
    `${config.src}/fonts/**/*`,
  ]))
    .pipe(newer(`${config.dist}/assets/fonts`))
    .pipe(gulp.dest(`${config.dist}/assets/fonts`));
});

// Images
gulp.task('optimize-copy-images', () => {
  gulp.src([
    `${config.src}/images/**/*`,
  ])
    .pipe(gulp.dest(`${config.dist}/assets/images`))
    .pipe(imagemin())
    .pipe(size());
});

// HTML
gulp.task('html', () => {
  gulp.src([
    `${config.src}/html/**/*.html`,
    `${config.src}/html/favicon.ico`,
  ])
    .pipe(newer(config.dist, '.html'))
    .pipe(gulp.dest(config.dist));
});

/*
 * JS related tasks
 */

// // Copy JS libraries
gulp.task('libcopy', () => {
  gulp.src([
    `${config.src}/scripts/libs/purify.min.js`,
    `${config.src}/scripts/libs/jpurify.js`,
    `${config.src}/scripts/libs/formvalidation/js/formValidation.min.js`,
    `${config.src}/scripts/libs/formvalidation/js/framework/bootstrap4.min.js`,
    `${config.src}/scripts/libs/store.everything.min.js`,
    `${config.src}/scripts/app/storage-wrapper.js`,
    `${config.src}/scripts/app/utils.js`,
    `${config.src}/scripts/app/safty-overrides.js`,
  ])
    .pipe(concat('libs.js'))
    .pipe(babel({
      babelrc: false,
      presets: ['es2015'],
    }))
    .pipe(gulp.dest(`${config.dist}/assets/js`));
});

// Copy Custom JS
gulp.task('jscopy', () => {
  gulp.src([
    `${config.src}/scripts/app/pages/*.js`,
  ])
    .pipe(newer(`${config.dist}/assets/js`))
    .pipe(babel({
      babelrc: false,
      presets: ['es2015'],
    }))
    .pipe(gulp.dest(`${config.dist}/assets/js`));
});

/*
 * End of JS related tasks
 */

/*
 * CSS related tasks
 */

// Copy Css
gulp.task('compile-sass-and-copy', () => {
  // return gulp.src([config.src + '/styles/style.css'])
  gulp.src(`${config.src}/styles/style.scss`)
    .pipe(sass().on('error', sass.logError))
    .pipe(newer(`${config.dist}/assets/temp`))
    .pipe(gulp.dest(`${config.dist}/assets/temp`));
});

// Strip comments from CSS using strip-css-comments
gulp.task('stripcss', () => {
  gulp.src(`${config.dist}/assets/temp/**/*.css`)
    .pipe(stripCssComments())
    .pipe(gulp.dest(`${config.dist}/assets/temp/`));
});

// Remove unnecessary css
gulp.task('csspurify', () => {
  gulp.src(`${config.dist}/assets/temp/**/*.css`)
    .pipe(purify([
      `${config.src}/scripts/app/config.js`,
      `${config.src}/scripts/app/utils.js`,
      `${config.src}/scripts/app/pages/*.js`,
      `${config.src}/html/*.html`,
    ]))
    .pipe(gulp.dest(`${config.dist}/assets/css`))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(`${config.dist}/assets/css`))
    .pipe(size());
});

gulp.task('autoprefix', () => {
  gulp.src(`${config.dist}/assets/css/style.css`)
    .pipe(autoprefixer({
      browsers: ['last 5 versions'],
      cascade: false,
    }))
    .pipe(gulp.dest(`${config.dist}/assets/css`));
});

/*
 * End CSS related tasks
 */


// Clean-all
gulp.task('clean-all', (cb) => { // eslint-disable-line
  return del([
    path.join(config.dist, 'assets'),
    path.join(config.dist, '*.html'),
    path.join(config.dist, '*.ico'),
  ], cb);
});

// Clean Temp Dir
gulp.task('cleantemp', (cb) => { // eslint-disable-line
  return del([`${config.dist}/assets/temp`], cb);
});

// String Validation and Sanitization
// https://www.npmjs.com/package/validator


// CSSFilter
// gulp.task('cssfilter', function() {
//   var files = glob.sync(config.src+'/scripts/app/**/*.css');
//   files.forEach(function(file) {
//     var warnings = CSSFilter.run(file);
//     warnings.forEach(function(warning) {
//       console.error(file + ':' + warning.line + ':
// possibly XSS-able `' + warning.method + '` style');
//     });
//   });
// });


// Build Task !
gulp.task('build', ['clean-all'], (done) => {
  runSequence(

// process js
    'libcopy',
    'jscopy',
    // 'jscopy',

// process other assets
    'fonts',
    'optimize-copy-images',
    'html',

// css
    'compile-sass-and-copy',
    'stripcss',
    'csspurify',
    'autoprefix',
// ???
    'cleantemp',
    () => {
      console.log('Build successful!');
      done();
    },
  );
});

gulp.task('watch', ['build'], () => {
  gulp.watch('frontend/**/*', ['build']);
});

// Default task
gulp.task('default', ['watch']);
