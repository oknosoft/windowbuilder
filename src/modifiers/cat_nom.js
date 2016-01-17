/**
 * Дополнительные методы справочника Номенклатура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_nom
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.nom;

		// модификаторы
		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		};

		_mgr.sql_selection_where_flds = function(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		};


		// публичные поля и методы

		/**
		 *	@desc: 	формирует строку описания номенклатуры для построителя
		 *	@param: 	oNom	- справочникОбъект Номенклатура
		 *	@param: 	row	(необязательный) - строка элеметов пзПараметрыПродукции
		 *	@type:	public
		 *	@topic: 0
		 */
		_mgr.istr_by_obj = function(oNom, row){
			var cClr = row ? row.clr : oNom.clr,
				oClr = $p.is_empty_guid(cClr) ? {id: 0} : $p.cat["clrs"].get(cClr),
				elm_type = row ? $p.enm["elm_types"].get(row.elm_type).name : $p.enm["elm_types"].get(oNom.elm_type).name,
				by_default = row ? (row["by_default"] ? 1 : "") : "",
				pos = row ? $p.enm["positions"].get(row.pos).name : "";

			return oNom.id + ";" +
				elm_type + ";" +
				by_default + ";" +
				pos + ";" +
				oNom.article + ";" +
				oClr.id + ";" +
				oNom.width + ";" +
				oNom.sizeb + ";" +
				oNom.sizefurn + ";" +
				oNom.thickness
		};

		/**
		 *	@desc: 	формирует номенклатуры для построителя и конструирует $p.N
		 *	@param: 	osys	- справочникОбъект пзПараметрыПродукции
		 *	@param: 	o		- справочникОбъект ХарактеристикиНоменлктауры
		 *	@type:	public
		 *	@topic: 0
		 */
		_mgr.make_istr = function(osys, o, sys_changed){
			var iStr = "", oNom, aIds = {};
			osys.elmnts._obj.forEach(function(row){
				if(iStr)
					iStr = iStr + "¶";
				oNom = _mgr.get(row.nom, false);
				iStr = iStr + _mgr.istr_by_obj(oNom._obj, row);
				aIds[oNom.id] = "";
			});
			o["coordinates"]._obj.forEach(function(row){
				if(!$p.is_empty_guid(row.nom)){
					oNom = _mgr.get(row.nom, false);
					if(oNom.id && !sys_changed && !(oNom.id in aIds)){
						iStr = iStr + "¶" + _mgr.istr_by_obj(oNom._obj);
						aIds[oNom.id] = "";
					}
				}
			});
			$p.N = new $p.ex.RNom(iStr);
		}

	}
);