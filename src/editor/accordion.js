/**
 * Элементы управления в аккордеоне редактора
 * Created 16.02.2016
 * @author Evgeniy Malyarov
 * @module editor
 * @submodule editor_accordion
 */

"use strict";


function EditorAccordion(_editor, cell_acc) {

	cell_acc.attachHTMLString($p.injected_data['tip_editor_right.html']);

	const cont = cell_acc.cell.querySelector(".editor_accordion"),

		/**
		 * ### Панель инструментов элемента
		 * @property tb_elm
		 * @for EditorAccordion
		 * @type {OTooolBar}
		 * @final
		 * @private
		 */
		tb_elm = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_elm]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'aling_bottom',
			buttons: [
				{name: 'left', css: 'tb_align_left', tooltip: $p.msg.align_node_left, float: 'left'},
				{name: 'bottom', css: 'tb_align_bottom', tooltip: $p.msg.align_node_bottom, float: 'left'},
				{name: 'top', css: 'tb_align_top', tooltip: $p.msg.align_node_top, float: 'left'},
				{name: 'right', css: 'tb_align_right', tooltip: $p.msg.align_node_right, float: 'left'},
				{name: 'all', text: '<i class="fa fa-arrows-alt fa-fw"></i>', tooltip: $p.msg.align_all, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'additional_inserts', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_elm, float: 'left'},
        {name: 'arc', css: 'tb_cursor-arc-r', tooltip: $p.msg.bld_arc, float: 'left'},
				{name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: $p.msg.del_elm, float: 'right', paddingRight: '20px'}
			],
			image_path: "dist/imgs/",
			onclick: function (name) {
        switch (name) {
          case 'arc':
            _editor.profile_radius()
            break;

          case 'additional_inserts':
            _editor.additional_inserts('elm')
            break;

          default:
            _editor.profile_align(name)
        }
			}
		}),

		/**
		 * панель инструментов свойств изделия
		 */
		tb_right = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_layers]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'right',
			image_path: 'dist/imgs/',
			buttons: [
				{name: 'new_layer', text: '<i class="fa fa-file-o fa-fw"></i>', tooltip: 'Добавить рамный контур', float: 'left'
					//,sub: {
					//	buttons: [
					//		{name: 'square', img: 'square.png', float: 'left'},
					//		{name: 'triangle1', img: 'triangle1.png', float: 'right'},
					//		{name: 'triangle2', img: 'triangle2.png', float: 'left'},
					//		{name: 'triangle3', img: 'triangle3.png', float: 'right'},
					//		{name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
					//		{name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
					//		{name: 'circle',    img: 'circle.png', float: 'left'},
					//		{name: 'arc1',      img: 'arc1.png', float: 'right'},
					//		{name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
					//		{name: 'trapeze2',  img: 'trapeze2.png', float: 'right'},
					//		{name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
					//		{name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
					//		{name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
					//		{name: 'trapeze6',  img: 'trapeze6.png', float: 'right'}]
					//}
				},
				{name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: $p.msg.bld_new_stv, float: 'left'},
        {name: 'sep_0', text: '', float: 'left'},
        {name: 'inserts_to_product', text: '<i class="fa fa-tags fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_product, float: 'left'},
        {name: 'inserts_to_contour', text: '<i class="fa fa-tag fa-fw"></i>', tooltip: $p.msg.additional_inserts + ' ' + $p.msg.to_contour, float: 'left'},
				{name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'}

			], onclick: function (name) {

				switch(name) {

					case 'new_stv':
						var fillings = _editor.project.getItems({class: Filling, selected: true});
						if(fillings.length)
							fillings[0].create_leaf();
						else
							$p.msg.show_msg({
								type: "alert-warning",
								text: $p.msg.bld_new_stv_no_filling,
								title: $p.msg.bld_new_stv
							});
						break;

					case 'drop_layer':
						tree_layers.drop_layer();
						break;

					case 'new_layer':

						// создаём пустой новый слой
						new Contour( {parent: undefined});

						// оповещаем мир о новых слоях
						Object.getNotifier(_editor.project._noti).notify({
							type: 'rows',
							tabular: "constructions"
						});
						break;

          case 'inserts_to_product':
            // дополнительные вставки в изделие
            _editor.additional_inserts();
            break;

          case 'inserts_to_contour':
            // дополнительные вставки в контур
            _editor.additional_inserts('contour');
            break;

					default:
						$p.msg.show_msg(name);
						break;
				}

				return false;
			}
		}),

    /**
     * панель инструментов над парамтрами изделия
     */
    tb_bottom = new $p.iface.OTooolBar({
      wrapper: cont.querySelector("[name=header_props]"),
      width: '100%',
      height: '28px',
      bottom: '2px',
      left: '4px',
      class_name: "",
      name: 'bottom',
      image_path: 'dist/imgs/',
      buttons: [
        {name: 'refill', text: '<i class="fa fa-retweet fa-fw"></i>', tooltip: 'Обновить параметры', float: 'right', paddingRight: '20px'}

      ], onclick: function (name) {

        switch(name) {

          case 'refill':
            _editor.project._dp.sys.refill_prm(_editor.project.ox);
            props.reload();
            break;

          default:
            $p.msg.show_msg(name);
            break;
        }

        return false;
      }
    }),

		/**
		 * слои в аккордионе
		 */
		tree_layers = new function SchemeLayers() {

			var tree = new dhtmlXTreeView({
				parent: cont.querySelector("[name=content_layers]"),
				checkboxes: true,
				multiselect: false
			});

			function layer_text(layer, bounds){
				if(!bounds)
					bounds = layer.bounds;
				return (layer.parent ? "Створка №" : "Рама №") + layer.cnstr +
					(bounds ? " " + bounds.width.toFixed() + "х" + bounds.height.toFixed() : "");
			}

			function load_layer(layer){

				tree.addItem(
					layer.cnstr,
					layer_text(layer),
					layer.parent ? layer.parent.cnstr : 0);


				layer.children.forEach(function (l) {
					if(l instanceof Contour)
						load_layer(l);

				});

			}

			function observer(changes){

				var synced;

				changes.forEach(function(change){
					if ("constructions" == change.tabular){

						synced = true;

						// добавляем слои изделия
						tree.clearAll();
						_editor.project.contours.forEach(function (l) {
							load_layer(l);
							tree.checkItem(l.cnstr);
							tree.openItem(l.cnstr);

						});

						// служебный слой размеров
						tree.addItem("sizes", "Размерные линии", 0);

						// служебный слой визуализации
						tree.addItem("visualization", "Визуализация доп. элементов", 0);

						// служебный слой текстовых комментариев
						tree.addItem("text", "Комментарии", 0);

					}
				});
			}


			this.drop_layer = function () {
				var cnstr = tree.getSelectedId(), l;
				if(cnstr){
					l = _editor.project.getItem({cnstr: Number(cnstr)});
				}else if(l = _editor.project.activeLayer){
					cnstr = l.cnstr;
				}
				if(cnstr && l){
					tree.deleteItem(cnstr);
					cnstr = l.parent ? l.parent.cnstr : 0;
					l.remove();
					setTimeout(function () {
						_editor.project.zoom_fit();
						if(cnstr)
							tree.selectItem(cnstr);
					}, 100);
				}
			};

			// начинаем следить за объектом
			this.attache = function () {
				Object.observe(_editor.project._noti, observer, ["rows"]);
			};

			this.unload = function () {
				Object.unobserve(_editor.project._noti, observer);
			};

			// гасим-включаем слой по чекбоксу
			tree.attachEvent("onCheck", function(id, state){
				var l,
					pid = tree.getParentId(id),
					sub = tree.getSubItems(id);

				if(pid && state && !tree.isItemChecked(pid)){
					if(l = _editor.project.getItem({cnstr: Number(pid)}))
						l.visible = true;
					tree.checkItem(pid);
				}

				if(l = _editor.project.getItem({cnstr: Number(id)}))
					l.visible = !!state;

				if(typeof sub == "string")
					sub = sub.split(",");
				sub.forEach(function (id) {
					state ? tree.checkItem(id) : tree.uncheckItem(id);
					if(l = _editor.project.getItem({cnstr: Number(id)}))
						l.visible = !!state;
				});

				if(pid && state && !tree.isItemChecked(pid))
					tree.checkItem(pid);

				_editor.project.register_update();

			});

			// делаем выделенный слой активным
			tree.attachEvent("onSelect", function(id, mode){
				if(!mode){
          return;
        }
				var contour = _editor.project.getItem({cnstr: Number(id)});
				if(contour){
					if(contour.project.activeLayer != contour){
            contour.activate(true);
          }
					cont.querySelector("[name=header_stv]").innerHTML = layer_text(contour);
				}
			});

			$p.eve.attachEvent("layer_activated", function (contour) {
				if(contour && contour.cnstr && contour.cnstr != tree.getSelectedId()){
				  if(tree.items[contour.cnstr]){
            tree.selectItem(contour.cnstr);
            cont.querySelector("[name=header_stv]").innerHTML = layer_text(contour);
          }
				}
			});

			// начинаем следить за изменениями размеров при перерисовке контуров
			$p.eve.attachEvent("contour_redrawed", function (contour, bounds) {

				const text = layer_text(contour, bounds);

				tree.setItemText(contour.cnstr, text);

				if(contour.project.activeLayer == contour){
          cont.querySelector("[name=header_stv]").innerHTML = text;
        }

			});

		},

		/**
		 * свойства изделия в аккордионе
		 */
		props = new (function SchemeProps(layout) {

			var _obj,
				_grid,
				_reflect_id;

			function reflect_changes() {
				_obj.len = _editor.project.bounds.width.round(0);
				_obj.height = _editor.project.bounds.height.round(0);
				_obj.s = _editor.project.area;
			}

			this.__define({

				attache: {
					value: function (obj) {

						_obj = obj;
						obj = null;

						// корректируем метаданные поля выбора цвета
						$p.cat.clrs.selection_exclude_service($p.dp.buyers_order.metadata("clr"), _obj);

						if(_grid && _grid.destructor)
							_grid.destructor();

						var is_dialer = !$p.current_acl.role_available("СогласованиеРасчетовЗаказов") && !$p.current_acl.role_available("РедактированиеСкидок"),
							oxml = {
								"Свойства": ["sys","clr",
								{id: "len", path: "o.len", synonym: "Ширина, мм", type: "ro"},
								{id: "height", path: "o.height", synonym: "Высота, мм", type: "ro"},
								{id: "s", path: "o.s", synonym: "Площадь, м²", type: "ro"}
							]
							};

						if($p.wsql.get_user_param("hide_price_dealer")){
							oxml["Строка заказа"] = [
								"quantity",
								{id: "price", path: "o.price", synonym: "Цена", type: "ro"},
								{id: "discount_percent", path: "o.discount_percent", synonym: "Скидка %", type: is_dialer ? "ro" : "calck"},
								{id: "amount", path: "o.amount", synonym: "Сумма", type: "ro"},
								"note"
							];
						}else{
							oxml["Строка заказа"] = [
								"quantity",
								{id: "price_internal", path: "o.price_internal", synonym: "Цена дилера", type: "ro"},
								{id: "discount_percent_internal", path: "o.discount_percent_internal", synonym: "Скидка дил %", type: "calck"},
								{id: "amount_internal", path: "o.amount_internal", synonym: "Сумма дилера", type: "ro"},
								{id: "price", path: "o.price", synonym: "Цена пост", type: "ro"},
								{id: "discount_percent", path: "o.discount_percent", synonym: "Скидка пост %", type: is_dialer ? "ro" : "calck"},
								{id: "amount", path: "o.amount", synonym: "Сумма пост", type: "ro"},
								"note"
							];
						}

						_grid = layout.cells("a").attachHeadFields({
							obj: _obj,
							oxml: oxml,
							ts: "extra_fields",
							ts_title: "Свойства",
							selection: {
							  cnstr: 0,
                inset: $p.utils.blank.guid,
                hide: {not: true}
							}
						});

						// при готовности снапшота, обновляем суммы и цены
						_on_snapshot = $p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
							if(scheme == _editor.project && !attr.clipboard){
								["price_internal","amount_internal","price","amount"].forEach(function (fld) {
									_obj[fld] = scheme.data._calc_order_row[fld];
								});
							}
						});
					}
				},

				unload: {
					value: function () {
						layout.unload();
						_obj = null;
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				},

        reload: {
				  value: function () {
            _grid.reload();
          }
        }

			});

			// начинаем следить за изменениями размеров при перерисовке контуров
			$p.eve.attachEvent("contour_redrawed", function () {
				if(_obj){
					if(_reflect_id)
						clearTimeout(_reflect_id);
					_reflect_id = setTimeout(reflect_changes, 100);
				}
			});


		})(new dhtmlXLayoutObject({
			parent:     cont.querySelector("[name=content_props]"),
			pattern:    "1C",
			offsets: {
				top:    0,
				right:  0,
				bottom: 0,
				left:   0
			},
			cells: [
				{
					id:             "a",
					header:         false,
					height:         330
				}
			]
		})),

		/**
		 * свойства створки в аккордионе
		 */
		stv = new (function StvProps(layout) {

			var t = this, _grid, _evts = [];

			this.__define({

				attache: {
					value: function (obj) {

						if(!obj || !obj.cnstr || (_grid && _grid._obj === obj))
							return;

						var attr = {
							obj: obj,
							oxml: {
								"Фурнитура": ["furn", "clr_furn", "direction", "h_ruch"],
								"Параметры": []
							},
							ts: "params",
							ts_title: "Параметры",
							selection: {
							  cnstr: obj.cnstr || -9999,
                inset: $p.utils.blank.guid,
                hide: {not: true}
							}
						};

						if(!_grid){
              _grid = layout.cells("a").attachHeadFields(attr);
            }else{
              _grid.attach(attr);
            }

						if(!obj.parent){
							var rids = _grid.getAllRowIds();
							if(rids)
								_grid.closeItem(rids.split(",")[0]);
						}

						setTimeout(t.set_sizes, 200);
					}
				},

				set_sizes: {

					value: function (do_reload) {
						if(do_reload)
							_grid.reload();
						layout.base.style.height = (Math.max(_grid.rowsBuffer.length, 10) + 1) * 22 + "px";
						layout.setSizes();
						_grid.objBox.style.width = "100%";
					}
				},

				unload: {
					value: function () {
						_evts.forEach(function (eid) {
							$p.eve.detachEvent(eid);
						});
						layout.unload();
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				}

			});

			_evts.push($p.eve.attachEvent("layer_activated", this.attache));
			_evts.push($p.eve.attachEvent("furn_changed", this.set_sizes));

		})(
      new dhtmlXLayoutObject({
        parent: cont.querySelector("[name=content_stv]"),
        pattern: "1C",
        offsets: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        },
        cells: [
          {
            id: "a",
            header: false,
            height: 200
          }
        ]
      })

      // new dhtmlXTabBar({
      //
      //   parent: cont.querySelector("[name=content_stv]"),
      //   close_button: false,           // boolean, render closing button on tabs, optional
      //   arrows_mode: "auto",          // mode of showing tabs arrows (auto, always)
      //
      //   tabs: [
      //     {
      //       id: "a",
      //       text: "Свойства"
      //     },
      //     {
      //       id: "b",
      //       text: "Вставки"
      //     }
      //   ]
      // })
    );


	this.unload = function () {
		tb_elm.unload();
		tb_right.unload();
		tree_layers.unload();
		props.unload();
		stv.unload();
	};

	this.attache = function (obj) {
		tree_layers.attache();
		props.attache(obj);
	};

	this.resize_canvas = function () {
		var scroller = $(cont, '.scroller').baron();
		scroller.update();
		this.elm.setSizes();
		props.layout.setSizes();
		stv.layout.setSizes();
	};

	this.elm = new dhtmlXLayoutObject({
		parent:     cont.querySelector("[name=content_elm]"),
		pattern:    "1C",
		offsets: {
			top:    0,
			right:  0,
			bottom: 0,
			left:   0
		},
		cells: [
			{
				id:             "a",
				header:         false,
				height:         200
			}
		]
	});

	this.header_stv = cont.querySelector("[name=header_stv]");
	this.header_props = cont.querySelector("[name=header_props]");

	baron({
		cssGuru: true,
		root: cont,
		scroller: '.scroller',
		bar: '.scroller__bar',
		barOnCls: 'baron'
	}).fix({
		elements: '.header__title',
		outside: 'header__title_state_fixed',
		before: 'header__title_position_top',
		after: 'header__title_position_bottom',
		clickable: true
	});

}
