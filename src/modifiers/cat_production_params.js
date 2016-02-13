/**
 * Дополнительные методы справочника Системы (Параметры продукции)
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_production_params
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.production_params;

		/**
		 * возвращает доступные в данной системе элементы
		 * @property noms
		 * @for Production_params
		 */
		_mgr._obj_сonstructor.prototype.__define("noms", {
			get: function(){
				var __noms = [];
				this.elmnts._obj.forEach(function(row){
					if(!$p.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1)
						__noms.push(row.nom);
				});
				return __noms;
			},
			enumerable: false
		});

		/**
		 * возвращает доступные в данной системе элементы (вставки)
		 * @property inserts
		 * @param elm_types - допустимые типы элементов
		 * @for Production_params
		 */
		_mgr._obj_сonstructor.prototype.__define("inserts", {
			value: function(elm_types){
				var __noms = [];
				if(!elm_types)
					elm_types = $p.enm.elm_types.rama_impost;

				else if(typeof elm_types == "string")
					elm_types = $p.enm.elm_types[elm_types];

				else(!Array.isArray(elm_types))
					elm_types = [elm_types];

				this.elmnts.each(function(row){
					if(!row.nom.empty() && __noms.indexOf(row.nom) == -1 && elm_types.indexOf(row.elm_type) != -1)
						__noms.push(row.nom);
				});
				return __noms;
			},
			enumerable: false
		});

		/**
		 * возвращает массив доступных для данного свойства значений
		 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
		 * @param is_furn {boolean} - интересуют свойства фурнитуры или объекта
		 * @return {Array}
		 */
		_mgr.slist = function(prop, is_furn){
			var res = [], rt, at, pmgr,
				op = this.get(prop);
			if(is_furn && $p.wsql.get_user_param("furn_params_restricted")){
				// за параметрами топаем в 1С

			}else if(op && op.type.is_ref){
				// параметры получаем из локального кеша
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){
							if(pmgr.class_name=="enm.open_directions")
								pmgr.each(function(v){
									if(v.name!=$p.enm.tso.folding)
										res.push({value: v.ref, text: v.synonym});
								});
							else
								pmgr.find_rows({owner: prop}, function(v){
									res.push({value: v.ref, text: v.presentation});
								});
						}
					}
			}
			return res;
		};



	}
);
