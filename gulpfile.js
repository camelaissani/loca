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
    cssNano = require('gulp-cssnano'),
    purifyCss = require('gulp-purifycss'),
    sourcemaps = require('gulp-sourcemaps'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    bower = require('gulp-bower'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    nodemon = require('gulp-nodemon'),
    mongobackup = require('mongobackup');

var babelOptions = {
    presets: ['es2015']
};

var uglifyOptions = {};

var paths = {
    images: 'server/views/images/**/*',
    publicLessFile: 'server/views/less/main-public.less',
    restrictedLessFile: 'server/views/less/main-restricted.less',
    printLessFile: 'server/views/less/main-print.less',
    publicScripts: ['public/js/*analytics.js', 'server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/website/**/*.js', 'server/views/login/**/*.js', 'server/views/signup/**/*.js'],
    restrictedScripts: ['server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/**/_*.js', 'server/views/**/*form.js', 'server/views/**/*.js'],
    printScripts: ['server/views/common/**/_*.js', 'server/views/common/**/*.js', 'server/views/printable/**/*.js'],
    frontendScripts: ['server/views/**/*.js'],
    backendScripts: ['server/*.js', 'server/models/**/*.js', 'server/managers/**/*.js'],
    htmlFiles: ['server/views/**/*.ejs'],
    scriptsToLint: ['*.js', 'server/**/*.js'],
    purifyCssScripts: ['bower_components/bootstrap/js/tooltip.js', 'bower_components/bootstrap/js/popover.js', 'bower_components/bootstrap/js/carousel.js', 'bower_components/bootbox/bootbox.js'],
    testScripts: ['test/**/*.js']
};

var watchPaths = {
    imageFiles: ['server/views/images/**/*'],
    lessFiles: ['server/views/**/*.less'],
    scriptFiles: ['server/views/**/*.js']
};

var isProd = function() {
    return process.env.NODE_ENV === 'production';
};

gulp.task('eslint', function() {
    return gulp.src(paths.scriptsToLint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('clean-images', function(cb) {
    del(['public/images/**'], cb);
});

gulp.task('clean-public-css', function(cb) {
    del(['public/css/main-public.css'], cb);
});

gulp.task('clean-restricted-css', function(cb) {
    del(['public/css/main-restricted.css'], cb);
});

gulp.task('clean-print-css', function(cb) {
    del(['public/css/main-print.css'], cb);
});

gulp.task('clean-public-scripts', function(cb) {
    del(['public/js/public.min.js'], cb);
});

gulp.task('clean-restricted-scripts', function(cb) {
    del(['public/js/restricted.min.js'], cb);
});

gulp.task('clean-print-scripts', function(cb) {
    del(['public/js/print.min.js'], cb);
});

gulp.task('publicScripts', ['clean-public-scripts'], function() {
    return gulp.src(paths.publicScripts)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(babel(babelOptions))
        .pipe(concat('public.min.js'))
        .pipe(gulpif(isProd, uglify(uglifyOptions)))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('restrictedScripts', ['clean-restricted-scripts'], function() {
    return gulp.src(paths.restrictedScripts)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(babel(babelOptions))
        .pipe(concat('restricted.min.js'))
        .pipe(gulpif(isProd, uglify(uglifyOptions)))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('printScripts', ['clean-print-scripts'], function() {
    return gulp.src(paths.printScripts)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(babel(babelOptions))
        .pipe(concat('print.min.js'))
        .pipe(gulpif(isProd, uglify(uglifyOptions)))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/js'));
});

gulp.task('bootboxScript', function() {
    return gulp.src(['bower_components/bootbox/bootbox.js'])
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(concat('bootbox.min.js'))
        .pipe(gulpif(isProd, uglify(uglifyOptions)))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('bower_components/bootbox'));
});

gulp.task('images', ['clean-images'], function() {
    return gulp.src(paths.images)
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest('public/images'));
});

gulp.task('publicLess', ['clean-public-css'], function() {
    return gulp.src(paths.publicLessFile)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(less())
        .pipe(purifyCss(paths.publicScripts.concat(paths.purifyCssScripts).concat(paths.htmlFiles)))
        .pipe(gulpif(isProd, cssNano()))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/css'));
});

gulp.task('restrictedLess', ['clean-restricted-css'], function() {
    return gulp.src(paths.restrictedLessFile)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(less())
        .pipe(purifyCss(paths.restrictedScripts.concat(paths.purifyCssScripts).concat(paths.htmlFiles)))
        .pipe(gulpif(isProd, cssNano()))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/css'));
});

gulp.task('printLess', ['clean-print-css'], function() {
    return gulp.src(paths.printLessFile)
        .pipe(gulpif(!isProd, sourcemaps.init()))
        .pipe(less())
        .pipe(gulpif(isProd, cssNano()))
        .pipe(gulpif(!isProd, sourcemaps.write()))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watchScriptFiles', function() {
    watch(watchPaths.scriptFiles, batch(function(events, done) {
        gulp.start('publicScripts', 'restrictedScripts', 'printScripts', done);
    }));
});

gulp.task('watchImageFiles', function() {
    watch(watchPaths.imageFiles, batch(function(events, done) {
        gulp.start('images', done);
    }));
});

gulp.task('watchLessFiles', function() {
    watch(watchPaths.lessFiles, batch(function(events, done) {
        gulp.start(['publicLess', 'restrictedLess', 'printLess'], done);
    }));
});

gulp.task('watch', ['watchScriptFiles', 'watchImageFiles', 'watchLessFiles']);

gulp.task('build', ['eslint', 'images', 'publicLess', 'restrictedLess', 'printLess', 'publicScripts', 'restrictedScripts', 'printScripts', 'bootboxScript']);

gulp.task('bower', function() {
    return bower();
});

gulp.task('test', /*['eslint'],*/ function() {
    return gulp.src(paths.backendScripts)
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(paths.testScripts)
                .pipe(mocha({
                    reporter: 'list'
                }))
                .pipe(istanbul.writeReports({
                    dir: 'unit-test-coverage',
                    reporters: ['lcov', 'text-summary'],
                    reportOpts: {
                        dir: 'unit-test-coverage'
                    }
                }));
        });
});

gulp.task('dev', ['build'], function() {
    if (!process.env.SELFHOSTED_DEMOMODE) {
        process.env.SELFHOSTED_DEMOMODE = true;
    }
    nodemon({
        script: 'server.js',
        ext: 'ejs html js json'
    });
});

gulp.task('mongodump', function() {
    mongobackup.dump({
        db: config.database,
        out: './bkp/'
    });
});

gulp.task('mongorestore', function() {
    mongobackup.restore({
        drop: true,
        path: './bkp/' + config.database
    });
});

gulp.task('default', gulpsync.sync(['bower', 'build', 'test']));

process.once('SIGINT', function() {
    process.exit();
});