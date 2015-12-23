/**
 * gulpfile.js for metastore.js
 *
 * Created 12.12.2015<br />
 * @author  Evgeniy Malyarov
 */

var gulp = require('gulp');
module.exports = gulp;
//var changed = require('gulp-changed');
//var concat = require('gulp-concat-sourcemap');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
//var shell = require('gulp-shell');
var rename = require('gulp-rename');
var resources = require('./lib/gulp-resource-concat.js');
var path = require('path');
var umd = require('gulp-umd');

// Сборка ресурсов
gulp.task('injected-tooltips', function(){
	gulp.src([
		'./src/tooltips/*.html'
	])
		.pipe(resources('merged_wb_tooltips.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'));
});

// Сборка ресурсов
gulp.task('injected-create-tables', function(){
	gulp.src([
		'./data/create_tables.sql'
	])
		.pipe(resources('merged_wb_create_tables.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'));
});

// Cборка библиотеки рисовалки
gulp.task('windowbuilder', function(){
	gulp.src([
			'./src/settings.js',
			'./src/element.js',
			'./src/scheme.js',
			'./src/contour.js',
			'./src/profile.js',
			'./src/filling.js',
			'./src/sectional.js',
			'./src/freetext.js',
			'./src/tool_arc.js',
			'./src/tool_lay_impost.js',
			'./src/tool_pan.js',
			'./src/tool_pen.js',
			'./src/tool_ruler.js',
			'./src/tool_select_elm.js',
			'./src/tool_select_node.js',
			'./src/tool_text.js',
			'./src/editor.js',
			'./src/main.js',
			'./data/merged_wb_tooltips.js'
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
gulp.task('debug', function(){
	gulp.src([
		'./src/modifiers/*.js',
		'./data/merged_wb_create_tables.js',
		'./src/wnd_paper.js',
	])
		.pipe(concat('wnd_debug.js'))
		.pipe(umd({
			exports: function(file) {
				return 'undefined';
			}
		}))
		.pipe(gulp.dest('./dist'))
		//.pipe(rename('wnd_debug.min.js'))
		//.pipe(uglify())
		//.pipe(gulp.dest('./dist'))
	;
});


var toRun = ['injected-tooltips', 'windowbuilder'];

// Главная задача
gulp.task('default', toRun, function(){});