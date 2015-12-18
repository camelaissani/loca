'use strict';

var configdir = process.env.SELFHOSTED_CONFIG_DIR || __dirname,
    config = require(configdir + '/config'),
    gulp = require('gulp'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    gulpif = require('gulp-if'),
    gulpsync = require('gulp-sync')(gulp),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    purifyCss = require('gulp-purifycss'),
    sourcemaps = require('gulp-sourcemaps'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    bower = require('gulp-bower'),
    mocha = require('gulp-mocha'),
    nodemon = require('gulp-nodemon'),
    mongobackup = require('mongobackup');

var babelOptions = {
    presets: ['es2015']
};

var uglifyOptions = {};

var paths = {
    images:             'server/views/images/**/*',
    publicLessFile:     'server/views/less/main-public.less',
    restrictedLessFile: 'server/views/less/main-restricted.less',
    printLessFile:      'server/views/less/main-print.less',
    publicScripts:      ['public/js/*analytics.js', 'server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/website/**/*.js', 'server/views/login/**/*.js', 'server/views/signup/**/*.js'],
    restrictedScripts:  ['server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/**/_*.js', 'server/views/**/*form.js', 'server/views/**/*.js'],
    printScripts:       ['server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/printable/**/*.js'],
    htmlFiles:          ['server/views/**/*.ejs'],
    scriptsToLint:      ['*.js', 'server/**/*.js'],
    purifyCssScripts:   ['bower_components/bootstrap/js/tooltip.js', 'bower_components/bootstrap/js/popover.js', 'bower_components/bootstrap/js/carousel.js', 'bower_components/bootbox/bootbox.js'],
    testScripts:        ['test/**/*.js']
};

var watchPaths = {
    imageFiles:  ['server/views/images/**/*'],
    lessFiles:   ['server/views/less/**/*.less'],
    scriptFiles: ['server/views/**/*.js']
};

var isProd = function() {
    return process.env.NODE_ENV === 'production';
};

gulp.task('eslint', function () {
    return gulp.src(paths.scriptsToLint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('clean-images', function (cb) {
    del(['public/images/**'], cb);
});

gulp.task('clean-public-css', function (cb) {
    del(['public/css/main-public.css'], cb);
});

gulp.task('clean-restricted-css', function (cb) {
    del(['public/css/main-restricted.css'], cb);
});

gulp.task('clean-print-css', function (cb) {
    del(['public/css/main-print.css'], cb);
});

gulp.task('clean-public-scripts', function (cb) {
    del(['public/js/public.min.js'], cb);
});

gulp.task('clean-restricted-scripts', function (cb) {
    del(['public/js/restricted.min.js'], cb);
});

gulp.task('clean-print-scripts', function (cb) {
    del(['public/js/print.min.js'], cb);
});

gulp.task('publicScripts', ['clean-public-scripts'], function () {
    return gulp.src(paths.publicScripts)
          .pipe(sourcemaps.init())
          .pipe(babel(babelOptions))
          .pipe(concat('public.min.js'))
          .pipe(gulpif(isProd, uglify(uglifyOptions)))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/js'));
});

gulp.task('restrictedScripts', ['clean-restricted-scripts'], function () {
    return gulp.src(paths.restrictedScripts)
          .pipe(sourcemaps.init())
          .pipe(babel(babelOptions))
          .pipe(concat('restricted.min.js'))
          .pipe(gulpif(isProd, uglify(uglifyOptions)))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/js'));
});

gulp.task('printScripts', ['clean-print-scripts'], function () {
    return gulp.src(paths.printScripts)
          .pipe(sourcemaps.init())
          .pipe(babel(babelOptions))
          .pipe(concat('print.min.js'))
          .pipe(gulpif(isProd, uglify(uglifyOptions)))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/js'));
});

gulp.task('images', ['clean-images'], function () {
    return gulp.src(paths.images)
          .pipe(imagemin({optimizationLevel: 5}))
          .pipe(gulp.dest('public/images'));
});

gulp.task('publicLess', ['clean-public-css'], function () {
    return gulp.src(paths.publicLessFile)
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(purifyCss(paths.publicScripts.concat(paths.purifyCssScripts).concat(paths.htmlFiles)))
          .pipe(gulpif(isProd, minifyCss()))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('restrictedLess', ['clean-restricted-css'], function () {
    return gulp.src(paths.restrictedLessFile)
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(purifyCss(paths.restrictedScripts.concat(paths.purifyCssScripts).concat(paths.htmlFiles)))
          .pipe(gulpif(isProd, minifyCss()))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('printLess', ['clean-print-css'], function () {
    return gulp.src(paths.printLessFile)
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(gulpif(isProd, minifyCss()))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('watchScripts', function () {
    watch(watchPaths.scriptFiles, batch(function (events, done) {
        gulp.start('publicScripts', 'restrictedScripts', 'printScripts', done);
    })).once('exit', function () {
        process.exit();
    });
});

gulp.task('watchImageFiles', function () {
    watch(watchPaths.imageFiles, batch(function (events, done) {
        gulp.start('images', done);
    })).once('exit', function () {
        process.exit();
    });
});

gulp.task('watchLessFiles', function () {
    watch(watchPaths.lessFiles, batch(function (events, done) {
        gulp.start(['publicLess', 'restrictedLess', 'printLess'], done);
    })).once('exit', function () {
        process.exit();
    });
});

gulp.task('watch', ['watchScripts', 'watchImageFiles', 'watchLessFiles']);

gulp.task('lint', ['eslint']);

gulp.task('build', ['lint', 'images', 'publicLess', 'restrictedLess', 'printLess', 'publicScripts', 'restrictedScripts', 'printScripts']);

gulp.task('install', gulpsync.sync(['bower', 'build', 'mocha']));

gulp.task('bower', function() {
    return bower();
});

gulp.task('mocha', function () {
    return gulp.src(paths.testScripts)
        .pipe(mocha({reporter: 'nyan'}))
        .once('end', function () {
            process.exit();  // Because db connection not closed
        });
});

gulp.task('dev', ['build'], function () {
    nodemon({
        script: 'server.js',
        ext: 'ejs html js',
        env: { 'NODE_ENV': 'development' }
    }).once('exit', function () {
        process.exit();
    });
});

gulp.task('mongodump', function() {
    mongobackup.dump({
        db : config.database,
        out : './bkp/'
    });
});

gulp.task('mongorestore', function() {
    mongobackup.restore({
        drop : true,
        path : './bkp/' + config.database
    });
});

gulp.task('default', ['build']);
