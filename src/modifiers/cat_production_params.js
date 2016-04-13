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

		_mgr._obj_constructor.prototype.__define({

			/**
			 * возвращает доступные в данной системе элементы
			 * @property noms
			 * @for Production_params
			 */
			noms: {
				get: function(){
					var __noms = [];
					this.elmnts._obj.forEach(function(row){
						if(!$p.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1)
							__noms.push(row.nom);
					});
					return __noms;
				},
				enumerable: false
			},

			/**
			 * возвращает доступные в данной системе элементы (вставки)
			 * @property inserts
			 * @for Production_params
			 * @param elm_types - допустимые типы элементов
			 */
			inserts: {
				value: function(elm_types, by_default){
					var __noms = [];
					if(!elm_types)
						elm_types = $p.enm.elm_types.rama_impost;

					else if(typeof elm_types == "string")
						elm_types = $p.enm.elm_types[elm_types];

					else if(!Array.isArray(elm_types))
						elm_types = [elm_types];

					this.elmnts.each(function(row){
						if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
								!__noms.some(function (e) {
									return row.nom == e.nom;
								}))
							__noms.push({by_default: row.by_default, nom: row.nom});
					});
					__noms.sort(function (a, b) {
						
						if(by_default){

							if (a.by_default && !b.by_default)
								return -1;
							else if (!a.by_default && b.by_default)
								return 1;
							else
								return 0;

						}else{
							if (a.nom.name < b.nom.name)
								return -1;
							else if (a.nom.name > b.nom.name)
								return 1;
							else
								return 0;
						}
					});
					return __noms.map(function (e) {
						return e.nom;
					});
				},
				enumerable: false
			},

			/**
			 * @method refill_prm
			 * @for cat.Production_params
			 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
			 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
			 */
			refill_prm: {
				value: function (ox, cnstr) {
					if(!cnstr)
						cnstr = 0;
					var prm_ts = !cnstr ? this.product_params : this.furn_params,
						adel = [];

					// если в характеристике есть лишние параметры - удаляем
					ox.params.find_rows({cnstr: cnstr}, function (row) {
						if(prm_ts.find_rows({param: row.param}).length == 0)
							adel.push(row);
					});
					adel.forEach(function (row) {
						ox.params.del(row);
					});

					// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
					prm_ts.forEach(function (default_row) {
						var row;
						ox.params.find_rows({cnstr: cnstr, param: default_row.param}, function (_row) {
							row = _row;
						});
						if(!row)
							row = ox.params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});

						if(row.hide != default_row.hide)
							row.hide = default_row.hide;

						if(default_row.forcibly && row.value != default_row.value)
							row.value = default_row.value;
					});
				}
			}

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

			if(op && op.type.is_ref){
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
