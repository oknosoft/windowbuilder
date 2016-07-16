/**
 * ### Графический редактор
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 24.07.2015
 *
 * @module  editor
 */

/**
 * ### Графический редактор
 * - Унаследован от [paper.PaperScope](http://paperjs.org/reference/paperscope/)
 * - У редактора есть коллекция проектов ({{#crossLink "Scheme"}}изделий{{/crossLink}}). В настоящий момент, поддержано единственное активное изделие, но потенциально, имеется возможность одновременного редактирования нескольких изделий
 * - У `редактора` есть коллекция инструментов ([tools](http://paperjs.org/reference/tool/)). Часть инструментов встроена в редактор, но у конечного пользователя, есть возможность как переопределить поведение встроенных инструментов, так и подключить собственные специализированные инструменты
 *
 *
 * - **Редактор** можно рассматривать, как четрёжный стол (кульман)
 * - **Изделие** подобно листу ватмана, прикрепленному к кульману в текущий момент
 * - **Инструменты** - это карандаши и рейсшины, которые инженер использует для редактирования изделия
 *
 * @example
 *
 *     // создаём экземпляр графического редактора
 *     // передаём в конструктор указатель на ячейку _cell и дополнительные реквизиты с функцией set_text()
 *     var editor = new $p.Editor(_cell, {
 *       set_text: function (text) {
 *         cell.setText({text: "<b>" + text + "</b>"});
 *       }
 *     });
 *
 * @class Editor
 * @constructor
 * @extends paper.PaperScope
 * @param pwnd {dhtmlXCellObject} - [ячейка dhtmlx](http://docs.dhtmlx.com/cell__index.html), в которой будет размещен редактор
 * @param [attr] {Object} - дополнительные параметры инициализации редактора
 * @menuorder 10
 * @tooltip Графический редактор
 */
function Editor(pwnd, attr){
	
	var _editor = this,

		/**
		 * ### История редактирования
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 *
		 * @property undo
		 * @for Editor
		 * @type {UndoRedo}
		 * @final
		 * @private
		 */
		undo = new UndoRedo(this),

		/**
		 * ### Буфер обмена
		 * Объект для прослушивания и обработки событий буфера обмена
		 *
		 * @property clipbrd
		 * @for Editor
		 * @type {Clipbrd}
		 * @final
		 * @private
		 */
		clipbrd = new Clipbrd(this),

		/**
		 * ### Клавиатура
		 * Объект для управления редактором с клавиатуры
		 *
		 * @property keybrd
		 * @for Editor
		 * @type {Keybrd}
		 * @final
		 * @private
		 */
		keybrd = new Keybrd(this),

		selectionBounds = null,
		selectionBoundsShape = null,
		drawSelectionBounds = 0;

	Editor.superclass.constructor.call(_editor);
	_editor.activate();

	consts.tune_paper(_editor.settings);

	_editor.__define({

		/**
		 * ### Ячейка родительского окна
		 * [dhtmlXCell](http://docs.dhtmlx.com/cell__index.html), в которой размещен редактор
		 *
		 * @property _pwnd
		 * @type dhtmlXCellObject
		 * @final
		 * @private
		 */
		_pwnd: {
			get: function () {
				return pwnd;
			}
		},

		// разбивка на канвас и аккордион
		_layout: {
			value: pwnd.attachLayout({
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
			})
		},

		// контейнер канваса
		_wrapper: {
			value: document.createElement('div')
		},

		// указатель на локальный dhtmlXWindows
		_dxw: {
			get: function () {
				return this._layout.dhxWins;
			}
		},

		toString: {
			value: function(){ return $p.msg.bld_constructor; }
		}
	});


	_editor._layout.cells("a").attachObject(_editor._wrapper);
	_editor._dxw.attachViewportTo(_editor._wrapper);

	_editor._wrapper.oncontextmenu = function (event) {
		event.preventDefault();
		return $p.cancel_bubble(event);
	};


	// аккордион со свойствами
	_editor._acc = new EditorAccordion(_editor, _editor._layout.cells("b")) ;

	/**
	 * Панель выбора инструментов рисовалки
	 * @type OTooolBar
	 */
	_editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '16px', left: '3px', name: 'left', height: '300px',
		image_path: 'dist/imgs/',
		buttons: [
			{name: 'select_node', css: 'tb_icon-arrow-white', title: $p.injected_data['tip_select_node.html']},
			{name: 'pan', css: 'tb_icon-hand', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
			{name: 'zoom_fit', css: 'tb_cursor-zoom', tooltip: 'Вписать в окно'},
			{name: 'pen', css: 'tb_cursor-pen-freehand', tooltip: 'Добавить профиль'},
			{name: 'lay_impost', css: 'tb_cursor-lay-impost', tooltip: 'Вставить раскладку или импосты'},
			{name: 'arc', css: 'tb_cursor-arc-r', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
			{name: 'ruler', css: 'tb_ruler_ui', tooltip: 'Позиционирование и сдвиг'},
			{name: 'grid', css: 'tb_grid', tooltip: 'Таблица координат'},
			{name: 'line', css: 'tb_line', tooltip: 'Произвольная линия'},
			{name: 'text', css: 'tb_text', tooltip: 'Произвольный текст'}
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

			{name: 'sep_0', text: '', float: 'left'},
			{name: 'stamp', img: 'stamp.png', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

			{name: 'sep_1', text: '', float: 'left'},
			{name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
			{name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
			{name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

			{name: 'sep_2', text: '', float: 'left'},
			{name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
			{name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

			{name: 'sep_3', text: '', float: 'left'},
			{name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},

			{name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'}


		], onclick: function (name) {
			switch(name) {
				
				case 'save_close':
					if(_editor.project)
						_editor.project.save_coordinates({save: true, close: true});
					break;

				case 'close':
					if(pwnd._on_close)
						pwnd._on_close();
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

				case 'copy':
					clipbrd.copy();
					break;

				case 'paste':
					clipbrd.paste();
					break;

				case 'paste_prop':
					$p.msg.show_msg(name);
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
		if(scheme == _editor.project && attr.close && pwnd._on_close)
			setTimeout(pwnd._on_close);
	});

	// Обработчик события при изменениях изделия
	$p.eve.attachEvent("scheme_changed", function (scheme) {
		if(scheme == _editor.project){
			if(attr.set_text && scheme._calc_order_row)
				attr.set_text(scheme.ox.prod_name(true) + " " + (scheme.ox._modified ? " *" : ""));
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

		this.project.getItems({class: Contour}).forEach(checkPathItem);
		
		boundingRect.remove();

		return paths;
	};

	/**
	 * Create pixel perfect dotted rectable for drag selections
	 * @param p1
	 * @param p2
	 * @return {paper.CompoundPath}
	 */
	_editor.drag_rect = function(p1, p2) {
		var half = new paper.Point(0.5 / _editor.view.zoom, 0.5 / _editor.view.zoom),
			start = p1.add(half),
			end = p2.add(half),
			rect = new paper.CompoundPath();
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


	// Создаём инструменты

	/**
	 * ### Вписать в окно
	 * Это не настоящий инструмент, а команда вписывания в окно
	 *
	 * @class ZoomFit
	 * @constructor
	 * @menuorder 53
	 * @tooltip Масштаб в экран
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


	// Создаём экземпляр проекта Scheme
	(function () {

		var _canvas = document.createElement('canvas'); // собственно, канвас
		_editor._wrapper.appendChild(_canvas);
		_canvas.style.backgroundColor = "#f9fbfa";

		var _scheme = new Scheme(_canvas),
			pwnd_resize_finish = function(){
				_editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
				_editor._acc.resize_canvas();
			};


		/**
		 * Подписываемся на события изменения размеров
		 */
		_editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);
		_editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);
		_editor._layout.attachEvent("onCollapse", pwnd_resize_finish);
		_editor._layout.attachEvent("onExpand", pwnd_resize_finish);

		if(_editor._pwnd instanceof  dhtmlXWindowsCell)
			_editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

		pwnd_resize_finish();

		/**
		 * Подписываемся на событие смещения мыши, чтобы показать текущие координаты
		 */
		var _mousepos = document.createElement('div');
		_editor._wrapper.appendChild(_mousepos);
		_mousepos.className = "mousepos";
		_scheme.view.on('mousemove', function (event) {
			var bounds = _scheme.bounds;
			if(bounds)
				_mousepos.innerHTML = "x:" + (event.point.x - bounds.x).toFixed(0) +
					" y:" + (bounds.height + bounds.y - event.point.y).toFixed(0);
		});

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
					_ref1 = panAndZoom.changeZoom(_editor.view.zoom, evt.deltaY, _editor.view.center, viewPosition);
					newZoom = _ref1[0];
					offset = _ref1[1];
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

	})();

}
Editor._extend(paper.PaperScope);

Editor.prototype.__define({

	/**
	 * ### Устанавливает икону курсора
	 * Действие выполняется для всех канвасов редактора
	 * 
	 * @method canvas_cursor
	 * @for Editor
	 * @param name {String} - имя css класса курсора
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

	/**
	 * ### Активизирует инструмент
	 * Находит инструмент по имени в коллекции tools и выполняет его метод [Tool.activate()](http://paperjs.org/reference/tool/#activate)
	 *
	 * @method select_tool
	 * @for Editor
	 * @param name {String} - имя инструмента
	 */
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
	 * @for Editor
	 * @param [ox] {String|DataObj} - ссылка или объект продукции
	 */
	open: {
		value: function (ox) {
			if(ox)
				this.project.load(ox);
		}
	},

	/**
	 * ### (Пере)заполняет изделие данными типового блока
	 * - Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
	 * - Если текущее изделие не пустое, задаёт вопрос о перезаписи данными типового блока
	 * - В обработчик выбора типового блока передаёт метод {{#crossLink "Scheme/load_stamp:method"}}Scheme.load_stamp(){{/crossLink}} текущего изделия
	 *
	 * @for Editor
	 * @method load_stamp
	 * @param confirmed {Boolean} - подавляет показ диалога подтверждения перезаполнения
	 */
	load_stamp: {
		value: function(confirmed){

			if(!confirmed && this.project.ox.coordinates.count()){
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

			$p.cat.characteristics.form_selection_block(null, {
				on_select: this.project.load_stamp.bind(this.project)
			});
		}
	},

	/**
	 * Returns path points which are contained in the rect
	 * @method segments_in_rect
	 * @for Editor
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

			this.project.getItems({class: Contour}).forEach(checkPathItem);

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

	/**
	 * ### Поворот кратно 90° и выравнивание
	 *
	 * @method profile_align
	 * @for Editor
	 * @param name {String} - ('left', 'right', 'top', 'bottom', 'all', 'delete')
	 */
	profile_align: {
		value: 	function(name){

			var profiles = this.project.selected_profiles();

			// если "все", получаем все профили активного или родительского контура
			if(name == "all"){

				var l = this.project.activeLayer;
				while (l.parent)
					l = l.parent;

				l.profiles.forEach(function (profile) {

					if(profile.angle_hor % 90 == 0)
						return;

					var mid;

					if(profile.orientation == $p.enm.orientations.vert){

						mid = profile.b.x + profile.e.x / 2;

						if(mid < l.bounds.center.x)
							profile.x1 = profile.x2 = Math.min(profile.x1, profile.x2);
						else
							profile.x1 = profile.x2 = Math.max(profile.x1, profile.x2);

					}else if(profile.orientation == $p.enm.orientations.hor){

						mid = profile.b.y + profile.e.y / 2;

						if(mid < l.bounds.center.y)
							profile.y1 = profile.y2 = Math.max(profile.y1, profile.y2);
						else
							profile.y1 = profile.y2 = Math.min(profile.y1, profile.y2);

					}

				});


			}else{
				this.project.selected_profiles().forEach(function (profile) {

					if(profile.angle_hor % 90 == 0)
						return;

					var minmax = {min: {}, max: {}};

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
						$p.msg.show_msg({type: "info", text: $p.msg.align_invalid_direction});

				})
			};

			if(profiles.length)
				this.project.register_change(true);

		}
	},


	/**
	 * ### Деструктор
	 * @method unload
	 * @for Editor
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
 * @for MetaEngine
 * @type {function}
 */
$p.Editor = Editor;

