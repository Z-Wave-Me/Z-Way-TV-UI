'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var exec = require('child_process').exec;
var svgSprite = require('gulp-svg-sprites');

var notify = require('gulp-notify');

var buffer = require('vinyl-buffer');
var argv = require('yargs').argv;
// sass
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var sourcemaps = require('gulp-sourcemaps');
// BrowserSync
var browserSync = require('browser-sync');
// js
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
// image optimization
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
// linting
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
// testing/mocha
var mocha = require('gulp-mocha');

// gulp build --production
var production = !!argv.production;
// determine if we're doing a build
// and if so, bypass the livereload
var build = argv._.length ? argv._[0] === 'build' : false;
var watch = argv._.length ? argv._[0] === 'watch' : true;

// ----------------------------
// Error notification methods
// ----------------------------
var beep = function() {
    var os = require('os');
    var file = 'gulp/error.wav';
    if (os.platform() === 'linux') {
        // linux
        exec("aplay " + file);
    } else {
        // mac
        console.log("afplay " + file);
        exec("afplay " + file);
    }
};
var handleError = function(task) {
    return function(err) {
        beep();

        notify.onError({
            message: task + ' failed, check the logs..',
            sound: false
        })(err);

        gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
    };
};
// --------------------------
// CUSTOM TASK METHODS
// --------------------------
var tasks = {
    // --------------------------
    // Delete build folder
    // --------------------------
    clean: function(cb) {
        del(['build/'], cb);
    },
    // --------------------------
    // Copy static assets
    // --------------------------
    assets: function() {
        return gulp.src('./src/assets/**/*')
            .pipe(gulp.dest('build/assets/'));
    },
    // --------------------------
    // HTML
    // --------------------------
    // html templates (when using the connect server)
    templates: function() {
        gulp.src('templates/*.html')
            .pipe(gulp.dest('build/'));
    },
    // --------------------------
    // SASS (libsass)
    // --------------------------
    sass: function() {
        return gulp.src(['./src/scss/**/*.scss', './src/scss/*.scss'])
            // sourcemaps + sass + error handling
            .pipe(gulpif(!production, sourcemaps.init()))
            .pipe(sass({
                sourceComments: !production,
                outputStyle: production ? 'compressed' : 'nested'
            }))
            .on('error', handleError('SASS'))
            // generate .maps
            .pipe(gulpif(!production, sourcemaps.write({
                'includeContent': false,
                'sourceRoot': '.'
            })))
            // autoprefixer
            .pipe(gulpif(!production, sourcemaps.init({
                'loadMaps': true
            })))
            .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
            // we don't serve the source files
            // so include scss content inside the sourcemaps
            .pipe(sourcemaps.write({
                'includeContent': true
            }))
            .pipe(concat('styles.css'))
            // write sourcemaps to a specific directory
            // give it a file and save
            .pipe(gulp.dest('build/css'));
    },
    // --------------------------
    // Browserify
    // --------------------------
    browserify: function() {
        var bundler = browserify([
            './src/js/app.js'
        ], {
            debug: !production,
            cache: {},
            require: ['jquery', 'lodash']
        })
            .require('lodash')
            .require('jquery');
        // determine if we're doing a build
        // and if so, bypass the livereload
        var build = argv._.length ? argv._[0] === 'build' : false;
        if (watch) {
            bundler = watchify(bundler);
        }
        var rebundle = function() {
            return bundler
                .bundle()
                .on('error', handleError('Browserify'))
                .pipe(source('build.js'))
                .pipe(gulpif(production, buffer()))
                .pipe(gulpif(production, uglify()))
                .pipe(gulp.dest('build/js/'));
        };
        bundler.on('update', rebundle);
        return rebundle();
    },
    // --------------------------
    // linting
    // --------------------------
    lintjs: function() {
        return gulp.src([
            'gulpfile.js',
            './src/js/app.js',
            './src/js/**/*.js'
        ]).pipe(jshint())
            .pipe(jshint.reporter(stylish))
            .on('error', function() {
                beep();
            });
    },
    // --------------------------
    // Optimize asset images
    // --------------------------
    optimize: function() {
        return gulp.src('./src/assets/**/*.{gif,jpg,png,svg}')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{removeViewBox: false}],
                // png optimization
                optimizationLevel: production ? 3 : 1
            }))
            .pipe(gulp.dest('./src/assets/'));
    },
    // --------------------------
    // Testing with mocha
    // --------------------------
    test: function() {
        return gulp.src('./__test__/**/*.js', {read: false})
            .pipe(mocha({
                'ui': 'bdd',
                'reporter': 'spec'
            })
        );
    },
    // --------------------------
    // Generate font icon from svg
    //
    sprites: function() {
        {
            return gulp.src('./src/assets/svg/*.svg')
                .pipe(svgSprite())
                .pipe(gulp.dest('build'));
        }
    }
};

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './'
        },
        port: process.env.PORT || 3000
    });
});

gulp.task('reload-sass', ['sass'], function() {
    browserSync.reload();
});
gulp.task('reload-js', ['browserify'], function() {
    browserSync.reload();
});
gulp.task('reload-templates', ['templates'], function() {
    browserSync.reload();
});
gulp.task('reload-sprites', ['sprites'], function() {
    browserSync.reload();
});

// --------------------------
// CUSTOMS TASKS
// --------------------------
gulp.task('clean', tasks.clean);
// for production we require the clean method on every individual task
var req = build ? ['clean'] : [];
// individual tasks
gulp.task('templates', req, tasks.templates);
gulp.task('assets', req, tasks.assets);
gulp.task('sass', req, tasks.sass);
gulp.task('browserify', req, tasks.browserify);
gulp.task('lint:js', tasks.lintjs);
gulp.task('optimize', tasks.optimize);
gulp.task('test', tasks.test);
gulp.task('sprites', tasks.sprites);

// --------------------------
// DEV/WATCH TASK
// --------------------------
gulp.task('watch', ['assets', 'templates', 'sass', 'browserify', 'browser-sync'], function() {

    // --------------------------
    // watch:sass
    // --------------------------
    gulp.watch(['./src/scss/**/*.scss', './src/scss/**/**/*.scss'], ['reload-sass']);
    // --------------------------
    // watch:js
    // --------------------------
    gulp.watch(['./src/js/**/*.js', './package.json'], ['reload-js']);
    // --------------------------
    // watch:hbs
    // --------------------------
    gulp.watch(['./src/templates/**/*.hbs', './packages.json'], ['reload-js']);
    // --------------------------
    // watch:svg
    // --------------------------
    gulp.watch(['./src/assets/svg/*.svg'], ['reload-sprites']);

    gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

// build task
gulp.task('build', [
    'clean',
    'templates',
    'assets',
    'sprites',
    'sass',
    'browserify'
]);

gulp.task('default', ['watch']);

// gulp (watch) : for development and livereload
// gulp build : for a one off development build
// gulp build --production : for a minified production build