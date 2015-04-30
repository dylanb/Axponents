var gulp = require('gulp');
var gulpTraceur = require('gulp-traceur');
var through2 = require('through2');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var copy = require('gulp-copy');

var log = function () {
    return through2.obj(
        function (file, encoding, cb) {
        	console.log(file.path);
        	// for (var att in file) {
        	// 	console.log('attribute: ', att);
        	// }
            this.push(file);
            cb();
        }, function (cb) {
            cb();
        });
};

gulp.task('compile',function() {
  return gulp.src("./*.es6.js")
  	.pipe(sourcemaps.init())
    .pipe(gulpTraceur({
		sourceMaps: true,
		outputLanguage: 'es5',
		annotations: true, // parse annotations
		types: true, // parse types
		script: false, // parse as a module
		memberVariables: true, // parse class fields
		modules: 'instantiate'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
	return gulp.src(['*.html', '*.css'])
		.pipe(copy('dist'));
});

gulp.task('watch', function () {
    gulp.watch(['*.html', '*.css', './*.es6.js'], ['compile', 'copy']);
});


gulp.task('default', ['compile', 'copy', 'watch']);
