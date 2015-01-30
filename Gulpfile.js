var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

gulp.task('develop_server', function () {
    plugins.connect.server({
        root: './',
        port: 8000,
        livereload: true
    });
});