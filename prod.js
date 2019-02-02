var gulp = require('gulp');
require('./gulpfile');

console.log('Server starting...')

gulp.start('js')
gulp.start('css')

require('./app')