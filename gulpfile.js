require('dotenv').load();

var gulp = require('gulp');
var babel = require('gulp-babel');
var webpack = require('gulp-webpack');
var nodemon = require('nodemon');
var dotenv = require('dotenv');
//var VueLoaderPlugin = require('vue-loader/lib/plugin');

gulp.task('js', function() {

    console.log('Rebuilding JS...');

    gulp.src(['app/client/src/*.vue', 'app/client/src/*.js'])
        .pipe(webpack({
            module: {
                loaders: [{
                    test: /.vue$/,
                    loader: 'vue-loader',
                    query: {
                        presets: ['es2015', 'stage-0'],
                        loaders: {
                            'js': 'babel-loader'
                        }
                    }
                }, {
                    test: /.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                }]
            },
            output: {
                filename: '[name].js'
            }
        }))
        .pipe(gulp.dest('app/client/dist'))
});

gulp.task('watch', ['js'], function() {
    gulp.watch('app/client/src/*.js', ['js']);
    gulp.watch('app/client/src/*.vue', ['js']);
});

// Restart server upon detecting change
gulp.task('server', ['watch'], function() {
    nodemon({
        script: 'app.js',
        env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV'},
        watch: [
            'app/server'
        ]
    });
});