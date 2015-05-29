var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber');
    
    
// run livereload
gulp.task('livereload', function() {
    tinylr = require('tiny-lr')();
    tinylr.listen(35729);
});


function notifyLiveReload(event) {
    var fileName = require('path').relative(__dirname, event.path);

    tinylr.changed({
        body: {
            files: [fileName]
        }
    });
}


// Styles gulp task
gulp.task('styles', function () {
    return (sass('./src/scss'))
        .on('error', function (err) { console.log(err.message); })
        .pipe(plumber())
        .pipe(gulp.dest('./public/gulp_derived/css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('./public/gulp_derived/css'))
        .pipe(notify({ message: 'Styles task complete' }));
});


// Scripts
gulp.task('scripts', function() {
  return gulp.src('./src/js/*.js')
    .pipe(plumber())
    .pipe(concat('client.js'))
    .pipe(gulp.dest('./public/gulp_derived/js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/gulp_derived/js'))
    .pipe(notify({ message: 'Custom Scripts task complete' }));
});


// Watch
gulp.task('watch', function() {
  gulp.watch('./src/scss/*.scss', ['styles']);
  gulp.watch('./src/js/*.js', ['scripts']);
  gulp.watch('./public/**', notifyLiveReload);
  gulp.watch('./views/**', notifyLiveReload);
});


// run express
gulp.task('express', function () {
  nodemon({ script: 'server.js'
          , ext: 'html js'
          , ignore: ['ignored.js']
          , tasks: ['lint'] })
    .on('restart', function () {
      console.log('restarted!')
    })
});

// Default task
gulp.task('default', ['express','livereload','watch'], function() {
    gulp.start('styles','scripts');
});