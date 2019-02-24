/**
 * gulpfile.js for windowbuilder.js
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 */

const gulp = require('gulp'),
	base64 = require('gulp-base64'),
	concat = require('gulp-concat'),
  strip = require('gulp-strip-comments'),
	rename = require('gulp-rename'),
	resources = require('./scripts/resource-concat.js'),
	umd = require('gulp-umd'),
  wrap = require("gulp-wrap");

module.exports = gulp;

// Cборка проекта
gulp.task('build-iface', function(){
	return gulp.src([
		'./data/merged_wb_templates.js',
		'./src/modifiers/**/*.js',
		'./src/widgets/*.js',
	])
		.pipe(concat('wnd_debug.js'))
    .pipe(strip())
		.pipe(umd({
			exports: function(file) {
				return undefined;
			}
		}))
    .pipe(gulp.dest('./public/dist'))
    // .pipe(rename('wnd_debug.min.js'))
    // .pipe(uglify())
    // .pipe(gulp.dest('./dist'))
});

// Cборка библиотеки для использования снаружи
gulp.task('build-drawer', function () {
  return gulp.src([
    './src/editor/consts.js',
    './src/editor/editor_base.js',
    './src/geometry/*.js',
    './src/modifiers/common/*.js',
    './src/modifiers/enums/*.js',
    './src/modifiers/catalogs/cat_characteristics.js',
    './src/modifiers/catalogs/cat_clrs.js',
    './src/modifiers/catalogs/cat_cnns.js',
    './src/modifiers/catalogs/cat_contracts.js',
    //'./src/modifiers/catalogs/cat_divisions.js',
    './src/modifiers/catalogs/cat_elm_visualization.js',
    './src/modifiers/catalogs/cat_furns.js',
    './src/modifiers/catalogs/cat_insert_bind.js',
    './src/modifiers/catalogs/cat_inserts.js',
    './src/modifiers/catalogs/cat_nom.js',
    './src/modifiers/catalogs/cat_partners.js',
    './src/modifiers/catalogs/cat_production_params.js',
    './src/modifiers/documents/doc_calc_order.js',
    './src/modifiers/documents/doc_calc_order_templates.js',
  ])
    .pipe(concat('drawer.js'))
    .pipe(strip())
    .pipe(umd({
      // exports: function (file) {
      //   return 'EditorInvisible';
      // },
      templateSource: 'module.exports = function({$p, paper}) {<%= contents %> \nreturn EditorInvisible;\n}',
    }))
    .pipe(gulp.dest('./public/dist'));
});

// Cборка библиотеки рисовалки
gulp.task('build-lib', function(){
	return gulp.src([
		'./src/editor/*.js',
    './src/geometry/*.js',
		'./src/tools/*.js',
		'./data/merged_wb_tips.js'
	])
		.pipe(concat('windowbuilder.js'))
    .pipe(strip())
		.pipe(umd({
			exports: function(file) {
				return 'Editor';
			}
		}))
		.pipe(gulp.dest('./public/dist'))
    // .pipe(rename('windowbuilder.min.js'))
    // .pipe(uglify())
    // .pipe(gulp.dest('./dist'))

});


// Сборка ресурсов рисовалки
gulp.task('injected-tips', function(){
	return gulp.src([
		'./src/templates/tip_*.html'
	])
		.pipe(resources('merged_wb_tips.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'))
});

// Сборка ресурсов интерфейса
gulp.task('injected-templates', function(){
	return gulp.src([
		'./src/templates/xml/toolbar_calc_order_production.xml',
		'./src/templates/xml/toolbar_calc_order_obj.xml',
    './src/templates/xml/toolbar_calc_order_selection.xml',
		'./src/templates/xml/toolbar_product_list.xml',
    './src/templates/xml/toolbar_characteristics_specification.xml',
    './src/templates/xml/toolbar_glass_inserts.xml',
    './src/templates/xml/toolbar_discounts.xml',
    './src/templates/xml/form_auth.xml',
		'./src/templates/xml/tree_*.xml',
		'./src/templates/view_*.html',
	])
		.pipe(resources('merged_wb_templates.js', function (data) {
			return new Buffer('$p.injected_data._mixin(' + JSON.stringify(data) + ');');
		}))
		.pipe(gulp.dest('./data'))
});

// Сборка css
gulp.task('css-base64', function () {
	return gulp.src([
    './src/templates/iface.css',
		'./src/templates/cursors/cursors.css',
		'./src/templates/buttons20.css',
	])
		.pipe(base64())
		.pipe(concat('windowbuilder.css'))
		.pipe(gulp.dest('./src/styles'))
});

gulp.task('css-bottls', function () {
  return gulp.src([
    './src/styles/bottls/b.css',
  ])
    .pipe(base64())
    .pipe(rename('b64.css'))
    .pipe(gulp.dest('./src/styles/bottls'))
});

