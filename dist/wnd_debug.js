;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wnd_debug = factory();
  }
}(this, function() {
/**
 * Модуль объекта справочника ХарактеристикиНоменклатуры
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 * Created 16.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module cat_characteristics
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.cat.characteristics;

		// перед записью надо пересчитать наименование и рассчитать итоги
		_mgr.attache_event("before_save", function (attr) {
			var _row = this.calc_order_row;
			if(_row){
				this.name = (this.calc_order.number_internal || this.calc_order.number_doc) + "/" + _row.row.pad();
				if(this.clr.name)
					this.name += "/" + this.clr.name;

				if(this.x && this.y)
					this.name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
				else if(this.x)
					this.name += "/" + this.x.toFixed(0);
				else if(this.y)
					this.name += "/" + this.y.toFixed(0);

				if(this.z){
					if(this.x || this.y)
						this.name += "x" + this.z.toFixed(0);
					else
						this.name += "/" + this.z.toFixed(0);
				}

				if(this.s)
					this.name += "/S:" + this.s.toFixed(3);

			}
		});

		_mgr._obj_сonstructor.prototype.__define({
			calc_order_row: {
				get: function () {
					var _calc_order_row;
					this.calc_order.production.find_rows({characteristic: this}, function (_row) {
						_calc_order_row = _row;
						return false;
					});
					return _calc_order_row;
				},
				enumerable: false
			}
		});

	}

);

/**
 * Форма выбора типового блока
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_characteristics_form_selection_block
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.characteristics,
			_meta = $p.cat.characteristics.metadata()._clone(),
			selection_block, wnd;

		// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
		_mgr.form_selection_block = function(pwnd, attr){

			if(!attr)
				attr = {};

			if(!selection_block){

				selection_block = {
					_obj: {
						_calc_order: $p.blank.guid
					}
				};

				_meta.form = {
					selection: {
						fields: ["name as presentation","s"],
						cols: [
							{"id": "presentation", "width": "260", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
							{"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
						]
					}
				};

				selection_block.__define({

					// виртуальные метаданные для поля фильтра по заказу
					_metadata: {
						get : function(){

							// возвращаем типовые метаданные зарактеристики, но могли бы вернуть изменённый клон
							//var calc_order = $p.cat.characteristics.metadata().fields.calc_order._clone();
							// calc_order.choice_links = [{
							// 	name: ["selection",	"s"],
							// 	path: [
							// 		function(o, f){
							//
							// 			if($p.is_data_obj(o)){
							// 				return o.s > 0;
							//
							// 			}else{
							// 				var refs = "";
							// 				t.project._dp.sys.elmnts.find_rows(selection, function (row) {
							// 					if(refs)
							// 						refs += ", ";
							// 					refs += "'" + row.nom.ref + "'";
							// 				});
							// 				return "_t_.ref in (" + refs + ")";
							// 			}
							// 		}]}
							// ];

							return {
								fields: {
									calc_order: _meta.fields.calc_order
								}
							};
						}
					},

					// виртуальный датаменеджер для автоформ
					_manager: {
						get: function () {
							return {
								class_name: "dp.fake"
							};
						}
					},

					calc_order: {
						get: function () {
							return _mgr._obj_сonstructor.prototype._getter.call(this, "calc_order");
						},

						set: function (v) {
							if(this._obj[f] == v)
								return;
							_mgr._obj_сonstructor.prototype.__setter.call(this, "calc_order", v);
							if(wnd && wnd.elmnts && wnd.elmnts.filter)
								wnd.elmnts.filter.call_event();
						}
					}

				});
			}

			// объект отбора по ссылке на расчет в продукции
			selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
			if(!selection_block.calc_order.empty()){
				$p.cat.predefined_elmnts.predefined("Расчет_ТиповойБлок").some(function (o) {
					selection_block.calc_order = o;
					$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
					return true;
				});
			}

			// начальное значение - выбранные в предыдущий раз типовой блок
			attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

			// подсовываем типовой форме списка изменённые метаданные
			attr.metadata = _meta;

			// создаём форму списка
			wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

			wnd.elmnts.toolbar.hideItem("btn_new");
			wnd.elmnts.toolbar.hideItem("btn_edit");
			wnd.elmnts.toolbar.hideItem("btn_delete");

			// добавляем элемент управления фильтра по расчету
			wnd.elmnts.filter.add_filter({
				text: "Расчет",
				name: "calc_order"
			});
			var fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
			fdiv.removeChild(fdiv.firstChild);

			wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
				parent: fdiv,
				obj: selection_block,
				field: "calc_order",
				width: 200,
				get_option_list: function (val, selection) {

					var l = [];

					$p.cat.predefined_elmnts.predefined("Расчет_ТиповойБлок").forEach(function (o) {
						l.push({text: o.presentation, value: o.ref});
					});

					return Promise.resolve(l);
				}
			});
			wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";
			
			// добавляем пользовательский отбор по "площадь > 0"
			wnd.elmnts.filter.custom_selection.s = {value: {gt: 0}};

			return wnd;
		};

	}
);
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

/**
 * Дополнительные методы справочника Соединения
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_cnns
 */


$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.cnns,
			_nomcache = {};

		// приватные поля и методы

		// модификаторы

		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
				" left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
		};


		// публичные методы менеджера

		/**
		 * Возвращает массив соединений, доступный для сочетания номенклатур.
		 * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
		 * @param nom1 {_cat.nom}
		 * @param nom2 {_cat.nom}
		 * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
		 * @return {Array}
		 */
		_mgr.nom_cnn = function(nom1, nom2, cnn_types){

			// если второй элемент вертикальный - меняем местами эл 1-2 при поиске
			if(nom1 instanceof $p.Editor.Profile &&
				nom2 instanceof $p.Editor.Profile &&
				cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
				nom1.orientation != $p.enm.orientations.Вертикальная &&
				nom2.orientation == $p.enm.orientations.Вертикальная ){

				return _mgr.nom_cnn(nom2, nom1, cnn_types);
			}


			var onom1, onom2,
				is_i = false, art1glass = false, art2glass = false,
				a1, a2, ref1,
				thickness1, thickness2;

			if(nom1 instanceof $p.Editor.BuilderElement){
				onom1 = nom1.nom;

			}else if($p.is_data_obj(nom1)){
				onom1 = nom1;

			}else{
				onom1 = $p.cat.nom.get(nom1);

			}

			if(!onom1 || onom1.empty())
				ref1 = nom1.ref;
			else
				ref1 = onom1.ref;


			if(!nom2 || ($p.is_data_obj(nom2) && nom2.empty())){
				is_i = true;
				onom2 = nom2 = {val: "i", ref: $p.blank.guid};

			}else{

				if(nom2 instanceof $p.Editor.BuilderElement){
					onom2 = nom2.nom;

				}else if($p.is_data_obj(nom2)){
					onom2 = nom2;

				}else{
					onom2 = $p.cat.nom.get(nom2);

				}
			}

			if(!is_i){
				if(nom1 instanceof $p.Editor.Filling){
					art1glass = true;
					thickness1 = nom1.thickness;

				}else if(nom2 instanceof $p.Editor.Filling){
					art2glass = true;
					thickness2 = nom2.thickness;
				}

			}

			if(!_nomcache[ref1])
				_nomcache[ref1] = {};
			a1 = _nomcache[ref1];
			if(!a1[onom2.ref]){
				a2 = (a1[onom2.ref] = []);
				// для всех элементов справочника соединения
				_mgr.each(function(оCnn){
					// если в строках соединяемых элементов есть наша - добавляем
					var is_nom1 = art1glass ? (оCnn.art1glass && thickness1 >= Number(оCnn.tmin) && thickness1 <= Number(оCnn.tmax)) : false,
						is_nom2 = art2glass ? (оCnn.art2glass && thickness2 >= Number(оCnn.tmin) && thickness2 <= Number(оCnn.tmax)) : false;

					оCnn["cnn_elmnts"].each(function(row){
						if(is_nom1 && is_nom2)
							return false;
						is_nom1 = is_nom1 || $p.is_equal(row.nom1, onom1);
						is_nom2 = is_nom2 || $p.is_equal(row.nom2, onom2);
					});
					if(is_nom1 && is_nom2){
						a2.push(оCnn);
					}
				});
			}

			if(cnn_types){
				var tmp = a1[onom2.ref], res = [], types;

				if(Array.isArray(cnn_types))
					types = cnn_types;
				else if($p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1)
					types = $p.enm.cnn_types.acn.a;
				else
					types = [cnn_types];

				tmp.forEach(function (c) {
					if(types.indexOf(c.cnn_type) != -1)
						res.push(c);
				});
				return res;
			}

			return a1[onom2.ref];
		};

		/**
		 * Возвращает соединение между элементами
		 * @param elm1
		 * @param elm2
		 * @param [cnn_types] {Array}
		 * @param [curr_cnn] {_cat.cnns}
		 */
		_mgr.elm_cnn = function(elm1, elm2, cnn_types, curr_cnn){

			if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type)!=-1)){
				// если установленное ранее соединение проходит по типу, нового не ищем
				// TODO: проверить геометрию
				return curr_cnn;
			}

			var cnns = _mgr.nom_cnn(elm1, elm2, cnn_types);

			// для примера подставляем первое попавшееся соединение
			if(cnns.length)
				return cnns[0];
			else{
				// TODO: возможно, надо вернуть соединение с пустотой
			}
		};



		// публичные методы объекта

		_mgr._obj_сonstructor.prototype.__define({

			/**
			 * Возвращает основную строку спецификации соединения между элементами
			 */
			main_row: {
				value: function (elm) {

					var ares, nom = elm.nom;

					// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
					if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){
						var art12;
						if(elm.orientation == $p.enm.orientations.Вертикальная)
							art12 = $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1");
						else
							art12 = $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2");

						ares = this.specification.find_rows({nom: art12});
						if(ares.length)
							return ares[0]._row;
					}

					// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
					if(this.cnn_elmnts.find_rows({nom1: nom}).length){
						ares = this.specification.find_rows({nom: $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1")});
						if(ares.length)
							return ares[0]._row;
					}
					if(this.cnn_elmnts.find_rows({nom2: nom}).length){
						ares = this.specification.find_rows({nom: $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2")});
						if(ares.length)
							return ares[0]._row;
					}
					ares = this.specification.find_rows({nom: nom});
					if(ares.length)
						return ares[0]._row;

				},
				enumerable: false
			}
		});

	}
);

/**
 * Дополнительные методы справочника Договоры контрагентов
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_contracts
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.cat.contracts;

		_mgr.sql_selection_list_flds = function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" +
				" left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" +
				" left outer join enm_mutual_contract_settlements as _m_ on _m_.ref = _t_.mutual_settlements" +
				" left outer join enm_contract_kinds as _k_ on _k_.ref = _t_.contract_kind %3 %4 LIMIT 300";
		};

		_mgr.by_partner_and_org = function (partner, organization, contract_kind) {
			if(!contract_kind)
				contract_kind = $p.enm.contract_kinds.СПокупателем;
			var res = _mgr.find_rows({owner: partner, organization: organization, contract_kind: contract_kind});
			res.sort(function (a, b) {
				return a.date > b.date;
			});
			return res.length ? res[0] : _mgr.get();
		}

	}
);
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

			var osys = $p.cat["production_params"].get(attr.sys),
				ofurn = _mgr.get(attr.ref),
				dp_buyers_order = $p.dp.buyers_order.create(),
				oprm = dp_buyers_order["product_params"],
				prm_direction = $p.cat.predefined_elmnts.by_name("Параметр_НаправлениеОткрывания").elm,
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
			var direction_added = ofurn.open_type.empty() ||
					ofurn.open_type == $p.enm.open_types.Глухое ||
					ofurn.open_type == $p.enm.open_types.Откидное,
				prm_row, prm_ref;

			aprm.forEach(function(v){

				prm_ref = {param: $p.cch.properties.get(v, false)};
				if(!(prm_row = oprm.find(prm_ref)))
					prm_row = oprm.add(prm_ref);

				if(!direction_added && $p.is_equal(prm_direction, prm_row.param))
					direction_added = true;

				osys.furn_params.each(function(row){
					if($p.is_equal(row.param, prm_row.param)){
						if(attr.refills || row.forcibly)
							prm_row.value = row.value;
						prm_row.hide = row.hide;
						return false;
					}
				});
			});

			if(!direction_added){
				osys.furn_params.each(function(row){
					if($p.is_equal(row.param, prm_direction)){
						prm_row = oprm.add({param: row.param, value: row.value, hide: row.hide});
						direction_added = true;
						return false;
					}
				});
			}

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

		var _mgr = $p.cat.inserts;

		_mgr._obj_сonstructor.prototype.__define({

			/**
			 * Возвращает номенклатуру вставки в завсисмости от свойств элемента
			 */
			nom: {
				value: function (elm) {

					var main_rows = [], _nom;

					this.specification.find_rows({is_main_elm: true}, function (row) {
						main_rows.push(row);
					});

					if(!this._cache)
						this._cache = {};

					if(this._cache.nom)
						return this._cache.nom;

					if(!main_rows.length && this.specification.count())
						main_rows.push(this.specification.get(0));

					if(main_rows.length && main_rows[0].nom instanceof _mgr._obj_сonstructor)
						_nom = main_rows[0].nom.nom();

					else if(main_rows.length)
						_nom = main_rows[0].nom;

					else
						_nom = $p.cat.nom.get();

					if(main_rows.length < 2)
						this._cache.nom = _nom;

					return _nom;

				},
				enumerable: false
			},

			/**
			 * Возвращает толщину вставки
			 */
			thickness: {
				get: function () {

					if(!this._cache)
						this._cache = {};

					var _cache = this._cache;

					if(!_cache.hasOwnProperty("thickness")){
						_cache.thickness = 0;
						if(this.insert_type == $p.enm.inserts_types.ТиповойСтеклопакет || this.insert_type == $p.enm.inserts_types.Стеклопакет){

							if(this.insert_glass_type == $p.enm.inserts_glass_types.Рамка)
								_cache.thickness += this.nom().thickness;

							else if(this.insert_glass_type == $p.enm.inserts_glass_types.Стекло)
								this.specification.each(function (row) {
									_cache.thickness += row.nom.thickness;
								});
						}else
							_cache.thickness = this.nom().thickness;
					}

					return _cache.thickness;

				},
				enumerable: false
			}
		});
	}
);

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
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		};

		_mgr.sql_selection_where_flds = function(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		};


		// публичные поля и методы

	}
);
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

		var _mgr = $p.cat.predefined_elmnts,
			_predefined = {};

		/**
		 * Возвращает предопределенный элемент или массив элементов
		 * 
		 * @param name
		 * @return {*}
		 */
		_mgr.predefined = function(name){

			if(_predefined[name])
				return _predefined[name];

			var res;
			_mgr.find_rows({name: name}, function (o) {
				res = o;
				return false;
			});
			if(res){
				if(res.elm){
					_predefined[name] = res.elm;
				}else{
					_predefined[name] = [];
					res.elmnts.each(function (row) {
						_predefined[name].push(row.elm);
					});
				}
				return _predefined[name];
			}
		};

	}
);
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

				else if(!Array.isArray(elm_types))
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

/**
 * Дополнительные методы плана видов характеристик Свойства объектов
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cch_properties
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cch.properties;

		/**
		 * Проверяем заполненность обязательных полей
		 * @param prms {Array}
		 * @param title {String}
		 * @return {boolean}
		 */
		_mgr.check_mandatory = function(prms, title){

			var t, row;

			// проверяем заполненность полей
			for(t in prms){
				row = prms[t];
				if(row.param.mandatory && (!row.value || row.value.empty())){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.bld_empty_param + row.param.presentation,
						title: title || $p.msg.bld_title});
					return true;
				}
			}

		};

		/**
		 * Возвращает массив доступных для данного свойства значений
		 * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
		 * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
		 * @return {Array}
		 */
		_mgr.slist = function(prop, ret_mgr){

			var res = [], rt, at, pmgr, op = this.get(prop);

			if(op && op.type.is_ref){
				// параметры получаем из локального кеша
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){

							if(ret_mgr)
								ret_mgr.mgr = pmgr;

							if(pmgr.class_name=="enm.open_directions")
								pmgr.get_option_list().forEach(function(v){
									if(v.value && v.value!=$p.enm.tso.folding)
										res.push(v);
								});

							else if(pmgr.class_name.indexOf("enm.")!=-1 || !pmgr.metadata().has_owners)
								res = pmgr.get_option_list();

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

/**
 * Модуль документа Расчет-заказ
 * Обрботчики событий after_create, after_load, before_save, after_save, value_change
 * Методы выполняются в контексте текущего объекта this = DocObj
 * Created 16.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module doc_calc_order
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.doc.calc_order;

		// после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
		_mgr.attache_event("after_create", function (attr) {

			var acl = $p.current_acl.acl_objs,
				obj = this;

			//Организация
			acl.find_rows({
				by_default: true,
				type: $p.cat.organizations.metadata().obj_presentation || $p.cat.organizations.metadata().name}, function (row) {
				obj.organization = row.acl_obj;
				return false;
			});

			//Подразделение
			acl.find_rows({
				by_default: true,
				type: $p.cat.divisions.metadata().obj_presentation || $p.cat.divisions.metadata().name}, function (row) {
				obj.department = row.acl_obj;
				return false;
			});

			//Контрагент
			acl.find_rows({
				by_default: true,
				type: $p.cat.partners.metadata().obj_presentation || $p.cat.partners.metadata().name}, function (row) {
				obj.partner = row.acl_obj;
				return false;
			});

			//Договор
			obj.contract = $p.cat.contracts.by_partner_and_org(obj.partner, obj.organization);

			//Менеджер
			obj.manager = $p.current_user;

			//СостояниеТранспорта
			obj.obj_delivery_state = $p.enm.obj_delivery_states.Черновик;

			//Заказ
			obj._obj.invoice = $p.generate_guid();

			//Номер документа
			return obj.new_number_doc();

		});

		// перед записью надо присвоить номер для нового и рассчитать итоги
		_mgr.attache_event("before_save", function (attr) {
			attr = null;
		});

		// при изменении реквизита
		_mgr.attache_event("value_change", function (attr) {
			if(attr.field == "organization" && this.contract.organization != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);

			}else if(attr.field == "partner" && this.contract.owner != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);

			}
		});

		// при установке нового номера
		_mgr._obj_сonstructor.prototype.__define({
			new_number_doc: {

				value: function () {

					var obj = this,
						prefix = ($p.current_acl.prefix || "") + obj.organization.prefix,
						code_length = obj._metadata.code_length - prefix.length,
						part;

					return $p.wsql.pouch.local[obj._manager.cachable].query("doc_calc_order/number_doc",
						{
							limit : 1,
							include_docs: false,
							startkey: prefix + '\uffff',
							endkey: prefix,
							descending: true
						})
						.then(function (res) {
							if(res.rows.length){
								part = (parseInt(res.rows[0].key.substr(prefix.length)) + 1).toFixed(0);
							}else{
								part = "1";
							}
							while (part.length < code_length)
								part = "0" + part;
							obj.number_doc = prefix + part;

							return obj;
						});
				}
			}
		});

	}

);
/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.doc.calc_order;

		_mgr.form_list = function(pwnd, attr){
			
			if(!attr)
				attr = {
					hide_header: true,
					date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31")
				};
			
			var layout = pwnd.attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Фильтр",
					collapsed_text: "Фильтр",
					width: 180
				}, {
					id: "b",
					text: "Заказы",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			}),

				wnd = _mgr.form_selection(layout.cells("b"), attr),

				tree = layout.cells("a").attachTree(),


				filter_view = {},
				filter_key = {};

			// настраиваем фильтр для списка заказов
			filter_view.__define({
				value: {
					get: function () {
						switch(tree.getSelectedItemId()) {

							case 'draft':
							case 'sent':
							case 'declined':
							case 'confirmed':
							case 'template':
							case 'zarchive':
								return 'doc_calc_order/date';

							case 'credit':
							case 'prepayment':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'deleted':
							case 'all':
								return '';
						}
					}
				}
			});
			filter_key.__define({
				value: {
					get: function () {
						switch(tree.getSelectedItemId()) {

							case 'draft':
								return 'draft';
							case 'sent':
								return 'sent';
							case 'declined':
								return 'declined';
							case 'confirmed':
								return 'confirmed';
							case 'template':
								return 'template';
							case 'zarchive':
								return 'zarchive';

							case 'credit':
							case 'prepayment':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';

							case 'deleted':
								return 'deleted';
						}
					}
				}
			});
			wnd.elmnts.filter.custom_selection._view = filter_view;
			wnd.elmnts.filter.custom_selection._key = filter_key;

			// настраиваем дерево
			tree.enableTreeImages(false);
			tree.parse($p.injected_data["tree_filteres.xml"]);
			tree.attachEvent("onSelect", wnd.elmnts.filter.call_event);

			return wnd;
		};
	}
);

/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 */


$p.modifiers.push(

	function($p) {

		var _mgr = $p.doc.calc_order,
			_meta_patched;




		_mgr.form_obj = function(pwnd, attr){

			var o, wnd, evts = [];

			/**
			 * структура заголовков табчасти продукции
			 * @param source
			 */
			if(!_meta_patched){
				(function(source){

					if($p.wsql.get_user_param("hide_price_dealer")){
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
						source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0";

					}else if($p.wsql.get_user_param("hide_price_manufacturer")){
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
						source.widths = "40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70";

					}else{
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
						source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70";
					}

					if($p.current_acl.acl_objs.find_rows({type: "СогласованиеРасчетовЗаказов"}).length)
						source.types = "cntr,ref,ref,txt,calck,calck,calck,calck,calck,ref,calck,ro,ro,calck,calck,ro";
					else
						source.types = "cntr,ref,ref,txt,calck,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

				})($p.doc.calc_order.metadata().form.obj.tabular_sections.production);
				_meta_patched = true;
			}

			attr.draw_tabular_sections = function (o, wnd, tabular_init) {

				/**
				 * получим задействованные в заказе объекты характеристик
				 */
				var refs = [];
				o.production.each(function (row) {
					if(!$p.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new())
						refs.push(row._obj.characteristic);
				});
				$p.cat.characteristics.pouch_load_array(refs)
					.then(function () {

						/**
						 * табчасть продукции
						 */
						tabular_init("production", $p.injected_data["toolbar_calc_order_production.xml"]);

						var toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
						toolbar.addSpacer("btn_delete");
						toolbar.attachEvent("onclick", toolbar_click);

						// попап для присоединенных файлов
						wnd.elmnts.discount_pop = new dhtmlXPopup({
							toolbar: toolbar,
							id: "btn_discount"
						});
						wnd.elmnts.discount_pop.attachEvent("onShow", show_discount);

						// в зависимости от статуса
						setTimeout(set_editable, 50);

					})

				/**
				 *	статусбар с картинками
				 */
				wnd.elmnts.statusbar = wnd.attachStatusBar({text: "<div></div>"});
				wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.statusbar);
				wnd.elmnts.svgs.reload(o.ref);

			};

			attr.draw_pg_header = function (o, wnd) {

				function layout_resize_finish() {
					setTimeout(function () {
						if(wnd.elmnts.layout_header.setSizes){
							wnd.elmnts.layout_header.setSizes();
							wnd.elmnts.pg_left.objBox.style.width = "100%";
							wnd.elmnts.pg_right.objBox.style.width = "100%";
						}
					}, 200);
				}

				/**
				 *	закладка шапка
				 */
				wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

				wnd.elmnts.layout_header.attachEvent("onResizeFinish", layout_resize_finish);

				wnd.elmnts.layout_header.attachEvent("onPanelResizeFinish", layout_resize_finish);

				/**
				 *	левая колонка шапки документа
				 */
				wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
				wnd.elmnts.cell_left.hideHeader();
				wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
					obj: o,
					pwnd: wnd,
					read_only: !$p.ajax.root,
					oxml: {
						" ": [{id: "number_doc", path: "o.number_doc", synonym: "Номер", type: "ro", txt: o.number_doc},
							{id: "date", path: "o.date", synonym: "Дата", type: "ro", txt: $p.dateFormat(o.date, "")},
							"number_internal"
							],
						"Контактная информация": ["partner", "client_of_dealer", "phone",
							{id: "shipping_address", path: "o.shipping_address", synonym: "Адрес доставки", type: "addr", txt: o["shipping_address"]}
						],
						"Дополнительные реквизиты": [
							{id: "obj_delivery_state", path: "o.obj_delivery_state", synonym: "Состояние транспорта", type: "ro", txt: o["obj_delivery_state"].presentation}
						]
					}
				});

				/**
				 *	правая колонка шапки документа
				 * TODO: задействовать либо удалить choice_links
				 * var choice_links = {contract: [
				 * {name: ["selection", "owner"], path: ["partner"]},
				 * {name: ["selection", "organization"], path: ["organization"]}
				 * ]};
				 */

				wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
				wnd.elmnts.cell_right.hideHeader();
				wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
					obj: o,
					pwnd: wnd,
					read_only: !$p.ajax.root,
					oxml: {
						"Налоги": ["vat_consider", "vat_included"],
						"Аналитика": ["project",
							{id: "organization", path: "o.organization", synonym: "Организация", type: "refc", txt: o["organization"].presentation},
							"contract", "organizational_unit", "department"],
						"Итоги": [{id: "doc_currency", path: "o.doc_currency", synonym: "Валюта документа", type: "ro", txt: o["doc_currency"].presentation},
							{id: "doc_amount", path: "o.doc_amount", synonym: "Сумма", type: "ron", txt: o["doc_amount"]},
							{id: "amount_internal", path: "o.amount_internal", synonym: "Сумма внутр", type: "ron", txt: o["amount_internal"]}]
					}
				});

				/**
				 *	редактор комментариев
				 */
				wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
				wnd.elmnts.cell_note.hideHeader();
				wnd.elmnts.cell_note.setHeight(140);
				wnd.elmnts.note_editor = wnd.elmnts.cell_note.attachEditor();
				wnd.elmnts.note_editor.setContent(o.note);
				wnd.elmnts.note_editor.attachEvent("onAccess", function(name, ev){
					if(wnd.elmnts.ro)
						return false;
					if (name == "blur"){
						this.clearFormatting();
						o.note = this.getContent();
					}
				});

				//wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
				//	obj: o,
				//	pwnd: wnd,
				//	read_only: !$p.ajax.root    // TODO: учитывать права для каждой роли на каждый объект
				//});
			};

			attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

			attr.toolbar_click = toolbar_click;

			return this.constructor.prototype.form_obj.call(this, pwnd, attr)
				.then(function (res) {
					if(res){
						o = res.o;
						wnd = res.wnd;
						return res;
					}
				});


			/**
			 * обработчик нажатия кнопок командных панелей
			 */
			function toolbar_click(btn_id){

				switch(btn_id) {

					case 'btn_sent':
						save("sent");
						break;

					case 'btn_save':
						save("save");
						break;

					case 'btn_retrieve':
						save("retrieve");
						break;

					case 'btn_close':
						wnd.close();
						break;

					case 'btn_add_builder':
						open_builder(true);
						break;

					case 'btn_add_product':
						$p.injected_data["wnd/wnd_product_list"](o, wnd, process_add_product);
						break;

					case 'btn_add_material':
						add_material();
						break;

					case 'btn_edit':
						open_builder();
						break;

					case 'btn_spec':
						open_spec();
						break;

					case 'btn_discount':

						break;

					case 'btn_calendar':
						caltndar_new_event();
						break;

					case 'btn_go_connection':
						go_connection();
						break;

				}
			}

			/**
			 * создаёт событие календаря
			 */
			function caltndar_new_event(){
				$p.msg.show_not_implemented();
			}

			/**
			 * показывает список связанных документов
			 */
			function go_connection(){
				$p.msg.show_not_implemented();
			}

			/**
			 * создаёт и показывает диалог групповых скидок
			 */
			function show_discount(){
				if (!wnd.elmnts.discount) {

					wnd.elmnts.discount = wnd.elmnts.discount_pop.attachForm([
						{type: "fieldset",  name: "discounts", label: "Скидки по группам", width:220, list:[
							{type:"settings", position:"label-left", labelWidth:100, inputWidth:50},
							{type:"input", label:"На продукцию", name:"production", numberFormat:["0.0 %", "", "."]},
							{type:"input", label:"На аксессуары", name:"accessories", numberFormat:["0.0 %", "", "."]},
							{type:"input", label:"На услуги", name:"services", numberFormat:["0.0 %", "", "."]}
						]},
						{ type:"button" , name:"btn_discounts", value:"Ок", tooltip:"Установить скидки"  }
					]);
					wnd.elmnts.discount.setItemValue("production", 0);
					wnd.elmnts.discount.setItemValue("accessories", 0);
					wnd.elmnts.discount.setItemValue("services", 0);
					wnd.elmnts.discount.attachEvent("onButtonClick", function(name){
						wnd.progressOn();
						// TODO: _mgr.save
						//_mgr.save({
						//	ref: o.ref,
						//	discounts: {
						//		production: $p.fix_number(wnd.elmnts.discount.getItemValue("production"), true),
						//		accessories: $p.fix_number(wnd.elmnts.discount.getItemValue("accessories"), true),
						//		services: $p.fix_number(wnd.elmnts.discount.getItemValue("services"), true)
						//	},
						//	o: o._obj,
						//	action: "calc",
						//	specify: "discounts"
						//}).then(function(res){
						//	if(!$p.msg.check_soap_result(res))
						//		wnd.reflect_characteristic_change(res); // - перезаполнить шапку и табчасть
						//	wnd.progressOff();
						//	wnd.elmnts.discount_pop.hide();
						//});
					});
				}
			}


			/**
			 * обработчик выбора значения в таблице продукции (ссылочные типы)
			 */
			function production_on_value_select(v){
				this.row[this.col] = v;
				this.cell.setValue(v.presentation);
				production_on_value_change();
			}

			/**
			 * РассчитатьСпецификациюСтроки() + ПродукцияПриОкончанииРедактирования()
			 * при изменении строки табчасти продукции
			 */
			function production_on_value_change(rId){

				wnd.progressOn();
				// TODO: _mgr.save
				//_mgr.save({
				//	ref: o.ref,
				//	row: rId!=undefined ? rId : production_get_sel_index(),
				//	o: o._obj,
				//	action: "calc",
				//	specify: "production"
				//}).then(function(res){
				//	if(!$p.msg.check_soap_result(res))
				//		wnd.reflect_characteristic_change(res); // - перезаполнить шапку и табчасть
				//	wnd.progressOff();
				//});
			}

			/**
			 * Перечитать табчасть продукции из объекта
			 */
			function production_refresh(){
				o["production"].sync_grid(wnd.elmnts.grids.production);
			}

			/**
			 * обработчик активизации строки продукции
			 */
			function production_on_row_activate(rId, cInd){
				var row = o["production"].get(rId-1),
					sfields = this.getUserData("", "source").fields,
					rofields = "nom,characteristic,qty,len,width,s,quantity,unit",
					pval;


				if($p.is_data_obj(row.ordn) && !row.ordn.empty()){
					for(var i in sfields)
						if(rofields.indexOf(sfields[i])!=-1){
							pval = this.cells(rId, Number(i)).getValue();
							this.setCellExcellType(rId, Number(i), "ro");
							if($p.is_data_obj(pval))
								this.cells(rId, Number(i)).setValue(pval.presentation);
						}
				}
			}

			/**
			 * обработчик изменения значения в таблице продукции (примитивные типы)
			 */
			function production_on_edit(stage, rId, cInd, nValue, oValue){
				if(stage != 2 || nValue == oValue) return true;
				var fName = this.getUserData("", "source").fields[cInd], ret_code;
				if(fName == "note"){
					ret_code = true;
					o["production"].get(rId-1)[fName] = nValue;
				} else if (!isNaN(Number(nValue))){
					ret_code = true;
					o["production"].get(rId-1)[fName] = Number(nValue);
				}
				if(ret_code){
					setTimeout(function(){ production_on_value_change(rId-1); } , 0);
					return ret_code;
				}
			}


			/**
			 * вспомогательные функции
			 */


			/**
			 * настройка (инициализация) табличной части продукции
			 */
			function production_init(){


				// собственно табличная часть
				var grid = wnd.elmnts.grids.production,
					source = {
						o: o,
						wnd: wnd,
						on_select: production_on_value_select,
						tabular_section: "production",
						footer_style: "text-align: right; font: bold 12px Tahoma; color: #005; background: #f9f9f9; height: 22px;"
					};
				production_captions(source);

				grid.setIconsPath(dhtmlx.image_path);
				grid.setImagePath(dhtmlx.image_path);

				// 16 полей
				//row, nom, characteristic, note, qty, len, width, s, quantity, unit, discount_percent, price, amount, discount_percent_internal, price_internal, amount_internal
				grid.setHeader(source.headers);
				grid.setInitWidths(source.widths);
				grid.setColumnMinWidth(source.min_widths);

				grid.setColumnIds(source.fields.join(","));
				grid.enableAutoWidth(true, 1200, 600);
				grid.enableEditTabOnly(true);

				grid.init();
				//grid.enableLightMouseNavigation(true);
				//grid.enableKeyboardSupport(true);
				//grid.splitAt(2);

				grid.attachFooter("Итого:,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,{#stat_total}, ,#cspan,{#stat_total}",
					[source.footer_style, "","","","","","","","","","","",source.footer_style,source.footer_style,"",source.footer_style]);

				grid.setUserData("", "source", source);
				grid.attachEvent("onEditCell", production_on_edit);
				grid.attachEvent("onRowSelect", production_on_row_activate);
			}


			/**
			 * перечитывает реквизиты шапки из объекта в гриды
			 */
			function header_refresh(){
				function reflect(id){
					if(typeof id == "string"){
						var fv = o[id]
						if(fv != undefined){
							if($p.is_data_obj(fv))
								this.cells(id, 1).setValue(fv.presentation);
							else if(fv instanceof Date)
								this.cells(id, 1).setValue($p.dateFormat(fv, ""));
							else
								this.cells(id, 1).setValue(fv);

						}else if(id.indexOf("extra_fields") > -1){
							var row = o["extra_fields"].find(id.split("|")[1]);
						}
					}
				}
				wnd.elmnts.pg_left.forEachRow(function(id){	reflect.call(wnd.elmnts.pg_left, id); });
				wnd.elmnts.pg_right.forEachRow(function(id){ reflect.call(wnd.elmnts.pg_right, id); });
			}

			function production_new_row(){
				var row = o["production"].add({
					qty: 1,
					quantity: 1,
					discount_percent_internal: $p.wsql.get_user_param("discount", "number")
				});
				production_refresh();
				wnd.elmnts.grids.production.selectRowById(row.row);
				return row;
			}

			function production_get_sel_index(){
				var selId = wnd.elmnts.grids.production.getSelectedRowId();
				if(selId && !isNaN(Number(selId)))
					return Number(selId)-1;
				$p.msg.show_msg({type: "alert-warning",
					text: $p.msg.no_selected_row.replace("%1", "Продукция"),
					title: _mgr.metadata()["obj_presentation"] + ' №' + o.number_str});
			}

			function production_del_row(){

				var rId = production_get_sel_index(), row;

				if(rId == undefined)
					return;
				else
					row = o["production"].get(rId);

				// проверяем, не подчинена ли текущая строка продукции
				if($p.is_data_obj(row.ordn) && !row.ordn.empty()){
					// возможно, ссылка оборвана. в этом случае, удаление надо разрешить
					if(o["production"].find({characteristic: row.ordn})){
						$p.msg.show_msg({type: "alert-warning",
							text: $p.msg.sub_row_change_disabled,
							title: o.presentation + ' стр. №' + (rId + 1)});
						return;
					}
				}

				// если удаляем строку продукции, за одно надо удалить и подчиненные аксессуары
				if($p.is_data_obj(row.characteristic) && !row.characteristic.empty()){
					o["production"].find_rows({ordn: row.characteristic}).forEach(function (r) {
						o["production"].del(r);
					});
				}

			}

			function save(action){

				function do_save(){

					wnd.progressOn();

					wnd.elmnts.note_editor.clearFormatting();
					o.note = wnd.elmnts.note_editor.getContent();

					o.save()
						.then(function(){

							wnd.progressOff();
							wnd.modified = false;

							if(action == "sent" || action == "close")
								wnd.close();

						})
						.catch(function(err){
							wnd.progressOff();
							$p.record_log(err);
						});
				}

				if(action == "sent"){
					// показать диалог и обработать возврат
					dhtmlx.confirm({
						title: $p.msg.order_sent_title,
						text: $p.msg.order_sent_message,
						cancel: $p.msg.cancel,
						callback: function(btn) {
							if(btn){
								// установить транспорт в "отправлено" и записать
								o["obj_delivery_state"] = $p.enm.obj_delivery_states.Отправлен;
								do_save();
							}
						}
					});

				} else if(action == "retrieve"){
					// установить транспорт в "отозвано" и записать
					o["obj_delivery_state"] =  $p.enm.obj_delivery_states.Отозван;
					do_save();

				} else if(action == "save"){
					do_save();
				}
			}

			function frm_close(win){

				// выгружаем из памяти всплывающие окна скидки и связанных файлов
				["vault", "vault_pop", "discount", "discount_pop"].forEach(function (elm) {
					if (wnd.elmnts[elm])
						wnd.elmnts[elm].unload();
				});

				evts.forEach(function (id) {
					$p.eve.detachEvent(id);
				});

				return true;
			}

			function set_editable(){

				// статусы
				var ds = $p.enm["obj_delivery_states"],
					st_draft = ds.Черновик.ref,
					st_sent = ds.Отправлен.ref,
					st_retrieve = ds.Отозван.ref,
					st_rejected = ds.Отклонен.ref,
					retrieve_enabed,
					detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();

				wnd.elmnts.pg_right.cells("vat_consider", 1).setDisabled(true);
				wnd.elmnts.pg_right.cells("vat_included", 1).setDisabled(true);

				wnd.elmnts.ro = o["posted"] || o["_deleted"];
				if(!wnd.elmnts.ro && !o["obj_delivery_state"].empty())
					wnd.elmnts.ro = !($p.is_equal(o["obj_delivery_state"], st_draft) || $p.is_equal(o["obj_delivery_state"], st_retrieve));

				retrieve_enabed = !o["_deleted"] &&
					($p.is_equal(o["obj_delivery_state"], st_sent) || $p.is_equal(o["obj_delivery_state"], st_rejected));

				wnd.elmnts.grids.production.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_left.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_right.setEditable(!wnd.elmnts.ro);

				// кнопки проведения гасим всегда
				wnd.elmnts.frm_toolbar.hideItem("btn_post");
				wnd.elmnts.frm_toolbar.hideItem("btn_unpost");

				// кнопки записи и отправки гасим в зависимости от статуса
				if(wnd.elmnts.ro){
					wnd.elmnts.frm_toolbar.disableItem("btn_sent");
					wnd.elmnts.frm_toolbar.disableItem("btn_save");
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.disableItem(itemId);
					});
				}else{
					wnd.elmnts.frm_toolbar.enableItem("btn_sent");
					wnd.elmnts.frm_toolbar.enableItem("btn_save");
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.enableItem(itemId);
					});
				}
				if(retrieve_enabed)
					wnd.elmnts.frm_toolbar.enableListOption("bs_more", "btn_retrieve");
				else
					wnd.elmnts.frm_toolbar.disableListOption("bs_more", "btn_retrieve");
			}

			/**
			 * Обработчик события _ЗаписанаХарактеристикаПостроителя_
			 * @param scheme
			 * @param sattr
			 */
			function characteristic_saved(scheme, sattr){

				var ox = scheme.ox,
					dp = scheme._dp,
					row = ox.calc_order_row;
				
				if(!row || ox.calc_order != o)
					return;

				//nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
				//discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,department,ordn,changed

				row.nom = ox.owner;
				row.note = dp.note;
				row.quantity = dp.quantity || 1;
				row.len = ox.x;
				row.width = ox.y;
				row.s = ox.s;
				row.discount_percent = dp.discount_percent;
				row.discount_percent_internal = dp.discount_percent_internal;
				if(row.unit.owner != row.nom)
					row.unit = row.nom.storage_unit;
				
			}

			/**
			 * ОткрытьПостроитель()
			 * @param create_new {Boolean} - создавать новое изделие или открывать в текущей строке
			 */
			function open_builder(create_new){
				var selId, row;

				if(create_new){

					row = production_new_row();

					// объект продукции создаём, но из базы не читаем и пока не записываем
					$p.cat.characteristics.create({
						ref: $p.generate_guid(),
						calc_order: o,
						product: row.row
					}, true)
						.then(function (ox) {

							// записываем расчет, если не сделали этого ранее
							if(o.is_new())
								return o.save()
									.then(function () {
										return ox;
									});
							else
								return ox;
						})
						.then(function (ox) {
							row.characteristic = ox;
							$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
						});

				}else if((selId = production_get_sel_index()) != undefined){
					row = o.production.get(selId);
					if(row){
						if(row.characteristic.empty() || row.characteristic.calc_order.empty()){

						}else
							$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
					}
				}

				if(!evts.length){
					evts.push($p.eve.attachEvent("characteristic_saved", characteristic_saved));
				}
			}

			function open_spec(){
				var selId, row;

				if((selId = production_get_sel_index()) != undefined){
					row = o.production.get(selId);
					if(row && !$p.is_empty_guid(row.characteristic.ref)){
						row.characteristic.form_obj()
							.then(function (w) {
								w.wnd.maximize();
							});
					}
				}
			}

			/**
			 * добавляет строку материала
			 */
			function add_material(){
				var row = production_new_row(),
					grid = wnd.elmnts.grids.production,
					cell;
				grid.selectCell(row.row-1, grid.getColIndexById("nom"), false, true, true);
				cell = grid.cells();
				cell.edit();
				cell.open_selection();
			}

			/**
			 * ОбработатьДобавитьПродукцию()
			 */
			function process_add_product(new_rows){

				wnd.progressOn();
				// TODO: _mgr.save
				//_mgr.save({
				//	ref: o.ref,
				//	row: 0,
				//	o: o._obj,
				//	action: "calc",
				//	specify: "product_list",
				//	new_rows: new_rows
				//}).then(function(res){
				//	if(!$p.msg.check_soap_result(res))
				//		wnd.reflect_characteristic_change(res);
				//	wnd.progressOff();
				//});
			}

		}

	}
);

/**
 * Дополнительные методы перечисления Типы соединений
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module enm_cnn_types
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.enm.cnn_types;

		/**
		 * Массивы Типов соединений
		 * @type {Object}
		 */
		_mgr.acn = {cache :{}};
		_mgr.acn.__define({

			ii: {
				get : function(){
					return this.cache.ii
						|| ( this.cache.ii = [_mgr.Наложение] );
				},
				enumerable : false,
				configurable : false
			},

			i: {
				get : function(){
					return this.cache.i
						|| ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
				},
				enumerable : false,
				configurable : false
			},

			a: {
				get : function(){
					return this.cache.a
						|| ( this.cache.a = [
							_mgr.УгловоеДиагональное,
							_mgr.УгловоеКВертикальной,
							_mgr.УгловоеКГоризонтальной,
							_mgr.КрестВСтык] );
				},
				enumerable : false,
				configurable : false
			},

			t: {
				get : function(){
					return this.cache.t
						|| ( this.cache.t = [_mgr.ТОбразное] );
				},
				enumerable : false,
				configurable : false
			}
		});

		/**
		 * Короткие псевдонимы перечисления "Типы соединений"
		 * @type {Object}
		 */
		_mgr.tcn = {cache :{}};
		_mgr.tcn.__define({
			ad: {
				get : function(){
					return this.cache.ad || ( this.cache.ad = _mgr.УгловоеДиагональное );
				},
				enumerable : false,
				configurable : false
			},

			av: {
				get : function(){
					return this.cache.av || ( this.cache.av = _mgr.УгловоеКВертикальной );
				},
				enumerable : false,
				configurable : false
			},

			ah: {
				get : function(){
					return this.cache.ah || ( this.cache.ah = _mgr.УгловоеКГоризонтальной );
				},
				enumerable : false,
				configurable : false
			},

			t: {
				get : function(){
					return this.cache.t || ( this.cache.t = _mgr.ТОбразное );
				},
				enumerable : false,
				configurable : false
			},

			ii: {
				get : function(){
					return this.cache.ii || ( this.cache.ii = _mgr.Наложение );
				},
				enumerable : false,
				configurable : false
			},

			i: {
				get : function(){
					return this.cache.i || ( this.cache.i = _mgr.НезамкнутыйКонтур );
				},
				enumerable : false,
				configurable : false
			},

			xt: {
				get : function(){
					return this.cache.xt || ( this.cache.xt = _mgr.КрестПересечение );
				},
				enumerable : false,
				configurable : false
			},

			xx: {
				get : function(){
					return this.cache.xx || ( this.cache.xx = _mgr.КрестВСтык );
				},
				enumerable : false,
				configurable : false
			}
		});

	}
);
/**
 * Дополнительные методы перечисления Типы элементов
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module enm_elm_types
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.enm.elm_types,

			/**
			 * Массивы Типов элементов
			 * @type {Object}
			 */
			cache = {};

		_mgr.__define({

			profiles: {
				get : function(){
					return cache.profiles
						|| ( cache.profiles = [
							_mgr.Рама,
							_mgr.Створка,
							_mgr.Импост,
							_mgr.Штульп,
							_mgr.Раскладка] );
				},
				enumerable : false,
				configurable : false
			},

			rama_impost: {
				get : function(){
					return cache.rama_impost
						|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
				},
				enumerable : false,
				configurable : false
			},

			stvs: {
				get : function(){
					return cache.stvs || ( cache.stvs = [_mgr.Створка] );
				},
				enumerable : false,
				configurable : false
			},

			glasses: {
				get : function(){
					return cache.glasses
						|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
				},
				enumerable : false,
				configurable : false
			}

		});

	}
);
/**
 * Аналог УПзП-шного __ЦенообразованиеСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  glob_pricing
 */

$p.modifiers.push(
	function($p){

		$p.pricing = new Pricing($p);


		function Pricing($p){

			/**
			 * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
			 * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
			 * @method nom_price
			 * @param nom
			 * @param characteristic
			 * @param price_type
			 * @param prm
			 * @param row
			 * @param cache
			 */
			this.nom_price = function (nom, characteristic, price_type, prm, row, cache) {

			};

			/**
			 * Возвращает структуру типов цен и КМарж
			 * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
			 * @method price_type
			 * @param prm
			 */
			this.price_type = function (prm) {

			};

			/**
			 * Формирует кеш цен номенклатуры по типу на дату
			 * Аналог УПзП-шного __СформироватьКешЦен__
			 * @param anom
			 * @param price_type
			 * @param date
			 * @param cache
			 */
			this.build_cache = function (anom, price_type, date, cache) {

			};

			/**
			 * Рассчитывает плановую себестоимость строки документа Расчет
			 * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
			 * @param prm
			 * @param cancel
			 */
			this.calc_first_cost = function (prm, cancel) {

			};

			/**
			 * Рассчитывает стоимость продажи в строке документа Расчет
			 * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
			 * @param prm
			 * @param cancel
			 */
			this.calc_amount = function (prm, cancel) {

			}
		}

	}
);

/**
 * Аналог УПзП-шного __ПостроительИзделийСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  glob_products_building
 */

$p.modifiers.push(
	function($p){

		$p.products_building = new ProductsBuilding();

		function ProductsBuilding(){

			var added_cnn_spec,
				ox,
				spec,
				constructions,
				coordinates,
				cnn_elmnts,
				glass_specification,
				glass_formulas,
				params;

			/**
			 * Перед записью изделия построителя
			 * Аналог УПзП-шного __ПередЗаписьюНаСервере__
			 * @method before_save
			 * @for ProductsBuilding
			 * @param o
			 * @param row
			 * @param prm
			 * @param cancel
			 */
			function before_save(o, row, prm, cancel) {

			}

			/**
			 * РассчитатьКоличествоПлощадьМассу
			 * @param row_cpec
			 * @param row_coord
			 */
			function calc_count_area_mass(row_cpec, row_coord, angle_calc_method_prev, angle_calc_method_next){

				//TODO: учесть angle_calc_method
				if(!angle_calc_method_next)
					angle_calc_method_next = angle_calc_method_prev;

				if(angle_calc_method_prev && !row_cpec.nom.is_pieces){

					if((angle_calc_method_prev == $p.enm.angle_calculating_ways.Основной) ||
						(angle_calc_method_prev == $p.enm.angle_calculating_ways.СварнойШов)){
						row_cpec.alp1 = row_coord.alp1;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways._90){
						row_cpec.alp1 = 90;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.СоединениеПополам){
						row_cpec.alp1 = row_coord.alp1 / 2;

					}else if(angle_calc_method_prev == $p.enm.angle_calculating_ways.Соединение){
						row_cpec.alp1 = row_coord.alp1;
					}

					if((angle_calc_method_next == $p.enm.angle_calculating_ways.Основной) ||
						(angle_calc_method_next == $p.enm.angle_calculating_ways.СварнойШов)){
						row_cpec.alp2 = row_coord.alp2;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways._90){
						row_cpec.alp2 = 90;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.СоединениеПополам){
						row_cpec.alp2 = row_coord.alp2 / 2;

					}else if(angle_calc_method_next == $p.enm.angle_calculating_ways.Соединение){
						row_cpec.alp2 = row_coord.alp2;

					}
				}

				if(row_cpec.len){
					if(row_cpec.width && !row_cpec.s)
						row_cpec.s = row_cpec.len * row_cpec.width;
				}else
					row_cpec.s = 0;

				if(!row_cpec.qty && (row_cpec.len || row_cpec.width))
					row_cpec.qty = 1;

				if(row_cpec.s)
					row_cpec.totqty = row_cpec.qty * row_cpec.s;

				else if(row_cpec.len)
					row_cpec.totqty = row_cpec.qty * row_cpec.len;

				else
					row_cpec.totqty = row_cpec.qty;

				row_cpec.totqty1 = row_cpec.totqty * row_cpec.nom.loss_factor;

				["len","width","s","qty","totqty","totqty1","alp1","alp2"].forEach(function (fld) {
					row_cpec[fld] = row_cpec[fld].round(4);
				});
			}

			/**
			 * РассчитатьQtyLen
			 * @param row_spec
			 * @param row_base
			 * @param len
			 */
			function calc_qty_len(row_spec, row_base, len){

				var nom = row_spec.nom;

				if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
						nom.cutting_optimization_type.empty() || nom.is_pieces){

					if(!row_base.coefficient || !len)
						row_spec.qty = row_base.quantity;

					else{
						if(!nom.is_pieces){
							row_spec.qty = row_base.quantity;
							row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
							if(nom.rounding_quantity){
								row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
								row_spec.len = 0;
							};

						}else if(!nom.rounding_quantity){
							row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);

						}else{
							row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
						}
					}

				}else{
					row_spec.qty = row_base.quantity;
					row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
				}
			}

			/**
			 * СтрокаСоединений
			 * @param elm1
			 * @param elm2
			 * @return {*}
			 */
			function cnn_row(elm1, elm2){
				var res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
				if(res.length)
					return res[0].row;
				res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
				if(res.length)
					return res[0].row;
				return 0;
			}

			/**
			 * НадоДобавитьСпецификациюСоединения
			 * @param cnn
			 * @param elm1
			 * @param elm2
			 */
			function need_add_cnn_spec(cnn, elm1, elm2){

				// соединения крест пересечение и крест в стык обрабатываем отдельно
				if(cnn && cnn.cnn_type == $p.enm.cnn_types.КрестВСтык)
					return false;

				else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1)
					return false;

				added_cnn_spec[elm1] = elm2;
				return true;
			}

			/**
			 * Добавляет или заполняет строку спецификации
			 * @param row_spec
			 * @param elm
			 * @param row_base
			 * @param [nom]
			 * @param [origin]
			 * @return {TabularSectionRow.<cat.characteristics.specification>}
			 */
			function new_spec_row(row_spec, elm, row_base, nom, origin){
				if(!row_spec)
					row_spec = spec.add();
				row_spec.nom = nom || row_base.nom;
				row_spec.clr = $p.cat.clrs.by_predefined(row_base.clr, elm.clr, ox.clr);
				row_spec.elm = elm.elm;
				if(origin)
					row_spec.origin = origin;
				return row_spec;
			}

			/**
			 * ДополнитьСпецификациюСпецификациейСоединения
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function add_cnn_spec(cnn, elm, len_angl){

				var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

				filter_cnn_spec(cnn, elm, len_angl).forEach(function (row_cnn_spec) {
					var nom = row_cnn_spec.nom;
					// TODO: nom может быть вставкой - в этом случае надо разузловать
					var row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin);

					// В простейшем случае, формула = "ДобавитьКомандуСоединения(Парам);"
					if(!row_cnn_spec.formula) {
						if(nom.is_pieces){
							if(!row_cnn_spec.coefficient)
								row_spec.qty = row_cnn_spec.quantity;
							else
								row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
									.round(nom.rounding_quantity);
						}else{
							// TODO: Строго говоря, нужно брать не размер соединения, а размеры предыдущего и последующего
							row_spec.qty = row_cnn_spec.quantity;
							if(row_cnn_spec.sz || row_cnn_spec.coefficient)
								row_spec.len = (len_angl.len - (len_angl.glass ? cnn.sz * 2 : 0) - sign * 2 * row_cnn_spec.sz) *
									(row_cnn_spec.coefficient || 0.001);
						}

					}else {
						try{
							if(eval(row_cnn_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}
					};

					if(!row_spec.qty)
						spec.del(row_spec.row-1);
					else
						calc_count_area_mass(row_spec, len_angl, row_cnn_spec.angle_calc_method);
				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function filter_cnn_spec(cnn, elm, len_angl){

				var res = [], nom, angle_hor = elm.angle_hor;

				cnn.specification.each(function (row) {
					nom = row.nom;
					if(!nom || nom.empty() ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул1") ||
							nom == $p.cat.predefined_elmnts.predefined("Номенклатура_Артикул2"))
						return;

					// только для прямых или только для кривых профилей
					if((row.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
							(row.for_direct_profile_only < 0 &&elm.profile.is_linear()))
						return;

					//TODO: реализовать фильтрацию
					if(cnn.cnn_type == $p.enm.cnn_types.Наложение){
						if(row.amin > angle_hor || row.amax < angle_hor)
							return;
					}else{
						if(row.amin > len_angl.angle || row.amax < len_angl.angle)
							return;
					};

					// "Устанавливать с" проверяем только для соединений профиля
					if(($p.enm.cnn_types.acn.a.indexOf(cnn.cnn_type) != -1) && (
							(row.set_specification == $p.enm.specification_installation_methods.САртикулом1 && !len_angl.art1) ||
							(row.set_specification == $p.enm.specification_installation_methods.САртикулом2 && !len_angl.art2)
						))
						return;

					// Проверяем параметры изделия и добавляем, если проходит по ограничениям
					if(check_params(cnn.selection_params, row.elm))
						res.push(row);

				});
				return res;
			}

			/**
			 * Проверяет соответствие параметров отбора параметрам изделия
			 * @param selection_params
			 * @param elm
			 * @param [cnstr]
			 * @return {boolean}
			 */
			function check_params(selection_params, elm, cnstr){
				var ok = true;
				selection_params.find_rows({elm: elm}, function (prm) {
					ok = false;
					params.find_rows({cnstr: cnstr || 0, param: prm.param, value: prm.value}, function () {
						ok = true;
						return false;
					});
					return ok;
				});
				return ok;
			}

			/**
			 * ПроверитьОграниченияВставки
			 * TODO: перенести в прототип объекта вставки
			 * @param inset
			 * @param elm
			 * @param by_perimetr
			 * @return {boolean}
			 */
			function check_inset(inset, elm, by_perimetr){

				var is_tabular = true,
					_row = elm._row;

				// проверяем площадь
				if(inset.smin > _row.s || (_row.s && inset.smax && inset.smax < _row.s))
					return false;

				// Главный элемент с нулевым количеством не включаем
				if(inset.is_main_elm && !inset.quantity)
					return false;

				if($p.is_data_obj(inset)){

					// только для прямых или только для кривых профилей
					if((inset.for_direct_profile_only > 0 && !elm.profile.is_linear()) ||
						(inset.for_direct_profile_only < 0 &&elm.profile.is_linear()))
						return false;

					if(inset.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
						if(!elm.joined_imposts(true))
							return false;

					}else if(inset.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
						if(elm.joined_imposts(true))
							return false;
					}
					is_tabular = false;
				}


				if(!is_tabular || by_perimetr || inset.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
					if(inset.lmin > _row.len || (inset.lmax < _row.len && inset.lmax > 0))
						return false;
					if(inset.ahmin > _row.angle_hor || inset.ahmax < _row.angle_hor)
						return false;
				}

				//// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

				return true;
			}

			/**
			 * ПолучитьСпецификациюВставкиСФильтром
			 * @param inset
			 * @param elm
			 * @param [is_high_level_call]
			 */
			function filter_inset_spec(inset, elm, is_high_level_call){

				var res = [], glass_rows;
				if(!inset || inset.empty())
					return res;

				if(is_high_level_call && inset.insert_type == $p.enm.inserts_types.Стеклопакет){
					glass_rows = glass_specification.find_rows({elm: elm.elm});
					if(!glass_rows.length){
						// заполняем спецификацию заполнений по умолчанию, чтобы склеить формулу
						inset.specification.each(function (row) {
							glass_rows.push(
								glass_specification.add({
									elm: elm.elm,
									gno: 0,
									inset: row.nom,
									clr: row.clr
								})
							);
						});
					}

					if(glass_rows.length){
						glass_formulas[elm.elm] = "";
						glass_rows.forEach(function (row) {
							filter_inset_spec(row.inset, elm).forEach(function (row) {
								res.push(row);
							});
							if(!glass_formulas[elm.elm])
								glass_formulas[elm.elm] = row.inset.name;
							else
								glass_formulas[elm.elm] += "x" + row.inset.name;
						});
						return res;
					}
				}

				inset.specification.each(function (row) {

					// Проверяем ограничения строки вставки
					if(!check_inset(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль))
						return;

					// Проверяем параметры изделия
					if(!check_params(inset.selection_params, row.elm))
						return;

					// Добавляем или разузловываем дальше
					if(row.nom._manager.class_name == "cat.nom")
						res.push(row);
					else
						filter_inset_spec(row.nom, elm).forEach(function (row) {
							res.push(row);
						});
				});

				return res;
			}

			/**
			 * Спецификации фурнитуры
			 */
			function spec_furn(scheme) {

			}

			/**
			 * Спецификации соединений
			 */
			function spec_nearest_cnn(elm) {
				var nearest = elm.nearest();
				if(nearest && elm.data._nearest_cnn)
					add_cnn_spec(elm.data._nearest_cnn, elm, {
						angle:  0,
						alp1:   0,
						alp2:   0,
						len:    elm.data._len,
						origin: cnn_row(elm.elm, nearest.elm)
					});
			}

			/**
			 * Спецификация вставки элемента
			 */
			function spec_insets(elm) {

				var _row = elm._row;

				filter_inset_spec(elm.inset, elm, true).forEach(function (row_ins_spec) {

					var row_spec;

					// добавляем строку спецификации, если профиль или не про шагам
					if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
						&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
						$p.enm.elm_types.profiles.indexOf(_row.elm_type) != -1)
						row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);

					if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && row_ins_spec.formula){
						try{
							row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, elm.inset);
							if(eval(row_ins_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}

					}else if($p.enm.elm_types.profiles.indexOf(_row.elm_type) != -1 ||
								row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
						// Для вставок в профиль способ расчета количество не учитывается
						calc_qty_len(row_spec, row_ins_spec, _row.len);

					}else{

						if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
							row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
							row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
							row_spec.s = _row.s;

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
							var row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
							elm.perimeter.forEach(function (rib) {
								row_prm._row._mixin(rib);
								if(check_inset(row_ins_spec, row_prm, true)){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);
									calc_qty_len(row_spec, row_ins_spec, rib.len);
									calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
								}
								row_spec = null;
							});

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам){

							var h = _row.y2 - _row.y1, w = _row.x2 - _row.x1;
							if((row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
								row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление) && row_ins_spec.step){

								for(var i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, elm.inset);
									calc_qty_len(row_spec, row_ins_spec, w);
									calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);
								}
								row_spec = null;
							}

						}else{
							throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
						}

					}

					if(row_spec)
						calc_count_area_mass(row_spec, _row, row_ins_spec.angle_calc_method);

				});
			}

			/**
			 * Базовая cпецификация по соединениям и вставкам таблицы координат
			 */
			function spec_base(scheme) {

				var b, e, curr, prev, next, len_angle,
					_row, row_constr, row_cnn, row_cnn_prev, row_cnn_next, row_spec;

				added_cnn_spec = {};

				// для всех контуров изделия
				scheme.contours.forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(function (curr) {

						_row = curr._row;
						if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure)
							return;

						b = curr.rays.b;
						e = curr.rays.e;
						prev = b.profile;
						next = e.profile;
						row_cnn_prev = b.cnn.main_row(curr);
						row_cnn_next = e.cnn.main_row(curr);

						// добавляем строку спецификации
						row_spec = new_spec_row(null, curr, row_cnn_prev, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0))

						// уточняем размер
						row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
							* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

						// profile.Длина - то, что получится после обработки
						// row_spec.Длина - сколько взять (отрезать)
						curr.data._len = _row.len;
						_row.len = (_row.len
							- (!row_cnn_prev || row_cnn_prev.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_prev.sz)
							- (!row_cnn_next || row_cnn_next.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_next.sz))
							* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

						// припуск для гнутых элементов
						if(!curr.is_linear())
							row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
						else if((row_cnn_prev && row_cnn_prev.formula) || (row_cnn_next && row_cnn_next.formula)){
							// TODO: дополнительная корректировка длины формулой

						}

						// РассчитатьКоличествоПлощадьМассу
						calc_count_area_mass(row_spec, _row, row_cnn_prev.angle_calc_method, row_cnn_next.angle_calc_method);

						// НадоДобавитьСпецификациюСоединения
						if(need_add_cnn_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

							len_angle = {
								angle: 0,
								alp1: prev.generatrix.angle_to(curr.generatrix, curr.b, true),
								alp2: curr.generatrix.angle_to(next.generatrix, curr.e, true),
								// art1: true TODO: учесть art-1-2
							};

							if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){
								// соединение Т-образное или незамкнутый контур: для них арт 1-2 не используется

								// для него надо рассчитать еще и с другой стороны
								if(need_add_cnn_spec(e.cnn, next ? next.elm : 0, _row.elm)){
								//	TODO: ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
								}
							}

							// для раскладок доппроверка
							//Если СтрК.ТипЭлемента = Перечисления.пзТипыЭлементов.Раскладка И (СоедСлед != Неопределено)
							//	И (СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.ТОбразное
							//	Или СоедСлед.ТипСоединения = Перечисления.пзТипыСоединений.НезамкнутыйКонтур) Тогда
							//	Если НадоДобавитьСпецификациюСоединения(СтруктураПараметров, СоедСлед, СтрК, След) Тогда
							//		ДлиныУглыСлед.Вставить("ДлинаСоединения", СтрК.Длина);
							//		ДополнитьСпецификациюСпецификациейСоединения(СтруктураПараметров, СтрК, ДлиныУглыСлед, СоедСлед, След);
							//	КонецЕсли;
							//КонецЕсли;

							// спецификацию с предыдущей стороны рассчитваем всегда
							add_cnn_spec(b.cnn, curr, len_angle);

						}


						// Спецификация вставки
						spec_insets(curr);

						// Если у профиля есть примыкающий элемент, добавим спецификацию соединения
						if(contour.parent)
							spec_nearest_cnn(curr);

					});


					// для всех заполнений контура
					contour.glasses(false, true).forEach(function (glass) {

						var profiles = glass.profiles,
							glength = profiles.length;

						_row = glass._row;

						// для всех рёбер заполнения
						for(var i=0; i<glength; i++ ){
							curr = profiles[i];
							prev = (i==0 ? profiles[glength-1] : profiles[i-1]).profile;
							next = (i==glength-1 ? profiles[0] : profiles[i+1]).profile;
							row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

							len_angle = {
								angle: 0,
								alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
								alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
								len: row_cnn.length ? row_cnn[0].aperture_len : 0,
								origin: cnn_row(_row.elm, curr.profile.elm),
								glass: true

							};

							// добавляем спецификацию соединения рёбер заполнения с профилем
							add_cnn_spec(curr.cnn, curr.profile, len_angle);

						}

						// добавляем спецификацию вставки в заполнение
						spec_insets(glass);

						// TODO: для всех раскладок заполнения

					});




				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme, attr) {

				ox = scheme.ox;
				spec = ox.specification;
				constructions = ox.constructions;
				coordinates = ox.coordinates;
				cnn_elmnts = ox.cnn_elmnts;
				glass_specification = ox.glass_specification;
				glass_formulas = {};
				params = ox.params;

				// чистим спецификацию
				spec.clear();

				// рассчитываем базовую сецификацию
				spec_base(scheme);

				// сворачиваем
				spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin", "qty,totqty,totqty1");

				// информируем мир об окончании расчета координат
				$p.eve.callEvent("coordinates_calculated", [scheme, attr]);

				// рассчитываем цены


				// информируем мир о записи продукции
				if(attr.save){

					// сохраняем картинку вместе с изделием
					var svg = scheme.get_svg();
					
					ox.save(undefined, undefined, {
							svg: {
								"content_type": "image/svg+xml",
								"data": new Blob([svg], {type: "image/svg+xml"})
							}
					})
						.then(function () {
							$p.msg.show_msg("Спецификация рассчитана");
							$p.eve.callEvent("characteristic_saved", [scheme, attr]);
						});
				}

			});

		}

	}
);


/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  glob_spec_building
 */

$p.modifiers.push(
	function($p){

		$p.spec_building = new SpecBuilding($p);

		function SpecBuilding($p){

			/**
			 * Рассчитывает спецификацию в строке документа Расчет
			 * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
			 * @param prm
			 * @param cancel
			 */
			this.calc_row_spec = function (prm, cancel) {

			}

		}

	}
);



$p.injected_data._mixin({"create_tables.sql":"USE md;\nCREATE TABLE IF NOT EXISTS `areg_invoice_payments` (`trans` CHAR, `partner` CHAR, `organization` CHAR, `period` Date, `recorder` CHAR, `recorder_T` CHAR, `amount_mutual` FLOAT, `amount_operation` FLOAT, PRIMARY KEY (`trans`, `partner`, `organization`, `period`, `recorder`));\nCREATE TABLE IF NOT EXISTS `areg_planning` (`phase` CHAR, `date` Date, `work_shift` CHAR, `work_center` CHAR, `work_center_T` CHAR, `obj` CHAR, `obj_T` CHAR, `elm` CHAR, `elm_T` CHAR, `specimen` INT, `period` Date, `recorder` CHAR, `recorder_T` CHAR, `quantity` FLOAT, `cost` FLOAT, PRIMARY KEY (`phase`, `date`, `work_shift`, `work_center`, `obj`, `elm`, `specimen`, `period`, `recorder`));\nCREATE TABLE IF NOT EXISTS `ireg_specification_adjustment` (`area` CHAR, `area_T` CHAR, `icounter` INT, `production` CHAR, `material_operation` CHAR, `characteristic` CHAR, `parameters_key` CHAR, `formula` CHAR, `condition_formula` CHAR, `is_order_row` BOOLEAN, `note` CHAR, PRIMARY KEY (`area`, `icounter`, `production`, `material_operation`, `characteristic`, `parameters_key`));\nCREATE TABLE IF NOT EXISTS `ireg_workers_schedules` (`begin_time` Date, `individual_person` CHAR, `department` CHAR, `end_time` Date, PRIMARY KEY (`begin_time`, `individual_person`, `department`));\nCREATE TABLE IF NOT EXISTS `ireg_currency_courses` (`currency` CHAR, `period` Date, `course` FLOAT, `multiplicity` INT, PRIMARY KEY (`currency`, `period`));\nCREATE TABLE IF NOT EXISTS `ireg_margin_coefficients` (`price_group` CHAR, `parameters_key` CHAR, `condition_formula` CHAR, `marginality` FLOAT, `marginality_min` FLOAT, `marginality_internal` FLOAT, `price_type_first_cost` CHAR, `price_type_sale` CHAR, `price_type_internal` CHAR, `formula` CHAR, `sale_formula` CHAR, `internal_formula` CHAR, `external_formula` CHAR, `extra_charge_external` FLOAT, `discount_external` FLOAT, `discount` FLOAT, `note` CHAR, PRIMARY KEY (`price_group`, `parameters_key`, `condition_formula`));\nCREATE TABLE IF NOT EXISTS `ireg_nom_prices` (`price_type` CHAR, `nom` CHAR, `nom_characteristic` CHAR, `period` Date, `currency` CHAR, `price` FLOAT, `discount_percent` FLOAT, PRIMARY KEY (`price_type`, `nom`, `nom_characteristic`, `period`));\nCREATE TABLE IF NOT EXISTS `ireg_$log` (`date` INT, `sequence` INT, `class` CHAR, `note` CHAR, `obj` CHAR, PRIMARY KEY (`date`, `sequence`));\nCREATE TABLE IF NOT EXISTS `ireg_buyers_order_states` (`invoice` CHAR, `state` CHAR, `event_date` Date, `СуммаОплаты` FLOAT, `ПроцентОплаты` INT, `СуммаОтгрузки` FLOAT, `ПроцентОтгрузки` INT, `СуммаДолга` FLOAT, `ПроцентДолга` INT, `ЕстьРасхожденияОрдерНакладная` BOOLEAN, PRIMARY KEY (`invoice`));\nCREATE TABLE IF NOT EXISTS `doc_planning_event` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `phase` CHAR, `work_shift` CHAR, `department` CHAR, `work_center` CHAR, `obj` CHAR, `obj_T` CHAR, `ts_executors` JSON, `ts_planning` JSON);\nCREATE TABLE IF NOT EXISTS `doc_nom_prices_setup` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `note` CHAR, `responsible` CHAR, `ts_goods` JSON);\nCREATE TABLE IF NOT EXISTS `doc_selling` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `department` CHAR, `warehouse` CHAR, `partner` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR, `ts_goods` JSON, `ts_services` JSON);\nCREATE TABLE IF NOT EXISTS `doc_credit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR);\nCREATE TABLE IF NOT EXISTS `doc_debit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR);\nCREATE TABLE IF NOT EXISTS `doc_credit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR);\nCREATE TABLE IF NOT EXISTS `doc_debit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR);\nCREATE TABLE IF NOT EXISTS `doc_calc_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `number_internal` CHAR, `project` CHAR, `organization` CHAR, `partner` CHAR, `client_of_dealer` CHAR, `contract` CHAR, `invoice` CHAR, `organizational_unit` CHAR, `note` CHAR, `manager` CHAR, `leading_manager` CHAR, `department` CHAR, `doc_amount` FLOAT, `amount_operation` FLOAT, `amount_internal` FLOAT, `accessory_characteristic` CHAR, `doc_currency` CHAR, `sys_profile` CHAR, `sys_furn` CHAR, `phone` CHAR, `delivery_area` CHAR, `shipping_address` CHAR, `coordinates` CHAR, `address_fields` CHAR, `difficult` BOOLEAN, `vat_consider` BOOLEAN, `vat_included` BOOLEAN, `settlements_course` FLOAT, `settlements_multiplicity` INT, `obj_delivery_state` CHAR, `ts_production` JSON, `ts_extra_fields` JSON, `ts_contact_information` JSON);\nCREATE TABLE IF NOT EXISTS `doc_buyers_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `partner` CHAR, `organization` CHAR, `warehouse` CHAR, `note` CHAR, `organizational_unit` CHAR, `organizational_unit_T` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `vat_included` BOOLEAN, `vat_consider` BOOLEAN, `department` CHAR);\nCREATE TABLE IF NOT EXISTS `doc_purchase` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `note` CHAR, `responsible` CHAR, `ts_goods` JSON, `ts_services` JSON);\nCREATE TABLE IF NOT EXISTS `doc_registers_correction` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `note` CHAR, `responsible` CHAR, `original_doc_type` CHAR, `ts_registers_table` JSON);\nCREATE TABLE IF NOT EXISTS `cat_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_characteristics` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `x` FLOAT, `y` FLOAT, `z` FLOAT, `s` FLOAT, `clr` CHAR, `weight` FLOAT, `condition_products` FLOAT, `calc_order` CHAR, `product` INT, `leading_product` CHAR, `leading_elm` INT, `note` CHAR, `number_str` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_constructions` JSON, `ts_coordinates` JSON, `ts_cnn_elmnts` JSON, `ts_params` JSON, `ts_glass_specification` JSON, `ts_extra_fields` JSON, `ts_glasses` JSON, `ts_mosquito` JSON, `ts_specification` JSON);\nCREATE TABLE IF NOT EXISTS `cat_individuals` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `birth_date` Date, `inn` CHAR, `imns_code` CHAR, `note` CHAR, `pfr_number` CHAR, `sex` CHAR, `birth_place` CHAR, `ОсновноеИзображение` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom_prices_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `price_currency` CHAR, `discount_percent` FLOAT, `vat_price_included` BOOLEAN, `rounding_order` CHAR, `rounding_in_a_big_way` BOOLEAN, `note` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_cost_items` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `cost_kind` CHAR, `costs_material_feed` CHAR, `costs_character` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_cash_flow_articles` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `РеквизитДопУпорядочивания` INT, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_stores` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `note` CHAR, `department` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_projects` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `start` Date, `finish` Date, `launch` Date, `readiness` Date, `finished` BOOLEAN, `responsible` CHAR, `note` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_users` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `invalid` BOOLEAN, `department` CHAR, `ФизическоеЛицо` CHAR, `note` CHAR, `ancillary` BOOLEAN, `predefined_name` CHAR, `ts_extra_fields` JSON, `ts_contact_information` JSON);\nCREATE TABLE IF NOT EXISTS `cat_divisions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `main_project` CHAR, `sorting` INT, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_color_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `for_pricing_only` CHAR, `for_pricing_only_T` CHAR, `predefined_name` CHAR, `ts_price_groups` JSON, `ts_clr_conformity` JSON);\nCREATE TABLE IF NOT EXISTS `cat_clrs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ral` CHAR, `machine_tools_clr` CHAR, `clr_str` CHAR, `clr_out` CHAR, `clr_in` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_furns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `flap_weight_max` INT, `left_right` BOOLEAN, `is_set` BOOLEAN, `is_sliding` BOOLEAN, `furn_set` CHAR, `side_count` INT, `handle_side` INT, `open_type` CHAR, `name_short` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_open_tunes` JSON, `ts_specification` JSON, `ts_selection_params` JSON, `ts_specification_restrictions` JSON);\nCREATE TABLE IF NOT EXISTS `cat_cnns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `amin` INT, `amax` INT, `sd1` CHAR, `sd2` CHAR, `sz` FLOAT, `cnn_type` CHAR, `ahmin` INT, `ahmax` INT, `lmin` INT, `lmax` INT, `tmin` INT, `tmax` INT, `var_layers` BOOLEAN, `for_direct_profile_only` INT, `art1vert` BOOLEAN, `art1glass` BOOLEAN, `art2glass` BOOLEAN, `predefined_name` CHAR, `ts_specification` JSON, `ts_cnn_elmnts` JSON, `ts_selection_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_delivery_areas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `country` CHAR, `region` CHAR, `city` CHAR, `latitude` FLOAT, `longitude` FLOAT, `ind` CHAR, `delivery_area` CHAR, `specify_area_by_geocoder` BOOLEAN, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_predefined_elmnts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `elm` CHAR, `elm_T` CHAR, `predefined_name` CHAR, `ts_elmnts` JSON);\nCREATE TABLE IF NOT EXISTS `cat_users_acl` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_acl_objs` JSON);\nCREATE TABLE IF NOT EXISTS `cat_production_params` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom` CHAR, `default_clr` CHAR, `auto_align` BOOLEAN, `allow_open_cnn` BOOLEAN, `sz_lines` CHAR, `clr_group` CHAR, `is_drainage` BOOLEAN, `active` BOOLEAN, `tmin` INT, `tmax` INT, `lay_split_type` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_elmnts` JSON, `ts_product_params` JSON, `ts_furn` JSON, `ts_furn_params` JSON, `ts_colors` JSON);\nCREATE TABLE IF NOT EXISTS `cat_parameters_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоПараметров` INT, `predefined_name` CHAR, `ts_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_inserts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `insert_type` CHAR, `clr` CHAR, `priority` INT, `lmin` INT, `lmax` INT, `hmin` INT, `hmax` INT, `smin` FLOAT, `smax` FLOAT, `for_direct_profile_only` INT, `ahmin` INT, `ahmax` INT, `mmin` INT, `mmax` INT, `insert_glass_type` CHAR, `impost_fixation` CHAR, `shtulp_fixation` BOOLEAN, `can_rotate` BOOLEAN, `sizeb` FLOAT, `predefined_name` CHAR, `ts_specification` JSON, `ts_selection_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_organizations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_bank_account` CHAR, `kpp` CHAR, `certificate_series_number` CHAR, `certificate_date_issue` Date, `certificate_authority_name` CHAR, `certificate_authority_code` CHAR, `individual_entrepreneur` CHAR, `predefined_name` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_nom_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `storage_unit` CHAR, `base_unit` CHAR, `vat_rate` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `name_full` CHAR, `base_unit` CHAR, `storage_unit` CHAR, `nom_kind` CHAR, `cost_item` CHAR, `nom_group` CHAR, `vat_rate` CHAR, `note` CHAR, `price_group` CHAR, `elm_type` CHAR, `len` FLOAT, `width` FLOAT, `thickness` FLOAT, `sizefurn` FLOAT, `sizefaltz` FLOAT, `density` FLOAT, `volume` FLOAT, `arc_elongation` FLOAT, `loss_factor` FLOAT, `rounding_quantity` INT, `clr` CHAR, `cutting_optimization_type` CHAR, `coloration_area` FLOAT, `pricing` CHAR, `complete_list_sorting` INT, `is_accessory` BOOLEAN, `is_procedure` BOOLEAN, `is_service` BOOLEAN, `is_pieces` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_partners` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `main_bank_account` CHAR, `note` CHAR, `kpp` CHAR, `okpo` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_contract` CHAR, `identification_document` CHAR, `buyer_main_manager` CHAR, `is_buyer` BOOLEAN, `is_supplier` BOOLEAN, `primary_contact` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `international_short` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_cashboxes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `funds_currency` CHAR, `department` CHAR, `current_account` CHAR, `predefined_name` CHAR, `owner` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_property_values` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `qualifier_unit` CHAR, `heft` FLOAT, `volume` FLOAT, `coefficient` FLOAT, `rounding_threshold` INT, `ПредупреждатьОНецелыхМестах` BOOLEAN, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_contracts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `settlements_currency` CHAR, `mutual_settlements` CHAR, `contract_kind` CHAR, `date` Date, `check_days_without_pay` BOOLEAN, `allowable_debts_amount` FLOAT, `allowable_debts_days` INT, `note` CHAR, `check_debts_amount` BOOLEAN, `check_debts_days` BOOLEAN, `number_doc` CHAR, `organization` CHAR, `main_cash_flow_article` CHAR, `main_project` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `prepayment_percent` FLOAT, `validity` Date, `vat_included` BOOLEAN, `price_type` CHAR, `vat_consider` BOOLEAN, `days_without_pay` INT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom_type` CHAR, `НаборСвойствНоменклатура` CHAR, `НаборСвойствХарактеристика` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_contact_information_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `Используется` BOOLEAN, `mandatory_fields` BOOLEAN, `tooltip` CHAR, `type` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_currencies` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ЗагружаетсяИзИнтернета` BOOLEAN, `name_full` CHAR, `extra_charge` FLOAT, `main_currency` CHAR, `parameters_russian_recipe` CHAR, `ФормулаРасчетаКурса` CHAR, `СпособУстановкиКурса` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_elm_visualization` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `svg_path` CHAR, `is_handle` BOOLEAN, `offset` INT, `side` CHAR, `elm_side` BOOLEAN, `attributes` CHAR, `cx` INT, `cy` INT, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_countries` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `alpha2` CHAR, `alpha3` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_destinations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоРеквизитов` CHAR, `КоличествоСведений` CHAR, `Используется` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON, `ts_extra_properties` JSON);\nCREATE TABLE IF NOT EXISTS `cat_banks_qualifier` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `correspondent_account` CHAR, `city` CHAR, `address` CHAR, `phone_numbers` CHAR, `activity_ceased` BOOLEAN, `СВИФТБИК` CHAR, `inn` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_property_values_hierarchy` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_organization_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `bank` CHAR, `funds_currency` CHAR, `account_number` CHAR, `СрокИсполненияПлатежа` INT, `settlements_bank` CHAR, `department` CHAR, `predefined_name` CHAR, `owner` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_partner_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `account_number` CHAR, `bank` CHAR, `settlements_bank` CHAR, `correspondent_text` CHAR, `appointments_text` CHAR, `funds_currency` CHAR, `bank_bic` CHAR, `РучноеИзменениеРеквизитовБанка` BOOLEAN, `bank_name` CHAR, `bank_correspondent_account` CHAR, `bank_city` CHAR, `bank_address` CHAR, `bank_phone_numbers` CHAR, `settlements_bank_bic` CHAR, `РучноеИзменениеРеквизитовБанкаДляРасчетов` BOOLEAN, `НаименованиеБанкаДляРасчетов` CHAR, `settlements_bank_correspondent_account` CHAR, `settlements_bank_city` CHAR, `АдресБанкаДляРасчетов` CHAR, `ТелефоныБанкаДляРасчетов` CHAR, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_params_links` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `master` CHAR, `slave` CHAR, `predefined_name` CHAR, `ts_values` JSON);\nCREATE TABLE IF NOT EXISTS `cch_properties` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `caption` CHAR, `shown` BOOLEAN, `destination` CHAR, `is_extra_property` BOOLEAN, `available` BOOLEAN, `mandatory` BOOLEAN, `extra_values_owner` CHAR, `note` CHAR, `tooltip` CHAR, `predefined_name` CHAR, `type` JSON, `ts_extra_fields_dependencies` JSON);\nCREATE TABLE IF NOT EXISTS `enm_individual_legal` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_costs_character` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_nom_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_contact_information_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_costs_material_feeds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_vat_rates` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_gender` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_outline_formation` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_elm_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_cnn_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_sz_line_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_open_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_cutting_optimization_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_lay_split_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_inserts_glass_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_inserts_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_cnn_sides` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_specification_installation_methods` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_angle_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_count_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_simple_complex_all` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_positions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_orientations` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_plan_limit` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_specification_adjustment_areas` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_open_directions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_color_groups_destination` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_control_during` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_planning_detailing` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_text_aligns` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_contraction_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_offset_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_transfer_operations_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_impost_mount_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_inset_attrs_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_caching_type` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_obj_delivery_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_costs_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_contract_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_mutual_contract_settlements` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\nCREATE TABLE IF NOT EXISTS `enm_accumulation_record_type` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR);\n","toolbar_calc_order_production.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_grp_add\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку заказа\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_add_builder\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt; Изделие построителя\" />\r\n        <item type=\"button\" id=\"btn_add_product\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Продукцию или услугу\" />\r\n        <item type=\"button\" id=\"btn_add_material\" text=\"&lt;i class='fa fa-cube fa-fw'&gt;&lt;/i&gt; Материал\" />\r\n    </item>\r\n\r\n    <item type=\"button\" id=\"btn_edit\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt;\" title=\"Редактировать изделие построителя\" />\r\n    <item type=\"button\" id=\"btn_spec\" text=\"&lt;i class='fa fa-table fa-fw'&gt;&lt;/i&gt;\" title=\"Открыть спецификацию изделия\" />\r\n    <item type=\"button\" id=\"btn_delete\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить строку заказа\" />\r\n\r\n    <item type=\"button\" id=\"btn_discount\" text=\"&lt;i class='fa fa-percent fa-fw'&gt;&lt;/i&gt;\" title=\"Скидки по типам строк заказа\"/>\r\n\r\n    <item id=\"sep1\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_calc_order_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt; Отправить\" title=\"Отправить заказ\" />\r\n    <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Рассчитать и записать данные\"/>\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\" />\r\n\r\n    <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_message\" enabled=\"false\" text=\"Сообщение\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\r\n        <item type=\"button\"     id=\"btn_retrieve\"    text=\"&lt;i class='fa fa-undo fa-fw'&gt;&lt;/i&gt; Отозвать\" title=\"Отозвать заказ\" />\r\n        <item type=\"separator\"  id=\"sep_export\" />\r\n        <item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить из файла\" />\r\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить в файл\" />\r\n    </item>\r\n\r\n    <item id=\"sep_close_1\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\r\n    <item id=\"sep_close_2\" type=\"separator\"/>\r\n\r\n</toolbar>","tree_filteres.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"draft\" text=\"&lt;i class='fa fa-pencil fa-fw'&gt;&lt;/i&gt; Черновики\" select=\"1\" tooltip=\"Предварительные расчеты\"/>\r\n    <item id=\"sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt; Отправлено\" tooltip=\"Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в 'черновики')\" />\r\n    <item id=\"confirmed\" text=\"&lt;i class='fa fa-thumbs-o-up fa-fw'&gt;&lt;/i&gt; Согласовано\" tooltip=\"Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером\" />\r\n    <item id=\"declined\" text=\"&lt;i class='fa fa-thumbs-o-down fa-fw'&gt;&lt;/i&gt; Отклонено\" tooltip=\"Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации\" />\r\n    <item id=\"credit\" text=\"&lt;i class='fa fa-ban fa-fw'&gt;&lt;/i&gt; Долги\" tooltip=\"Не оплачены либо оплачены не полностью\" />\r\n    <item id=\"prepayment\" text=\"&lt;i class='fa fa-money fa-fw'&gt;&lt;/i&gt; Авансы\" tooltip=\"Предоплата - еще не отгружены\" />\r\n    <item id=\"underway\" text=\"&lt;i class='fa fa-industry fa-fw'&gt;&lt;/i&gt; В работе\" tooltip=\"Включены в задания на производство, но еще не изготовлены\" />\r\n    <item id=\"manufactured\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Изготовлено\" tooltip=\"Изготовлены, но еще не отгружены\" />\r\n    <item id=\"executed\" text=\"&lt;i class='fa fa-truck fa-fw'&gt;&lt;/i&gt; Исполнено\" tooltip=\"Отгружены клиенту\" />\r\n    <item id=\"template\" text=\"&lt;i class='fa fa-puzzle-piece fa-fw'&gt;&lt;/i&gt; Шаблоны\" tooltip=\"Типовые блоки\" />\r\n    <item id=\"zarchive\" text=\"&lt;i class='fa fa-archive fa-fw'&gt;&lt;/i&gt; Архив\" tooltip=\"Старые заказы\" />\r\n    <item id=\"deleted\" text=\"&lt;i class='fa fa-trash-o fa-fw'&gt;&lt;/i&gt; Удалено\" tooltip=\"Помеченные на удаление\" />\r\n    <item id=\"all\" text=\"&lt;i class='fa fa-expand fa-fw'&gt;&lt;/i&gt; Все\" tooltip=\"Отключить фильтрацию\" />\r\n</tree>\r\n","view_about.html":"<div class=\"md_column1300\">\r\n    <h1><i class=\"fa fa-info-circle\"></i> Окнософт: Заказ дилера</h1>\r\n    <p>Заказ дилера - это веб-приложение с открытым исходным кодом, разработанное компанией <a href=\"http://www.oknosoft.ru/\" target=\"_blank\">Окнософт</a> на базе фреймворка <a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\">Metadata.js</a><br />\r\n        Исходный код и документация доступны на <a href=\"https://github.com/oknosoft/windowbuilder\" target=\"_blank\">GitHub <i class=\"fa fa-github-alt\"></i></a>.<br />\r\n    </p>\r\n\r\n    <h3>Назначение и возможности</h3>\r\n    <ul>\r\n        <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>\r\n        <li>Экстремальная поддержка сложных и нестандартных изделий (многоугольники, множественные перегибы профиля)</li>\r\n        <li>Расчет спецификации и координат технологических операций</li>\r\n        <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>\r\n        <li>Формирование печатных форм для заказчика и производства</li>\r\n        <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена данными с сервером при возобновлении соединения</li>\r\n    </ul>\r\n\r\n    <p>Использованы следующие библиотеки и инструменты:</p>\r\n\r\n    <h3>Серверная часть</h3>\r\n    <ul>\r\n        <li><a href=\"http://couchdb.apache.org/\" target=\"_blank\">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>\r\n        <li><a href=\"http://nginx.org/ru/\" target=\"_blank\">nginx</a>, высокопроизводительный HTTP-сервер</li>\r\n        <li><a href=\"http://1c-dn.com/1c_enterprise/\" target=\"_blank\">1c_enterprise</a>, ORM сервер 1С:Предприятие</li>\r\n    </ul>\r\n\r\n    <h3>Управление данными в памяти браузера</h3>\r\n    <ul>\r\n        <li><a href=\"https://pouchdb.com/\" target=\"_blank\">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>\r\n        <li><a href=\"https://github.com/agershun/alasql\" target=\"_blank\">alaSQL</a>, база данных SQL для браузера и Node.js с поддержкой как традиционных реляционных таблиц, так и вложенных JSON данных (NoSQL)</li>\r\n        <li><a href=\"https://github.com/SheetJS/js-xlsx\" target=\"_blank\">xlsx</a>, библиотека для чтения и записи XLSX / XLSM / XLSB / XLS / ODS в браузере</li>\r\n    </ul>\r\n\r\n    <h3>UI библиотеки и компоненты интерфейса</h3>\r\n    <ul>\r\n        <li><a href=\"http://paperjs.org/\" target=\"_blank\">paper.js</a>, фреймворк векторной графики для HTML5 Canvas</li>\r\n        <li><a href=\"http://dhtmlx.com/\" target=\"_blank\">dhtmlx</a>, кроссбраузерная библиотека javascript для построения современных веб и мобильных приложений</li>\r\n        <li><a href=\"https://github.com/Diokuz/baron\" target=\"_blank\">baron</a>, компонент управления полосами прокрутки</li>\r\n        <li><a href=\"https://jquery.com/\" target=\"_blank\">jQuery</a><span class=\"muted-color\">, популярная JavaScript библиотека селекторов и событий DOM</li>\r\n        <li><a href=\"https://github.com/eligrey/FileSaver.js\" target=\"_blank\">filesaver.js</a>, HTML5 реализация метода saveAs</li>\r\n    </ul>\r\n\r\n    <h3>Графика</h3>\r\n    <ul>\r\n        <li><a href=\"https://fortawesome.github.io/Font-Awesome/\" target=\"_blank\">fontawesome</a>, набор иконок и стилей CSS</li>\r\n    </ul>\r\n\r\n    <p>&nbsp;</p>\r\n    <h2><i class=\"fa fa-question-circle\"></i> Вопросы</h2>\r\n    <p>Если обнаружили ошибку, пожалуйста,\r\n        <a href=\"https://github.com/oknosoft/windowbuilder/issues/new\" target=\"_blank\">зарегистрируйте вопрос в GitHub</a> или\r\n        <a href=\"http://www.oknosoft.ru/metadata/#page-118\" target=\"_blank\">свяжитесь с разработчиком</a> напрямую<br /></p>\r\n    <p>&nbsp;</p>\r\n\r\n</div>","view_settings.html":"<div class=\"md_column1300\">\r\n\r\n    <div class=\"md_column320\" name=\"form1\" style=\"max-width: 420px;\"><div></div></div>\r\n\r\n</div>"});
/**
 *
 * Created 07.11.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @license content of this file is covered by Oknosoft Commercial license. Usage without proper license is prohibited. To obtain it contact info@oknosoft.ru
 * @author  Evgeniy Malyarov
 * @module  widgets
 * @submodule btn_auth_sync
 */

/**
 * ### Невизуальный компонент для управления кнопками авторизации и синхронизации на панелях инструментов
 * Изменяет текст, всплывающие подсказки и обработчики нажатий кнопок в зависимости от ...
 *
 * @class OBtnAuthSync
 * @constructor
 */
function OBtnAuthSync() {

	var bars = [], spin_timer;

	//$(t.tb_nav.buttons.bell).addClass("disabledbutton");

	function btn_click(){

		if($p.wsql.pouch.authorized)
			dhtmlx.confirm({
				title: $p.msg.log_out_title,
				text: $p.msg.logged_in + $p.wsql.pouch.authorized + $p.msg.log_out_break,
				cancel: $p.msg.cancel,
				callback: function(btn) {
					if(btn){
						$p.wsql.pouch.log_out();
					}
				}
			});
		else
			$p.iface.frm_auth({
				modal_dialog: true
				//, try_auto: true
			});
	}

	function sync_mouseover(){

	}

	function sync_mouseout(){

	}

	function set_spin(spin){

		if(spin && spin_timer){
			clearTimeout(spin_timer);

		}else{
			bars.forEach(function (bar) {
				if(spin)
					bar.buttons.sync.innerHTML = '<i class="fa fa-refresh fa-spin md-fa-lg"></i>';
				else{
					if($p.wsql.pouch.authorized)
						bar.buttons.sync.innerHTML = '<i class="fa fa-refresh md-fa-lg"></i>';
					else
						bar.buttons.sync.innerHTML = '<i class="fa fa-ban md-fa-lg"></i>';
				}
			});
		}
		spin_timer = spin ? setTimeout(set_spin, 3000) : 0;
	}

	function set_auth(){

		bars.forEach(function (bar) {

			if($p.wsql.pouch.authorized){
				bar.buttons.auth.title = $p.msg.logged_in + $p.wsql.pouch.authorized;
				bar.buttons.auth.innerHTML = '<i class="fa fa-sign-out md-fa-lg"></i>';
				bar.buttons.sync.title = "Синхронизация выполняется...";
				bar.buttons.sync.innerHTML = '<i class="fa fa-refresh md-fa-lg"></i>';
			}else{
				bar.buttons.auth.title = "Войти на сервер и включить синхронизацию данных";
				bar.buttons.auth.innerHTML = '<i class="fa fa-sign-in md-fa-lg"></i>';
				bar.buttons.sync.title = "Синхронизация не выполняется - пользователь не авторизован на сервере";
				bar.buttons.sync.innerHTML = '<i class="fa fa-ban md-fa-lg"></i>';
					//'<i class="fa fa-refresh fa-stack-1x"></i>' +
					//'<i class="fa fa-ban fa-stack-2x text-danger"></i>' +
					//'</span>';
			}
		})
	}

	/**
	 * Привязывает обработчики к кнопке
	 * @param btn
	 */
	this.bind = function (bar) {
		bar.buttons.auth.onclick = btn_click;
		//bar.buttons.auth.onmouseover = null;
		//bar.buttons.auth.onmouseout = null;
		bar.buttons.sync.onclick = null;
		bar.buttons.sync.onmouseover = sync_mouseover;
		bar.buttons.sync.onmouseout = sync_mouseout;
		bars.push(bar);
		setTimeout(set_auth);
	};

	$p.eve.attachEvent("pouch_load_data_start", function (page) {

		if(!$p.iface.sync)
			$p.iface.wnd_sync();
		$p.iface.sync.create($p.eve.stepper);
		$p.eve.stepper.frm_sync.setItemValue("text_bottom", "Читаем справочники");

		if(page.hasOwnProperty("local_rows") && page.local_rows < 10){
			$p.eve.stepper.wnd_sync.setText("Первый запуск - подготовка данных");
			$p.eve.stepper.frm_sync.setItemValue("text_processed", "Загрузка начального образа");
		}else{
			$p.eve.stepper.wnd_sync.setText("Загрузка данных из IndexedDB");
			$p.eve.stepper.frm_sync.setItemValue("text_processed", "Извлечение начального образа");
		}

		set_spin(true);
	});

	$p.eve.attachEvent("pouch_load_data_page", function (page) {
		set_spin(true);
		if($p.eve.stepper.wnd_sync){
			var docs_written = page.docs_written || page.page * page.limit;
			$p.eve.stepper.frm_sync.setItemValue("text_current", "Обработано элементов: " + docs_written + " из " + page.total_rows);
			$p.eve.stepper.frm_sync.setItemValue("text_bottom", "Текущий запрос: " + page.page + " (" + (100 * docs_written/page.total_rows).toFixed(0) + "%)");
		}
	});

	$p.eve.attachEvent("pouch_change", function (id, page) {
		set_spin(true);
	});

	/**
	 * Завершение начальной синхронизации либо загрузки данных при старте
	 */
	$p.eve.attachEvent("pouch_load_data_loaded", function (page) {
		if($p.eve.stepper.wnd_sync){
			if(page.docs_written){
				setTimeout(function () {
					$p.iface.sync.close();
					$p.eve.redirect = true;
					location.reload(true);
				}, 3000);
			}else{
				$p.iface.sync.close();
			}
		}
	});

	$p.eve.attachEvent("pouch_load_data_error", function (err) {
		set_spin();
		if($p.eve.stepper.wnd_sync)
			$p.iface.sync.close();
	});

	$p.eve.attachEvent("log_in", function (username) {
		set_auth();
	});

	$p.eve.attachEvent("log_out", function () {
		set_auth();
	});

}



/**
 * Ячейка грида для отображения картинки svg и компонент,
 * получающий и отображающий галерею эскизов объекта данных
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  widgets
 * @submodule rsvg
 */

/**
 * Конструктор поля картинки svg
 */
function eXcell_rsvg(cell){ //the eXcell name is defined here
	if (cell){                // the default pattern, just copy it
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}
	this.edit = function(){};  //read-only cell doesn't have edit method
	this.isDisabled = function(){ return true; }; // the cell is read-only, so it's always in the disabled state
	this.setValue=function(val){
		this.setCValue(val ? $p.iface.scale_svg(val, 120, 10) : "нет эскиза");
	}
}
eXcell_rsvg.prototype = new eXcell();
window.eXcell_rsvg = eXcell_rsvg;

/**
 * ### Визуальный компонент OSvgs
 * Получает и отображает галерею эскизов объекта данных
 *
 * @class OSvgs
 * @param manager {DataManager}
 * @param layout {dhtmlXLayoutObject|dhtmlXWindowsCell}
 * @param area {HTMLElement}
 * @constructor
 */
$p.iface.OSvgs = function (manager, layout, area) {

	var t = this,
		minmax = document.createElement('div'),
		pics_area = document.createElement('div'),
		stack = [],
		area_hidden = $p.wsql.get_user_param("svgs_area_hidden", "boolean"),
		area_text = area.querySelector(".dhx_cell_statusbar_text");

	if(area_text)
		area_text.style.display = "none";

	pics_area.className = 'svgs-area';
	if(area.firstChild)
		area.insertBefore(pics_area, area.firstChild);
	else
		area.appendChild(pics_area);

	minmax.className = 'svgs-minmax';
	minmax.title="Скрыть/показать панель эскизов";
	minmax.onclick = function () {
		area_hidden = !area_hidden;
		$p.wsql.set_user_param("svgs_area_hidden", area_hidden);
		apply_area_hidden();

		if(!area_hidden && stack.length)
			t.reload();

	};
	area.appendChild(minmax);
	apply_area_hidden();

	function apply_area_hidden(){

		pics_area.style.display = area_hidden ? "none" : "";

		if(layout.setSizes)
			layout.setSizes();
		else if(layout.getDimension){
			var dim = layout.getDimension();
			layout.setDimension(dim[0], dim[1]);
			layout.maximize();
		}

		if(area_hidden){
			minmax.style.backgroundPositionX = "-32px";
			minmax.style.top = layout.setSizes ? "16px" : "-18px";
		}
		else{
			minmax.style.backgroundPositionX = "0px";
			minmax.style.top = "0px";
		}
	}

	function draw_svgs(res){

		var i, svg_elm;

		$p.iface.clear_svgs(pics_area);

		if(!res.svgs.length){
			// возможно, стоит показать надпись, что нет эскизов
		}else
			for(i in res.svgs){
				if(!res.svgs[i] || res.svgs[i].substr(0, 1) != "<")
					continue;
				svg_elm = document.createElement("div");
				pics_area.appendChild(svg_elm);
				svg_elm.style["float"] = "left";
				svg_elm.innerHTML = $p.iface.scale_svg(res.svgs[i], 88, 22);
			}
	}

	this.reload = function (ref) {

		if(ref)
			stack.push(ref);

		if(!area_hidden)
			setTimeout(function(){
				if(stack.length){
					//manager.save({
					//		ref: stack.pop(),
					//		specify: "order_pics",
					//		action: "calc",
					//		async: true
					//	})
					//	.then(draw_svgs)
					//	.catch($p.record_log);
					//stack.length = 0;
				}
			}, 300);
	}

};
/**
 * Главное окно интерфейса
 *
 * Created 25.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module wnd_main
 */

/**
 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 * @param modifiers {Array} - сюда можно добавить обработчики, переопределяющие функциональность объектов данных
 */
$p.settings = function (prm, modifiers) {

	// разделитель для localStorage
	prm.local_storage_prefix = "wb_";

	//prm.rest = true;
	prm.irest_enabled = true;

	// расположение rest-сервиса 1c
	prm.rest_path = "/a/zd/%1/odata/standard.odata/";

	// по умолчанию, обращаемся к зоне 0
	prm.zone = 0;

	// расположение couchdb
	prm.couch_path = "/couchdb/wb_";
	//prm.couchdb = "http://192.168.9.136:5984/wb_";

	// логин гостевого пользователя couchdb
	prm.guest_name = "guest";

	// пароль гостевого пользователя couchdb
	prm.guest_pwd = "meta";

	// гостевые пользователи для демо-режима
	prm.guests = [{
		username: "Дилер",
		password: "2"
	}];

	// скин по умолчанию
	prm.skin = "dhx_terrace";

	// сокет временно отключаем
	// prm.ws_url = "ws://builder.oknosoft.local:8001";

	// TODO: удалить расположение файлов данных
	prm.data_url = "data/";

	// используем геокодер
	prm.use_ip_geo = true;

	// разрешаем покидать страницу без лишних вопросов
	// $p.eve.redirect = true;

};

$p.iface.oninit = function() {

	// разделы интерфейса
	$p.iface.sidebar_items = [
		{id: "orders", text: "Заказы", icon: "projects_48.png"},
		{id: "events", text: "Планирование", icon: "events_48.png"},
		{id: "settings", text: "Настройки", icon: "settings_48.png"},
		{id: "about", text: "О программе", icon: "about_48.png"}
	];


	// наблюдатель за событиями авторизации и синхронизации
	$p.iface.btn_auth_sync = new OBtnAuthSync();

	// подписываемся на событие готовности метаданных, после которого рисуем интерфейс
	var dt = Date.now();
	$p.eve.attachEvent("meta", function () {
		console.log(Date.now() - dt);

		// гасим заставку
		document.body.removeChild(document.querySelector("#builder_splash"));

		// основной сайдбар
		$p.iface.main = new dhtmlXSideBar({
			parent: document.body,
			icons_path: "dist/imgs/",
			width: 180,
			header: true,
			template: "tiles",
			autohide: true,
			items: $p.iface.sidebar_items,
			offsets: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		});

		// подписываемся на событие навигации по сайдбару
		$p.iface.main.attachEvent("onSelect", function(id){

			var hprm = $p.job_prm.parse_url();
			if(hprm.view != id)
				$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, id);

			$p.iface["view_" + id]($p.iface.main.cells(id));

		});

		// включаем индикатор загрузки
		$p.iface.main.progressOn();

		// активируем страницу
		hprm = $p.job_prm.parse_url();
		if(!hprm.view || $p.iface.main.getAllItems().indexOf(hprm.view) == -1){
			$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, "orders");
		} else
			setTimeout($p.iface.hash_route);

	});

	// Подписываемся на событие окончания загрузки локальных данных
	var pouch_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {

		$p.iface.main.progressOff();

		// если разрешено сохранение пароля - сразу пытаемся залогиниться
		if(!$p.wsql.pouch.authorized && navigator.onLine &&
			$p.wsql.get_user_param("enable_save_pwd") &&
			$p.wsql.get_user_param("user_name") &&
			$p.wsql.get_user_param("user_pwd")){

			setTimeout(function () {
				$p.iface.frm_auth({
					modal_dialog: true,
					try_auto: true
				});
			}, 100);
		}

		$p.eve.detachEvent(pouch_data_loaded);

	});

	// Подписываемся на событие окончания загрузки локальных данных
	var pouch_load_data_error = $p.eve.attachEvent("pouch_load_data_error", function (err) {

		// если это первый запуск, показываем диалог авторизации
		if(err.db_name && err.hasOwnProperty("doc_count") && err.doc_count < 10){
			$p.iface.frm_auth({
				modal_dialog: true
			});
		}
		$p.iface.main.progressOff();

	});


	// запрещаем масштабировать колёсиком мыши, т.к. для масштабирования у канваса свой инструмент
	window.onmousewheel = function (e) {
		if(e.ctrlKey){
			e.preventDefault();
			return false;
		}
	}

};

/**
 * Обработчик маршрутизации
 * @param hprm
 * @return {boolean}
 */
$p.eve.hash_route.push(function (hprm) {

	// view отвечает за переключение закладки в SideBar
	if(hprm.view && $p.iface.main.getActiveItem() != hprm.view){
		$p.iface.main.getAllItems().forEach(function(item){
			if(item == hprm.view)
				$p.iface.main.cells(item).setActive(true);
		});
	}
	return false;
});
/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_about
 */

$p.iface.view_about = function (cell) {

	function OViewAbout(){

		cell.attachHTMLString($p.injected_data['view_about.html']);
		cell.cell.querySelector(".dhx_cell_cont_sidebar").style.overflow = "auto";

		this.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '180px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'}

			], onclick: function (name) {
				$p.iface.main.cells(name).setActive(true);
				return false;
			}
		});
	}

	if(!$p.iface._about)
		$p.iface._about = new OViewAbout();

	return $p.iface._about;

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_events
 */

$p.iface.view_events = function (cell) {

	function OViewEvents(){

		var t = this;

		function create_scheduler(){
			//scheduler.config.xml_date="%Y-%m-%d %H:%i";
			scheduler.config.first_hour = 8;
			scheduler.config.last_hour = 22;

			var sTabs = '<div class="dhx_cal_tab" name="day_tab" style="right:204px;"></div>'+
				'<div class="dhx_cal_tab" name="week_tab" style="right:140px;"></div>'+
				'<div class="dhx_cal_tab" name="month_tab" style="right:280px;"></div>'+
				'<div class="dhx_cal_date"></div><div class="dhx_minical_icon">&nbsp;</div>';
			//'<div class="dhx_cal_tab" name="timeline_tab" style="right:76px;"></div>';

			t._scheduler = cell.attachScheduler(null, "week", sTabs);

			t._scheduler.attachEvent("onBeforeViewChange", function(old_mode, old_date, mode, date){
				//if(mode == "timeline"){
				//	$p.msg.show_not_implemented();
				//	return false;
				//}
				return true;
			});
		}

		function show_doc(){

		}
		function show_list(){

		}

		function hash_route(hprm) {

			if(hprm.view == "events"){

				if(hprm.obj != "doc.planning_event")
					setTimeout(function () {
						$p.iface.set_hash("doc.planning_event");
					});
				else{

					if(!$p.is_empty_guid(hprm.ref)){

						//if(hprm.frm != "doc")
						//	setTimeout(function () {
						//		$p.iface.set_hash(undefined, undefined, "doc");
						//	});
						//else
						//	show_doc(hprm.ref);


					} else if($p.is_empty_guid(hprm.ref) || hprm.frm == "list"){

						show_list();
					}
				}

				return false;
			}

		}

		if(!window.dhtmlXScheduler){
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.min.js", "script", create_scheduler);
			$p.load_script("//oknosoft.github.io/metadata.js/lib/dhtmlxscheduler/dhtmlxscheduler.css", "link");
		}else
			create_scheduler();


		t.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '180px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
				{name: 'auth', text: '', float: 'left'},
				{name: 'sync', text: '', float: 'left'}

			], onclick: function (name) {
				if(['settings', 'about', 'orders'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);

				return false;
			}
		});
		$p.iface.btn_auth_sync.bind(t.tb_nav);

		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.eve.hash_route.push(hash_route);

	}

	if(!$p.iface._events)
		$p.iface._events = new OViewEvents();

	return $p.iface._events;

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {

	function OViewOrders(){

		var t = this;

		function show_list(){

			var _cell = t.carousel.cells("list");

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			var _cell = t.carousel.cells("doc");

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			if(!_cell.ref || _cell.ref != ref)
				$p.doc.calc_order.form_obj(_cell, {
						ref: ref,
						bind_pwnd: true,
						on_close: function () {
							setTimeout(function () {
								$p.iface.set_hash(undefined, "", "list");
							});
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
					});
		}

		function show_builder(ref){

			var _cell = t.carousel.cells("builder");

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			t.editor.open(ref);

		}

		function hash_route(hprm) {

			if(hprm.view == "orders"){

				if(hprm.obj == "doc.calc_order" && !$p.is_empty_guid(hprm.ref)){

					if(hprm.frm != "doc")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "doc");
						});
					else
						show_doc(hprm.ref);


				} if(hprm.obj == "cat.characteristics" && !$p.is_empty_guid(hprm.ref)) {

					if(hprm.frm != "builder")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "builder");
						});
					else
						show_builder(hprm.ref);


				}else{

					if(hprm.obj != "doc.calc_order")
						setTimeout(function () {
							$p.iface.set_hash("doc.calc_order", "", "list");
						});
					else
						show_list();
				}

				return false;
			}

		}

		function create_elmnts(){

			// создадим экземпляр графического редактора
			var _cell = t.carousel.cells("builder"),
				hprm = $p.job_prm.parse_url(),
				obj = hprm.obj || "doc.calc_order";

			_cell._on_close = function () {

				_cell = t.carousel.cells("doc");

				if(!$p.is_empty_guid(_cell.ref))
					$p.iface.set_hash("doc.calc_order", _cell.ref, "doc");

				else{
					hprm = $p.job_prm.parse_url();
					obj = $p.cat.characteristics.get(hprm.ref, false, true);
					if(obj && !$p.is_empty_guid(obj.calc_order.ref))
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}

			t.editor = new $p.Editor(_cell);

			setTimeout(function () {
				$p.iface.set_hash(obj);
			});
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '180px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
				{name: 'auth', text: '', float: 'left'},
				{name: 'sync', text: '', float: 'left'}

				//{name: 'filter', text: '<i class="fa fa-filter md-fa-lg"></i>', tooltip: 'Фильтр', float: 'left'}

			], onclick: function (name) {

				if(['settings', 'about', 'events'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);

				return false;
			}
		});
		$p.iface.btn_auth_sync.bind(t.tb_nav);

		// страницы карусели
		t.carousel = cell.attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     0,
			offset_item:    0
		});
		t.carousel.hideControls();
		t.carousel.addCell("list");
		t.carousel.addCell("doc");
		t.carousel.addCell("builder");


		// Подписываемся на событие окончания загрузки локальных данных
		// и рисум список заказов и заготовку графического редактора
		if($p.wsql.pouch._data_loaded)
			setTimeout(create_elmnts);
		else
			$p.eve.attachEvent("pouch_load_data_loaded", create_elmnts);


		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.eve.hash_route.push(hash_route);

	}

	if(!$p.iface._orders)
		$p.iface._orders = new OViewOrders();

	return $p.iface._orders;

};

/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_settings
 */

$p.iface.view_settings = function (cell) {

	function OViewSettings(){

		var t = this;

		function hash_route(hprm) {

			if(hprm.view == "settings"){

				return false;
			}

		}


		t.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '180px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'}


			], onclick: function (name) {
				$p.iface.main.cells(name).setActive(true);
				return false;
			}
		});

		// разделы настроект
		t.tabs = cell.attachTabbar({
			arrows_mode:    "auto",
			tabs: [
				{id: "const", text: '<i class="fa fa-key"></i> Общее', active: true},
				{id: "industry", text: '<i class="fa fa-industry"></i> Технология'},
				{id: "price", text: '<i class="fa fa-money"></i> Цены'},
				{id: "events", text: '<i class="fa fa-calendar-check-o"></i> Планирование'}
			]
		});

		t.tabs.cells("const").attachHTMLString($p.injected_data['view_settings.html']);
		t.const = t.tabs.cells("const").cell.querySelector(".dhx_cell_cont_tabbar");
		t.const.style.overflow = "auto";
		t.form = t.const.querySelector("[name=form1]");
		t.form = new dhtmlXForm(t.form.firstChild, [

			{ type:"settings", labelWidth:80, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Тип устройства", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_device_type", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"device_type", labelWidth:120, label:'<i class="fa fa-desktop"></i> Компьютер', value:"desktop"},
				{ type:"newcolumn"   },
				{ type:"radio" , name:"device_type", labelWidth:150, label:'<i class="fa fa-mobile fa-lg"></i> Телефон, планшет', value:"phone"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Класс устройства определяется автоматически, но пользователь может задать его явно", width: 320}},

			//{type: "label", labelWidth:320, label: "Адрес http сервиса 1С", className: "label_options"},
			//{type:"input" , inputWidth: 220, name:"rest_path", label:"Путь", validate:"NotEmpty"},
			//{type:"template", label:"",value:"",
			//	note: {text: "Можно указать как относительный, так и абсолютный URL публикации 1С OData. " +
			//	"О настройке кроссдоменных запросов к 1С <a href='#'>см. здесь</a>", width: 320}},

			{type: "label", labelWidth:320, label: "Адрес CouchDB", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_path", label:"Путь:", validate:"NotEmpty"},
			{type:"template", label:"",value:"",
				note: {text: "Можно указать как относительный, так и абсолютный URL публикации CouchDB", width: 320}},

			{type: "label", labelWidth:320, label: "Значение разделителя публикации 1С fresh", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"zone", label:"Зона:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Для неразделенной публикации, зона = 0", width: 320}},

			{type: "label", labelWidth:320, label: "Суффикс базы пользователя", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_suffix", label:"Суффикс:"},
			{type:"template", label:"",value:"",
				note: {text: "Назначается дилеру при регистрации", width: 320}},

			{type: "label", labelWidth:320, label: "Сохранять пароль пользователя", className: "label_options"},
			{type:"checkbox", name:"enable_save_pwd", label:"Разрешить:", checked: $p.wsql.get_user_param("enable_save_pwd", "boolean")},
			{type:"template", label:"",value:"", note: {text: "Не рекомендуется, если к компьютеру имеют доступ посторонние лица", width: 320}},
			{type:"template", label:"",value:"", note: {text: "", width: 320}},

			{ type:"block", blockOffset: 0, name:"block_buttons", list:[
				{type: "button", name: "save", value: "Применить", tooltip: "Применить настройки и перезагрузить программу"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 20, name: "reset", value: "Сброс данных", tooltip: "Стереть справочники и перезаполнить данными сервера"}
			]  }

			]
		);
		t.form.cont.style.fontSize = "100%";

		// инициализация свойств

		t.form.checkItem("device_type", $p.wsql.get_user_param("device_type"));

		["zone", "couch_path", "couch_suffix"].forEach(function (prm) {
			t.form.setItemValue(prm, $p.wsql.get_user_param(prm) || $p.job_prm[prm]);
		});

		t.form.attachEvent("onChange", function (name, value, state){
			$p.wsql.set_user_param(name, name == "enable_save_pwd" ? state || "" : value);
		});

		t.form.attachEvent("onButtonClick", function(name){

			function do_reload(){
				setTimeout(function () {
					$p.eve.redirect = true;
					location.reload(true);
				}, 2000);
			}

			if(name == "save")
				location.reload();

			else if(name == "reset"){
				dhtmlx.confirm({
					title: "Сброс данных",
					text: "Стереть справочники и перезаполнить данными сервера?",
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn)
							$p.wsql.pouch.reset_local_data();
					}
				});
			}
		});


		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.eve.hash_route.push(hash_route);

	}

	if(!$p.iface._settings)
		$p.iface._settings = new OViewSettings();

	return $p.iface._settings;

};

return undefined;
}));
