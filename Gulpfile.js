'use strict';
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    exec = require('child_process').exec,
    notify = require('gulp-notify'),
    buffer = require('vinyl-buffer'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,
// sass
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer-core'),
    sourcemaps = require('gulp-sourcemaps'),
// BrowserSync
    browserSync = require('browser-sync'),
// js
    watchify = require('watchify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
// image optimization
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
// linting
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
// svg/fonts
    sketch = require('gulp-sketch'),
    iconfont = require('gulp-iconfont'),
    consolidate = require('gulp-consolidate'),

// gulp build --production
    production = Boolean(argv.production),
// determine if we're doing a build
// and if so, bypass the livereload
    build = argv._.length ? argv._[0] === 'build' : false,
    watch = argv._.length ? argv._[0] === 'watch' : true,
// other variable
    beep, handleError;

// ----------------------------
// Error notification methods
// ----------------------------
beep = function() {
    var os = require('os'),
        file = 'gulp/error.wav';

    if (os.platform() === 'linux') {
        // linux
        exec('aplay ' + file);
    } else {
        // mac
        console.log('afplay ' + file);
        exec('afplay ' + file);
    }
};

handleError = function(task) {
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
            .pipe(postcss([autoprefixer({
                browsers: ['last 2 versions', 'opera 12.1']
            })]))
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
        // var build = argv._.length ? argv._[0] === 'build' : false;

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
            './src/js/**/*.js',
            '!./src/js/libs/*.js'
        ]).pipe(jshint('./zw.jshintrc'))
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
    symbols: function() {
        var fontName = 'zwayfont',
            template = 'fontawesome-style'; // you can also choose 'foundation-style'

        gulp.src('src/fonts/z-way-font.sketch')
            .pipe(sketch({
                export: 'artboards',
                formats: 'svg'
            }))
            .pipe(iconfont({fontName: fontName}))
            .on('codepoints', function(codepoints) {
                var options = {
                    glyphs: codepoints,
                    fontName: fontName,
                    fontPath: '../fonts/', // set path to font (from your CSS file if relative)
                    className: 's' // set class name in your CSS
                };

                gulp.src('src/fonts/templates/' + template + '.css')
                    .pipe(consolidate('lodash', options))
                    .pipe(rename({basename: fontName}))
                    .pipe(gulp.dest('build/css/')); // set path to export your CSS

                // if you don't need sample.html, remove next 4 lines
                gulp.src('src/fonts/templates/' + template + '.html')
                    .pipe(consolidate('lodash', options))
                    .pipe(rename({basename: 'sample'}))
                    .pipe(gulp.dest('build')); // set path to export your sample HTML
            })
            .on('error', handleError('SYMBOLS'))
            .pipe(gulp.dest('build/fonts')); // set path to export your fonts
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

gulp.task('reload-sass', ['sass'], browserSync.reload);
gulp.task('reload-js', ['browserify'], browserSync.reload);
gulp.task('reload-templates', ['templates'], browserSync.reload);
gulp.task('reload-sprites', ['symbols'], browserSync.reload);

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
gulp.task('symbols', tasks.symbols);

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
    gulp.watch(['./src/js/**/*.js', '!./src/js/libs/*.js', './package.json'], ['reload-js']);
    // --------------------------
    // watch:hbs
    // --------------------------
    gulp.watch(['./src/templates/**/*.hbs', './packages.json'], ['reload-js']);
    // --------------------------
    // watch:svg
    // --------------------------
    gulp.watch(['./src/assets/*.svg'], ['reload-sprites']);

    gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

// build task
gulp.task('build', [
    'clean',
    'templates',
    'optimize',
    'assets',
    'symbols',
    'sass',
    'browserify'
]);

gulp.task('default', ['watch']);

// gulp (watch) : for development and livereload
// gulp build : for a one off development build
// gulp build --production : for a minified production build