var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber');
    

gulp.task('styles', function () {
    return (sass('./src/scss'))
        .on('error', function (err) { console.log(err.message); })
        .pipe(plumber())
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('./css'))
        .pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./js'))
    .pipe(notify({ message: 'Custom Scripts task complete' }));
});


// Watch
gulp.task('watch', function() {
  gulp.watch('./src/scss/*.scss', ['styles']);
  gulp.watch('./src/js/*.js', ['scripts']);
});

// Default task
gulp.task('default', ['watch'], function() {
    gulp.start('styles','scripts');
});








