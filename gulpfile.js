/**
 * gulpfile.js for windowbuilder.js
 *
 * Created 12.12.2015<br />
 * @author  Evgeniy Malyarov
 */

var gulp = require('gulp');
module.exports = gulp;
//var changed = require('gulp-changed');
var base64 = require('gulp-base64');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
//var shell = require('gulp-shell');
var rename = require('gulp-rename');
var resources = require('./lib/gulp-resource-concat.js');
var path = require('path');
var umd = require('gulp-umd');

// Сборка ресурсов
gulp.task('injected-tips', function(){
	gulp.src([
		'./src/templates/tip_*.html'
	])
		.pipe(resources('merged_wb_tips.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'));
});

// Сборка ресурсов
gulp.task('injected-templates', function(){
	gulp.src([
		'./data/create_tables.sql',
		'./data/toolbar_calc_order_production.xml',
		'./data/toolbar_calc_order_obj.xml',
		'./data/tree_filteres.xml',
		'./src/templates/view_*.html'
	])
		.pipe(resources('merged_wb_templates.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
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

// Cборка библиотеки рисовалки
gulp.task('build-lib', function(){
	gulp.src([
			'./src/i18n.ru.js',
			'./src/geometry/*.js',
			'./src/tools/*.js',
			'./src/editor/*.js',
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

// Cборка отладочного проекта
gulp.task('build-iface', function(){
	gulp.src([
		'./src/modifiers/*.js',
		'./data/merged_wb_templates.js',
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
