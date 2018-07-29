require('dotenv').load();

var gulp = require('gulp');
var babel = require('gulp-babel');
var webpack = require('gulp-webpack');
var nodemon = require('nodemon');
var dotenv = require('dotenv');

gulp.task('js', function() {

    console.log('Rebuilding JS...');

    gulp.src('app/client/src/*.js')
        .pipe(webpack({
            module: {
                loaders: [{
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

        /*
        .pipe(babel({
            loader: ['babel-loader'],
            plugins: ['transform-runtime'],
            presets: ['es2015', 'env']
        }))
        .pipe(gulp.dest('app/client/src'))*/
});

gulp.task('watch', ['js'], function() {
    gulp.watch('app/client/src/*.js', ['js']);
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