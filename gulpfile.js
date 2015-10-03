'use strict';

var gulp = require('gulp'),
    gulpsync = require('gulp-sync')(gulp),
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

var uglifyOptions = {
    //sourceMapIncludeSources: true
};

var paths = {
    images:             'client/images/**/*',
    publicLessFile:     'client/less/main-public.less',
    restrictedLessFile: 'client/less/main-restricted.less',
    printLessFile:      'client/less/main-print.less',
    publicScripts:      ['client/js/common/**/_*.js', 'client/js/common/**/*.js', 'client/js/public/**/*.js', 'bower_components/bootbox/bootbox.js'],
    restrictedScripts:  ['client/js/common/**/_*.js', 'client/js/common/**/*.js', 'bower_components/bootbox/bootbox.js', 'client/js/restricted/**/_*.js', 'client/js/restricted/lib/**/*.js', 'client/js/restricted/form/**/*.js', 'client/js/restricted/**/*.js'],
    printScripts:       ['client/js/common/**/_*.js', 'client/js/common/**/*.js', 'client/js/print/**/*.js'],
    htmlFiles:          ['server/views/**/*.ejs'],
    scriptsToLint:      ['*.js', 'client/js/**/*.js', 'server/**/*.js'],
    purifyCssScripts:   ['bower_components/bootstrap/js/tooltip.js', 'bower_components/bootstrap/js/popover.js'],
    testScripts:        ['test/**/*.js']
};

var watchPaths = {
    imageFiles :            ['client/images/**/*'],
    lessFiles :             ['client/less/**/*.less'],
    publicScriptFiles :     ['client/js/common/**/*.js', 'client/js/public/**/*.js'],
    restrictedScriptFiles : ['client/js/common/**/*.js', 'client/js/restricted/**/*.js'],
    printScriptFiles :      ['client/js/common/**/*.js', 'client/js/print/**/*.js']
};

gulp.task('eslint', function () {
    return gulp.src(paths.scriptsToLint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('clean', ['clean-images'], function (cb) {
    del(['public/css/**', 'public/js/**', 'node_modules', 'bower_components'], cb);
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
          .pipe(uglify(uglifyOptions))
          .pipe(concat('public.min.js'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/js'));
});

gulp.task('restrictedScripts', ['clean-restricted-scripts'], function () {
    return gulp.src(paths.restrictedScripts)
          .pipe(sourcemaps.init())
          .pipe(uglify(uglifyOptions))
          .pipe(concat('restricted.min.js'))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/js'));
});

gulp.task('printScripts', ['clean-print-scripts'], function () {
    return gulp.src(paths.printScripts)
          .pipe(sourcemaps.init())
          .pipe(uglify(uglifyOptions))
          .pipe(concat('print.min.js'))
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
          .pipe(minifyCss())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('restrictedLess', ['clean-restricted-css'], function () {
    return gulp.src(paths.restrictedLessFile)
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(purifyCss(paths.restrictedScripts.concat(paths.purifyCssScripts).concat(paths.htmlFiles)))
          .pipe(minifyCss())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('printLess', ['clean-print-css'], function () {
    return gulp.src(paths.printLessFile)
          .pipe(sourcemaps.init())
          .pipe(less())
          .pipe(minifyCss())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function () {
    gulp.watch(watchPaths.publicScriptFiles, ['publicScripts', 'eslint']);
    gulp.watch(watchPaths.restrictedScriptFiles, ['restrictedScripts', 'eslint']);
    gulp.watch(watchPaths.printScriptFiles, ['printScripts', 'eslint']);
    gulp.watch(watchPaths.lessFiles, ['publicLess', 'restrictedLess', 'printLess']);
    gulp.watch(watchPaths.imageFiles, ['mages']);
});

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
            process.exit();  // Because of db connection not closed
        });
});

gulp.task('dev', ['build'], function () {
    nodemon({
        script: 'server.js',
        ext: 'ejs html js',
        env: { 'NODE_ENV': 'development' }
    });
});

gulp.task('mongodump', function() {
    mongobackup.dump({
        db : 'demodb',
        out : './bkp/'
    });
});

gulp.task('mongorestore', function() {
    mongobackup.restore({
        drop : true,
        path : './bkp/demodb'
    });
});

gulp.task('default', ['build']);