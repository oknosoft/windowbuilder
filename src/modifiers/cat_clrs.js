/**
 * Дополнительные методы справочника Цвета
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_cnns
 */


$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.clrs;


		// публичные методы менеджера

		/**
		 * ПолучитьЦветПоПредопределенномуЦвету
		 * @param clr
		 * @param clr_elm
		 * @param clr_sch
		 * @return {*}
		 */
		_mgr.by_predefined = function(clr, clr_elm, clr_sch){
			if(clr.predefined_name){
				return clr_elm;
			}else if(clr.empty())
				return clr_elm;
			else
				return clr;
		};

	}
);
