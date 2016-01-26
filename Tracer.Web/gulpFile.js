var gulp = require('gulp');
var insert = require('gulp-insert');
var sass = require('gulp-sass');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();

gulp.task('convert sass files to css', function() {
    gulp.src('styles/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('styles'));
});

gulp.task('default', function(cb) {
    runSequence(
        ['convert sass files to css'],
        cb);
});