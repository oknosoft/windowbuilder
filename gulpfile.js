/**
 * gulpfile.js for windowbuilder.js
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 */

var gulp = require('gulp'),
	base64 = require('gulp-base64'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	resources = require('./src/utils/resource-concat.js'),
	prebuild = require('./src/utils/prebuild.js'),
	umd = require('gulp-umd'),
	replace = require('gulp-replace'),
	package_data = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));  // данные файла package.json

module.exports = gulp;

// Cборка проекта
gulp.task('build-iface', function(){
	return gulp.src([
		'./data/prebuild.js',
		'./data/merged_wb_templates.js',
		'./src/modifiers/**/*.js',
		'./src/widgets/*.js',
		'./src/wnd_main.js',
		'./src/view_*.js'
	])
		.pipe(concat('wnd_debug.js'))
		.pipe(umd({
			exports: function(file) {
				return 'undefined';
			}
		}))
		.pipe(gulp.dest('./dist'))
		.pipe(rename('wnd_debug.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'))
		;
});

// Cборка библиотеки рисовалки
gulp.task('build-lib', function(){
	return gulp.src([
		'./src/i18n.ru.js',
		'./src/editor/*.js',
		'./src/geometry/*.js',
		'./src/tools/*.js',
		'./data/merged_wb_tips.js'
	])
		.pipe(concat('windowbuilder.js'))
		.pipe(umd({
			exports: function(file) {
				return 'Editor';
			}
		}))
		.pipe(gulp.dest('./dist'))
		.pipe(rename('windowbuilder.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist'));
});


// Сборка ресурсов рисовалки
gulp.task('injected-tips', function(){
	return gulp.src([
		'./src/templates/tip_*.html'
	])
		.pipe(resources('merged_wb_tips.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'));
});

// Сборка ресурсов интерфейса
gulp.task('injected-templates', function(){
	return gulp.src([
		'./src/templates/xml/toolbar_calc_order_production.xml',
		'./src/templates/xml/toolbar_calc_order_obj.xml',
		'./src/templates/xml/toolbar_product_list.xml',
		'./src/templates/xml/tree_*.xml',
		'./src/templates/view_*.html'
	])
		.pipe(resources('merged_wb_templates.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'));
});

// Сборка метаданных
gulp.task('injected-meta', function(){

	return gulp.src(['./src/utils/prebuild.js'])
		.pipe(prebuild(package_data))
		.pipe(gulp.dest('./data'));

});

// Сборка css
gulp.task('css-base64', function () {
	return gulp.src([
		'./src/templates/cursors/cursors.css',
		'./src/templates/buttons20.css',
		'./src/templates/baron.css',
		'./src/templates/iface.css'
	])
		.pipe(base64())
		.pipe(concat('windowbuilder.min.css'))
		.pipe(gulp.dest('./dist'));
});

