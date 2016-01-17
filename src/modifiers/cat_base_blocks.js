/**
 * Дополнительные методы справочника Типовые блоки
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_base_blocks
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.cat.base_blocks;

		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`deleted`, _t_.is_folder, case when _t_.is_folder = '' then _t_.id || '&lt;br /&gt;' || _p_.name || '&lt;br /&gt; ' || _t_.name else _t_.name end as presentation, _t_.svg," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_base_blocks AS _t_" +
				" left outer join cat_production_params as _p_ on _p_.ref = _t_.sys" +
				" %3 %4 LIMIT 300";
		};


	}
);