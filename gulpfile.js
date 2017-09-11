'use strict';

const gulp = require('gulp'),
	  uglify = require('gulp-uglify'),
	  sass = require('gulp-sass'),
	  rename = require('gulp-rename'),
	  map = require('gulp-sourcemaps'),
	  useref = require('gulp-useref'),
	  iff = require('gulp-if'),
	  concat = require('gulp-concat'),
	  csso = require('gulp-csso'),
	  cache = require('gulp-cache'),
	  imagemin = require('gulp-imagemin'),
	  runSequence = require('run-sequence'),
	  browserSync = require('browser-sync'),
	  connect = require('gulp-connect'),
	  del = require('del');


//-----STYLES-----//
gulp.task('htmlStyles', () => {
	return gulp.src('sass/global.scss')  		    
			.pipe(sass())
			.pipe(csso())
			.pipe(gulp.dest('dist/css'));
});


gulp.task('styles', ['htmlStyles'], () => {
	return gulp.src('dist/css/*.css')
		.pipe(map.init())
		.pipe(rename('all.min.css'))
		.pipe(map.write('./'))
		.pipe(gulp.dest('dist/styles'));
});


//-----SCRIPTS-----//
gulp.task('concat', () => {
	return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'js/circle/*.js'])
			.pipe(concat('global.js'))
			.pipe(gulp.dest('js'))
});

gulp.task('scripts', ['htmlScripts'], () => {
	return gulp.src('dist/scripts/all.min.js')
		.pipe(map.init())	
		.pipe(rename('all.min.js'))		
		.pipe(map.write('./'))
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task('htmlScripts', ['concat'], () => {
	return gulp.src('index.html')
		.pipe(useref())	
		.pipe((iff('*.js', uglify()))) 
		.pipe(gulp.dest('dist'));
});


//-----IMAGES-----/
gulp.task('images', () => {
	return gulp.src('images/*.+(png|jpg)')
		.pipe(cache(imagemin()))			 
		.pipe(gulp.dest('dist/content'))
});


gulp.task('clean', () => {
	return del.sync(['dist', 'css', 'js/global.js']);			
});


//-----BUILD-----//
gulp.task('build', (callback) => {
	runSequence('clean', ['styles', 'scripts', 'images'], callback);	
	gulp.src('icons/**/*').pipe(gulp.dest('dist/icons'));
});


gulp.task('connect', () => {					
	return connect.server({ port: 3000 });
});

gulp.task('sync', () => {			
	browserSync.init({
		server: {
			baseDir: 'dist'
		}
  	}); 
});

gulp.task('watch', () => {
	gulp.watch('./sass/*.scss', browserSync.reload)
});


//-----GULP-----//
gulp.task('default', (callback) => {
	runSequence('build', 'connect', 'sync', 'watch', callback);
});

