require('dotenv').load();

var gulp = require('gulp');
var babel = require('gulp-babel');
var webpack = require('gulp-webpack');
var nodemon = require('nodemon');
var dotenv = require('dotenv');
var WebpackConfig = require('./webpack.config');
var uglify = require('gulp-uglify');

gulp.task('js', function() {

    console.log('Rebuilding JS...');

    if (process.env.NODE_ENV === 'production') {
        gulp.src(['app/client/components/*.vue', 'app/client/src/*.js'])
            .pipe(webpack(WebpackConfig))
            .pipe(uglify())
            .pipe(gulp.dest('app/client/dist'))
    } else {
        gulp.src(['app/client/components/*.vue', 'app/client/src/*.js'])
            .pipe(webpack(WebpackConfig))
            .pipe(gulp.dest('app/client/dist'))
    }

    console.log('JS built!')
});

gulp.task('watch', ['js'], function() {
    gulp.watch(['app/client/src/*.js', 'app/client/components/*.vue'], ['js']);
});

// Restart server upon detecting change
gulp.task('server', ['watch'], function() {
    nodemon({
        script: 'app.js',
        env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV'},
        watch: [
            'app/server', 'app.js'
        ]
    });
});