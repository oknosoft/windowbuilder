/**
 * Классы объектов построителя на базе paper.js <br />&copy; http://www.oknosoft.ru 2009-2015
 * @module  paper_ex
 * @author	Evgeniy Malyarov
 */


/**
 * Экспортируем конструктор Scheme, чтобы экземпляры построителя можно было создать снаружи
 * @property Scheme
 * @for $p
 * @type {Scheme}
 */
if(typeof $p !== "undefined")
	$p.Scheme = Scheme;

/**
 * Обёртка для подключения через AMD или CommonJS
 * https://github.com/umdjs/umd
 */
if (typeof define === 'function' && define.amd) {
	// Support AMD (e.g. require.js)
	define('Scheme', Scheme);
} else if (typeof module === 'object' && module) { // could be `null`
	// Support CommonJS module
	module.exports = Scheme;
}

/**
 * Здесь делаем mixin и расширения классам paper.js
 */

/**
 * Вычисляет направленный угол в точке пути
 * @param point
 * @return {*}
 */
paper.Path.prototype.getDirectedAngle = function (point) {
	var np = this.getNearestPoint(point),
		offset = this.getOffsetOf(np);
	return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
};

/**
 * Выясняет, является ли путь прямым
 * @return {Boolean}
 */
paper.Path.prototype.is_linear = function () {
	return this.curves.length == 1 && this.firstCurve.isLinear();
};

/**
 * Выясняет, расположена ли точка в окрестности точки
 * @param point {paper.Point}
 * @param [sticking] {Boolean}
 * @returns {Boolean}
 */
paper.Point.prototype.is_nearest = function (point, sticking) {
	return this.getDistance(point, true) < (sticking ? consts.sticking2 : 10);
};




