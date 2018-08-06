require('dotenv').load();

const gulp = require('gulp');
const babel = require('gulp-babel');
const webpack = require('gulp-webpack');
const nodemon = require('nodemon');
const dotenv = require('dotenv');
const WebpackConfig = require('./webpack.config');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-minify-css')

gulp.task('css', function() {
    console.log('Rebuilding CSS...');

    gulp.src(['app/client/css/*.css'])
        .pipe(minifyCss())
        .pipe(gulp.dest('app/client/dist'))

    console.log('CSS built!')
});

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

gulp.task('watch', ['js', 'css'], function() {
    gulp.watch(['app/client/src/*.js', 'app/client/components/*.vue'], ['js']);
    gulp.watch(['app/client/css/*.css'], ['css']);
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