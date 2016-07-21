/**
 * ### Форма выбора типового блока
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 23.12.2015
 * 
 * @module modifiers
 * @submodule cat_characteristics_form_selection_block
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
						_calc_order: $p.utils.blank.guid
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
							// 			if($p.utils.is_data_obj(o)){
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

							if(!$p.utils.is_empty_guid(this._obj.calc_order) &&
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
			if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
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
								ares.push($p.utils.blob_as_text(o.svg.data)
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