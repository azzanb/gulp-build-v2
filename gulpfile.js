'use strict';

const gulp = require('gulp'),
	  uglify = require('gulp-uglify'),
	  sass = require('gulp-sass'),
	  rename = require('gulp-rename'),
	  map = require('gulp-sourcemaps'),
	  useref = require('gulp-useref'),
	  iff = require('gulp-if'),
	  csso = require('gulp-csso'),
	  cache = require('gulp-cache'),
	  imagemin = require('gulp-imagemin'),
	  runSequence = require('run-sequence'),
	  browserSync = require('browser-sync'),
	  connect = require('gulp-connect'),
	  del = require('del');

/*

1) htmlStyles compiles all sass/scss files to css
2) htmlScripts concatenates and minifies css and js files
3) styles creates a css map
4) scripts creates a js map

*/


gulp.task('htmlStyles', () => {
	return gulp.src('sass/global.scss')  		    
			.pipe(sass())
			.pipe(gulp.dest('dist/css'));
});


gulp.task('styles', ['htmlStyles'], () => {
	return gulp.src('dist/css/*.css')
		.pipe(csso())
		.pipe(map.init())
		.pipe(rename('all.min.css'))
		.pipe(map.write('./'))
		.pipe(gulp.dest('dist/styles'));
});

gulp.task('htmlScripts', () => {
	return gulp.src('js/**/*.js')
			.pipe(map.init())					
			.pipe(rename('all.min.js')) 
			.pipe(map.write('./'))
			.pipe(gulp.dest('dist/scripts'));
});

gulp.task('scripts', ['htmlScripts'], () => {
	return gulp.src('index.html')
		.pipe(useref())	
		.pipe((iff('*.js', uglify()))) 
		.pipe(gulp.dest('dist'));
});
gulp.task('images', () => {
	return gulp.src('images/*.+(png|jpg)')
		.pipe(cache(imagemin()))			//Can be run WHENEVER 
		.pipe(gulp.dest('dist/content'))
});

gulp.task('clean', () => {
	return del.sync(['dist', 'css']);			//Clean up
});


gulp.task('build', (callback) => {
	runSequence('clean', 'styles', ['scripts', 'images'], callback);	//Create build
	gulp.src('icons/**/*').pipe(gulp.dest('dist/icons'));
});

gulp.task('connect', () => {					//Connect to server
	return connect.server({ port: 3000 });
});

gulp.task('watch', () => {						//Watch .scss file changes
	gulp.watch('sass/**/*.scss', ['styles'])
});

gulp.task('sync', ['watch'], () => {			//If changes, show them on the web
	browserSync.init({
		server: {
			baseDir: './'
		},
  	}); 
});

gulp.task('default', (callback) => {						//Run 'gulp'
	runSequence('build', 'connect', 'sync', callback);
});

