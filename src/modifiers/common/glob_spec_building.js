/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации 
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 *
 * @module  glob_spec_building
 * Created 26.05.2015
 */

function SpecBuilding(){

	/**
	 * Рассчитывает спецификацию в строке документа Расчет
	 * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
	 * @param prm
	 * @param cancel
	 */
	this.calc_row_spec = function (prm, cancel) {

	};

	/**
	 * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
	 * @param attr
	 */
	this.specification_adjustment = function (attr) {

		var adel = [];

		// удаляем строки, добавленные предыдущими корректировками
		attr.spec.find_rows({ch: {in: [-1,-2]}}, function (row) {
			adel.push(row);
		});
		adel.forEach(function (row) {
			attr.spec.del(row, true);
		});


	}

}

$p.spec_building = new SpecBuilding();



