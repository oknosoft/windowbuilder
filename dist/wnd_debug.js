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

			// уточняем номенклатуру системы
			var nom = this.prod_nom;

			// пересчитываем наименование
			var name = this.prod_name();
			if(name)
				this.name = name;
			
			// дублируем контрагента для целей RLS
			this.partner = this.calc_order.partner;
			
		});

		// свойства объекта характеристики
		_mgr._obj_constructor.prototype.__define({
			
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
			},
			
			prod_name: {
				value: function (short) {

					var _row = this.calc_order_row,
						name = "";
					
					if(_row){

						if(this.calc_order.number_internal)
							name = this.calc_order.number_internal.trim();
							
						else{
							// убираем нули из середины номера
							var num0 = this.calc_order.number_doc,
								part = "";
							for(var i = 0; i<num0.length; i++){
								if(isNaN(parseInt(num0[i])))
									name += num0[i];
								else
									break;
							}							
							for(var i = num0.length-1; i>0; i--){
								if(isNaN(parseInt(num0[i])))
									break;
								part = num0[i] + part;
							}
							name += parseInt(part || 0).toFixed(0);
						}
						
						name += "/" + _row.row.pad();
						
						// добавляем название системы
						if(!this.sys.empty())
							name += "/" + this.sys.name;
						
						if(!short){

							// добавляем название цвета
							if(this.clr.name)
								name += "/" + this.clr.name;

							// добавляем размеры
							if(this.x && this.y)
								name += "/" + this.x.toFixed(0) + "x" + this.y.toFixed(0);
							else if(this.x)
								name += "/" + this.x.toFixed(0);
							else if(this.y)
								name += "/" + this.y.toFixed(0);

							if(this.z){
								if(this.x || this.y)
									name += "x" + this.z.toFixed(0);
								else
									name += "/" + this.z.toFixed(0);
							}

							if(this.s)
								name += "/S:" + this.s.toFixed(3);	
						}
					}
					return name;
				}
			},

			/**
			 * Возвращает номенклатуру продукции по системе
			 */
			prod_nom: {
				
				get: function () {
					
					if(!this.sys.empty()){

						var setted,
							param = this.params;
													
						if(this.sys.production.count() == 1){
							this.owner = this.sys.production.get(0).nom;
							
						}else{
							this.sys.production.each(function (row) {

								if(setted)
									return false;
								
								if(row.param && !row.param.empty()){
									param.find_rows({cnstr: 0, param: row.param, value: row.value}, function () {
										setted = true;
										param._owner.owner = row.nom;
										return false;
									});
								}
										
							});
							if(!setted){
								this.sys.production.find_rows({param: $p.blank.guid}, function (row) {
									setted = true;
									param._owner.owner = row.nom;
									return false;
								});	
							}
							if(!setted){
								this.owner = this.sys.production.get(0).nom;
							}
						}
					}

					return this.owner;
				}

			}
		});

		// подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
		var init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", function () {
			$p.eve.detachEvent(init_event_id);
			return _mgr.pouch_load_view("doc/nom_characteristics");

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
						fields: ["presentation","svg"],
						cols: [
							{"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
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

					// виртуальный датаменеджер для поля фильтра по заказу
					_manager: {
						get: function () {
							return {
								class_name: "dp.fake"
							};
						}
					},

					calc_order: {
						get: function () {
							return _mgr._obj_constructor.prototype._getter.call(this, "calc_order");
						},

						set: function (v) {
							if(this._obj.calc_order == v)
								return;
							_mgr._obj_constructor.prototype.__setter.call(this, "calc_order", v);

							if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount())
								wnd.elmnts.filter.call_event();

							if(!$p.is_empty_guid(this._obj.calc_order) &&
									$p.wsql.get_user_param("template_block_calc_order") != this._obj.calc_order){
								$p.wsql.set_user_param("template_block_calc_order", this._obj.calc_order);
							}
						}
					}
				});
			}

			// объект отбора по ссылке на расчет в продукции
			if(selection_block.calc_order.empty()){
				selection_block.calc_order = $p.wsql.get_user_param("template_block_calc_order");
			}
			if(selection_block.calc_order.empty() || selection_block.calc_order.is_new()){
				$p.job_prm.builder.base_block.some(function (o) {
					selection_block.calc_order = o;
					$p.wsql.set_user_param("template_block_calc_order", selection_block.calc_order.ref);
					return true;
				});
			}

			// начальное значение - выбранные в предыдущий раз типовой блок
			attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

			// подсовываем типовой форме списка изменённые метаданные
			attr.metadata = _meta;

			// и еще, подсовываем форме собственный обработчик получения данных
			attr.custom_selection = function (attr) {
				var ares = [], crefs = [], calc_order;

				// получаем ссылку на расчет из отбора
				attr.selection.some(function (o) {
					if(Object.keys(o).indexOf("calc_order") != -1){
						calc_order = o.calc_order;
						return true;
					}
				});
				
				// получаем документ расчет
				return $p.doc.calc_order.get(calc_order, true, true)
					.then(function (o) {

						// получаем массив ссылок на характеристики в табчасти продукции
						o.production.each(function (row) {
							if(!row.characteristic.empty()){
								if(row.characteristic.is_new())
									crefs.push(row.characteristic.ref);
								
								else{
									// если это характеристика продукции - добавляем
									if(!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()){
										if(row.characteristic._attachments &&
												row.characteristic._attachments.svg &&
												!row.characteristic._attachments.svg.stub)
											ares.push(row.characteristic);
										else
											crefs.push(row.characteristic.ref);
									}
								}
							}
						});
						return crefs.length ? _mgr.pouch_load_array(crefs, true) : crefs;
					})
					.then(function () {

						// если это характеристика продукции - добавляем
						crefs.forEach(function (o) {
							o = _mgr.get(o, false, true);
							if(o && !o.calc_order.empty() && o.coordinates.count()){
								ares.push(o);
							}
						});

						// фильтруем по подстроке
						crefs.length = 0;
						ares.forEach(function (o) {
							var presentation = (o.calc_order_row.note || o.note || o.name) + "&lt;br /&gt;" + o.owner.name;
							if(!attr.filter || presentation.indexOf(attr.filter) != -1)
								crefs.push({
									ref: o.ref,
									presentation: presentation,
									svg: o._attachments ? o._attachments.svg : ""
								});
						});

						// догружаем изображения
						ares.length = 0;
						crefs.forEach(function (o) {
							if(o.svg && o.svg.data){
								ares.push($p.blob_as_text(o.svg.data)
									.then(function (svg) {
										o.svg = svg;
									}))
							}
						});
						return Promise.all(ares);

					})
					.then(function () {
						// конвертируем в xml для вставки в грид
						return $p.iface.data_to_grid.call(_mgr, crefs, attr);
					});

			};

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
				width: 220,
				get_option_list: function (val, selection) {

					var l = [];

					$p.job_prm.builder.base_block.forEach(function (o) {
						l.push({text: o.note || o.presentation, value: o.ref});
					});

					return Promise.resolve(l);
				}
			});
			wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

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
				onom2 = nom2 = $p.cat.nom.get();

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

					оCnn.cnn_elmnts.each(function(row){
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

		_mgr._obj_constructor.prototype.__define({

			/**
			 * Возвращает основную строку спецификации соединения между элементами
			 */
			main_row: {
				value: function (elm) {

					var ares, nom = elm.nom;

					// если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
					if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

						var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

						ares = this.specification.find_rows({nom: art12});
						if(ares.length)
							return ares[0]._row;
					}

					// в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
					if(this.cnn_elmnts.find_rows({nom1: nom}).length){
						ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
						if(ares.length)
							return ares[0]._row;
					}
					if(this.cnn_elmnts.find_rows({nom2: nom}).length){
						ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
						if(ares.length)
							return ares[0]._row;
					}
					ares = this.specification.find_rows({nom: nom});
					if(ares.length)
						return ares[0]._row;

				}
			},

			/**
			 * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
			 */
			check_nom2: {
				value: function (nom) {
					var ref = $p.is_data_obj(nom) ? nom.ref : nom;
					return this.cnn_elmnts._obj.some(function (row) {
						return row.nom == ref;
					})
				}
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
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization, _p_.name as partner," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" +
				" left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" +
				" left outer join cat_partners as _p_ on _p_.ref = _t_.owner" +
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
		};

		// перед записью, устанавливаем код, родителя и наименование
		// _mgr.attache_event("before_save", function (attr) {
		//
		//
		//
		// });

	}
);
/**
 * Дополнительные методы справочника Визуализация элементов
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_elm_visualization
 * Created 08.04.2016
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.elm_visualization;


		// публичные методы объекта

		_mgr._obj_constructor.prototype.__define({

			draw: {
				value: function (elm, layer, offset) {

					var subpath;

					if(this.svg_path.indexOf('{"method":') == 0){

						if(!layer._by_spec)
							layer._by_spec = new paper.Group({ parent: l_vis });

						var attr = JSON.parse(this.svg_path);

						if(attr.method == "subpath_outer"){

							subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

							subpath.parent = layer._by_spec;
							subpath.strokeWidth = attr.strokeWidth || 4;
							subpath.strokeColor = attr.strokeColor || 'red';
							subpath.strokeCap = attr.strokeCap || 'round';
							if(attr.dashArray)
								subpath.dashArray = attr.dashArray

						}
						
					}else if(this.svg_path){

						subpath = new paper.CompoundPath({
							pathData: this.svg_path,
							parent: layer._by_spec,
							strokeColor: 'black',
							fillColor: 'white',
							strokeScaling: false,
							pivot: [0, 0]
						});

						var angle_hor = elm.generatrix.getTangentAt(offset).angle;
						if((this.rotate != -1 || elm.orientation == $p.enm.orientations.Горизонтальная) && angle_hor != this.angle_hor){
							subpath.rotation = angle_hor - this.angle_hor;
						}

						offset += elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

						if(this.elm_side == -1){
							// в середине элемента
							var p0 = elm.generatrix.getPointAt(offset || 0),
								p1 = elm.rays.inner.getNearestPoint(p0),
								p2 = elm.rays.outer.getNearestPoint(p0);

							subpath.position = p1.add(p2).divide(2);

						}else if(!this.elm_side){
							// изнутри
							subpath.position = elm.rays.inner.getNearestPoint(elm.generatrix.getPointAt(offset || 0));

						}else{
							// снаружи
							subpath.position = elm.rays.outer.getNearestPoint(elm.generatrix.getPointAt(offset || 0));
						}




					}

				}
			}

		});

	}
);
/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_formulas
 * Created 17.04.2016
 */

$p.modifiers.push(
	function($p){

		// Подписываемся на событие окончания загрузки локальных данных
		var _mgr = $p.cat.formulas,
			on_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {
				
				$p.eve.detachEvent(on_data_loaded);

				// читаем элементы из pouchdb и создаём формулы
				_mgr.pouch_find_rows({ _top: 500, _skip: 0 })
					.then(function (rows) {

						rows.forEach(function (row) {

							// формируем списки печатных форм и внешних обработок
							if(row.parent == _mgr.predefined("printing_plates")){
								row.params.find_rows({param: "destination"}, function (dest) {
									var dmgr = $p.md.mgr_by_class_name(dest.value);
									if(dmgr){
										if(!dmgr._printing_plates)
											dmgr._printing_plates = {};
										dmgr._printing_plates["prn_" + row.id] = row;
									}
								})
							}
						});
						
					});

		});

		_mgr._obj_constructor.prototype.__define({
			
			execute: {
				value: function (obj) {

					// создаём функцию из текста формулы
					if(!this._data._formula && this.formula)
						this._data._formula = (new Function("obj", this.formula)).bind(this);

					if(this.parent == _mgr.predefined("printing_plates")){

						// создаём blob из шаблона пустой страницы
						if(!($p.injected_data['view_blank.html'] instanceof Blob))
							$p.injected_data['view_blank.html'] = new Blob([$p.injected_data['view_blank.html']], {type: 'text/html'});

						// получаем HTMLDivElement с отчетом
						return this._data._formula(obj)

							// показываем отчет в отдельном окне
							.then(function (doc) {

								if(doc && doc.content instanceof HTMLElement){

									var url = window.URL.createObjectURL($p.injected_data['view_blank.html']),
										wnd_print = window.open(
											url, "wnd_print", "fullscreen,menubar=no,toolbar=no,location=no,status=no,directories=no,resizable=yes,scrollbars=yes");

									if (wnd_print.outerWidth < screen.availWidth || wnd_print.outerHeight < screen.availHeight){
										wnd_print.moveTo(0,0);
										wnd_print.resizeTo(screen.availWidth, screen.availHeight);
									}

									wnd_print.onload = function(e) {
										window.URL.revokeObjectURL(url);
										wnd_print.document.body.appendChild(doc.content);

										if(doc.title)
											wnd_print.document.title = doc.title;

										wnd_print.print();
									};

									return wnd_print;
								}

							});

					}else
						return this._data._formula(obj)


				}
			},

			_template: {
				get: function () {
					if(!this._data._template)
						this._data._template = new $p.SpreadsheetDocument(this.template);

					return this._data._template;
				}
			}
		});

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


		// методы объекта
		_mgr._obj_constructor.prototype.__define({

			/**
			 * Перезаполняет табчасть параметров указанного контура
			 */
			refill_prm: {
				value: function (contour) {

					var osys = contour.project._dp.sys,
						fprms = contour.project.ox.params,
						prm_direction = $p.job_prm.properties.direction;

					// формируем массив требуемых параметров по задействованным в contour.furn.furn_set
					var aprm = contour.furn.furn_set.add_furn_prm();

					// дозаполняем и приклеиваем значения по умолчанию
					var prm_row, forcibly;
					aprm.forEach(function(v){

						// направления в табчасть не добавляем
						if(v == prm_direction)
							return;
						
						prm_row = null;
						forcibly = true;
						fprms.find_rows({param: v, cnstr: contour.cnstr}, function (row) {
							prm_row = row;
							return forcibly = false;
						});
						if(!prm_row)
							prm_row = fprms.add({param: v, cnstr: contour.cnstr}, true);

						osys.furn_params.each(function(row){
							if(row.param == prm_row.param){
								if(row.forcibly || forcibly)
									prm_row.value = row.value;
								prm_row.hide = row.hide;
								return false;
							}
						});
					});

					// удаляем лишние строки
					var adel = [];
					fprms.find_rows({cnstr: contour.cnstr}, function (row) {
						if(aprm.indexOf(row.param) == -1)
							adel.push(row);
					});
					adel.forEach(function (row) {
						fprms.del(row, true);
					});
					
					
				},
				enumerable: false
			},

			add_furn_prm: {
				value: function (aprm, afurn_set) {

					if(!aprm)
						aprm = [];

					if(!afurn_set)
						afurn_set = [];

					// если параметры этого набора уже обработаны - пропускаем
					if(afurn_set.indexOf(this.ref)!=-1)
						return;

					afurn_set.push(this.ref);

					this.selection_params.each(function(row){
						if(aprm.indexOf(row.param)==-1)
							aprm.push(row.param);
					});

					this.specification.each(function(row){
						if(row.nom_set && row.nom_set._manager === _mgr)
							row.nom_set.add_furn_prm(aprm, afurn_set);
					});
					
					return aprm;

				},
				enumerable: false
			}
			
		});

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

		_mgr._inserts_types_filling = [
			$p.enm.inserts_types.Стеклопакет,
			$p.enm.inserts_types.Заполнение,
			$p.enm.inserts_types.ТиповойСтеклопакет
		];
		
		_mgr.by_thickness = function (min, max) {

			if(!_mgr._by_thickness){
				_mgr._by_thickness = {};
				_mgr.find_rows({insert_type: {in: _mgr._inserts_types_filling}}, function (ins) {
					if(ins.thickness > 0){
						if(!_mgr._by_thickness[ins.thickness])
							_mgr._by_thickness[ins.thickness] = [];
						_mgr._by_thickness[ins.thickness].push(ins);
					}
				});
			}

			var res = [];
			for(var thickness in _mgr._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, _mgr._by_thickness[thickness]);
			}
			return res;

		};

		_mgr._obj_constructor.prototype.__define({

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

					if(main_rows.length && main_rows[0].nom instanceof _mgr._obj_constructor)
						_nom = main_rows[0].nom.nom();

					else if(main_rows.length)
						_nom = main_rows[0].nom;

					else
						_nom = $p.cat.nom.get();

					if(main_rows.length < 2)
						this._cache.nom = _nom;

					return _nom;

				}
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

				}
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


		// публичные методы объекта
		
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

		_mgr._obj_constructor.prototype.__define({

			addr: {
				get: function () {

					return this.contact_information._obj.reduce(function (val, row) {

						if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресКонтрагента") && row.presentation)
							return row.presentation;

						else if(val)
							return val;

						else if(row.presentation && (
								row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресКонтрагента") ||
								row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресКонтрагента")
							))
							return row.presentation;

					}, "")

				}
			},

			phone: {
				get: function () {

					return this.contact_information._obj.reduce(function (val, row) {

						if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагента") && row.presentation)
							return row.presentation;

						else if(val)
							return val;

						else if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагентаМобильный") && row.presentation)
							return row.presentation;

					}, "")
				}
			},

			// полное наименование с телефоном, адресом и банковским счетом
			long_presentation: {
				get: function () {
					var res = this.name_full || this.name,
						addr = this.addr,
						phone = this.phone;

					if(this.inn)
						res+= ", ИНН" + this.inn;

					if(this.kpp)
						res+= ", КПП" + this.kpp;
					
					if(addr)
						res+= ", " + addr;

					if(phone)
						res+= ", " + phone;
					
					return res;
				}
			}
		});


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
				}
			},

			/**
			 * возвращает доступные в данной системе элементы (вставки)
			 * @property inserts
			 * @for Production_params
			 * @param elm_types - допустимые типы элементов
			 * @param by_default {Boolean|String} - сортировать по признаку умолчания или по наименованию вставки
			 * @return Array.<_cat.inserts>
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
							(by_default == "rows" || !__noms.some(function (e) {
								return row.nom == e.nom;
							})))
							__noms.push(row);
					});
					
					if(by_default == "rows")
						return __noms;
					
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
				}
			},

			/**
			 * @method refill_prm
			 * @for cat.Production_params
			 * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
			 * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
			 */
			refill_prm: {
				value: function (ox, cnstr) {

					var prm_ts = !cnstr ? this.product_params : this.furn_params,
						adel = [];

					// если в характеристике есть лишние параметры - удаляем
					if(!cnstr){
						cnstr = 0;
						ox.params.find_rows({cnstr: cnstr}, function (row) {
							if(prm_ts.find_rows({param: row.param}).length == 0)
								adel.push(row);
						});
						adel.forEach(function (row) {
							ox.params.del(row);
						});
					}

					// бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
					prm_ts.forEach(function (default_row) {
						
						var row;
						ox.params.find_rows({cnstr: cnstr, param: default_row.param}, function (_row) {
							row = _row;
							return false;
						});
						
						// если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
						if(!row){
							if(cnstr)
								return;
							row = ox.params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});
						}							

						if(row.hide != default_row.hide)
							row.hide = default_row.hide;

						if(default_row.forcibly && row.value != default_row.value)
							row.value = default_row.value;
					});

					if(!cnstr){
						ox.sys = this;
						ox.owner = ox.prod_nom;

						// одновременно, перезаполним параметры фурнитуры
						ox.constructions.forEach(function (row) {
							if(!row.furn.empty())
								ox.sys.refill_prm(ox, row.cnstr);
						})
					}
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

		$p.cat.users_acl.__define({

			load_array: {
				value: function(aattr, forse){

					var ref, obj, res = [], acl;

					for(var i in aattr){

						ref = $p.fix_guid(aattr[i]);

						acl = aattr[i].acl;
						if(acl)
							delete aattr[i].acl;

						if(!(obj = this.by_ref[ref])){
							obj = new this._obj_constructor(aattr[i], this);
							if(forse)
								obj._set_loaded();

						}else if(obj.is_new() || forse){
							obj._mixin(aattr[i]);
							obj._set_loaded();
						}

						if(acl && !obj._acl){
							var _acl = {};
							for(var i in acl){
								_acl.__define(i, {
									value: {},
									writable: false
								});
								for(var j in acl[i]){
									_acl[i].__define(j, {
										value: acl[i][j],
										writable: false
									});
								}
							}
							obj.__define({
								_acl: {
									value: _acl,
									writable: false
								}
							});
						}

						res.push(obj);
					}

					return res;
				}
			}
		});

		$p.cat.users_acl._obj_constructor.prototype.__define({

			role_available: {
				value: function (name) {
					return this.acl_objs._obj.some(function (row) {
						return row.type == name;
					});
				}
			},

			partners_uids: {
				get: function () {
					var res = [];
					this.acl_objs.each(function (row) {
						if(row.acl_obj instanceof $p.cat.partners._obj_constructor)
							res.push(row.acl_obj.ref)
					});
					return res;
				}
			}
		});

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

		// Подписываемся на событие окончания загрузки локальных данных
		var pouch_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {

			$p.eve.detachEvent(pouch_data_loaded);

			// читаем элементы из pouchdb и создаём свойства
			$p.cch.predefined_elmnts.pouch_find_rows({ _raw: true, _top: 500, _skip: 0 })
				.then(function (rows) {

					var parents = {};

					rows.forEach(function (row) {
						if(row.is_folder && row.synonym){
							var ref = row._id.split("|")[1];
							parents[ref] = row.synonym;
							$p.job_prm.__define(row.synonym, { value: {} });
						}
					});

					rows.forEach(function (row) {

						if(!row.is_folder && row.synonym && parents[row.parent] && !$p.job_prm[parents[row.parent]][row.synonym]){

							var _mgr, tnames;
							
							if(row.type.is_ref){
								tnames = row.type.types[0].split(".");
								_mgr = $p[tnames[0]][tnames[1]]
							}

							if(row.list == -1){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: function () {
										var res = {};
										row.elmnts.forEach(function (row) {
											res[row.elm] = _mgr ? _mgr.get(row.value, false) : row.value;
										});
										return res;
									}()
								});

							}else if(row.list){

								$p.job_prm[parents[row.parent]].__define(row.synonym, {
									value: row.elmnts.map(function (row) {
										return _mgr ? _mgr.get(row.value, false) : row.value;
									})
								});

							}else{
								$p.job_prm[parents[row.parent]].__define(row.synonym, { value: _mgr ? _mgr.get(row.value, false) : row.value });
							}

						}
					});
				})
				.then(function () {
					
					// рассчеты, помеченные, как шаблоны, загрузим в память заранее
					setTimeout(function () {

						if(!$p.job_prm.builder.base_block)
							$p.job_prm.builder.base_block = [];

						// дополним base_block шаблонами из систем профилей
						$p.cat.production_params.forEach(function (o) {
							if(!o.is_folder)
								o.base_blocks.forEach(function (row) {
									if($p.job_prm.builder.base_block.indexOf(row.calc_order) == -1)
										$p.job_prm.builder.base_block.push(row.calc_order);
								});
						});
						
						$p.job_prm.builder.base_block.forEach(function (o) {
							o.load();
						});

					}, 1000);

					// загружаем ключи планирования, т.к. они нужны в ОЗУ
					$p.cat.planning_keys.pouch_find_rows();


					// даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
					setTimeout(function () {
						$p.eve.callEvent("predefined_elmnts_inited");
					}, 200);
					
				});
			
		});

		var _mgr = $p.cch.predefined_elmnts,
			obj_constructor =  _mgr._obj_constructor.prototype;

		delete obj_constructor.value;
		obj_constructor.__define({

			value: {
				get: function () {

					var mf = this.type,
						res = this._obj ? this._obj.value : "",
						mgr, ref;

					if(this._obj.is_folder)
						return "";

					if(typeof res == "object")
						return res;

					else if(mf.is_ref){
						if(mf.digits && typeof res === "number")
							return res;

						if(mf.hasOwnProperty("str_len") && !$p.is_guid(res))
							return res;

						if(mgr = $p.md.value_mgr(this._obj, "value", mf)){
							if($p.is_data_mgr(mgr))
								return mgr.get(res, false);
							else
								return $p.fetch_type(res, mgr);
						}

						if(res){
							console.log(["value", mf, this._obj]);
							return null;
						}

					}else if(mf.date_part)
						return $p.fix_date(this._obj.value, true);

					else if(mf.digits)
						return $p.fix_number(this._obj.value, !mf.hasOwnProperty("str_len"));

					else if(mf.types[0]=="boolean")
						return $p.fix_boolean(this._obj.value);

					else
						return this._obj.value || "";

					return this.characteristic.clr;
				},
				
				set: function (v) {

					if(this._obj.value === v)
						return;

					Object.getNotifier(this).notify({
						type: 'update',
						name: 'value',
						oldValue: this._obj.value
					});
					this._obj.value = $p.is_data_obj(v) ? v.ref : v;
					this._data._modified = true;
				}
			}
		});

		_mgr.form_obj = function(pwnd, attr){

			var o, wnd;

			return this.constructor.prototype.form_obj.call(this, pwnd, attr)
				.then(function (res) {
					if(res){
						o = res.o;
						wnd = res.wnd;
						return res;
					}
				});
		}

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
 * Модуль менеджера и документа Расчет-заказ
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

		// переопределяем формирование списка выбора
		_mgr.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

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

			//Номер документа
			return obj.new_number_doc();

		});

		// перед записью надо присвоить номер для нового и рассчитать итоги
		_mgr.attache_event("before_save", function (attr) {

			doc_amount = 0;
			amount_internal = 0;
			sys_profile = "";
			sys_furn = "";

			// если установлен признак проведения, проверим состояние транспорта
			if(this.posted){
				if (this.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен ||
					this.obj_delivery_state == $p.enm.obj_delivery_states.Отозван ||
					this.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){

					$p.msg.show_msg({
						type: "alert-warning",
						text: "Нельзя провести заказ со статусом<br/>'Отклонён', 'Отозван' или 'Шаблон'",
						title: this.presentation
					});

					return false;

				}else if(this.obj_delivery_state != $p.enm.obj_delivery_states.Подтвержден){
					this.obj_delivery_state = $p.enm.obj_delivery_states.Подтвержден;

				}
			}else if(this.obj_delivery_state == $p.enm.obj_delivery_states.Подтвержден){
				this.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
			}

			this.production.each(function (row) {

				doc_amount += row.amount;
				amount_internal += row.amount_internal;

				var name;
				if(!row.characteristic.calc_order.empty()){

					name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
					if(sys_profile.indexOf(name) == -1){
						if(sys_profile)
							sys_profile += " ";
						sys_profile += name;
					}

					row.characteristic.constructions.each(function (row) {
						if(row.parent && !row.furn.empty()){
							name = row.furn.name_short || row.furn.name;
							if(sys_furn.indexOf(name) == -1){
								if(sys_furn)
									sys_furn += " ";
								sys_furn += name;
							}
						}
					});
				}
			});

			this.doc_amount = doc_amount;
			this.amount_internal = amount_internal;
			this.sys_profile = sys_profile;
			this.sys_furn = sys_furn;
			this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency);

			this._obj.partner_name = this.partner.name;
		});

		// при изменении реквизита
		_mgr.attache_event("value_change", function (attr) {
			
			// реквизиты шапки
			if(attr.field == "organization" && this.contract.organization != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(this.partner, attr.value);

			}else if(attr.field == "partner" && this.contract.owner != attr.value){
				this.contract = $p.cat.contracts.by_partner_and_org(attr.value, this.organization);
				
			// табчасть продукции
			}else if(attr.tabular_section == "production"){

				if(attr.field == "nom" || attr.field == "characteristic"){
					
				}else if(attr.field == "price" || attr.field == "price_internal" || attr.field == "quantity" ||
						attr.field == "discount_percent" || attr.field == "discount_percent_internal"){
					
					attr.row[attr.field] = attr.value;
					
					attr.row.amount = (attr.row.price * ((100 - attr.row.discount_percent)/100) * attr.row.quantity).round(2);

					// если есть внешняя цена дилера, получим текущую дилерскую наценку
					if(!attr.no_extra_charge){
						var prm = {calc_order_row: attr.row};
						$p.pricing.price_type(prm);
						if(prm.price_type.extra_charge_external)
							attr.row.price_internal = (attr.row.price * (100 - attr.row.discount_percent)/100 * (100 + prm.price_type.extra_charge_external)/100).round(2);
					}
	
					attr.row.amount_internal = (attr.row.price_internal * ((100 - attr.row.discount_percent_internal)/100) * attr.row.quantity).round(2);

					this.doc_amount = this.production.aggregate([], ["amount"]);
					this.amount_internal = this.production.aggregate([], ["amount_internal"]);

					// TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

				}
				
			}
		});

		// свойства и методы объекта
		_mgr._obj_constructor.prototype.__define({
			

			// валюту документа получаем из договора
			doc_currency: {
				get: function () {
					var currency = this.contract.settlements_currency;
					return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
				}
			},

			/**
			 * Возвращает данные для печати
			 */
			print_data: {
				get: function () {
					var our_bank_account = this.organizational_unit && !this.organizational_unit.empty() && this.organizational_unit._manager == cat.organization_bank_accounts ?
							this.organizational_unit : this.organization.main_bank_account,
						get_imgs = [];

					// заполняем res теми данными, которые доступны синхронно
					var res = {
						АдресДоставки: this.shipping_address,
						ВалютаДокумента: this.doc_currency.presentation,
						ДатаЗаказаФорматD: $p.dateFormat(this.date, $p.dateFormat.masks.short_ru),
						ДатаЗаказаФорматDD: $p.dateFormat(this.date, $p.dateFormat.masks.longDate),
						ДатаТекущаяФорматD: $p.dateFormat(new Date(), $p.dateFormat.masks.short_ru),
						ДатаТекущаяФорматDD: $p.dateFormat(new Date(), $p.dateFormat.masks.longDate),
						ДоговорДатаФорматD: $p.dateFormat(this.contract.date.valueOf() == $p.blank.date.valueOf() ? this.date : this.contract.date, $p.dateFormat.masks.short_ru),
						ДоговорДатаФорматDD: $p.dateFormat(this.contract.date.valueOf() == $p.blank.date.valueOf() ? this.date : this.contract.date, $p.dateFormat.masks.longDate),
						ДоговорНомер: this.contract.number_doc ? this.contract.number_doc : this.number_doc,
						ДоговорСрокДействия: $p.dateFormat(this.contract.validity, $p.dateFormat.masks.short_ru),
						ЗаказНомер: this.number_doc,
						Контрагент: this.partner.presentation,
						КонтрагентОписание: this.partner.long_presentation,
						КонтрагентДокумент: "",
						КонтрагентКЛДолжность: "",
						КонтрагентКЛДолжностьРП: "",
						КонтрагентКЛИмя: "",
						КонтрагентКЛИмяРП: "",
						КонтрагентКЛК: "",
						КонтрагентКЛОснованиеРП: "",
						КонтрагентКЛОтчество: "",
						КонтрагентКЛОтчествоРП: "",
						КонтрагентКЛФамилия: "",
						КонтрагентКЛФамилияРП: "",
						КонтрагентЮрФизЛицо: "",
						КратностьВзаиморасчетов: this.settlements_multiplicity,
						КурсВзаиморасчетов: this.settlements_course,
						ЛистКомплектацииГруппы: "",
						ЛистКомплектацииСтроки: "",
						Организация: this.organization.presentation,
						ОрганизацияГород: this.organization.contact_information._obj.reduce(function (val, row) { return val || row.city }, "") || "Москва",
						ОрганизацияАдрес: this.organization.contact_information._obj.reduce(function (val, row) {

							if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресОрганизации") && row.presentation)
								return row.presentation;

							else if(val)
								return val;

							else if(row.presentation && (
									row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресОрганизации") ||
									row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресОрганизации")
								))
								return row.presentation;

						}, ""),
						ОрганизацияТелефон: this.organization.contact_information._obj.reduce(function (val, row) {

							if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонОрганизации") && row.presentation)
								return row.presentation;

							else if(val)
								return val;

							else if(row.kind == $p.cat.contact_information_kinds.predefined("ФаксОрганизации") && row.presentation)
								return row.presentation;

						}, ""),
						ОрганизацияБанкБИК: our_bank_account.bank.id,
						ОрганизацияБанкГород: our_bank_account.bank.city,
						ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
						ОрганизацияБанкНаименование: our_bank_account.bank.name,
						ОрганизацияБанкНомерСчета: our_bank_account.account_number,
						ОрганизацияИндивидуальныйПредприниматель: this.organization.individual_entrepreneur.presentation,
						ОрганизацияИНН: this.organization.inn,
						ОрганизацияКПП: this.organization.kpp,
						ОрганизацияСвидетельствоДатаВыдачи: this.organization.certificate_date_issue,
						ОрганизацияСвидетельствоКодОргана: this.organization.certificate_authority_code,
						ОрганизацияСвидетельствоНаименованиеОргана: this.organization.certificate_authority_name,
						ОрганизацияСвидетельствоСерияНомер: this.organization.certificate_series_number,
						ОрганизацияЮрФизЛицо: this.organization.individual_legal.presentation,
						ПродукцияЭскизы: {},
						Проект: this.project.presentation,
						СистемыПрофилей: this.sys_profile,
						СистемыФурнитуры: this.sys_furn,
						Сотрудник: this.manager.presentation,
						СотрудникДолжность: this.manager.individual_person.Должность || "менеджер",
						СотрудникДолжностьРП: this.manager.individual_person.ДолжностьРП,
						СотрудникИмя: this.manager.individual_person.Имя,
						СотрудникИмяРП: this.manager.individual_person.ИмяРП,
						СотрудникОснованиеРП: this.manager.individual_person.ОснованиеРП,
						СотрудникОтчество: this.manager.individual_person.Отчество,
						СотрудникОтчествоРП: this.manager.individual_person.ОтчествоРП,
						СотрудникФамилия: this.manager.individual_person.Фамилия,
						СотрудникФамилияРП: this.manager.individual_person.ФамилияРП,
						СотрудникФИО: this.manager.individual_person.Фамилия + 
							(this.manager.individual_person.Имя ? " " + this.manager.individual_person.Имя[1].toUpperCase() + "." : "" )+
							(this.manager.individual_person.Отчество ? " " + this.manager.individual_person.Отчество[1].toUpperCase() + "." : ""),
						СотрудникФИОРП: this.manager.individual_person.ФамилияРП + " " + this.manager.individual_person.ИмяРП + " " + this.manager.individual_person.ОтчествоРП,
						СуммаДокумента: this.doc_amount.toFixed(2),
						СуммаДокументаПрописью: this.doc_amount.in_words(),
						СуммаДокументаБезСкидки: this.production._obj.reduce(function (val, row){
							return val + row.quantity * row.price;
						}, 0).toFixed(2),
						СуммаСкидки: this.production._obj.reduce(function (val, row){
							return val + row.discount;
						}, 0).toFixed(2),
						СуммаНДС: this.production._obj.reduce(function (val, row){
							return val + row.vat_amount;
						}, 0).toFixed(2),
						ТекстНДС: this.vat_consider ? (this.vat_included ? "В том числе НДС 18%" : "НДС 18% (сверху)") : "Без НДС",
						ТелефонПоАдресуДоставки: this.phone,
						СуммаВключаетНДС: this.contract.vat_included,
						УчитыватьНДС: this.contract.vat_consider,
						ВсегоНаименований: this.production.count(),
						ВсегоИзделий: 0,
						ВсегоПлощадьИзделий: 0
					};

					// дополняем значениями свойств
					this.extra_fields.forEach(function (row) {
						res["Свойство" + row.property.name.replace(/\s/g,"")] = row.value.presentation || row.value;
					});

					// TODO: дополнить датами доставки и монтажа
					if(!this.shipping_address)
						res.МонтажДоставкаСамовывоз = "Самовывоз";
					else
						res.МонтажДоставкаСамовывоз = "Монтаж по адресу: " + this.shipping_address;
					
					// получаем логотип организации
					for(var key in this.organization._attachments){
						if(key.indexOf("logo") != -1){
							get_imgs.push(this.organization.get_attachment(key)
								.then(function (blob) {
									return $p.blob_as_text(blob, blob.type.indexOf("svg") == -1 ? "data_url" : "")
								})
								.then(function (data_url) {
									res.ОрганизацияЛоготип = data_url;
								})
								.catch($p.record_log));
							break;
						}
					}

					// получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
					this.production.forEach(function (row) {
						
						if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

							res.ВсегоИзделий+= row.quantity;
							res.ВсегоПлощадьИзделий+= row.quantity * row.s;

							get_imgs.push($p.cat.characteristics.get_attachment(row.characteristic.ref, "svg")
								.then(function (blob) {
									return $p.blob_as_text(blob)
								})
								.then(function (svg_text) {
									res.ПродукцияЭскизы[row.characteristic.ref] = svg_text;
								})
								.catch($p.record_log));
						}
					});
					res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

					return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
						.then(function () {
							
							if(!window.QRCode)
								return new Promise(function(resolve, reject){
									$p.load_script("lib/qrcodejs/qrcode.js", "script", resolve);
								});
							
						})
						.then(function () {

							var svg = document.createElement("SVG");
							svg.innerHTML = "<g />";
							var qrcode = new QRCode(svg, {
								text: "http://www.oknosoft.ru/zd/",
								width: 100,
								height: 100,
								colorDark : "#000000",
								colorLight : "#ffffff",
								correctLevel : QRCode.CorrectLevel.H,
								useSVG: true
							});
							res.qrcode = svg.innerHTML;

							return res;	
						});
				}
			},

			/**
			 * Возвращает струклуру с описанием строки продукции для печати
			 */
			row_description: {
				value: function (row) {

					var product = row.characteristic,
						res = {
							НомерСтроки: row.row,
							Количество: row.quantity,
							Ед: row.unit.name || "шт",
							Цвет: product.clr.name,
							Размеры: row.len + "x" + row.width + ", " + row.s + "м²",
							Номенклатура: row.nom.name_full || row.nom.name,
							Характеристика: product.name,
							Заполнения: "",
							Цена: row.price,
							ЦенаВнутр: row.price_internal,
							СкидкаПроцент: row.discount_percent,
							СкидкаПроцентВнутр: row.discount_percent_internal,
							Скидка: row.discount,
							Сумма: row.amount,
							СуммаВнутр: row.amount_internal
						};

					product.glasses.forEach(function (row) {
						if(res.Заполнения.indexOf(row.nom.name) == -1){
							if(res.Заполнения)
								res.Заполнения += ", ";
							res.Заполнения += row.nom.name;
						}
					});
					
					return res;
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
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
					on_new: function (o) {
						$p.iface.set_hash(_mgr.class_name, o.ref);
					},
					on_edit: function (_mgr, rId) {
						$p.iface.set_hash(_mgr.class_name, rId);
					}
				};

			// разбивка на 2 колонки - дерево и карусель
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

				tree = layout.cells("a").attachTree(),

				carousel = layout.cells("b").attachCarousel({
					keys:           false,
					touch_scroll:   false,
					offset_left:    0,
					offset_top:     0,
					offset_item:    0
				});

			// страницы карусели
			carousel.hideControls();
			carousel.addCell("list");
			carousel.addCell("report");
			carousel.conf.anim_step = 200;
			carousel.conf.anim_slide = "left 0.1s";

			var wnd = _mgr.form_selection(carousel.cells("list"), attr),

				report,

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
								return 'doc/doc_calc_order_date';

							case 'execution':
							case 'plan':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';
						}
					}
				}
			});
			filter_key.__define({
				value: {
					get: function () {
						var key;

						switch(tree.getSelectedItemId()) {

							case 'draft':
								key = 'draft';
								break;
							case 'sent':
								key = 'sent';
								break;
							case 'declined':
								key = 'declined';
								break;
							case 'confirmed':
								key = 'confirmed';
								break;
							case 'template':
								key = 'template';
								break;
							case 'zarchive':
								key = 'zarchive';
								break;

							case 'execution':
							case 'plan':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';
						}

						var filter = wnd.elmnts.filter.get_filter(true);
						return {
							startkey: [key, filter.date_from.getFullYear(), filter.date_from.getMonth()+1, filter.date_from.getDate()],
							endkey: [key, filter.date_till.getFullYear(), filter.date_till.getMonth()+1, filter.date_till.getDate()],
							_drop_date: true,
							_order_by: true,
							_search: filter.filter.toLowerCase()
						};
					}
				}
			});
			wnd.elmnts.filter.custom_selection._view = filter_view;
			wnd.elmnts.filter.custom_selection._key = filter_key;

			// картинка заказа в статусбаре
			wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.status_bar);
			wnd.elmnts.grid.attachEvent("onRowSelect", function (rid) {
				wnd.elmnts.svgs.reload(rid);
			});

			// настраиваем дерево
			tree.enableTreeImages(false);
			tree.parse($p.injected_data["tree_filteres.xml"]);
			tree.attachEvent("onSelect", function (rid) {

				// переключаем страницу карусели
				switch(rid) {

					case 'draft':
					case 'sent':
					case 'declined':
					case 'confirmed':
					case 'template':
					case 'zarchive':
					case 'all':
						carousel.cells("list").setActive();
						wnd.elmnts.filter.call_event();
						return;
				}

				build_report(rid);

			});

			
			function build_report(rid) {

				carousel.cells("report").setActive();
				
				function show_report() {

					switch(rid) {

						case 'execution':
							$p.doc.calc_order.rep_invoice_execution(report);
							break;
						
						case 'plan':
						case 'underway':
						case 'manufactured':
						case 'executed':

							$p.doc.calc_order.rep_planing(report, rid);
							break;
					}
					
				}

				if(!report){

					report = new $p.HandsontableDocument(carousel.cells("report"), {})

						.then(function (rep) {

							if(!rep._online)
								return report = null;

							show_report();


						});

				}else if(report._online){

					show_report();
				}

				
			}

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

			var o, wnd, evts = [], attr_on_close = attr.on_close;

			/**
			 * структура заголовков табчасти продукции
			 * @param source
			 */
			if(!_meta_patched){
				(function(source){
					// TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
					if($p.wsql.get_user_param("hide_price_dealer")){
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
						source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0";

					}else if($p.wsql.get_user_param("hide_price_manufacturer")){
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
						source.widths = "40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70";

					}else{
						source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
						source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70";
						source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70";
					}

					if($p.current_acl.role_available("СогласованиеРасчетовЗаказов") || $p.current_acl.role_available("РедактированиеСкидок"))
						source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro";
					else
						source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

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

						// табчасть продукции со специфическим набором кнопок
						tabular_init("production", $p.injected_data["toolbar_calc_order_production.xml"]);

						var toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
						toolbar.addSpacer("btn_delete");
						toolbar.attachEvent("onclick", toolbar_click);

						// табчасть планирования
						tabular_init("planning");


						// попап для присоединенных файлов
						wnd.elmnts.discount_pop = new dhtmlXPopup({
							toolbar: toolbar,
							id: "btn_discount"
						});
						wnd.elmnts.discount_pop.attachEvent("onShow", show_discount);

						// в зависимости от статуса
						setTimeout(set_editable, 50);

					});

				/**
				 *	статусбар с картинками
				 */
				wnd.elmnts.statusbar = wnd.attachStatusBar({text: "<div></div>"});
				wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.statusbar);
				wnd.elmnts.svgs.reload(o);

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
					read_only: wnd.elmnts.ro,
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
					read_only: wnd.elmnts.ro,
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
				wnd.elmnts.cell_note.setHeight(100);
				wnd.elmnts.cell_note.attachHTMLString("<textarea class='textarea_editor'>" + o.note + "</textarea>");
				// wnd.elmnts.note_editor = wnd.elmnts.cell_note.attachEditor({
				// 	content: o.note,
				// 	onFocusChanged: function(name, ev){
				// 		if(!wnd.elmnts.ro && name == "blur")
				// 			o.note = this.getContent().replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
				// 	}
				// });

				//wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
				//	obj: o,
				//	pwnd: wnd,
				//	read_only: wnd.elmnts.ro    // TODO: учитывать права для каждой роли на каждый объект
				//});
			};

			attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

			attr.toolbar_click = toolbar_click;

			attr.on_close = frm_close;

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

					case 'btn_save_close':
						save("close");
						break;

					case 'btn_retrieve':
						save("retrieve");
						break;

					case 'btn_post':
						save("post");
						break;

					case 'btn_unpost':
						save("unpost");
						break;


					case 'btn_close':
						wnd.close();
						break;

					case 'btn_add_builder':
						open_builder(true);
						break;

					case 'btn_add_product':
						$p.dp.buyers_order.form_product_list(wnd, process_add_product);
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
						calendar_new_event();
						break;

					case 'btn_go_connection':
						go_connection();
						break;
				}

				if(btn_id.substr(0,4)=="prn_")
					_mgr.print(o, btn_id, wnd);
			}

			/**
			 * создаёт событие календаря
			 */
			function calendar_new_event(){
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

			function production_new_row(){
				var row = o["production"].add({
					qty: 1,
					quantity: 1,
					discount_percent_internal: $p.wsql.get_user_param("discount", "number")
				});
				o["production"].sync_grid(wnd.elmnts.grids.production);
				wnd.elmnts.grids.production.selectRowById(row.row);
				return row;
			}

			function production_get_sel_index(){
				var selId = wnd.elmnts.grids.production.getSelectedRowId();
				if(selId && !isNaN(Number(selId)))
					return Number(selId)-1;

				$p.msg.show_msg({
					type: "alert-warning",
					text: $p.msg.no_selected_row.replace("%1", "Продукция"),
					title: o.presentation
				});
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
						$p.msg.show_msg({
							type: "alert-warning",
							text: $p.msg.sub_row_change_disabled,
							title: o.presentation + ' стр. №' + (rId + 1)
						});
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

				function do_save(post){

					if(!wnd.elmnts.ro){
						o.note = wnd.elmnts.cell_note.cell.querySelector("textarea").value.replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
						wnd.elmnts.pg_left.selectRow(0);
					}

					o.save(post)
						.then(function(){

							if(action == "sent" || action == "close")
								wnd.close();
							else{
								wnd.set_text();
								set_editable();
							}

						})
						.catch(function(err){
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
								o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
								do_save();
							}
						}
					});

				} else if(action == "retrieve"){
					// установить транспорт в "отозвано" и записать
					o.obj_delivery_state =  $p.enm.obj_delivery_states.Отозван;
					do_save();

				} else if(action == "save" || action == "close"){
					do_save();

				}else if(action == "post"){
					do_save(true);

				}else if(action == "unpost"){
					do_save(false);
				}
			}

			function frm_close(){

				// выгружаем из памяти всплывающие окна скидки и связанных файлов
				["vault", "vault_pop", "discount", "discount_pop"].forEach(function (elm) {
					if (wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload)
						wnd.elmnts[elm].unload();
				});

				evts.forEach(function (id) {
					$p.eve.detachEvent(id);
				});

				if(typeof attr_on_close == "function")
					attr_on_close();
				
				return true;
			}

			function set_editable(){

				// статусы
				var st_draft = $p.enm.obj_delivery_states.Черновик,
					st_retrieve = $p.enm.obj_delivery_states.Отозван,
					retrieve_enabed, detales_toolbar;

				wnd.elmnts.pg_right.cells("vat_consider", 1).setDisabled(true);
				wnd.elmnts.pg_right.cells("vat_included", 1).setDisabled(true);

				wnd.elmnts.ro = false;

				// технолог может изменять шаблоны
				if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){
					wnd.elmnts.ro = !$p.current_acl.role_available("ИзменениеТехнологическойНСИ");

				// ведущий менеджер может изменять проведенные
				}else if(o.posted || o._deleted){
					wnd.elmnts.ro = !$p.current_acl.role_available("СогласованиеРасчетовЗаказов");

				}else if(!wnd.elmnts.ro && !o.obj_delivery_state.empty())
					wnd.elmnts.ro = o.obj_delivery_state != st_draft && o.obj_delivery_state != st_retrieve;

				retrieve_enabed = !o._deleted &&
					(o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

				wnd.elmnts.grids.production.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.grids.planning.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_left.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_right.setEditable(!wnd.elmnts.ro);

				// гасим кнопки проведения, если недоступна роль
				if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
					wnd.elmnts.frm_toolbar.hideItem("btn_post");
					wnd.elmnts.frm_toolbar.hideItem("btn_unpost");
				}

				// кнопки записи и отправки гасим в зависимости от статуса
				if(wnd.elmnts.ro){
					wnd.elmnts.frm_toolbar.disableItem("btn_sent");
					wnd.elmnts.frm_toolbar.disableItem("btn_save");

					detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.disableItem(itemId);
					});

					detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.disableItem(itemId);
					});

				}else{
					// шаблоны никогда не надо отправлять
					if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон)
						wnd.elmnts.frm_toolbar.disableItem("btn_sent");
					else
						wnd.elmnts.frm_toolbar.enableItem("btn_sent");

					wnd.elmnts.frm_toolbar.enableItem("btn_save");

					detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.enableItem(itemId);
					});

					detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
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
				//discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

				// т.к. табчасть мы будем перерисовывать в любом случае, отключаем обсерверы
				ox._silent = true;
				
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

				// обновляем табчасть
				wnd.elmnts.grids.production.refresh_row(row);
				
				// обновляем эскизы
				wnd.elmnts.svgs.reload(o);
				
			}

			/**
			 * показывает диалог с сообщением "это не продукция"
			 */
			function not_production(){
				$p.msg.show_msg({
					title: $p.msg.bld_title,
					type: "alert-error",
					text: $p.msg.bld_not_product
				});
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
						if(row.characteristic.empty() ||
								row.characteristic.calc_order.empty() ||
								row.characteristic.owner.is_procedure ||
								row.characteristic.owner.is_service ||
								row.characteristic.owner.is_accessory){
							not_production();

						}else if(row.characteristic.coordinates.count() == 0){
							// возможно, это заготовка - проверим номенклатуру системы

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
			function process_add_product(ts){

				if(ts && ts.count()){

					ts.clear();
				}
				//wnd.progressOn();
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
 * Отчеты по документу Расчет
 * @module doc_calc_order_reports
 * Created 23.06.2016
 */

$p.modifiers.push(
	function($p) {

		$p.doc.calc_order.rep_invoice_execution = function (rep) {

			var query_options = {
				reduce: true,
				limit: 10000,
				group: true,
				group_level: 3
			},
				res = {
					data: [],
					readOnly: true,
					colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
					colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
					columns: [
						{type: 'text'},
						{type: 'text'},
						{type: 'text'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'}
					],
					wordWrap: false
					//minSpareRows: 1
				};

			if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				//query_options.group_level = 3;
				query_options.startkey = [$p.current_acl.partners_uids[0],""];
				query_options.endkey = [$p.current_acl.partners_uids[0],"\uffff"];
			}

			return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options)

				.then(function (data) {

					var total = {
						invoice: 0,
						pay: 0,
						total_pay: 0,
						shipment:0,
						total_shipment:0
					};

					if(data.rows){

						data.rows.forEach(function (row) {

							if(!row.value.total_pay && !row.value.total_shipment)
								return;

							res.data.push([
								$p.cat.partners.get(row.key[0]).presentation,
								$p.cat.organizations.get(row.key[1]).presentation,
								row.key[2],
								row.value.invoice,
								row.value.pay,
								row.value.total_pay,
								row.value.shipment,
								row.value.total_shipment]);

							total.invoice+= row.value.invoice;
							total.pay+=row.value.pay;
							total.total_pay+=row.value.total_pay;
							total.shipment+=row.value.shipment;
							total.total_shipment+=row.value.total_shipment;
						});

						res.data.push([
							"Итого:",
							"",
							"",
							total.invoice,
							total.pay,
							total.total_pay,
							total.shipment,
							total.total_shipment]);

						res.mergeCells= [
							{row: res.data.length-1, col: 0, rowspan: 1, colspan: 3}
						]
					}

					rep.requery(res);
					
					return res;
				});
		};

		$p.doc.calc_order.rep_planing = function (rep, attr) {

			var date_from = $p.date_add_day(new Date(), -1, true),
				date_till = $p.date_add_day(date_from, 7, true),
				query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 5,
					startkey: [date_from.getFullYear(), date_from.getMonth()+1, date_from.getDate(), ""],
					endkey: [date_till.getFullYear(), date_till.getMonth()+1, date_till.getDate(),"\uffff"]
				},
				res = {
					data: [],
					readOnly: true,
					wordWrap: false
					//minSpareRows: 1
				};



			return $p.wsql.pouch.remote.doc.query("server/planning", query_options)

				.then(function (data) {


					if(data.rows){
						
						var include_detales = $p.current_acl.role_available("СогласованиеРасчетовЗаказов");

						data.rows.forEach(function (row) {

							if(!include_detales){

							}

							res.data.push([
								new Date(row.key[0], row.key[1]-1, row.key[2]),
								$p.cat.planning_keys.get(row.key[3]),
								row.value.debit,
								row.value.credit,
								row.value.total
							]);
						});

					}

					rep.requery(res);

					return res;
				});

		};

	}
);
/**
 * Модификаторы обработки _builder_pen_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module dp_builder_pen
 * Created 13.05.2016
 */

$p.modifiers.push(

	function($p) {
		
		function elm_type_change(attr) {
			if(attr.field == "elm_type") {
				this.inset = paper.project.default_inset({elm_type: this.elm_type});
				this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
			}
		}

		$p.dp.builder_pen.attache_event("value_change", elm_type_change);

		if($p.dp.builder_lay_impost)
			$p.dp.builder_lay_impost.attache_event("value_change", elm_type_change);
	}
);
/**
 * Модификаторы обработки _Заказ покупателя_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module dp_buyers_order
 * Created 13.05.2016
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.dp.buyers_order;
			
		// переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
		
		var obj_constructor =  _mgr._obj_constructor.prototype;
		delete obj_constructor.clr;
		delete obj_constructor.sys;			
		obj_constructor.__define({
			
			clr: {
				get: function () {
					return this.characteristic.clr;
				},
				set: function (v) {
					
					if(this.characteristic.clr == v)
						return;

					Object.getNotifier(this).notify({
						type: 'update',
						name: 'clr',
						oldValue: this.characteristic.clr
					});
					this.characteristic.clr = v;
					this._data._modified = true;
				}
			},

			sys: {
				get: function () {
					return this.characteristic.sys;
				},
				set: function (v) {

					if(this.characteristic.sys == v)
						return;

					Object.getNotifier(this).notify({
						type: 'update',
						name: 'sys',
						oldValue: this.characteristic.sys
					});
					this.characteristic.sys = v;
					this._data._modified = true;
				}
			}
		});

		
		_mgr.unload_obj = function () {
			
		};

		/**
		 * форма ДобавитьСписокПродукции. публикуемый метод: $p.dp.buyers_order.form_product_list(o, pwnd, attr)
		 * @param pwnd
		 * @param attr
		 */
		_mgr.form_product_list = function (pwnd, callback) {

			var o = _mgr.create(), 
				wnd,
				attr = {

					// командная панель формы
					toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

					// переопределяем обработчики кнопок командной панели формы
					toolbar_click: function (btn_id) {
						if(btn_id == "btn_ok"){
							o._data._modified = false;
							wnd.close();
							callback(o.production);
						}
					},

					// переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
					draw_pg_header: function (o, wnd) {
						wnd.elmnts.tabs.tab_header.hide();
						wnd.elmnts.frm_tabs.tabsArea.classList.add("tabs_hidden");
						wnd.elmnts.frm_toolbar.hideItem("bs_print");
					}
				};

			// переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
			// attr.draw_tabular_sections = function (o, wnd, tabular_init) {
			//
			// };


			o.presentation = "Добавление продукции с параметрами";

			o.form_obj(pwnd, attr)
				.then(function (res) {
					wnd = res.wnd
				});

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
							_mgr.Штульп] );
				},
				enumerable : false,
				configurable : false
			},

			profile_items: {
				get : function(){
					return cache.profile_items
						|| ( cache.profile_items = [
							_mgr.Рама,
							_mgr.Створка,
							_mgr.Импост,
							_mgr.Штульп,
							_mgr.Добор,
							_mgr.Соединитель,
							_mgr.Раскладка
						] );
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

			impost_lay: {
				get : function(){
					return cache.impost_lay
						|| ( cache.impost_lay = [ _mgr.Импост, _mgr.Раскладка] );
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
 * Модификаторы перечислений
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module enm_orientations
 * Created 22.04.2016
 */


$p.modifiers.push(
	
	function($p) {
		
		/**
		 * Дополнительные методы перечисления Типы открывания
		 */
		$p.enm.open_types.__define({

			is_opening: {
				value: function (v) {

					if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное)
						return false;

					return true;

				}
			}

			/*
			,

			rotary: {
				get: function () {
					return this.Поворотное;
				}
			},

			folding: {
				get: function () {
					return this.Откидное;
				}
			},

			rotary_folding: {
				get: function () {
					return this.ПоворотноОткидное;
				}
			},

			deaf: {
				get: function () {
					return this.Глухое;
				}
			},

			sliding: {
				get: function () {
					return this.Раздвижное;
				}
			},

			fixed: {
				get: function () {
					return this.Неподвижное;
				}
			}
			*/

		});

		/**
		 * Дополнительные методы перечисления Ориентация
		 */
		$p.enm.orientations.__define({

			hor: {
				get: function () {
					return this.Горизонтальная;
				}
			},

			vert: {
				get: function () {
					return this.Вертикальная;
				}
			},

			incline: {
				get: function () {
					return this.Наклонная;
				}
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

		// экспортируем класс Pricing (модуль ценообразования)
		$p.pricing = new Pricing($p);

		// методы ценообразования в прототип номенклатуры
		$p.cat.nom._obj_constructor.prototype.__define({

			/**
			 * Возвращает цену номенклатуры указанного типа
			 * - на дату
			 * - с подбором характеристики по цвету
			 * - с пересчетом из валюты в валюту
			 */
			_price: {
				value: function (attr) {
					
					if(!attr)
						attr = {};

					if(!attr.price_type)
						attr.price_type = $p.job_prm.pricing.price_type_sale;
					else if($p.is_data_obj(attr.price_type))
						attr.price_type = attr.price_type.ref;

					if(!attr.characteristic)
						attr.characteristic = $p.blank.guid;
					else if($p.is_data_obj(attr.characteristic))
						attr.characteristic = attr.characteristic.ref;

					if(!attr.date)
						attr.date = new Date();

					var price = 0, currency, date = $p.blank.date;

					if(this._data._price){
						if(this._data._price[attr.characteristic]){
							if(this._data._price[attr.characteristic][attr.price_type]){
								this._data._price[attr.characteristic][attr.price_type].forEach(function (row) {
									if(row.date > date && row.date <= attr.date){
										price = row.price;
										currency = row.currency;
									}
								})
							}
						}else if(attr.clr){

						}
					}

					// Пересчитать из валюты в валюту
					return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

				}
			}
		});

		
		/**
		 * Обработчик события "при изменении свойства" в шапке или табличной части при редактировании в форме объекта
		 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
		 */
		$p.doc.nom_prices_setup.attache_event("add_row", function (attr) {

			// установим валюту и тип цен по умолчению при добавлении строки
			if(attr.tabular_section == "goods"){
				attr.row.price_type = this.price_type;
				attr.row.currency = this.price_type.price_currency;
			}

		});

		/**
		 * Обработчик при создании документа
		 */
		$p.doc.nom_prices_setup.attache_event("after_create", function (attr) {

			//Номер документа
			return this.new_number_doc();

		});
		
		/**
		 * Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
		 */
		$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;



		function Pricing($p){

			/**
			 * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
			 * Если в маржинальных коэффициентах или номенклатуре указана формула - выполняет
			 *
			 * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
			 * @method nom_price
			 * @param nom
			 * @param characteristic
			 * @param price_type
			 * @param prm
			 * @param row
			 */
			this.nom_price = function (nom, characteristic, price_type, prm, row) {

				if(row && prm){
					var calc_order = prm.calc_order_row._owner._owner;
					row.price = nom._price({
						price_type: price_type,
						characteristic: characteristic,
						date: calc_order.date,
						currency: calc_order.doc_currency
					});

					return row.price;
				}
			};

			/**
			 * Возвращает структуру типов цен и КМарж
			 * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
			 * @method price_type
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.price_type = function (prm) {

				// Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
				// 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
				// 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
				prm.price_type = {
					marginality: 1.9,
					marginality_min: 1.2,
					marginality_internal: 1.5,
					discount: 0,
					discount_external: 10,
					extra_charge_external: 0,
					price_type_first_cost: $p.job_prm.pricing.price_type_first_cost,
					price_type_sale: $p.job_prm.pricing.price_type_first_cost,
					price_type_internal: $p.job_prm.pricing.price_type_first_cost,
					formula: "",
					sale_formula: "",
					internal_formula: "",
					external_formula: ""
				};

				var filter = prm.calc_order_row.nom.price_group.empty() ?
					{price_group: prm.calc_order_row.nom.price_group} :
					{price_group: {in: [prm.calc_order_row.nom.price_group, $p.cat.price_groups.get()]}},
					ares = [];

				$p.ireg.margin_coefficients.find_rows(filter, function (row) {
					ares.push(row);
				});

				// заглушка - фильтр только по ценовой группе
				if(ares.length)
					Object.keys(prm.price_type).forEach(function (key) {
						prm.price_type[key] = ares[0][key];
					});

				// если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
				prm.calc_order_row._owner._owner.partner.extra_fields.find_rows({
					property: $p.job_prm.pricing.dealer_surcharge
				}, function (row) {
					prm.price_type.extra_charge_external = row.value;
					return false;
				});

				return prm.price_type;
			};

			/**
			 * Рассчитывает плановую себестоимость строки документа Расчет
			 * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
			 *
			 * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.calc_first_cost = function (prm) {

				var marginality_in_spec = $p.job_prm.pricing.marginality_in_spec,
					fake_row = {};

				if(!prm.spec)
					return;

				// пытаемся рассчитать по спецификации
				if(prm.spec.count()){
					prm.spec.each(function (row) {

						$p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_first_cost, prm, row);
						row.amount = row.price * row.totqty1;

						if(marginality_in_spec){
							fake_row._mixin(row, ["nom"]);
							tmp_price = $p.pricing.nom_price(row.nom, row.characteristic, prm.price_type.price_type_sale, prm, fake_row);
							row.amount_marged = (tmp_price ? tmp_price : row.price) * row.totqty1;
						}

					});
					prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
				}else{
					// TODO: реализовать расчет себестомиости по номенклатуре строки расчета
				}
				
				
				
				
			};

			/**
			 * Рассчитывает стоимость продажи в строке документа Расчет
			 * 
			 * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
			 * @param prm {Object}
			 * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
			 */
			this.calc_amount = function (prm) {

				// TODO: реализовать расчет цены продажи по номенклатуре строки расчета
				var price_cost = $p.job_prm.pricing.marginality_in_spec ? prm.spec.aggregate([], ["amount_marged"]) : 0;

				// цена продажи
				if(price_cost)
					prm.calc_order_row.price = price_cost.round(2);
				else
					prm.calc_order_row.price = (prm.calc_order_row.first_cost * prm.price_type.marginality).round(2);

				// КМарж в строке расчета
				prm.calc_order_row.marginality = prm.calc_order_row.first_cost ?
					prm.calc_order_row.price * ((100 - prm.calc_order_row.discount_percent)/100) / prm.calc_order_row.first_cost : 0;
				

				// TODO: Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
				if(prm.price_type.extra_charge_external){

					prm.calc_order_row.price_internal = (prm.calc_order_row.price *
						(100 - prm.calc_order_row.discount_percent)/100 * (100 + prm.price_type.extra_charge_external)/100).round(2);

					// TODO: учесть формулу

				}


				// TODO: вытягивание строк спецификации в заказ

				// Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
				if(!prm.hand_start){
					$p.doc.calc_order.handle_event(prm.calc_order_row._owner._owner, "value_change", {
						field: "price",
						value: prm.calc_order_row.price,
						tabular_section: "production",
						row: prm.calc_order_row,
						no_extra_charge: true
					});
				}



			};

			/**
			 * Пересчитывает сумму из валюты в валюту
			 * @param amount {Number} - сумма к пересчету
			 * @param date {Date} - дата курса
			 * @param from - исходная валюта
			 * @param [to] - конечная валюта
			 * @return {Number}
			 */
			this.from_currency_to_currency = function (amount, date, from, to) {

				if(!to || to.empty())
					to = $p.job_prm.pricing.main_currency;
				
				if(!from || from == to)
					return amount;
				
				if(!date)
					date = new Date();

				if(!this.cource_sql)
					this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `date` desc");

				var cfrom = {course: 1, multiplicity: 1}, 
					cto = {course: 1, multiplicity: 1},
					tmp;
				if(from != $p.job_prm.pricing.main_currency){
					tmp = this.cource_sql([from.ref, date]);
					if(tmp.length)
						cfrom = tmp[0];
				}
				if(to != $p.job_prm.pricing.main_currency){
					tmp = this.cource_sql([to.ref, date]);
					if(tmp.length)
						cto = tmp[0];
				}

				return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
			};


			/**
			 * Выгружает в CouchDB изменённые в RAM справочники
			 */
			this.cut_upload = function () {

				if(!$p.current_acl || (
						!$p.current_acl.role_available("СогласованиеРасчетовЗаказов") &&
						!$p.current_acl.role_available("ИзменениеТехнологическойНСИ"))){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.error_low_acl,
						title: $p.msg.error_rights
					});
					return true;
				}
				
				function upload_acc() {
					var mgrs = [
						"cat.users",
						"cat.individuals",
						"cat.organizations",
						"cat.partners",
						"cat.contracts",
						"cat.currencies",
						"cat.nom_prices_types",
						"cat.price_groups",
						"cat.cashboxes",
						"cat.partner_bank_accounts",
						"cat.organization_bank_accounts",
						"cat.projects",
						"cat.stores",
						"cat.cash_flow_articles",
						"cat.cost_items",
						"cat.price_groups",
						"cat.delivery_areas",
						"ireg.currency_courses",
						"ireg.margin_coefficients"
					];

					$p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
						filter: function (doc) {
							return mgrs.indexOf(doc._id.split("|")[0]) != -1;
						}
					})
						.on('change', function (info) {
							//handle change

						})
						.on('paused', function (err) {
							// replication paused (e.g. replication up to date, user went offline)

						})
						.on('active', function () {
							// replicate resumed (e.g. new changes replicating, user went back online)

						})
						.on('denied', function (err) {
							// a document failed to replicate (e.g. due to permissions)
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						})
						.on('complete', function (info) {
							
							if($p.current_acl.role_available("ИзменениеТехнологическойНСИ"))
								upload_tech();

							else
								$p.msg.show_msg({
									type: "alert-info",
									text: $p.msg.sync_complite,
									title: $p.msg.sync_title
								});

						})
						.on('error', function (err) {
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						});
				}

				function upload_tech() {
					var mgrs = [
						"cat.units",
						"cat.nom",
						"cat.nom_groups",
						"cat.nom_units",
						"cat.nom_kinds",
						"cat.elm_visualization",
						"cat.destinations",
						"cat.property_values",
						"cat.property_values_hierarchy",
						"cat.inserts",
						"cat.insert_bind",
						"cat.color_price_groups",
						"cat.clrs",
						"cat.furns",
						"cat.cnns",
						"cat.production_params",
						"cat.parameters_keys",
						"cat.formulas",
						"cch.properties",
						"cch.predefined_elmnts"
						
					];

					$p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
						filter: function (doc) {
							return mgrs.indexOf(doc._id.split("|")[0]) != -1;
						}
					})
						.on('change', function (info) {
							//handle change

						})
						.on('paused', function (err) {
							// replication paused (e.g. replication up to date, user went offline)

						})
						.on('active', function () {
							// replicate resumed (e.g. new changes replicating, user went back online)

						})
						.on('denied', function (err) {
							// a document failed to replicate (e.g. due to permissions)
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						})
						.on('complete', function (info) {
							$p.msg.show_msg({
								type: "alert-info",
								text: $p.msg.sync_complite,
								title: $p.msg.sync_title
							});

						})
						.on('error', function (err) {
							$p.msg.show_msg(err.reason);
							$p.record_log(err);

						});
				}

				
				if($p.current_acl.role_available("СогласованиеРасчетовЗаказов"))
					upload_acc();
				else
					upload_tech();				
				
			};
			
			// виртуальный срез последних
			function build_cache() {

				return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
					{
						limit : 1000,
						include_docs: false,
						startkey: [''],
						endkey: ['\uffff']
						// ,reduce: function(keys, values, rereduce) {
						// 	return values.length;
						// }
					})
					.then(function (res) {
						res.rows.forEach(function (row) {

							var onom = $p.cat.nom.get(row.key[0], false, true);

							if(!onom || !onom._data)
								return;
							
							if(!onom._data._price)
								onom._data._price = {};

							if(!onom._data._price[row.key[1]])
								onom._data._price[row.key[1]] = {};

							if(!onom._data._price[row.key[1]][row.key[2]])
								onom._data._price[row.key[1]][row.key[2]] = [];

							onom._data._price[row.key[1]][row.key[2]].push({
								date: new Date(row.value.date),
								price: row.value.price,
								currency: $p.cat.currencies.get(row.value.currency)
							});

						});
					});
			}

			// подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
			var init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", function () {
				$p.eve.detachEvent(init_event_id);
				build_cache();
			});

			// следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
			$p.eve.attachEvent("pouch_change", function (dbid, change) {
				if (dbid != $p.doc.nom_prices_setup.cachable)
					return;

				// формируем новый
			});
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
			 * @return {Number|DataObj}
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
			function cnn_need_add_spec(cnn, elm1, elm2){

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
			 * @return {TabularSectionRow.cat.characteristics.specification}
			 */
			function new_spec_row(row_spec, elm, row_base, nom, origin){
				if(!row_spec)
					row_spec = spec.add();
				row_spec.nom = nom || row_base.nom;
				row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr);
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
			function cnn_add_spec(cnn, elm, len_angl){

				var sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;

				cnn_filter_spec(cnn, elm, len_angl).forEach(function (row_cnn_spec) {
					var nom = row_cnn_spec.nom;

					// TODO: nom может быть вставкой - в этом случае надо разузловать
					if(nom._manager == $p.cat.inserts){
						if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)){
							var tmp_len_angl = len_angl._clone();
							tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
							inset_spec(elm, nom, tmp_len_angl);
						}else
							inset_spec(elm, nom, len_angl);

					}else {

						var row_spec = new_spec_row(null, elm, row_cnn_spec, nom, len_angl.origin);

						// В простейшем случае, формула = "ДобавитьКомандуСоединения(Парам);"
						if(row_cnn_spec.formula.empty()) {
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
									row_spec.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
							}

						}else {
							// TODO: заменить eval и try-catch на динамическую функцию
							try{
								if(eval(row_cnn_spec.formula) === false)
									return;
							}catch(err){
								$p.record_log(err);
							}
						}

						if(!row_spec.qty)
							spec.del(row_spec.row-1);
						else
							calc_count_area_mass(row_spec, len_angl, row_cnn_spec.angle_calc_method);
						
					}


				});
			}

			/**
			 * ПолучитьСпецификациюСоединенияСФильтром
			 * @param cnn
			 * @param elm
			 * @param len_angl
			 */
			function cnn_filter_spec(cnn, elm, len_angl){

				var res = [], nom, angle_hor = elm.angle_hor;

				cnn.specification.each(function (row) {
					nom = row.nom;
					if(!nom || nom.empty() ||
							nom == $p.job_prm.nom.art1 ||
							nom == $p.job_prm.nom.art2)
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
					}

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
			function inset_check(inset, elm, by_perimetr, len_angl){

				var is_tabular = true,
					_row = elm._row,
					len = len_angl ? len_angl.len : _row.len;

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
					if(inset.lmin > len || (inset.lmax < len && inset.lmax > 0))
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
			function inset_filter_spec(inset, elm, is_high_level_call, len_angl){

				var res = [], glass_rows;
				if(!inset || inset.empty())
					return res;

				if(is_high_level_call && inset.insert_type == $p.enm.inserts_types.Стеклопакет){
					glass_rows = glass_specification.find_rows({elm: elm.elm}).map(function (row) {
						return row._row;
					});
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
							inset_filter_spec(row.inset, elm, false, len_angl).forEach(function (row) {
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
					if(!inset_check(row, elm, inset.insert_type == $p.enm.inserts_types.Профиль, len_angl))
						return;

					// Проверяем параметры изделия
					if(!check_params(inset.selection_params, row.elm))
						return;

					// Добавляем или разузловываем дальше
					if(row.nom._manager == $p.cat.inserts)
						inset_filter_spec(row.nom, elm, false, len_angl).forEach(function (row) {
							res.push(row);
						});
					else
						res.push(row);
						
				});

				return res;
			}

			/**
			 * Спецификации фурнитуры
			 * @param contour {Contour}
			 */
			function furn_spec(contour) {

				// у рамных контуров фурнитуры не бывает
				if(!contour.parent)
					return false;
				
				// кеш сторон фурнитуры
				var cache = {
					profiles: contour.outer_nodes,
					bottom: contour.profiles_by_side("bottom"),
					params: contour.project.ox.params
				};

				// проверяем, подходит ли фурнитура под геометрию контура
				if(!furn_check_opening_restrictions(contour, cache))
					return;

				// уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
				furn_update_handle_height(contour, cache, contour.furn.furn_set);

				// получаем спецификацию фурнитуры и переносим её в спецификацию изделия
				furn_get_spec(contour, cache, contour.furn.furn_set).each(function (row) {
					var elm = {elm: -contour.cnstr, clr: contour.clr_furn},
						row_spec = new_spec_row(null, elm, row, row.nom_set, row.origin);

					if(row.is_procedure_row){
						row_spec.elm = row.handle_height_min;
						row_spec.len = row.coefficient / 1000;
						row_spec.qty = 0;
						row_spec.totqty = 1;
						row_spec.totqty1 = 1;
						if(!row_spec.nom.visualization.empty())
							row_spec.dop = -1;

					}else{
						row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
						calc_count_area_mass(row_spec);
					}
				});
			}

			/**
			 * Проверяет ограничения открывания, добавляет визуализацию ошибок
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @return {boolean}
			 */
			function furn_check_opening_restrictions(contour, cache) {

				var ok = true;

				// TODO: реализовать проверку по количеству сторон

				// проверка геометрии
				contour.furn.open_tunes.each(function (row) {
					var elm = contour.profile_by_furn_side(row.side, cache),
						len = elm._row.len - 2 * elm.nom.sizefurn;

					// angle_hor = elm.angle_hor; TODO: реализовать проверку углов

					if(len < row.lmin ||
						len > row.lmax ||
						(!elm.is_linear() && !row.arc_available)){

						new_spec_row(null, elm, {clr: $p.cat.clrs.get()}, $p.job_prm.nom.furn_error, contour.furn).dop = -1;
						ok = false;
					}

				});

				return ok;
			}

			/**
			 * Аналог УПзП-шного _ПроверитьОграниченияСтрокиФурнитуры_
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @param furn_set {_cat.furns}
			 * @param row {_cat.furns.specification.row}
			 */
			function furn_check_row_restrictions(contour, cache, furn_set, row) {

				var res = true;

				// по таблице параметров
				furn_set.selection_params.find_rows({elm: row.elm, dop: row.dop}, function (row) {

					var ok = false;

					if($p.job_prm.properties.direction == row.param){
						ok = contour.direction == row.value;

					}else{
						cache.params.find_rows({cnstr: contour.cnstr, param: row.param, value: row.value}, function () {
							return !(ok = true);
						});
					}

					if(!ok)
						return res = false;

				});

				// по таблице ограничений
				if(res){
					furn_set.specification_restrictions.find_rows({elm: row.elm, dop: row.dop}, function (row) {

						var len;
						
						if(contour.is_rectangular){
							if(!cache.w)
								cache.w = contour.w;
							if(!cache.h)
								cache.h = contour.h;

							len = (row.side == 1 || row.side == 3) ? cache.w : cache.h;
							
						}else{
							var elm = contour.profile_by_furn_side(row.side, cache);
							len = elm._row.len - 2 * elm.nom.sizefurn;	
						}

						if(len < row.lmin || len > row.lmax ){
							return res = false;

						}
					});
				}

				return res;
			}

			/**
			 * Уточняет высоту ручки
			 * @param contour {Contour}
			 * @param cache {Object}
			 */
			function furn_update_handle_height(contour, cache, furn_set){

				if(!contour.furn.handle_side && furn_set.empty())
					return;

				// получаем элемент, на котором ручка и длину элемента
				var elm = contour.profile_by_furn_side(contour.furn.handle_side, cache),
					len = elm._row.len;

				// бежим по спецификации набора в поисках строки про ручку
				furn_set.specification.find_rows({dop: 0}, function (row) {

					// проверяем, проходит ли строка
					if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
						return;

					if(furn_set_handle_height(contour, row, len))
						return false;

					if(row.is_set_row){
						var ok = false;
						furn_get_spec(contour, cache, row.nom_set, true).each(function (sub_row) {
							if(furn_set_handle_height(contour, sub_row, len))
								return !(ok = true);
						});
						if(ok)
							return false;
					}

				})


			}

			/**
			 * Устанавливает высоту ручки в контуре, если этого требует текущая строка спецификации фкрнитуры
			 * @param contour {Contour}
			 * @param row {TabularSectionRow.cat.furns.specification}
			 * @param len {Number}
			 */
			function furn_set_handle_height(contour, row, len){

				if(row.handle_height_base == -1){
					contour._row.h_ruch = (len / 2).round(0);
					contour._row.fix_ruch = false;
					return true;

				}else if(row.handle_height_base > 0){
					contour._row.h_ruch = row.handle_height_base;
					contour._row.fix_ruch = true;
					return true;

				}
			}

			/**
			 * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
			 * @param contour {Contour}
			 * @param cache {Object}
			 * @param furn_set {_cat.furns}
			 * @param [exclude_dop] {Boolean}
			 */
			function furn_get_spec(contour, cache, furn_set, exclude_dop) {

				var res = $p.dp.buyers_order.create().specification;

				// бежим по всем строкам набора
				furn_set.specification.find_rows({dop: 0}, function (row) {

					// проверяем, проходит ли строка
					if(!row.quantity || !furn_check_row_restrictions(contour, cache, furn_set, row))
						return;

					// ищем строки дополнительной спецификации
					if(!exclude_dop){
						furn_set.specification.find_rows({is_main_specification_row: false, elm: row.elm}, function (dop_row) {

							if(!furn_check_row_restrictions(contour, cache, furn_set, dop_row))
								return;

							// расчет координаты и (или) визуализации
							if(dop_row.is_procedure_row){

								var invert = contour.direction == $p.enm.open_directions.Правое,
									invert_nearest = false,
									coordin = 0,
									elm = contour.profile_by_furn_side(dop_row.side, cache),
									len = elm._row.len,
									sizefurn = elm.nom.sizefurn,
									dx0 = (len - elm.data._len) / 2,
									dx1 = $p.job_prm.builder.add_d ? sizefurn : 0,
									faltz = len - 2 * sizefurn;

								if(dop_row.offset_option == $p.enm.offset_options.Формула){


								}else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
									coordin = faltz + dop_row.contraction;

								}else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
									// строим горизонтальную линию от нижней границы контура, находим пересечение и offset
									var bounds = contour.bounds,
										by_side = contour.profiles_by_side(),
										hor;
									if(elm == by_side.top || elm == by_side.bottom){
										hor = new paper.Path({
											insert: false,
											segments: [[bounds.left + contour.h_ruch, bounds.top - 200], [bounds.left + contour.h_ruch, bounds.bottom + 200]]
										});
									}else
										hor = new paper.Path({
											insert: false,
											segments: [[bounds.left - 200, bounds.bottom - contour.h_ruch], [bounds.right + 200, bounds.bottom - contour.h_ruch]]
										});


									coordin = elm.generatrix.getOffsetOf(elm.generatrix.intersect_point(hor));

								}else{

									if(invert){

										if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
											coordin = dop_row.contraction;

										}else{
											coordin = len - dop_row.contraction;
										}

									}else{

										if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
											coordin = len - dop_row.contraction;

										}else{
											coordin = dop_row.contraction;
										}
									}
								}

								var procedure_row = res.add(dop_row);
								procedure_row.origin = furn_set;
								procedure_row.handle_height_min = elm.elm;
								procedure_row.handle_height_max = contour.cnstr;
								procedure_row.coefficient = coordin;

								return;

							}else if(!dop_row.quantity)
								return;

							// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
							if(dop_row.is_set_row){
								furn_get_spec(contour, cache, dop_row.nom_set).each(function (sub_row) {

									if(sub_row.is_procedure_row)
										res.add(sub_row);

									else if(!sub_row.quantity)
										return;

									res.add(sub_row).quantity = row.quantity * sub_row.quantity;

								});
							}else{
								res.add(dop_row).origin = furn_set;
							}

						});
					}

					// в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
					if(row.is_set_row){
						furn_get_spec(contour, cache, row.nom_set).each(function (sub_row) {

							if(sub_row.is_procedure_row)
								res.add(sub_row);

							else if(!sub_row.quantity)
								return;

							res.add(sub_row).quantity = row.quantity * sub_row.quantity;

						});
					}else{
						res.add(row).origin = furn_set;
					}

				});

				return res;
			}



			/**
			 * Спецификации соединений примыкающих профилей
			 * @param elm {Profile}
			 */
			function cnn_spec_nearest(elm) {
				var nearest = elm.nearest();
				if(nearest && elm.data._nearest_cnn)
					cnn_add_spec(elm.data._nearest_cnn, elm, {
						angle:  0,
						alp1:   0,
						alp2:   0,
						len:    elm.data._len,
						origin: cnn_row(elm.elm, nearest.elm)
					});
			}

			/**
			 * Спецификация профиля
			 * @param elm {Profile}
			 */
			function base_spec_profile(elm) {

				var b, e, prev, next, len_angle,
					_row, row_cnn_prev, row_cnn_next, row_spec;

				_row = elm._row;
				if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure)
					return;

				b = elm.rays.b;
				e = elm.rays.e;

				if(!b.cnn || !e.cnn){
					$p.record_log({
						note: "не найдено соединение",
						obj: _row._obj
					});
					return;
				}

				prev = b.profile;
				next = e.profile;
				row_cnn_prev = b.cnn.main_row(elm);
				row_cnn_next = e.cnn.main_row(elm);

				// добавляем строку спецификации
				if(row_cnn_prev || row_cnn_next){
					row_spec = new_spec_row(null, elm, row_cnn_prev || row_cnn_next, _row.nom, cnn_row(_row.elm, prev ? prev.elm : 0));

					// уточняем размер
					row_spec.len = (_row.len - (row_cnn_prev ? row_cnn_prev.sz : 0) - (row_cnn_next ? row_cnn_next.sz : 0))
						* ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

					// profile.Длина - то, что получится после обработки
					// row_spec.Длина - сколько взять (отрезать)
					elm.data._len = _row.len;
					_row.len = (_row.len
						- (!row_cnn_prev || row_cnn_prev.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_prev.sz)
						- (!row_cnn_next || row_cnn_next.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? 0 : row_cnn_next.sz))
						* 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

					// припуск для гнутых элементов
					if(!elm.is_linear())
						row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;

					// дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
					if(row_cnn_prev && !row_cnn_prev.formula.empty()){
						row_cnn_prev.formula.execute({
							ox: ox,
							elm: elm,
							row_cnn: row_cnn_prev,
							row_spec: row_spec
						});

					}else if(row_cnn_next && !row_cnn_next.formula.empty()){
						row_cnn_next.formula.execute({
							ox: ox,
							elm: elm,
							row_cnn: row_cnn_next,
							row_spec: row_spec
						});
					}

					// РассчитатьКоличествоПлощадьМассу
					calc_count_area_mass(row_spec, _row, row_cnn_prev ? row_cnn_prev.angle_calc_method : null, row_cnn_next ? row_cnn_next.angle_calc_method : null);
				}

				// НадоДобавитьСпецификациюСоединения
				if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0)){

					len_angle = {
						angle: 0,
						alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
						alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90
						// art1: true TODO: учесть art-1-2
					};

					if(b.cnn.cnn_type == $p.enm.cnn_types.ТОбразное || b.cnn.cnn_type == $p.enm.cnn_types.НезамкнутыйКонтур){
						// соединение Т-образное или незамкнутый контур: для них арт 1-2 не используется

						// для него надо рассчитать еще и с другой стороны
						if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm)){
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
					cnn_add_spec(b.cnn, elm, len_angle);

				}


				// спецификация вставки
				inset_spec(elm);

				// если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
				cnn_spec_nearest(elm);

				// если у профиля есть доборы, добавляем их спецификации
				elm.addls.forEach(base_spec_profile);

			}

			/**
			 * Спецификация заполнения
			 * @param glass {Filling}
			 */
			function base_spec_glass(glass) {

				var curr, prev, next, len_angle, _row, row_cnn;

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
						origin: cnn_row(_row.elm, curr.profile.elm)

					};

					// добавляем спецификацию соединения рёбер заполнения с профилем
					cnn_add_spec(curr.cnn, curr.profile, len_angle);

				}

				// добавляем спецификацию вставки в заполнение
				inset_spec(glass);

				// TODO: для всех раскладок заполнения
			}

			/**
			 * Спецификация вставки элемента
			 * @param elm {BuilderElement}
			 */
			function inset_spec(elm, inset, len_angl) {

				var _row = elm._row;
				
				if(!inset)
					inset = elm.inset;

				inset_filter_spec(inset, elm, true, len_angl).forEach(function (row_ins_spec) {

					var row_spec;

					// добавляем строку спецификации, если профиль или не про шагам
					if((row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру
						&& row_ins_spec.count_calc_method != $p.enm.count_calculating_ways.ПоШагам) ||
						$p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1)
						row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);

					if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !row_ins_spec.formula.empty()){
						try{
							row_spec = new_spec_row(row_spec, elm, row_ins_spec, null, inset);
							if(eval(row_ins_spec.formula) === false)
								return;
						}catch(err){
							$p.record_log(err);
						}

					}else if($p.enm.elm_types.profile_items.indexOf(_row.elm_type) != -1 ||
								row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ДляЭлемента){
						// Для вставок в профиль способ расчета количество не учитывается
						calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);

					}else{

						if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади){
							row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz)/1000;
							row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz)/1000;
							row_spec.s = _row.s;

						}else if(row_ins_spec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру){
							var row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
							elm.perimeter.forEach(function (rib) {
								row_prm._row._mixin(rib);
								if(inset_check(row_ins_spec, row_prm, true)){
									row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
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
									row_spec = new_spec_row(null, elm, row_ins_spec, null, inset);
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
			 * Основная cпецификация по соединениям и вставкам таблицы координат
			 * @param scheme {Scheme}
			 */
			function base_spec(scheme) {

				// сбрасываем структуру обработанных соединений
				added_cnn_spec = {};

				// для всех контуров изделия
				scheme.getItems({class: $p.Editor.Contour}).forEach(function (contour) {

					// для всех профилей контура
					contour.profiles.forEach(base_spec_profile);

					// для всех заполнений контура
					contour.glasses(false, true).forEach(base_spec_glass);

					// фурнитура контура
					furn_spec(contour);

				});

			}

			/**
			 * Пересчет спецификации при записи изделия
			 */
			$p.eve.attachEvent("save_coordinates", function (scheme, attr) {

				//console.time("base_spec");
				//console.profile();


				// ссылки для быстрого доступа к свойствам обхекта продукции
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
				base_spec(scheme);

				// сворачиваем
				spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");


				//console.timeEnd("base_spec");
				//console.profileEnd();


				// информируем мир об окончании расчета координат
				$p.eve.callEvent("coordinates_calculated", [scheme, attr]);

				
				// рассчитываем цены

				// типы цен получаем заранее, т.к. они пригодятся при расчете корректировки спецификации
				var prm = {
					calc_order_row: ox.calc_order_row,
					spec: spec
				};
				if(prm.calc_order_row){

					$p.pricing.price_type(prm);

					// производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
					$p.spec_building.specification_adjustment(prm);

					// рассчитываем плановую себестоимость
					$p.pricing.calc_first_cost(prm);

					// рассчитываем стоимость продажи
					$p.pricing.calc_amount(prm);
				}



				// информируем мир о завершении пересчета
				if(attr.snapshot){
					$p.eve.callEvent("scheme_snapshot", [scheme, attr]);
				}
				
				// информируем мир о записи продукции
				if(attr.save){

					// сохраняем картинку вместе с изделием
					ox.save(undefined, undefined, {
							svg: {
								"content_type": "image/svg+xml",
								"data": new Blob([scheme.get_svg()], {type: "image/svg+xml"})
							}
						})
						.then(function () {
							$p.msg.show_msg("Спецификация рассчитана");
							delete scheme.data._saving;
							$p.eve.callEvent("characteristic_saved", [scheme, attr]);
						});

				}else{
					delete scheme.data._saving;
				}

			});

		}

	}
);


/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации 
 *
 * Created 26.05.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  glob_spec_building
 */

$p.modifiers.push(
	function($p){

		$p.spec_building = new SpecBuilding();

		function SpecBuilding(){

			/**
			 * Рассчитывает спецификацию в строке документа Расчет
			 * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
			 * @param prm
			 * @param cancel
			 */
			this.calc_row_spec = function (prm, cancel) {

			};

			/**
			 * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
			 * @param attr
			 */
			this.specification_adjustment = function (attr) {

				var adel = [];
				
				// удаляем строки, добавленные предыдущими корректировками
				attr.spec.find_rows({ch: {in: [-1,-2]}}, function (row) {
					adel.push(row);
				});
				adel.forEach(function (row) {
					attr.spec.del(row, true);	
				});
				
				
			}

		}

	}
);



$p.injected_data._mixin({"create_tables.sql":"USE md;\nCREATE TABLE IF NOT EXISTS `areg_invoice_payments` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `trans` CHAR, `partner` CHAR, `organization` CHAR, `period` Date, `recorder` CHAR, `amount_mutual` FLOAT, `amount_operation` FLOAT);\nCREATE TABLE IF NOT EXISTS `areg_planning` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `phase` CHAR, `date` Date, `work_center` CHAR, `obj` CHAR, `elm` INT, `specimen` INT, `period` Date, `recorder` CHAR, `quantity` FLOAT, `cost` FLOAT);\nCREATE TABLE IF NOT EXISTS `ireg_currency_courses` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `currency` CHAR, `period` Date, `course` FLOAT, `multiplicity` INT);\nCREATE TABLE IF NOT EXISTS `ireg_margin_coefficients` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `price_group` CHAR, `parameters_key` CHAR, `condition_formula` CHAR, `marginality` FLOAT, `marginality_min` FLOAT, `marginality_internal` FLOAT, `price_type_first_cost` CHAR, `price_type_sale` CHAR, `price_type_internal` CHAR, `formula` CHAR, `sale_formula` CHAR, `internal_formula` CHAR, `external_formula` CHAR, `extra_charge_external` FLOAT, `discount_external` FLOAT, `discount` FLOAT, `note` CHAR);\nCREATE TABLE IF NOT EXISTS `ireg_$log` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `date` INT, `sequence` INT, `class` CHAR, `note` CHAR, `obj` CHAR);\nCREATE TABLE IF NOT EXISTS `ireg_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `invoice` CHAR, `state` CHAR, `event_date` Date, `СуммаОплаты` FLOAT, `ПроцентОплаты` INT, `СуммаОтгрузки` FLOAT, `ПроцентОтгрузки` INT, `СуммаДолга` FLOAT, `ПроцентДолга` INT, `ЕстьРасхожденияОрдерНакладная` BOOLEAN);\nCREATE TABLE IF NOT EXISTS `doc_planning_event` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `phase` CHAR, `work_center` CHAR, `recipient` CHAR, `calc_order` CHAR, `note` CHAR, `ts_executors` JSON, `ts_planning` JSON);\nCREATE TABLE IF NOT EXISTS `doc_nom_prices_setup` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `note` CHAR, `responsible` CHAR, `price_type` CHAR, `ts_goods` JSON);\nCREATE TABLE IF NOT EXISTS `doc_selling` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON);\nCREATE TABLE IF NOT EXISTS `doc_credit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON);\nCREATE TABLE IF NOT EXISTS `doc_debit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `partner_T` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON);\nCREATE TABLE IF NOT EXISTS `doc_credit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON);\nCREATE TABLE IF NOT EXISTS `doc_debit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON);\nCREATE TABLE IF NOT EXISTS `doc_work_centers_performance` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `start_date` Date, `expiration_date` Date, `responsible` CHAR, `note` CHAR, `ts_planning` JSON);\nCREATE TABLE IF NOT EXISTS `doc_credit_card_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON);\nCREATE TABLE IF NOT EXISTS `doc_calc_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `number_internal` CHAR, `project` CHAR, `organization` CHAR, `partner` CHAR, `client_of_dealer` CHAR, `contract` CHAR, `organizational_unit` CHAR, `note` CHAR, `manager` CHAR, `leading_manager` CHAR, `department` CHAR, `doc_amount` FLOAT, `amount_operation` FLOAT, `amount_internal` FLOAT, `accessory_characteristic` CHAR, `sys_profile` CHAR, `sys_furn` CHAR, `phone` CHAR, `delivery_area` CHAR, `shipping_address` CHAR, `coordinates` CHAR, `address_fields` CHAR, `difficult` BOOLEAN, `vat_consider` BOOLEAN, `vat_included` BOOLEAN, `settlements_course` FLOAT, `settlements_multiplicity` INT, `obj_delivery_state` CHAR, `ts_production` JSON, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_planning` JSON);\nCREATE TABLE IF NOT EXISTS `doc_work_centers_task` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `work_center` CHAR, `recipient` CHAR, `responsible` CHAR, `note` CHAR, `ts_planning` JSON);\nCREATE TABLE IF NOT EXISTS `doc_purchase` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON);\nCREATE TABLE IF NOT EXISTS `doc_registers_correction` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `original_doc_type` CHAR, `responsible` CHAR, `note` CHAR, `ts_registers_table` JSON);\nCREATE TABLE IF NOT EXISTS `cat_planning_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `work_shift` CHAR, `department` CHAR, `work_center` CHAR, `work_center_kind` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_insert_bind` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `inset` CHAR, `inset_T` CHAR, `zone` INT, `predefined_name` CHAR, `ts_production` JSON);\nCREATE TABLE IF NOT EXISTS `cat_nom_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `vat_rate` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_characteristics` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `x` FLOAT, `y` FLOAT, `z` FLOAT, `s` FLOAT, `clr` CHAR, `weight` FLOAT, `condition_products` FLOAT, `calc_order` CHAR, `product` INT, `leading_product` CHAR, `leading_elm` INT, `note` CHAR, `partner` CHAR, `sys` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_constructions` JSON, `ts_coordinates` JSON, `ts_cnn_elmnts` JSON, `ts_params` JSON, `ts_glass_specification` JSON, `ts_extra_fields` JSON, `ts_glasses` JSON, `ts_mosquito` JSON, `ts_specification` JSON);\nCREATE TABLE IF NOT EXISTS `cat_individuals` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `birth_date` Date, `inn` CHAR, `imns_code` CHAR, `note` CHAR, `pfr_number` CHAR, `sex` CHAR, `birth_place` CHAR, `ОсновноеИзображение` CHAR, `Фамилия` CHAR, `Имя` CHAR, `Отчество` CHAR, `ФамилияРП` CHAR, `ИмяРП` CHAR, `ОтчествоРП` CHAR, `ОснованиеРП` CHAR, `ДолжностьРП` CHAR, `Должность` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON);\nCREATE TABLE IF NOT EXISTS `cat_nom_prices_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `price_currency` CHAR, `discount_percent` FLOAT, `vat_price_included` BOOLEAN, `rounding_order` CHAR, `rounding_in_a_big_way` BOOLEAN, `note` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_cash_flow_articles` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_stores` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `note` CHAR, `department` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_projects` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `start` Date, `finish` Date, `launch` Date, `readiness` Date, `finished` BOOLEAN, `responsible` CHAR, `note` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_users` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `invalid` BOOLEAN, `department` CHAR, `individual_person` CHAR, `note` CHAR, `ancillary` BOOLEAN, `user_ib_uid` CHAR, `user_fresh_uid` CHAR, `id` CHAR, `predefined_name` CHAR, `ts_extra_fields` JSON, `ts_contact_information` JSON);\nCREATE TABLE IF NOT EXISTS `cat_divisions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `main_project` CHAR, `sorting` INT, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_color_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `for_pricing_only` CHAR, `for_pricing_only_T` CHAR, `predefined_name` CHAR, `ts_price_groups` JSON, `ts_clr_conformity` JSON);\nCREATE TABLE IF NOT EXISTS `cat_clrs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ral` CHAR, `machine_tools_clr` CHAR, `clr_str` CHAR, `clr_out` CHAR, `clr_in` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_furns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `flap_weight_max` INT, `left_right` BOOLEAN, `is_set` BOOLEAN, `is_sliding` BOOLEAN, `furn_set` CHAR, `side_count` INT, `handle_side` INT, `open_type` CHAR, `name_short` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_open_tunes` JSON, `ts_specification` JSON, `ts_selection_params` JSON, `ts_specification_restrictions` JSON, `ts_colors` JSON);\nCREATE TABLE IF NOT EXISTS `cat_cnns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `amin` INT, `amax` INT, `sd1` CHAR, `sd2` CHAR, `sz` FLOAT, `cnn_type` CHAR, `ahmin` INT, `ahmax` INT, `lmin` INT, `lmax` INT, `tmin` INT, `tmax` INT, `var_layers` BOOLEAN, `for_direct_profile_only` INT, `art1vert` BOOLEAN, `art1glass` BOOLEAN, `art2glass` BOOLEAN, `predefined_name` CHAR, `ts_specification` JSON, `ts_cnn_elmnts` JSON, `ts_selection_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_delivery_areas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `country` CHAR, `region` CHAR, `city` CHAR, `latitude` FLOAT, `longitude` FLOAT, `ind` CHAR, `delivery_area` CHAR, `specify_area_by_geocoder` BOOLEAN, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_users_acl` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_acl_objs` JSON);\nCREATE TABLE IF NOT EXISTS `cat_production_params` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `default_clr` CHAR, `allow_open_cnn` BOOLEAN, `clr_group` CHAR, `is_drainage` BOOLEAN, `tmin` INT, `tmax` INT, `lay_split_type` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_elmnts` JSON, `ts_production` JSON, `ts_product_params` JSON, `ts_furn_params` JSON, `ts_colors` JSON, `ts_base_blocks` JSON);\nCREATE TABLE IF NOT EXISTS `cat_parameters_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоПараметров` INT, `predefined_name` CHAR, `ts_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_inserts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `insert_type` CHAR, `clr` CHAR, `priority` INT, `lmin` INT, `lmax` INT, `hmin` INT, `hmax` INT, `smin` FLOAT, `smax` FLOAT, `for_direct_profile_only` INT, `ahmin` INT, `ahmax` INT, `mmin` INT, `mmax` INT, `insert_glass_type` CHAR, `impost_fixation` CHAR, `shtulp_fixation` BOOLEAN, `can_rotate` BOOLEAN, `sizeb` FLOAT, `predefined_name` CHAR, `ts_specification` JSON, `ts_selection_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_organizations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `individual_legal` CHAR, `individual_entrepreneur` CHAR, `inn` CHAR, `kpp` CHAR, `main_bank_account` CHAR, `main_cashbox` CHAR, `certificate_series_number` CHAR, `certificate_date_issue` Date, `certificate_authority_name` CHAR, `certificate_authority_code` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_nom` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `name_full` CHAR, `base_unit` CHAR, `storage_unit` CHAR, `nom_kind` CHAR, `nom_group` CHAR, `vat_rate` CHAR, `note` CHAR, `price_group` CHAR, `elm_type` CHAR, `len` FLOAT, `width` FLOAT, `thickness` FLOAT, `sizefurn` FLOAT, `sizefaltz` FLOAT, `density` FLOAT, `volume` FLOAT, `arc_elongation` FLOAT, `loss_factor` FLOAT, `rounding_quantity` INT, `clr` CHAR, `cutting_optimization_type` CHAR, `saw_width` FLOAT, `double_cut` INT, `overmeasure` FLOAT, `coloration_area` FLOAT, `pricing` CHAR, `visualization` CHAR, `complete_list_sorting` INT, `is_accessory` BOOLEAN, `is_procedure` BOOLEAN, `is_service` BOOLEAN, `is_pieces` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_partners` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `main_bank_account` CHAR, `note` CHAR, `kpp` CHAR, `okpo` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_contract` CHAR, `identification_document` CHAR, `buyer_main_manager` CHAR, `is_buyer` BOOLEAN, `is_supplier` BOOLEAN, `primary_contact` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON);\nCREATE TABLE IF NOT EXISTS `cat_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `international_short` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_cashboxes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `funds_currency` CHAR, `department` CHAR, `current_account` CHAR, `predefined_name` CHAR, `owner` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_meta_ids` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `full_moniker` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_property_values` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `qualifier_unit` CHAR, `heft` FLOAT, `volume` FLOAT, `coefficient` FLOAT, `rounding_threshold` INT, `ПредупреждатьОНецелыхМестах` BOOLEAN, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_contracts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `settlements_currency` CHAR, `mutual_settlements` CHAR, `contract_kind` CHAR, `date` Date, `check_days_without_pay` BOOLEAN, `allowable_debts_amount` FLOAT, `allowable_debts_days` INT, `note` CHAR, `check_debts_amount` BOOLEAN, `check_debts_days` BOOLEAN, `number_doc` CHAR, `organization` CHAR, `main_cash_flow_article` CHAR, `main_project` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `prepayment_percent` FLOAT, `validity` Date, `vat_included` BOOLEAN, `price_type` CHAR, `vat_consider` BOOLEAN, `days_without_pay` INT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_nom_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom_type` CHAR, `НаборСвойствНоменклатура` CHAR, `НаборСвойствХарактеристика` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_contact_information_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ВидПоляДругое` CHAR, `Используется` BOOLEAN, `mandatory_fields` BOOLEAN, `type` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_currencies` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `extra_charge` FLOAT, `main_currency` CHAR, `parameters_russian_recipe` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_elm_visualization` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `svg_path` CHAR, `note` CHAR, `attributes` CHAR, `rotate` INT, `offset` INT, `side` CHAR, `elm_side` INT, `cx` INT, `cy` INT, `angle_hor` INT, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_formulas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `formula` CHAR, `leading_formula` CHAR, `condition_formula` BOOLEAN, `definition` CHAR, `template` CHAR, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON);\nCREATE TABLE IF NOT EXISTS `cat_countries` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `alpha2` CHAR, `alpha3` CHAR, `predefined_name` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_work_centers` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `work_center_kind` CHAR, `КоэффициентВремениРаботы` FLOAT, `МаксимальнаяЗагрузка` FLOAT, `calendar` CHAR, `definition` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_destinations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоРеквизитов` CHAR, `КоличествоСведений` CHAR, `Используется` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON, `ts_extra_properties` JSON);\nCREATE TABLE IF NOT EXISTS `cat_banks_qualifier` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `correspondent_account` CHAR, `city` CHAR, `address` CHAR, `phone_numbers` CHAR, `activity_ceased` BOOLEAN, `swift` CHAR, `inn` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_property_values_hierarchy` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_work_center_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `department` CHAR, `predefined_name` CHAR, `parent` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_organization_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `bank` CHAR, `bank_bic` CHAR, `funds_currency` CHAR, `account_number` CHAR, `settlements_bank` CHAR, `settlements_bank_bic` CHAR, `department` CHAR, `predefined_name` CHAR, `owner` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_partner_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `account_number` CHAR, `bank` CHAR, `settlements_bank` CHAR, `correspondent_text` CHAR, `appointments_text` CHAR, `funds_currency` CHAR, `bank_bic` CHAR, `bank_name` CHAR, `bank_correspondent_account` CHAR, `bank_city` CHAR, `bank_address` CHAR, `bank_phone_numbers` CHAR, `settlements_bank_bic` CHAR, `settlements_bank_correspondent_account` CHAR, `settlements_bank_city` CHAR, `predefined_name` CHAR, `owner` CHAR, `owner_T` CHAR);\nCREATE TABLE IF NOT EXISTS `cat_params_links` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `master` CHAR, `slave` CHAR, `zone` INT, `predefined_name` CHAR, `ts_values` JSON);\nCREATE TABLE IF NOT EXISTS `cch_properties` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `shown` BOOLEAN, `extra_values_owner` CHAR, `available` BOOLEAN, `caption` CHAR, `mandatory` BOOLEAN, `note` CHAR, `destination` CHAR, `tooltip` CHAR, `is_extra_property` BOOLEAN, `list` BOOLEAN, `predefined_name` CHAR, `type` JSON, `ts_extra_fields_dependencies` JSON);\nCREATE TABLE IF NOT EXISTS `cch_predefined_elmnts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `value` CHAR, `value_T` CHAR, `definition` CHAR, `synonym` CHAR, `list` INT, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `type` CHAR, `ts_elmnts` JSON);\nCREATE TABLE IF NOT EXISTS `enm_individual_legal` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_costs_character` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_nom_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_contact_information_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_vat_rates` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_gender` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_elm_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_cnn_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_sz_line_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_open_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_cutting_optimization_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_lay_split_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_inserts_glass_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_inserts_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_cnn_sides` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_specification_installation_methods` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_angle_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_count_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_simple_complex_all` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_positions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_orientations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_plan_limit` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_open_directions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_color_groups_destination` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_planning_detailing` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_text_aligns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_contraction_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_offset_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_transfer_operations_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_impost_mount_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_inset_attrs_options` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_caching_type` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_obj_delivery_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_costs_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_contract_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_mutual_contract_settlements` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\nCREATE TABLE IF NOT EXISTS `enm_accumulation_record_type` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN);\n","toolbar_calc_order_production.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_grp_add\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку заказа\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_add_builder\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt; Изделие построителя\" />\r\n        <item type=\"button\" id=\"btn_add_product\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Продукцию или услугу\" />\r\n        <item type=\"button\" id=\"btn_add_material\" text=\"&lt;i class='fa fa-cube fa-fw'&gt;&lt;/i&gt; Материал\" />\r\n    </item>\r\n\r\n    <item type=\"button\" id=\"btn_edit\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt;\" title=\"Редактировать изделие построителя\" />\r\n    <item type=\"button\" id=\"btn_spec\" text=\"&lt;i class='fa fa-table fa-fw'&gt;&lt;/i&gt;\" title=\"Открыть спецификацию изделия\" />\r\n    <item type=\"button\" id=\"btn_delete\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить строку заказа\" />\r\n\r\n    <item type=\"button\" id=\"btn_discount\" text=\"&lt;i class='fa fa-percent fa-fw'&gt;&lt;/i&gt;\" title=\"Скидки по типам строк заказа\"/>\r\n\r\n    <item id=\"sep1\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_calc_order_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_save_close\" text=\"&lt;i class='fa fa-caret-square-o-down fa-fw'&gt;&lt;/i&gt;\" title=\"Записать и закрыть\"/>\r\n    <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Записать\"/>\r\n    <item type=\"button\" id=\"btn_sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отправить заказ\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\" />\r\n\r\n    <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_message\" enabled=\"false\" text=\"Сообщение\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\r\n        <item type=\"button\"     id=\"btn_retrieve\"    text=\"&lt;i class='fa fa-undo fa-fw'&gt;&lt;/i&gt; Отозвать\" title=\"Отозвать заказ\" />\r\n        <item type=\"separator\"  id=\"sep_export\" />\r\n        <item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить из файла\" />\r\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить в файл\" />\r\n    </item>\r\n\r\n    <item id=\"sep_close_1\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\r\n    <item id=\"sep_close_2\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_product_list.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"btn_ok\"   type=\"button\"   text=\"&lt;b&gt;Рассчитать и закрыть&lt;/b&gt;\" title=\"Рассчитать, записать и закрыть\"  />\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item id=\"btn_xls\"  type=\"button\"\ttext=\"Загрузить из XLS\" title=\"Загрузить список продукции из файла xls\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"buttonSelect\" id=\"bs_print\" enabled=\"false\" text=\"\" title=\"\" openAll=\"true\">\r\n    </item>\r\n\r\n</toolbar>","tree_events.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.stores\" text=\"Склады\" />\r\n    <item id=\"cat.divisions\" select=\"1\" text=\"Подразделения\" />\r\n\r\n</tree>\r\n","tree_filteres.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"draft\" text=\"&lt;i class='fa fa-pencil fa-fw'&gt;&lt;/i&gt; Черновики\" select=\"1\" tooltip=\"Предварительные расчеты\"/>\r\n    <item id=\"sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt; Отправлено\" tooltip=\"Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в 'черновики')\" />\r\n    <item id=\"confirmed\" text=\"&lt;i class='fa fa-thumbs-o-up fa-fw'&gt;&lt;/i&gt; Согласовано\" tooltip=\"Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером\" />\r\n    <item id=\"declined\" text=\"&lt;i class='fa fa-thumbs-o-down fa-fw'&gt;&lt;/i&gt; Отклонено\" tooltip=\"Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации\" />\r\n    <item id=\"execution\" text=\"&lt;i class='fa fa-money fa-fw'&gt;&lt;/i&gt; Долги\" tooltip=\"Оплата, отгрузка\" />\r\n    <item id=\"plan\" text=\"&lt;i class='fa fa-calendar-check-o fa-fw'&gt;&lt;/i&gt; План\" tooltip=\"Согласованы, но еще не запущены в работу\" />\r\n    <item id=\"underway\" text=\"&lt;i class='fa fa-industry fa-fw'&gt;&lt;/i&gt; В работе\" tooltip=\"Включены в задания на производство, но еще не изготовлены\" />\r\n    <item id=\"manufactured\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Изготовлено\" tooltip=\"Изготовлены, но еще не отгружены\" />\r\n    <item id=\"executed\" text=\"&lt;i class='fa fa-truck fa-fw'&gt;&lt;/i&gt; Исполнено\" tooltip=\"Отгружены клиенту\" />\r\n    <item id=\"template\" text=\"&lt;i class='fa fa-puzzle-piece fa-fw'&gt;&lt;/i&gt; Шаблоны\" tooltip=\"Типовые блоки\" />\r\n    <item id=\"zarchive\" text=\"&lt;i class='fa fa-archive fa-fw'&gt;&lt;/i&gt; Архив\" tooltip=\"Старые заказы\" />\r\n    <item id=\"all\" text=\"&lt;i class='fa fa-expand fa-fw'&gt;&lt;/i&gt; Все\" tooltip=\"Отключить фильтрацию\" />\r\n</tree>\r\n","tree_industry.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.nom_kinds\" text=\"Виды номенклатуры\" />\r\n    <item id=\"cat.nom_groups\" text=\"Номенклатурные группы\" />\r\n    <item id=\"cat.nom\" text=\"Номенклатура\" />\r\n    <item id=\"cat.production_params\" text=\"Параметры продукции\" select=\"1\" tooltip=\"системы профилей\"/>\r\n    <item id=\"cat.cnns\" text=\"Соединения\" />\r\n    <item id=\"cat.inserts\" text=\"Вставки\" />\r\n    <item id=\"cat.furns\" text=\"Фурнитура\" />\r\n    <item id=\"cat.clrs\" text=\"Цвета\" />\r\n    <item id=\"cat.color_price_groups\" text=\"Цвето-ценовые группы\" />\r\n    <item id=\"cch.properties\" text=\"Дополнительные реквизиты\" />\r\n    <item id=\"cat.params_links\" text=\"Связи параметров\" />\r\n    <item id=\"cat.elm_visualization\" text=\"Визуализация элементов\" />\r\n    <item id=\"cat.insert_bind\" text=\"Привязки вставок\" />\r\n    <item id=\"cat.formulas\" text=\"Формулы\" />\r\n</tree>\r\n","tree_price.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.users\" text=\"Пользователи\" />\r\n    <item id=\"cat.individuals\" text=\"Физические лица\" />\r\n    <item id=\"cat.organizations\" text=\"Организации\" />\r\n    <item id=\"cat.partners\" text=\"Контрагенты\" />\r\n    <item id=\"cat.contracts\" text=\"Договоры\" />\r\n    <item id=\"cat.currencies\" text=\"Валюты\" />\r\n    <item id=\"ireg.currency_courses\" select=\"1\" text=\"Курсы валют\" />\r\n    <item id=\"cat.nom_prices_types\" text=\"Виды цен\" />\r\n    <item id=\"cat.price_groups\" text=\"Ценовые группы\" />\r\n    <item id=\"ireg.margin_coefficients\" text=\"Маржинальные коэффициенты\" />\r\n    <item id=\"doc.nom_prices_setup\" text=\"Установка цен номенклатуры\" />\r\n    <item id=\"cch.predefined_elmnts\" text=\"Константы и списки\" />\r\n\r\n</tree>\r\n","view_about.html":"<div class=\"md_column1300\">\r\n    <h1><i class=\"fa fa-info-circle\"></i> Окнософт: Заказ дилера</h1>\r\n    <p>Заказ дилера - это веб-приложение с открытым исходным кодом, разработанное компанией <a href=\"http://www.oknosoft.ru/\" target=\"_blank\">Окнософт</a> на базе фреймворка <a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\">Metadata.js</a><br />\r\n        Исходный код и документация доступны на <a href=\"https://github.com/oknosoft/windowbuilder\" target=\"_blank\">GitHub <i class=\"fa fa-github-alt\"></i></a>.<br />\r\n    </p>\r\n\r\n    <h3>Назначение и возможности</h3>\r\n    <ul>\r\n        <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>\r\n        <li>Экстремальная поддержка нестандартных изделий (многоугольники, сложные перегибы профиля)</li>\r\n        <li>Расчет спецификации и координат технологических операций</li>\r\n        <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>\r\n        <li>Формирование печатных форм для заказчика и производства</li>\r\n        <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена с сервером при возобновлении соединения</li>\r\n    </ul>\r\n\r\n    <p>Использованы следующие библиотеки и инструменты:</p>\r\n\r\n    <h3>Серверная часть</h3>\r\n    <ul>\r\n        <li><a href=\"http://couchdb.apache.org/\" target=\"_blank\">CouchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>\r\n        <li><a href=\"http://nginx.org/ru/\" target=\"_blank\">nginx</a>, высокопроизводительный HTTP-сервер</li>\r\n        <li><a href=\"http://1c-dn.com/1c_enterprise/\" target=\"_blank\">1c_enterprise</a>, ORM сервер 1С:Предприятие</li>\r\n    </ul>\r\n\r\n    <h3>Управление данными в памяти браузера</h3>\r\n    <ul>\r\n        <li><a href=\"https://pouchdb.com/\" target=\"_blank\">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>\r\n        <li><a href=\"https://github.com/agershun/alasql\" target=\"_blank\">alaSQL</a>, база данных SQL для браузера и Node.js с поддержкой как традиционных реляционных таблиц, так и вложенных JSON данных (NoSQL)</li>\r\n        <li><a href=\"https://github.com/SheetJS/js-xlsx\" target=\"_blank\">xlsx</a>, библиотека для чтения и записи XLSX / XLSM / XLSB / XLS / ODS в браузере</li>\r\n    </ul>\r\n\r\n    <h3>UI библиотеки и компоненты интерфейса</h3>\r\n    <ul>\r\n        <li><a href=\"http://paperjs.org/\" target=\"_blank\">paper.js</a>, фреймворк векторной графики для HTML5 Canvas</li>\r\n        <li><a href=\"http://dhtmlx.com/\" target=\"_blank\">dhtmlx</a>, кроссбраузерная библиотека javascript для построения современных веб и мобильных приложений</li>\r\n        <li><a href=\"https://github.com/Diokuz/baron\" target=\"_blank\">baron</a>, компонент управления полосами прокрутки</li>\r\n        <li><a href=\"https://jquery.com/\" target=\"_blank\">jQuery</a>, популярная JavaScript библиотека селекторов и событий DOM</li>\r\n        <li><a href=\"https://github.com/eligrey/FileSaver.js\" target=\"_blank\">filesaver.js</a>, HTML5 реализация метода saveAs</li>\r\n    </ul>\r\n\r\n    <h3>Графика</h3>\r\n    <ul>\r\n        <li><a href=\"https://fortawesome.github.io/Font-Awesome/\" target=\"_blank\">fontawesome</a>, набор иконок и стилей CSS</li>\r\n    </ul>\r\n\r\n    <p>&nbsp;</p>\r\n    <h2><i class=\"fa fa-question-circle\"></i> Вопросы</h2>\r\n    <p>Если обнаружили ошибку, пожалуйста,\r\n        <a href=\"https://github.com/oknosoft/windowbuilder/issues/new\" target=\"_blank\">зарегистрируйте вопрос в GitHub</a> или\r\n        <a href=\"http://www.oknosoft.ru/metadata/#page-118\" target=\"_blank\">свяжитесь с разработчиком</a> напрямую<br /></p>\r\n    <p>&nbsp;</p>\r\n\r\n</div>","view_blank.html":"<!DOCTYPE html>\r\n<html lang=\"ru\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"/>\r\n    <title>Документ</title>\r\n    <style>\r\n\r\n        html {\r\n            width: 100%;\r\n            height: 100%;\r\n            margin: 0;\r\n            padding: 0;\r\n            overflow: auto;\r\n\r\n        }\r\n        body {\r\n            width: 210mm;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n            overflow: hidden;\r\n            color: rgb(48, 57, 66);\r\n            font-family: Arial, sans-serif;\r\n            font-size: 11pt;\r\n            text-rendering: optimizeLegibility;\r\n        }\r\n\r\n        /* Таблица */\r\n        table.border {\r\n            border-collapse: collapse; border: 1px solid;\r\n        }\r\n        table.border > tbody > tr > td,\r\n        table.border > tr > td,\r\n        table.border th{\r\n            border: 1px solid;\r\n        }\r\n        .noborder{\r\n            border: none;\r\n        }\r\n\r\n        /* Многоуровневый список */\r\n        ol {\r\n            counter-reset: li;\r\n            list-style: none;\r\n            padding: 0;\r\n        }\r\n        li {\r\n            margin-top: 8px;\r\n        }\r\n        li:before {\r\n            counter-increment: li;\r\n            content: counters(li,\".\") \".\";\r\n            padding-right: 8px;\r\n        }\r\n        li.flex {\r\n            display: flex;\r\n            text-align: left;\r\n            list-style-position: outside;\r\n            font-weight: normal;\r\n        }\r\n\r\n        .container {\r\n            width: 100%;\r\n            position: relative;\r\n        }\r\n\r\n        .margin-top-20 {\r\n            margin-top: 20px;\r\n        }\r\n\r\n        .column-50-percent {\r\n            width: 48%;\r\n            min-width: 40%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .column-30-percent {\r\n            width: 31%;\r\n            min-width: 30%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .block-left {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        .block-center {\r\n            display: block;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n        }\r\n\r\n        .block-right {\r\n            display: block;\r\n            float: right;\r\n        }\r\n\r\n        .list-center {\r\n            text-align: center;\r\n            list-style-position: inside;\r\n            font-weight: bold;\r\n        }\r\n\r\n        .clear-both {\r\n            clear: both;\r\n        }\r\n\r\n        .small {\r\n            font-size: small;\r\n        }\r\n\r\n        .text-center {\r\n            text-align: center;\r\n        }\r\n\r\n        .text-justify {\r\n            text-align: justify;\r\n        }\r\n\r\n        .text-right {\r\n            text-align: right;\r\n        }\r\n\r\n        .muted-color {\r\n            color: #636773;\r\n        }\r\n\r\n        .accent-color {\r\n            color: #f30000;\r\n        }\r\n\r\n        .note {\r\n            background: #eaf3f8;\r\n            color: #2980b9;\r\n            font-style: italic;\r\n            padding: 12px 20px;\r\n        }\r\n\r\n        .note:before {\r\n            content: 'Замечание: ';\r\n            font-weight: 500;\r\n        }\r\n        *, *:before, *:after {\r\n            box-sizing: inherit;\r\n        }\r\n\r\n    </style>\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>","view_settings.html":"<div class=\"md_column1300\">\r\n\r\n    <div class=\"md_column320\" name=\"form1\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n    <div class=\"md_column320\" name=\"form2\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n</div>"});
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
				// bar.buttons.auth.title = $p.msg.logged_in + $p.wsql.pouch.authorized;
				// bar.buttons.auth.innerHTML = '<i class="fa fa-sign-out md-fa-lg"></i>';
				bar.buttons.auth.title = "Отключиться от сервера";
				bar.buttons.auth.innerHTML = '<span class="span_user">' + $p.wsql.pouch.authorized + '</span>';
				bar.buttons.sync.title = "Синхронизация выполняется...";
				bar.buttons.sync.innerHTML = '<i class="fa fa-refresh md-fa-lg"></i>';
			}else{
				bar.buttons.auth.title = "Войти на сервер и включить синхронизацию данных";
				bar.buttons.auth.innerHTML = '&nbsp;<i class="fa fa-sign-in md-fa-lg"></i><span class="span_user">Вход...</span>';
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
		return bar;
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
		this.cell.style.padding = "2px 4px";
		this.setCValue(val ? $p.iface.scale_svg(val, 120, 0) : "нет эскиза");
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
		stack = [], reload_id,
		area_hidden = $p.wsql.get_user_param("svgs_area_hidden", "boolean"),
		area_text = area.querySelector(".dhx_cell_statusbar_text");

	if(area_text && area_text.innerHTML == "<div></div>")
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

		minmax.style.backgroundPositionX = area_hidden ? "-32px" : "0px";
	}

	function draw_svgs(res){

		$p.iface.clear_svgs(pics_area);

		res.forEach(function (svg) {
			if(!svg || svg.substr(0, 1) != "<")
				return;
			var svg_elm = document.createElement("div");
			pics_area.appendChild(svg_elm);
			svg_elm.style.float = "left";
			svg_elm.style.marginLeft = "4px";
			svg_elm.innerHTML = $p.iface.scale_svg(svg, 88, 22);
		});

		if(!res.length){
			// возможно, стоит показать надпись, что нет эскизов
		}
	}

	this.reload = function (ref) {

		if(ref){
			stack.push(ref);
			ref = null;
		}

		if(reload_id)
			clearTimeout(reload_id);

		if(!area_hidden)
			reload_id = setTimeout(function(){
				if(stack.length){

					// Получаем табчасть заказа
					var _obj = stack.pop();

					if (typeof _obj == "string")
						_obj = $p.doc.calc_order.pouch_db.get(manager.class_name + "|" + _obj);
					else
						_obj = Promise.resolve({production: _obj.production._obj});

					_obj.then(function (res) {
							// Для продукций заказа получаем вложения
							var aatt = [];
							res.production.forEach(function (row) {
								if(!$p.is_empty_guid(row.characteristic))
									aatt.push($p.cat.characteristics.get_attachment(row.characteristic, "svg").catch(function (err) {

									}));
							});
							_obj = null;
							return Promise.all(aatt);
						})
						.then(function (res) {
							// Извлекаем из блоба svg-текст эскизов
							var aatt = [];
							res.forEach(function (row) {
								if(row instanceof Blob && row.size)
									aatt.push($p.blob_as_text(row));
							});
							return Promise.all(aatt);
						})
						.then(draw_svgs)
						.catch($p.record_log);

					stack.length = 0;
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

	prm.__define({

		// разделитель для localStorage
		local_storage_prefix: {
			value: "wb_"
		},

		// скин по умолчанию
		skin: {
			value: "dhx_terrace"
		},

		// фильтр для репликации с CouchDB
		pouch_filter: {
			value: {},
			writable: false
		},

		// гостевые пользователи для демо-режима
		guests: {
			value: [{
				username: "Дилер",
				password: "1gNjzYQKBlcD"
			}]
		},

		// если понадобится обратиться к 1С, будем использовать irest
		irest_enabled: {
			value: true
		},

		// расположение rest-сервиса 1c по умолчанию
		rest_path: {
			value: "/a/zd/%1/odata/standard.odata/"
		},

		// не шевелить hash url при открытии подчиненных форм
		keep_hash: {
			value: true
		},

		// используем геокодер
		use_ip_geo: {
			value: true
		}
		
	});

	// фильтр для репликации с CouchDB
	prm.pouch_filter.__define({
		doc: {
			value: "auth/by_partner",
			writable: false
		}
	});
	
	// по умолчанию, обращаемся к зоне 1
	prm.zone = 1;

	// объявляем номер демо-зоны
	prm.zone_demo = 1;

	// расположение couchdb
	prm.couch_path = "/couchdb/wb_";
	//prm.couchdb = "http://192.168.9.136:5984/wb_";

	// логин гостевого пользователя couchdb
	prm.guest_name = "guest";

	// пароль гостевого пользователя couchdb
	prm.guest_pwd = "meta";
	
	// разрешаем сохранение пароля
	prm.enable_save_pwd = true;
	

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

	$p.iface.btns_nav = function (wrapper) {
		return $p.iface.btn_auth_sync.bind(new $p.iface.OTooolBar({
			wrapper: wrapper,
			class_name: 'md_otbnav',
			width: '260px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
				{name: 'sep_0', text: '', float: 'right'},
				{name: 'sync', text: '', float: 'right'},
				{name: 'auth', text: '', width: '80px', float: 'right'}

			], onclick: function (name) {
				$p.iface.main.cells(name).setActive(true);
				return false;
			}
		}))
	};

	// подписываемся на событие готовности метаданных, после которого рисуем интерфейс
	$p.eve.attachEvent("meta", function () {

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

	// Подписываемся на событие окончания загрузки предопределённых элементов
	var predefined_elmnts_inited = $p.eve.attachEvent("predefined_elmnts_inited", function () {

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

		$p.eve.detachEvent(predefined_elmnts_inited);

	});

	// Подписываемся на событие окончания загрузки локальных данных
	var pouch_load_data_error = $p.eve.attachEvent("pouch_load_data_error", function (err) {

		// если это первый запуск, показываем диалог авторизации
		if(err.db_name && err.hasOwnProperty("doc_count") && err.doc_count < 10 && navigator.onLine){

			// если это демо (zone === zone_demo), устанавливаем логин и пароль
			if($p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && !$p.wsql.get_user_param("user_name")){
				$p.wsql.set_user_param("enable_save_pwd", true);
				$p.wsql.set_user_param("user_name", $p.job_prm.guests[0].username);
				$p.wsql.set_user_param("user_pwd", $p.job_prm.guests[0].password);

				setTimeout(function () {
					$p.iface.frm_auth({
						modal_dialog: true,
						try_auto: true
					});
				}, 100);

			}else{
				$p.iface.frm_auth({
					modal_dialog: true,
					try_auto: $p.wsql.get_user_param("zone") == $p.job_prm.zone_demo && $p.wsql.get_user_param("enable_save_pwd")
				});
			}

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

		this.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));
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

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

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
			
			t.carousel.cells("list").setActive();
			cell.setText({text: "Заказы"});

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			var _cell = t.carousel.cells("doc");

			_cell.setActive();

			if(!_cell.ref || _cell.ref != ref)

				$p.doc.calc_order.form_obj(_cell, {
						ref: ref,
						bind_pwnd: true,
						on_close: function () {
							setTimeout(function () {
								$p.iface.set_hash(undefined, "", "list");
							});
						},
						set_text: function (text) {
							if(t.carousel.getActiveCell() == _cell)
								cell.setText({text: "<b>" + text + "</b>"});
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
						setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
					});

			else if(t.doc && t.doc.wnd){
				setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
			}

		}

		function show_builder(ref){

			t.carousel.cells("builder").setActive();

			// отвязываем ошибки открытия построителя от текущего контекста
			setTimeout(t.editor.open.bind(t.editor, ref));

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


				} else if(hprm.obj == "cat.characteristics" && !$p.is_empty_guid(hprm.ref)) {

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

			if(t.init_event_id){
				$p.eve.detachEvent(t.init_event_id);
				delete t.init_event_id;
			}

			// создадим экземпляр графического редактора
			var _cell = t.carousel.cells("builder"),
				obj = $p.job_prm.parse_url().obj || "doc.calc_order";

			_cell._on_close = function (confirmed) {

				if(t.editor.project.ox._modified && !confirmed){
					dhtmlx.confirm({
						title: $p.msg.bld_title,
						text: $p.msg.modified_close,
						cancel: $p.msg.cancel,
						callback: function(btn) {
							if(btn){
								// закрыть изменённый без сохранения - значит прочитать его из pouchdb
								t.editor.project.data._loading = true;
								if(t.editor.project.ox.is_new()){
									// если характеристика не была записана - удаляем её вместе со строкой заказа
									var _row = t.editor.project.ox.calc_order_row;
									if(_row)
										_row._owner.del(_row);
									t.editor.project.ox.unload();
									this._on_close(true);
								}else{
									t.editor.project.ox.load()
										.then(this._on_close.bind(this, true));
								}
							}								
						}.bind(this)
					});
					return;
				}

				t.editor.project.data._loading = true;
				t.editor.project.data._opened = false;
				t.editor.project.ox = null;

				var _cell = t.carousel.cells("doc");
				
				$p.eve.callEvent("editor_closed", [t.editor]);

				if(!$p.is_empty_guid(_cell.ref))
					$p.iface.set_hash("doc.calc_order", _cell.ref, "doc");

				else{
					
					var hprm = $p.job_prm.parse_url(),
						obj = $p.cat.characteristics.get(hprm.ref, false, true);
					
					if(obj && !obj.calc_order.empty())
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}.bind(_cell);

			// создаём экземпляр графического редактора
			t.editor = new $p.Editor(_cell, {
				set_text: function (text) {
					cell.setText({text: "<b>" + text + "</b>"});
				}
			});

			setTimeout(function () {
				$p.iface.set_hash(obj);
			});
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

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
		t.carousel.conf.anim_step = 200;
		t.carousel.conf.anim_slide = "left 0.1s";


		// Подписываемся на событие окончания загрузки локальных данных
		// и рисум список заказов и заготовку графического редактора
		if($p.job_prm.builder)
			setTimeout(create_elmnts);
		else
			t.init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", create_elmnts);


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

		var t = this, deferred_id;

		function hash_route(hprm) {

			if(hprm.view == "settings"){

				return false;
			}

		}

		function deferred_init(){

			// отписываемся от события
			if(deferred_id)
				$p.eve.detachEvent(deferred_id);

			// разблокируем
			if(t.form2.isLocked())
				t.form2.unlock();

			// устанавливаем значения сокрытия колонок цен
			if($p.wsql.get_user_param("hide_price_dealer")){
				t.form2.checkItem("hide_price", "hide_price_dealer");

			}else if($p.wsql.get_user_param("hide_price_manufacturer")){
				t.form2.checkItem("hide_price", "hide_price_manufacturer");

			}else{
				t.form2.checkItem("hide_price", "hide_price_no");

			}

			if($p.current_acl.partners_uids.length){


				var partner = $p.cat.partners.get($p.current_acl.partners_uids[0]),
					prm = {calc_order_row: {
						nom: $p.cat.nom.get(),
						_owner: {_owner: {partner: partner}}
					}};

				$p.pricing.price_type(prm);

				t.form2.setItemValue("surcharge_internal", prm.price_type.extra_charge_external);


			}else{
				t.form2.disableItem("surcharge_internal");
				t.form2.disableItem("discount_percent_internal");
			}

			// подключаем обработчик изменения значений в форме
			t.form2.attachEvent("onChange", function (name, value, state){
				
				if(name == "hide_price"){
					if(value == "hide_price_dealer"){
						$p.wsql.set_user_param("hide_price_dealer", true);
						$p.wsql.set_user_param("hide_price_manufacturer", "");

					}else if(value == "hide_price_manufacturer"){
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", true);

					}else{
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", "");
					}
				}
			});

		}
		
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		// разделы настроек
		t.tabs = cell.attachTabbar({
			arrows_mode:    "auto",
			tabs: [
				{id: "const", text: '<i class="fa fa-key"></i> Общее', active: true},
				{id: "industry", text: '<i class="fa fa-industry"></i> Технология'},
				{id: "price", text: '<i class="fa fa-money"></i> Учет'},
				{id: "events", text: '<i class="fa fa-calendar-check-o"></i> Планирование'}
			]
		});

		t.tabs.attachEvent("onSelect", function(id){
			if(t[id] && t[id].tree && t[id].tree.getSelectedItemId()){
				t[id].tree.callEvent("onSelect", [t[id].tree.getSelectedItemId()]);
			}
			return true;
		});

		// закладка основных настроек
		t.tabs.cells("const").attachHTMLString($p.injected_data['view_settings.html']);
		t.const = t.tabs.cells("const").cell.querySelector(".dhx_cell_cont_tabbar");
		t.const.style.overflow = "auto";

		// форма общих настроек
		t.form1 = t.const.querySelector("[name=form1]");
		t.form1 = new dhtmlXForm(t.form1.firstChild, [

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
				{type: "button", name: "save", value: "<i class='fa fa-floppy-o fa-lg'></i>", tooltip: "Применить настройки и перезагрузить программу"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 20, name: "reset", value: "<i class='fa fa-refresh fa-lg'></i>", tooltip: "Стереть справочники и перезаполнить данными сервера"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 60, name: "upload", value: "<i class='fa fa-cloud-upload fa-lg'></i>", tooltip: "Выгрузить изменения справочников на сервер"}
			]  }

			]
		);
		t.form1.cont.style.fontSize = "100%";

		// инициализация свойств

		t.form1.checkItem("device_type", $p.job_prm.device_type);

		["zone", "couch_path", "couch_suffix"].forEach(function (prm) {
			if(prm == "zone")
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm));
			else
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm) || $p.job_prm[prm]);
		});

		t.form1.attachEvent("onChange", function (name, value, state){
			$p.wsql.set_user_param(name, name == "enable_save_pwd" ? state || "" : value);
		});

		t.form1.attachEvent("onButtonClick", function(name){

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
				
			}else if(name == "upload"){
				$p.pricing.cut_upload();
			}
		});

		// форма личных настроек
		t.form2 = t.const.querySelector("[name=form2]");
		t.form2 = new dhtmlXForm(t.form2.firstChild, [
			{ type:"settings", labelWidth:220, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Колонки цен", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_hide_price", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-eye fa-fw"></i> Показывать все цены', value:"hide_price_no"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-user-secret fa-fw"></i> Скрыть цены дилера', value:"hide_price_dealer"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-university fa-fw"></i> Скрыть цены завода', value:"hide_price_manufacturer"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Настройка видимости колонок в документе 'Расчет' и графическом построителе", width: 320}},

			{type: "label", labelWidth:320, label: "Наценки и скидки", className: "label_options"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"surcharge_internal", label:"Наценка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"discount_percent_internal", label:"Скидка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Значения наценки и скидки по умолчанию, которые дилер предоставляет своим (конечным) покупателям", width: 320}}

		]);
		t.form2.cont.style.fontSize = "100%";

		// если основной контрагент уже в озу, устанавливаем умолчания. иначе, setReadonly и подписываемся на событие окончания загрузки
		if(!$p.cat.partners.alatable.length || !$p.current_acl){
			t.form2.lock();
			deferred_id = $p.eve.attachEvent("predefined_elmnts_inited", deferred_init);
		}else {
			deferred_init();
		}



		// закладка технологии
		t.industry = {
			layout: t.tabs.cells("industry").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево технологических справочников
		t.industry.tree = t.industry.layout.cells("a").attachTree();
		t.industry.tree.enableTreeImages(false);
		t.industry.tree.parse($p.injected_data["tree_industry.xml"]);
		t.industry.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.industry.layout.cells("b"), {hide_header: true});
		});

		// закладка ценообразования
		t.price = {
			layout: t.tabs.cells("price").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников ценообразования
		t.price.tree = t.price.layout.cells("a").attachTree();
		t.price.tree.enableTreeImages(false);
		t.price.tree.parse($p.injected_data["tree_price.xml"]);
		t.price.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.price.layout.cells("b"), {hide_header: true});
		});

		// закладка планирования
		t.events = {
			layout: t.tabs.cells("events").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников планирования
		t.events.tree = t.events.layout.cells("a").attachTree();
		t.events.tree.enableTreeImages(false);
		t.events.tree.parse($p.injected_data["tree_events.xml"]);
		t.events.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.events.layout.cells("b"), {hide_header: true});
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
