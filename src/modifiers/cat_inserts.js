/**
 * Дополнительные методы справочника Вставки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_inserts
 */

$p.modifiers.push(
	function($p){
		$p.cat.inserts._obj_сonstructor.prototype.__define("nom", {
			get: function () {
				return this.specification.count() ? this.specification.get(0).nom : $p.cat.nom.get();
			},
			enumerable: false
		});
	}
);
