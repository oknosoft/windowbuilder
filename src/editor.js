/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  editor
 */

/**
 * ### Графический редактор
 * @class Editor
 * @constructor
 * @extends paper.PaperScope
 * @param pwnd {dhtmlXLayoutCell} - ячейка dhtmlx, в которой будут размещены редактор и изделия
 */
function Editor(pwnd){

	acn = $p.enm.cnn_types.acn;

	var _editor = this,

		/**
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 * @type {Undo}
		 */
		undo = new function Undo(){

			this.clear = function () {

			}
		},

		selectionBounds = null,
		selectionBoundsShape = null,
		drawSelectionBounds = 0;

	Editor.superclass.constructor.call(_editor);
	_editor.activate();

	consts.tune_paper(_editor.settings);

	_editor._pwnd = pwnd;
	_editor._layout = pwnd.attachLayout({
		pattern: "2U",
		cells: [{
			id: "a",
			text: "Изделие",
			header: false
		}, {
			id: "b",
			text: "Инструменты",
			collapsed_text: "Инструменты",
			width: pwnd.getWidth() > 1200 ? 360 : 240
		}],
		offsets: { top: 0, right: 0, bottom: 0, left: 0}
	});         // разбивка на канвас и аккордион
	_editor._wrapper = document.createElement('div');                  // контейнер канваса
	_editor._layout.cells("a").attachObject(this._wrapper);
	_editor._dxw = this._layout.pwnd;                               // указатель на dhtmlXWindows

	_editor._wrapper.oncontextmenu = function (event) {
		event.preventDefault();
		return $p.cancel_bubble(event);
	};

	//_editor._dxw.attachViewportTo(eid);
	//_editor._dxw.setSkin(dhtmlx.skin);
	_editor._acc = this._layout.cells("b").attachAccordion({           // аккордион со свойствами
		icons_path: dhtmlx.image_path,
		multi_mode: true,
		dnd:        true
	});

	_editor.toString = function(){ return $p.msg.bld_constructor; };


	/**
	 * Панель выбора инструментов рисовалки
	 * @type OTooolBar
	 */
	_editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '24px', left: '3px', name: 'left', height: '310px',
		buttons: [
			{name: 'select_elm', img: 'icon-arrow-black.png', title: $p.injected_data['select_elm.html']},
			{name: 'select_node', img: 'icon-arrow-white.png', title: $p.injected_data['select_node.html']},
			{name: 'pan', img: 'icon-hand.png', title: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
			{name: 'zoom_fit', img: 'cursor-zoom.png', title: 'Вписать в окно'},
			{name: 'pen', img: 'cursor-pen-freehand.png', title: 'Добавить профиль'},
			{name: 'lay_impost', img: 'cursor-lay-impost.png', title: 'Вставить раскладку или импосты'},
			{name: 'arc', img: 'cursor-arc-r.png', title: 'Арка {Crtl}, {Alt}, {Пробел}'},
			{name: 'ruler', img: 'ruler_ui.png', title: 'Позиционирование и сдвиг'},
			{name: 'grid', img: 'grid.png', title: 'Таблица координат'},
			{name: 'line', img: 'line.png', title: 'Произвольная линия'},
			{name: 'text', img: 'text.png', title: 'Произвольный текст'}
		], onclick: function (name) {
			return _editor.select_tool(name);
		}
	});

	/**
	 * Верхняя панель инструментов
	 * @type {OTooolBar}
	 */
	_editor.tb_top = new $p.iface.OTooolBar({wrapper: _editor._wrapper, width: '250px', height: '28px', top: '3px', left: '50px', name: 'top',
		buttons: [
			{name: 'open', img: 'open.png', title: 'Открыть изделие', float: 'left'},
			{name: 'save_close', img: 'save.png', title: 'Рассчитать, записать и закрыть', float: 'left'},
			{name: 'close', img: 'close.png', title: 'Закрыть без сохранения', float: 'left'},
			{name: 'calck', img: 'calculate.png', title: 'Рассчитать и записать данные', float: 'left'},
			{name: 'standard_form', img: 'standard_form.png', title: 'Добавить типовую форму', float: 'left',
				sub: {
					buttons: [
						{name: 'square', img: 'square.png', float: 'left'},
						{name: 'triangle1', img: 'triangle1.png', float: 'right'},
						{name: 'triangle2', img: 'triangle2.png', float: 'left'},
						{name: 'triangle3', img: 'triangle3.png', float: 'right'},
						{name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
						{name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
						{name: 'circle',    img: 'circle.png', float: 'left'},
						{name: 'arc1',      img: 'arc1.png', float: 'right'},
						{name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
						{name: 'trapeze2',  img: 'trapeze2.png', float: 'right'},
						{name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
						{name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
						{name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
						{name: 'trapeze6',  img: 'trapeze6.png', float: 'right'}]
				}
			},
			{name: 'stamp', img: 'stamp.png', title: 'Загрузить из типового блока', float: 'left'},
			{name: 'back', text: '<i class="fa fa-undo fa-lg"></i>', title: 'Шаг назад', float: 'left'},
			{name: 'rewind', text: '<i class="fa fa-repeat fa-lg"></i>', title: 'Шаг вперед', float: 'left'}


		], onclick: function (name) {
			switch(name) {
				case 'open':
					_editor.open();
					break;

				case 'save_close':
					if(_editor.project)
						_editor.project.save_coordinates(true);
					break;

				case 'calck':
					_editor.project.save_coordinates(false);
					break;

				case 'stamp':
					_editor.load_stamp();
					break;

				case 'back':
					$p.msg.show_msg(name);
					break;

				case 'rewind':
					$p.msg.show_msg(name);
					break;

				case 'square':
					$p.msg.show_msg(name);
					break;

				case 'triangle1':
					$p.msg.show_msg(name);
					break;

				case 'triangle3':
					$p.msg.show_msg(name);
					break;

				case 'triangle3':
					$p.msg.show_msg(name);
					break;

				default:
					$p.msg.show_msg(name);
					break;
			}
		}});

	/**
	 * Правая панель инструментов
	 * @type {*|OTooolBar}
	 */
	_editor.tb_right = new $p.iface.OTooolBar({wrapper: _editor._wrapper, width: '200px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'layers', img: 'layers.png', text: 'Слои', float: 'left', width: '90px',
					sub: {
						width: '190px',
						height: '90px',
						buttons: [
							{name: 'new_layer', img: 'new_layer.png', width: '182px', text: 'Добавить конструкцию'},
							{name: 'new_stv', img: 'triangle1.png', width: '182px', text: 'Добавить створку'},
							{name: 'drop_layer', img: 'trash.gif', width: '182px', text: 'Удалить слой'}
						]
					}
				},
				{name: 'elm', img: 'icon-arrow-black.png', text: 'Элементы', float: 'left', width: '90px',
					sub: {
						width: '230px',
						height: '160px',
						align: 'right',
						buttons: [
							{name: 'left', img: 'align_left.png', width: '222px', text: $p.msg.align_node_left},
							{name: 'bottom', img: 'align_bottom.png', width: '222px', text: $p.msg.align_node_bottom},
							{name: 'top', img: 'align_top.png', width: '222px', text: $p.msg.align_node_top},
							{name: 'right', img: 'align_right.png', width: '222px', text: $p.msg.align_node_right},
							{name: 'delete', img: 'trash.gif', width: '222px', text: 'Удалить элемент'}
						]
					}
				}
			], onclick: function (name) {
				if(name == 'new_layer')
					$p.msg.show_not_implemented();

				else if(name == 'drop_layer')
					_editor.tree_layers.drop_layer();

				else if(['left', 'bottom', 'top', 'right'].indexOf(name) != -1)
					_editor.profile_align(name);

				return false;
			}
		});

	/**
	 * слои в аккордионе
	 */
	_editor.tree_layers = function () {

		var wid = 'wnd_dat_' + dhx4.newId(),
			acc_cell, wnd, tree, lid;

		_editor._acc.addItem(
			wid,
			"Слои",
			true,
			"*");
		acc_cell = _editor._acc.cells(wid);

		function load_layer(layer){
			lid = (layer.parent ? "Створка №" : "Рама №") + layer.cnstr + " " + layer.bounds.width.toFixed() + "х" + layer.bounds.height.toFixed();

			tree.insertNewItem(
				layer.parent ? layer.parent.cnstr : 0,
				layer.cnstr,
				lid);


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

		tree = acc_cell.attachTree();
		tree.setImagePath(dhtmlx.image_path + 'dhxtree_web/');
		tree.setIconsPath(dhtmlx.image_path + 'dhxtree_web/');
		tree.enableCheckBoxes(true, true);
		tree.enableTreeImages(false);

		// Гасим-включаем слой по чекбоксу
		tree.attachEvent("onCheck", function(id, state){
			var l = _editor.project.getItem({cnstr: Number(id)}),
				sub = tree.getAllSubItems(id);

			if(l)
				l.visible = !!state;

			if(typeof sub == "string")
				tree.setCheck(sub, state);
			else
				sub.forEach(function (id) {
					tree.setCheck(id, state);
				});

		});

		// делаем выделенный слой активным
		tree.attachEvent("onSelect", function(id){
			var l = _editor.project.getItem({cnstr: Number(id)});
			if(l)
				l.activate();
		});

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


		return {

			drop_layer: function () {
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
			},

			attache: function () {
				// начинаем следить за объектом
				Object.observe(_editor.project._noti, observer, ["rows"]);
			},

			unload: function () {
				Object.unobserve(_editor.project._noti, observer);
			}
		}
	}();

	/**
	 * свойства в аккордионе
	 */
	_editor.props = function () {
		var wid = 'wnd_dat_' + dhx4.newId(),
			acc_cell, wnd;

		_editor._acc.addItem(
			wid,
			"Изделие",
			true,
			"*");
		acc_cell = _editor._acc.cells(wid);

		return {

			attache: function () {
				acc_cell.attachHeadFields({
					obj: _editor.project._dp,
					oxml: {
						"Свойства": ["sys", "clr", "len", "height", "s"],
						"Строка заказа": ["quantity", "price_internal", "discount_percent_internal", "discount_percent", "price", "amount"]

					},
					ts: "extra_fields",
					ts_title: "Свойства",
					selection: {cnstr: 0, hide: {not: true}}
				});
			},

			unload: function () {
				acc_cell.unload();
			}
		}
	}();

	_editor.clear_selection_bounds = function() {
		if (selectionBoundsShape)
			selectionBoundsShape.remove();
		selectionBoundsShape = null;
		selectionBounds = null;
	};

	_editor.hide_selection_bounds = function() {
		if (drawSelectionBounds > 0)
			drawSelectionBounds--;
		if (drawSelectionBounds == 0) {
			if (selectionBoundsShape)
				selectionBoundsShape.visible = false;
		}
	};

	// Returns serialized contents of selected items.
	_editor.capture_selection_state = function() {
		var originalContent = [];
		var selected = _editor.project.selectedItems;
		for (var i = 0; i < selected.length; i++) {
			var item = selected[i];
			if (item.guide) continue;
			var orig = {
				id: item.id,
				json: item.exportJSON({ asString: false }),
				selectedSegments: []
			};
			originalContent.push(orig);
		}
		return originalContent;
	};

	// Restore the state of selected items.
	_editor.restore_selection_state = function(originalContent) {
		for (var i = 0; i < originalContent.length; i++) {
			var orig = originalContent[i];
			var item = this.project.getItem({id: orig.id});
			if (!item)
				continue;
			// HACK: paper does not retain item IDs after importJSON,
			// store the ID here, and restore after deserialization.
			var id = item.id;
			item.importJSON(orig.json);
			item._id = id;
		}
	};

	/**
	 * Returns all items intersecting the rect.
	 * Note: only the item outlines are tested
	 */
	_editor.paths_intersecting_rect = function(rect) {
		var paths = [];
		var boundingRect = new paper.Path.Rectangle(rect);

		function checkPathItem(item) {
			var children = item.children;
			if (item.equals(boundingRect))
				return;
			if (!rect.intersects(item.bounds))
				return;
			if (item instanceof paper.PathItem ) {

				if(item.parent instanceof Profile){
					if(item != item.parent.generatrix)
						return;

					if (rect.contains(item.bounds)) {
						paths.push(item);
						return;
					}
					var isects = boundingRect.getIntersections(item);
					if (isects.length > 0)
						paths.push(item);
				}

			} else {
				for (var j = children.length-1; j >= 0; j--)
					checkPathItem(children[j]);
			}
		}

		for (var i = 0, l = _editor.project.layers.length; i < l; i++) {
			var layer = _editor.project.layers[i];
			checkPathItem(layer);
		}

		boundingRect.remove();

		return paths;
	};

	/**
	 * Create pixel perfect dotted rectable for drag selections
	 * @param p1
	 * @param p2
	 * @return {exporters.CompoundPath}
	 */
	_editor.drag_rect = function(p1, p2) {
		var half = new paper.Point(0.5 / _editor.view.zoom, 0.5 / _editor.view.zoom);
		var start = p1.add(half);
		var end = p2.add(half);
		var rect = new paper.CompoundPath();
		rect.moveTo(start);
		rect.lineTo(new paper.Point(start.x, end.y));
		rect.lineTo(end);
		rect.moveTo(start);
		rect.lineTo(new paper.Point(end.x, start.y));
		rect.lineTo(end);
		rect.strokeColor = 'black';
		rect.strokeWidth = 1.0 / _editor.view.zoom;
		rect.dashOffset = 0.5 / _editor.view.zoom;
		rect.dashArray = [1.0 / _editor.view.zoom, 1.0 / _editor.view.zoom];
		rect.removeOn({
			drag: true,
			up: true
		});
		rect.guide = true;
		return rect;
	};



	/**
	 * Это не настоящий инструмент, а команда вписывания в окно
	 */
	new function ZoomFit() {

		var tool = new paper.Tool();
		tool.options = {name: 'zoom_fit'};
		tool.on({
			activate: function () {
				_editor.project.zoom_fit();

				var previous = _editor.tb_left.get_selected();

				if(previous)
					return _editor.select_tool(previous.replace("left_", ""));
			}
		});

		return tool;
	};

	/**
	 * Свойства и перемещение элемента
	 */
	new ToolSelectElm();

	/**
	 * Свойства и перемещение узлов элемента
	 */
	new ToolSelectNode();

	/**
	 * Панорама и масштабирование с колёсиком и без колёсика
	 */
	new ToolPan();

	/**
	 * Манипуляции с арками (дуги правильных окружностей)
	 */
	new ToolArc();

	/**
	 * Добавление (рисование) профилей
	 */
	new ToolPen();

	/**
	 * Вставка раскладок и импостов
	 */
	new ToolLayImpost();

	/**
	 * Инструмент произвольного текста
	 */
	new ToolText();

	/**
	 * Относительное позиционирование и сдвиг
	 */
	new ToolRuler();


	this.tools[2].activate();

}
Editor._extend(paper.PaperScope);

Editor.prototype.__define({

	/**
	 * Устанавливает икну курсора для всех канвасов редактора
	 * @method canvas_cursor
	 */
	canvas_cursor: {
		value: function (name) {
			for(var p in this.projects){
				var _scheme = this.projects[p];
				for(var i=0; i<_scheme.view.element.classList.length; i++){
					var class_name = _scheme.view.element.classList[i];
					if(class_name == name)
						return;
					else if((/\bcursor-\S+/g).test(class_name))
						_scheme.view.element.classList.remove(class_name);
				}
				_scheme.view.element.classList.add(name);
			}
		}
	},

	select_tool: {
		value: function (name) {
			for(var t in this.tools){
				if(this.tools[t].options.name == name)
					return this.tools[t].activate();
			}
		}
	},

	/**
	 * ### Открывает изделие для редактирования
	 * MDI пока не реализовано. Изделие загружается в текущий проект
	 * @method open
	 * @param [ox] {String|DataObj} - ссылка или объект продукции
	 */
	open: {
		value: function (ox) {
			var _editor = this;

			if(!_editor.project){

				var _canvas = document.createElement('canvas'); // собственно, канвас
				_editor._wrapper.appendChild(_canvas);

				var _scheme = new Scheme(_canvas);

				/**
				 * Подписываемся на события изменения размеров
				 */
				if(_editor._pwnd instanceof  dhtmlXWindowsCell){

					function pwnd_resize_finish(){
						var dimension = _editor._pwnd.getDimension();
						_editor.project.resize_canvas(dimension[0], dimension[1]);
					}

					_editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

					pwnd_resize_finish();

				}else if(_editor._pwnd instanceof  dhtmlXLayoutCell){

					_editor._pwnd.layout.attachEvent("onResizeFinish", function(){
						_editor.project.resize_canvas(_editor._pwnd.getWidth(), _editor._pwnd.getHeight());
					});

					_editor._pwnd.layout.attachEvent("onPanelResizeFinish", function(names){
						_editor.project.resize_canvas(_editor._pwnd.getWidth(), _editor._pwnd.getHeight());
					});

					_editor.project.resize_canvas(_editor._pwnd.getWidth(), _editor._pwnd.getHeight());
				}

				/**
				 * Объект для реализации функций масштабирования
				 * @type {StableZoom}
				 */
				var pan_zoom = new function StableZoom(){

					function changeZoom(oldZoom, delta) {
						var factor;
						factor = 1.05;
						if (delta < 0) {
							return oldZoom * factor;
						}
						if (delta > 0) {
							return oldZoom / factor;
						}
						return oldZoom;
					}

					var panAndZoom = this;

					dhtmlxEvent(_canvas, "mousewheel", function(evt) {
						var mousePosition, newZoom, offset, viewPosition, _ref1;
						if (event.shiftKey) {
							_editor.view.center = panAndZoom.changeCenter(_editor.view.center, event.deltaX, event.deltaY, 1);
							return event.preventDefault();
						} else if (event.altKey) {
							mousePosition = new paper.Point(event.offsetX, event.offsetY);
							viewPosition = _editor.view.viewToProject(mousePosition);
							_ref1 = panAndZoom.changeZoom(_editor.view.zoom, event.deltaY, _editor.view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
							_editor.view.zoom = newZoom;
							_editor.view.center = _editor.view.center.add(offset);
							event.preventDefault();
							return _editor.view.draw();
						}
					});

					this.changeZoom = function(oldZoom, delta, c, p) {
						var a, beta, newZoom, pc;
						newZoom = changeZoom.call(this, oldZoom, delta);
						beta = oldZoom / newZoom;
						pc = p.subtract(c);
						a = p.subtract(pc.multiply(beta)).subtract(c);
						return [newZoom, a];
					};

					this.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
						var offset;
						offset = new paper.Point(deltaX, -deltaY);
						offset = offset.multiply(factor);
						return oldCenter.add(offset);
					};
				};

				_editor.tree_layers.attache();
				_editor.props.attache();
			}

			if(!ox){
				// последовательно выбираем заказ и изделие
				$p.cat.characteristics.form_selection({
					initial_value: $p.job_prm.demo.production,
					on_select: function (sval) {
						_editor.project.load(sval);
					}
				});
			}else
				_editor.project.load(ox);
		}
	},

	/**
	 * ### (Пере)заполняет изделие данными типового блока
	 * Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
	 * @method load_stamp
	 * @param confirmed {Boolean} - подавляет показ диалога подтверждения перезаполнения
	 */
	load_stamp: {
		value: function(confirmed){

			if(this.project.ox.elm_str && !confirmed){
				dhtmlx.confirm({
					title: $p.msg.bld_from_blocks_title,
					text: $p.msg.bld_from_blocks,
					cancel: "Отмена",
					callback: function(btn) {
						if(btn)
							load_stamp(true);
					}
				});
				return;
			}

			$p.cat.base_blocks.form_selection({
				o: this.project.ox,
				wnd: this.project._pwnd,
				_scheme: this.project,
				on_select: this.project.load_stamp
			}, {
				initial_value: null, // TODO: возможно, надо запоминать типовой блок в изделии?
				parent: $p.wsql.get_user_param("base_blocks_folder") ? $p.wsql.get_user_param("base_blocks_folder") : null
			});
		}
	},

	/**
	 * Returns path points which are contained in the rect
	 * @param rect
	 * @returns {Array}
	 */
	segments_in_rect: {
		value: 	function(rect) {
			var segments = [];

			function checkPathItem(item) {
				if (item._locked || !item._visible || item._guide)
					return;
				var children = item.children;
				if (!rect.intersects(item.bounds))
					return;
				if (item instanceof paper.Path) {

					if(item.parent instanceof Profile){
						if(item != item.parent.generatrix)
							return;

						for (var i = 0; i < item.segments.length; i++) {
							if (rect.contains(item.segments[i].point))
								segments.push(item.segments[i]);
						}
					}

				} else {
					for (var j = children.length-1; j >= 0; j--)
						checkPathItem(children[j]);
				}
			}

			for (var i = this.project.layers.length - 1; i >= 0; i--) {
				checkPathItem(this.project.layers[i]);
			}

			return segments;
		}
	},

	purge_selection: {
		value: 	function(){
			var selected = this.project.selectedItems, deselect = [];
			for (var i = 0; i < selected.length; i++) {
				var path = selected[i];
				if(path.parent instanceof Profile && path != path.parent.generatrix)
					deselect.push(path);
			}
			while(selected = deselect.pop())
				selected.selected = false;
		}
	},

	profile_align: {
		value: 	function(name){
			var minmax = {min: {}, max: {}},
				profile = paper.tool.profile;

			if(!profile)
				return;

			minmax.min.x = Math.min(profile.x1, profile.x2);
			minmax.min.y = Math.min(profile.y1, profile.y2);
			minmax.max.x = Math.max(profile.x1, profile.x2);
			minmax.max.y = Math.max(profile.y1, profile.y2);
			minmax.max.dx = minmax.max.x - minmax.min.x;
			minmax.max.dy = minmax.max.y - minmax.min.y;

			if(name == 'left' && minmax.max.dx < minmax.max.dy){
				if(profile.x1 - minmax.min.x > 0)
					profile.x1 = minmax.min.x;
				if(profile.x2 - minmax.min.x > 0)
					profile.x2 = minmax.min.x;

			}else if(name == 'right' && minmax.max.dx < minmax.max.dy){
				if(profile.x1 - minmax.max.x < 0)
					profile.x1 = minmax.max.x;
				if(profile.x2 - minmax.max.x < 0)
					profile.x2 = minmax.max.x;

			}else if(name == 'top' && minmax.max.dx > minmax.max.dy){
				if(profile.y1 - minmax.max.y < 0)
					profile.y1 = minmax.max.y;
				if(profile.y2 - minmax.max.y < 0)
					profile.y2 = minmax.max.y;

			}else if(name == 'bottom' && minmax.max.dx > minmax.max.dy) {
				if (profile.y1 - minmax.min.y > 0)
					profile.y1 = minmax.min.y;
				if (profile.y2 - minmax.min.y > 0)
					profile.y2 = minmax.min.y;

			}else if(name == 'delete') {
				profile.removeChildren();
				profile.remove();

			}else
				$p.msg.show_msg({type: "alert-warning",
					text: $p.msg.align_invalid_direction,
					title: $p.msg.main_title});

			this.view.update();
			return false;
		}
	},

	snap_to_angle: {
		value: function(delta, snapAngle) {
			var angle = Math.atan2(delta.y, delta.x);
			angle = Math.round(angle/snapAngle) * snapAngle;
			var dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*delta.x + diry*delta.y;
			return new paper.Point(dirx*d, diry*d);
		}
	},

	/**
	 * Деструктор
	 */
	unload: {
		value: function () {

			if(this.tool && this.tool._callbacks.deactivate.length)
				this.tool._callbacks.deactivate[0].call(this.tool);

			for(var t in this.tools){
				if(this.tools[t].remove)
					this.tools[t].remove();
				this.tools[t] = null;
			}

			this.tb_left.unload();
			this.tb_top.unload();
			this.tb_right.unload();
			this.tree_layers.unload();
			this.props.unload();
		}
	}

});


