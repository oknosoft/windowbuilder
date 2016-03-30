/**
 * Элементы управления в аккордеоне редактора
 * Created 16.02.2016
 * @author Evgeniy Malyarov
 * @module editor
 * @submodule editor_accordion
 */

function EditorAccordion(_editor, cell_acc) {

	cell_acc.attachHTMLString($p.injected_data['tip_editor_right.html']);

	var _cell = cell_acc.cell,
		cont = _cell.querySelector(".editor_accordion"),

		/**
		 * панель инструментов элемента
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
				{name: 'left', img: 'align_left.png', tooltip: $p.msg.align_node_left, float: 'left'},
				{name: 'bottom', img: 'align_bottom.png', tooltip: $p.msg.align_node_bottom, float: 'left'},
				{name: 'top', img: 'align_top.png', tooltip: $p.msg.align_node_top, float: 'left'},
				{name: 'right', img: 'align_right.png', tooltip: $p.msg.align_node_right, float: 'left'},
				{name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить элемент', float: 'right', paddingRight: '20px'}
			],
			image_path: "dist/imgs/",
			onclick: function (name) {
				return _editor.profile_align(name);
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
				{name: 'standard_form', text: '<i class="fa fa-file-o fa-fw"></i>', tooltip: 'Добавить рамный контур', float: 'left'
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
				{name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: 'Добавить створку', float: 'left'},
				{name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'}

				//{name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть редактор', float: 'right', paddingRight: '20px'}

			], onclick: function (name) {

				switch(name) {

					case 'new_stv':
						var fillings = _editor.project.getItems({class: Filling, selected: true});
						if(fillings.length)
							fillings[0].create_leaf();
						break;

					case 'drop_layer':
						tree_layers.drop_layer();
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

			var tree = new dhtmlXTreeObject({
				parent: cont.querySelector("[name=content_layers]"),
				checkbox: true
			});


			function layer_text(layer, bounds){
				if(!bounds)
					bounds = layer.bounds;
				return (layer.parent ? "Створка №" : "Рама №") + layer.cnstr + " " + bounds.width.toFixed() + "х" + bounds.height.toFixed();
			}

			function load_layer(layer){

				tree.insertNewItem(
					layer.parent ? layer.parent.cnstr : 0,
					layer.cnstr,
					layer_text(layer));


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
						tree.deleteChildItems(0);
						_editor.project.layers.forEach(function (l) {
							if(l instanceof Contour){
								load_layer(l);
								tree.setSubChecked(l.cnstr, true);
							}

						});

						// служебный слой размеров
						tree.insertNewItem(0, "sizes", "Размерные линии");

						// служебный слой визуализации
						tree.insertNewItem(0, "visualization", "Визуализация доп. элементов");

						// служебный слой текстовых комментариев
						tree.insertNewItem(0, "text", "Комментарии");

					}
				});
			}


			tree.enableTreeImages(false);


			//tree.enableDragAndDrop(true, false);
			//tree.setDragHandler(function(){ return false; });
			//tree.dragger.addDragLanding(tb_bottom.cell, {
			//	_drag : function(sourceHtmlObject, dhtmlObject, targetHtmlObject){
			//		tb_bottom.buttons["delete"].style.backgroundColor="";
			//		$p.msg.show_msg({type: "alert-warning",
			//			text: sourceHtmlObject.parentObject.id,
			//			title: $p.msg.main_title});
			//	},
			//	_dragIn : function(dst, src, x, y, ev){
			//		if(tb_bottom.buttons["delete"] == ev.target || tb_bottom.buttons["delete"] == ev.target.parentElement){
			//			tb_bottom.buttons["delete"].style.backgroundColor="#fffacd";
			//			return dst;
			//		}
			//	},
			//	_dragOut : function(htmlObject){
			//		tb_bottom.buttons["delete"].style.backgroundColor="";
			//		return this;
			//	}
			//});


			this.drop_layer = function () {
				var cnstr = tree.getSelectedItemId(), l;
				if(cnstr){
					l = _editor.project.getItem({cnstr: Number(cnstr)});
				}else if(l = _editor.project.activeLayer){
					cnstr = l.cnstr;
				}
				if(cnstr && l){
					tree.deleteItem(cnstr);
					l.remove();
					setTimeout(_editor.project.zoom_fit, 100);
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
					sub = tree.getAllSubItems(id);

				if(pid && state && !tree.isItemChecked(pid)){
					if(l = _editor.project.getItem({cnstr: Number(pid)}))
						l.visible = true;
					tree.setCheck(pid, 1);
				}

				if(l = _editor.project.getItem({cnstr: Number(id)}))
					l.visible = !!state;

				if(typeof sub == "string")
					sub = sub.split(",");
				sub.forEach(function (id) {
					tree.setCheck(id, state);
					if(l = _editor.project.getItem({cnstr: Number(id)}))
						l.visible = !!state;
				});

				if(pid && state && !tree.isItemChecked(pid))
					tree.setCheck(pid, 1);

				_editor.project.register_update();

			});

			// делаем выделенный слой активным
			tree.attachEvent("onSelect", function(id){
				var l = _editor.project.getItem({cnstr: Number(id)});
				if(l)
					l.activate();
			});

			$p.eve.attachEvent("layer_activated", function (l) {
				if(l && l.cnstr && l.cnstr != tree.getSelectedItemId())
					tree.selectItem(l.cnstr);
			});

			// начинаем следить за изменениями размеров при перерисовке контуров
			$p.eve.attachEvent("contour_redrawed", function (contour, bounds) {
				tree.setItemText(contour.cnstr, layer_text(contour, bounds));
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

						if(_grid && _grid.destructor)
							_grid.destructor();

						_grid = layout.cells("a").attachHeadFields({
							obj: _obj,
							oxml: {
								"Свойства": ["sys","clr",
									{id: "len", path: "o.len", synonym: "Ширина, мм", type: "ro", txt: _obj.len},
									{id: "height", path: "o.height", synonym: "Высота, мм", type: "ro", txt: _obj.height},
									{id: "s", path: "o.s", synonym: "Площадь, м²", type: "ro", txt: _obj.s}
								],
								"Строка заказа": ["quantity",
									{id: "price_internal", path: "o.price_internal", synonym: "Цена внутр.", type: "ro", txt: _obj.price_internal},
									{id: "discount_percent_internal", path: "o.discount_percent_internal", synonym: "Скидка внутр. %", type: "ro", txt: _obj.discount_percent_internal},
									{id: "price", path: "o.price", synonym: "Цена", type: "ro", txt: _obj.price},
									"discount_percent",
									{id: "amount", path: "o.amount", synonym: "Сумма", type: "ro", txt: _obj.amount},
									"note"]

							},
							ts: "extra_fields",
							ts_title: "Свойства",
							selection: {cnstr: 0, hide: {not: true}}
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

			var _grid,
				_eve_layer_activated;

			this.__define({

				attache: {
					value: function (obj) {

						if(!obj || !obj.cnstr || (_grid && _grid._obj === obj))
							return;

						var attr = {
							obj: obj,
							oxml: {
								"Фурнитура": ["furn", "clr_furn", "direction", "h_ruch"],
								"Москитка": ["mskt", "clr_mskt"],
								"Параметры": []
							},
							ts: "params",
							ts_title: "Параметры",
							selection: {cnstr: obj.cnstr || -1, hide: {not: true}}
						};

						if(!_grid)
							_grid = layout.cells("a").attachHeadFields(attr);
						else
							_grid.attach(attr);

						setTimeout(function () {
							layout.base.style.height = (Math.max(_grid.rowsBuffer.length, 10) + 1) * 21 + "px";
							layout.setSizes();
							_grid.objBox.style.width = "100%";
						}, 200);
					}
				},

				unload: {
					value: function () {
						layout.unload();
						$p.eve.detachEvent(_eve_layer_activated);
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				}

			});

			_eve_layer_activated = $p.eve.attachEvent("layer_activated", this.attache);

		})(new dhtmlXLayoutObject({
			parent:     cont.querySelector("[name=content_stv]"),
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
		}));

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
