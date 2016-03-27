/**
 * Дополнительные методы справочника Фурнитура
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_furns
 */

$p.modifiers.push(
	function furns($p) {

		var _mgr = $p.cat.furns;


		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
		};


		/**
		 * вычисляет список параметров и доступных значений фурнитуры
		 * @param attr {object} - условия, для которых надо получить список параметров
		 * @param callback {function} - функция обратного вызова
		 */
		_mgr.prms_get = function(attr, callback){

			var osys = $p.cat.production_params.get(attr.sys),
				ofurn = _mgr.get(attr.ref),
				dp_buyers_order = $p.dp.buyers_order.create(),
				oprm = dp_buyers_order.product_params,
				prm_direction = $p.cat.predefined_elmnts.predefined("Параметр_НаправлениеОткрывания"),
				aprm = [], afurn_set = [];

			function add_furn_prm(obj){

				if(afurn_set.indexOf(obj.ref)!=-1)
					return;

				afurn_set.push(obj.ref);

				obj.selection_params.each(function(row){
					if(aprm.indexOf(row.param.ref)==-1)
						aprm.push(row.param.ref);
				});

				obj.specification.each(function(row){
					if($p.is_data_obj(row.nom_set) && row.nom_set._manager === $p.cat.furns)
						add_furn_prm(row.nom_set);
				});
			}

			// загружаем в oprm параметры текущей фурнитуры
			if(!attr.refills)
				oprm.load(attr.fprms);

			// формируем массив требуемых параметров по задействованным в ofurn.furn_set
			if(!ofurn.furn_set.empty())
				add_furn_prm(ofurn.furn_set);

			// Приклеиваем значения по умолчанию
			var prm_row, prm_ref;

			aprm.forEach(function(v){

				prm_ref = {param: $p.cch.properties.get(v, false)};
				if(!(prm_row = oprm.find(prm_ref)))
					prm_row = oprm.add(prm_ref);

				osys.furn_params.each(function(row){
					if($p.is_equal(row.param, prm_row.param)){
						if(attr.refills || row.forcibly)
							prm_row.value = row.value;
						prm_row.hide = row.hide;
						return false;
					}
				});
			});

			// параметры и значения по умолчанию получены в oprm
			if((prm_row = oprm.find(prm_direction.ref)) && (prm_row.row > 1))
				oprm.swap(prm_row.row -1, 0);

			var res = {
				sub_type: ofurn.open_type.empty() ? "" : ofurn.open_type.name,
				furn_no: ofurn.id,
				fprms: []};
			oprm.each(function(row){
				res.fprms.push(row);
			});
			if(res.sub_type.toLowerCase() == $p.enm.tso.rotary_folding.toLowerCase())
				res.sub_type = $p.enm.tso.rotary_folding;

			callback(res);

		}

	}
);