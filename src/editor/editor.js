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
function Editor(pwnd, attr){

	acn = $p.enm.cnn_types.acn;

	var _editor = this,

		/**
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 * @type {Undo}
		 */
		undo = new UndoRedo(this),

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
			width: (pwnd.getWidth ? pwnd.getWidth() : pwnd.cell.offsetWidth) > 1200 ? 360 : 240
		}],
		offsets: { top: 28, right: 0, bottom: 0, left: 0}
	});         // разбивка на канвас и аккордион
	_editor._wrapper = document.createElement('div');                  // контейнер канваса
	_editor._layout.cells("a").attachObject(_editor._wrapper);
	_editor._dxw = _editor._layout.dhxWins;                             // указатель на dhtmlXWindows
	_editor._dxw.attachViewportTo(_editor._wrapper);

	_editor._wrapper.oncontextmenu = function (event) {
		event.preventDefault();
		return $p.cancel_bubble(event);
	};

	_editor.toString = function(){ return $p.msg.bld_constructor; };

	// аккордион со свойствами
	_editor._acc = new EditorAccordion(_editor, _editor._layout.cells("b")) ;

	/**
	 * Панель выбора инструментов рисовалки
	 * @type OTooolBar
	 */
	_editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '16px', left: '3px', name: 'left', height: '300px',
		image_path: 'dist/imgs/',
		buttons: [
			{name: 'select_node', img: 'icon-arrow-white.png', title: $p.injected_data['tip_select_node.html']},
			{name: 'pan', img: 'icon-hand.png', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
			{name: 'zoom_fit', img: 'cursor-zoom.png', tooltip: 'Вписать в окно'},
			{name: 'pen', img: 'cursor-pen-freehand.png', tooltip: 'Добавить профиль'},
			{name: 'lay_impost', img: 'cursor-lay-impost.png', tooltip: 'Вставить раскладку или импосты'},
			{name: 'arc', img: 'cursor-arc-r.png', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
			{name: 'ruler', img: 'ruler_ui.png', tooltip: 'Позиционирование и сдвиг'},
			{name: 'grid', img: 'grid.png', tooltip: 'Таблица координат'},
			{name: 'line', img: 'line.png', tooltip: 'Произвольная линия'},
			{name: 'text', img: 'text.png', tooltip: 'Произвольный текст'}
		],
		onclick: function (name) {
			return _editor.select_tool(name);
		},
		on_popup: function (popup, bdiv) {
			popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
			popup.p.style.top = (dhx4.absTop(bdiv) - 20) + "px";
			popup.p.querySelector(".dhx_popup_arrow").style.top = "20px";
		}
	});

	/**
	 * Верхняя панель инструментов
	 * @type {OTooolBar}
	 */
	_editor.tb_top = new $p.iface.OTooolBar({wrapper: _editor._layout.base, width: '100%', height: '28px', top: '0px', left: '0px', name: 'top',
		image_path: 'dist/imgs/',
		buttons: [

			{name: 'save_close', text: '&nbsp;<i class="fa fa-floppy-o fa-fw"></i>', tooltip: 'Рассчитать, записать и закрыть', float: 'left', width: '34px'},
			{name: 'calck', text: '<i class="fa fa-calculator fa-fw"></i>&nbsp;', tooltip: 'Рассчитать и записать данные', float: 'left'},

			{name: 'stamp', img: 'stamp.png', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

			{name: 'sep_0', text: '', float: 'left'},
			{name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
			{name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
			{name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

			{name: 'sep_1', text: '', float: 'left'},
			{name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
			{name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

			{name: 'sep_2', text: '', float: 'left'},
			{name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},

			{name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'}


		], onclick: function (name) {
			switch(name) {
				
				case 'save_close':
					if(_editor.project)
						_editor.project.save_coordinates({save: true, close: true});
					break;

				case 'close':
					if(_editor._pwnd._on_close)
						_editor._pwnd._on_close();
					_editor.select_tool('select_node');
					break;

				case 'calck':
					if(_editor.project)
						_editor.project.save_coordinates({save: true});
					break;

				case 'stamp':
					_editor.load_stamp();
					break;

				case 'new_stv':
					var fillings = _editor.project.getItems({class: Filling, selected: true});
					if(fillings.length)
						fillings[0].create_leaf();
					break;

				case 'back':
					undo.back();
					break;

				case 'rewind':
					undo.rewind();
					break;

				case 'open_spec':
					_editor.project.ox.form_obj()
						.then(function (w) {
							w.wnd.maximize();
						});
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
	_editor._layout.base.style.backgroundColor = "#f5f5f5";
	//_editor._layout.base.parentNode.parentNode.style.top = "0px";
	_editor.tb_top.cell.style.background = "transparent";
	_editor.tb_top.cell.style.boxShadow = "none";


	// Обработчик события после записи характеристики. Если в параметрах укзано закрыть - закрываем форму
	$p.eve.attachEvent("characteristic_saved", function (scheme, attr) {
		if(scheme == _editor.project && attr.close && _editor._pwnd._on_close)
			_editor._pwnd._on_close();
	});

	// Обработчик события при изменениях изделия
	$p.eve.attachEvent("scheme_changed", function (scheme) {
		if(scheme == _editor.project){
			if(attr.set_text && scheme._calc_order_row)
				attr.set_text(scheme.ox.prod_name(true) + " " + scheme._dp.sys.name + (scheme.ox._modified ? " *" : ""));
		}
	});


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
			var children = item.children || [];
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

	this.tools[1].activate();

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
				_canvas.style.backgroundColor = "#f9fbfa";

				var _scheme = new Scheme(_canvas);

				/**
				 * Подписываемся на события изменения размеров
				 */
				function pwnd_resize_finish(){
					_editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
					_editor._acc.resize_canvas();
				}

				_editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);

				_editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);

				if(_editor._pwnd instanceof  dhtmlXWindowsCell)
					_editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

				pwnd_resize_finish();


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
						if (evt.shiftKey || evt.ctrlKey) {
							_editor.view.center = panAndZoom.changeCenter(_editor.view.center, evt.deltaX, evt.deltaY, 1);
							return evt.preventDefault();

						}else if (evt.altKey) {
							mousePosition = new paper.Point(evt.offsetX, evt.offsetY);
							viewPosition = _editor.view.viewToProject(mousePosition);
							_ref1 = panAndZoom.changeZoom(_editor.view.zoom, evt.deltaY, _editor.view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
							_editor.view.zoom = newZoom;
							_editor.view.center = _editor.view.center.add(offset);
							evt.preventDefault();
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

				_editor._acc.attache(_editor.project._dp);
			}

			if(ox)
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

			if(this.project.ox.coordinates.count() && !confirmed){
				dhtmlx.confirm({
					title: $p.msg.bld_from_blocks_title,
					text: $p.msg.bld_from_blocks,
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn)
							this.load_stamp(true);
					}.bind(this)
				});
				return;
			}

			$p.cat.characteristics.form_selection_block(this.project._pwnd, {
				on_select: this.project.load_stamp.bind(this.project)
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
				var children = item.children || [];
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
			this._acc.unload();

		}
	}

});

/**
 * Экспортируем конструктор Editor, чтобы экземпляры построителя можно было создать снаружи
 * @property Editor
 * @for $p
 * @type {Editor}
 */
if(typeof $p !== "undefined")
	$p.Editor = Editor;

