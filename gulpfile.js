var gulp = require('gulp');
var nodemon = require('nodemon');
var dotenv = require('dotenv');

// Restart server upon detecting change
gulp.task('server', function() {
    nodemon({
        script: 'app.js',
        env: { 'NODE_ENV': process.env.NODE_ENV || 'DEV'},
        watch: [
            'app/server'
        ]
    });
});