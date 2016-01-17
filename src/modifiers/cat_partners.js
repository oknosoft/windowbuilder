/**
 * Дополнительные методы справочника Контрагенты
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_partners
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.cat.partners;

		_mgr.sql_selection_where_flds = function(filter){
			return " OR inn LIKE '" + filter + "' OR name_full LIKE '" + filter + "' OR name LIKE '" + filter + "'";
		};

	}
);