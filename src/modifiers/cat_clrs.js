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

		/**
		 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
		 * @param mf {Object} - описание метаданных поля
		 */
		_mgr.selection_exclude_service = function (mf) {

			if(!mf.choice_params)
				mf.choice_params = [];

			if(mf.choice_params.some(function (ch) {
					if(ch.name == "parent")
						return true;
				}))
				return;

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});
		};

	}
);
