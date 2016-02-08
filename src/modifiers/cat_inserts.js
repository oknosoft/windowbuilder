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

		var _mgr = $p.cat.inserts

		_mgr._obj_сonstructor.prototype.__define({

			/**
			 * Возвращает номенклатуру вставки в завсисмости от свойств элемента
			 */
			nom: {
				value: function (elm) {

					var main_row = this.specification.find({is_main_elm: true});
					if(!main_row && this.specification.count())
						main_row = this.specification.get(0);
					if(main_row && main_row.nom instanceof _mgr._obj_сonstructor)
						return main_row.nom.nom();
					else if(main_row)
						return main_row.nom;
					else
						return $p.cat.nom.get();
				},
				enumerable: false
			}
		});
	}
);
