/**
 * ### Дополнительные методы справочника Цвета
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_cnns
 * Created 23.12.2015
 */

$p.cat.clrs.__define({

	/**
	 * ПолучитьЦветПоПредопределенномуЦвету
	 * @param clr
	 * @param clr_elm
	 * @param clr_sch
	 * @return {*}
	 */
	by_predefined: {
		value: function(clr, clr_elm, clr_sch){
			if(clr.predefined_name){
				return clr_elm;
			}else if(clr.empty())
				return clr_elm;
			else
				return clr;
		}
	},

	/**
	 * Дополняет связи параметров выбора отбором, исключающим служебные цвета
	 * @param mf {Object} - описание метаданных поля
	 */
	selection_exclude_service: {
		value: function (mf) {

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
		}
	}
});

