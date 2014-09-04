var gulp = require('gulp');

var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var ngAnnotate = require('gulp-ng-annotate');

gulp.task('usemin', function() {
  gulp.src('./*.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat'],
      html: [minifyHtml({empty: true})],
      js: [ngAnnotate(), uglify(), rev()]
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('copy', function() {
  gulp.src('./partials/*')
    .pipe(gulp.dest('./build/partials'));

  gulp.src('./languages/*')
    .pipe(gulp.dest('./build/languages'));

  gulp.src('./images/*')
    .pipe(gulp.dest('./build/images'));
});

gulp.start('usemin', 'copy');