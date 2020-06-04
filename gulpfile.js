const { src, dest, parallel, series, gulp, watch } = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const mode =  require('gulp-mode')({
  modes: ['prod', 'dev'],
  default: 'dev',
  verbose: false
});

// Define paths

var paths = {
  base: {
    base:  './',
    node:  './node_modules'
  },
  dist: {
    base:  './public',
    css:   './public/css'
  },
  src: {
    base:  './src',
		sass:  './src/sass/**/*.scss',
		js:    './public/**/*.js',
		html:  './public/**/*.html'
  }
}


// CSS

function css() {
	return src(paths.src.sass)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: "expanded"}).on('error', sass.logError))
		.pipe(autoprefixer())
    .pipe(mode.prod(dest(paths.dist.css, { sourcemaps: false })))
    .pipe(mode.dev(dest(paths.dist.css, { sourcemaps: true })))
    .pipe(browserSync.stream())
}


// Watch files

function watchTask() {
  browserSync.init({
		proxy: 'localhost:3000',
		port: 3000
  });
  watch([paths.src.html, paths.src.sass, paths.src.js], parallel(css)).on('change', browserSync.reload)
}

exports.default = series(parallel(css), watchTask);
