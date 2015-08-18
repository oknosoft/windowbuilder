/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
 * @module  editor
 */

/**
 * Редактор
 * @class Editor
 * @constructor
 */
function Editor(_scheme){

	var _view = _scheme.view,
		_editor = this,

		/**
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 * @type {Undo}
		 */
		undo = new function Undo(){

			this.clear = function () {

			}
		},

		/**
		 * Панель выбора инструментов рисовалки
		 * @type OTooolBar
		 */
		tb_left = new $p.iface.OTooolBar({wrapper: _scheme._wrapper, top: '16px', left: '3px', name: 'left', height: '250px',
			buttons: [
				{name: 'select_elm', img: 'icon-arrow-black.png', title: require('select_elm')},
				{name: 'select_node', img: 'icon-arrow-white.png', title: require('select_node')},
				{name: 'pan', img: 'icon-hand.png', title: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
				{name: 'zoom_fit', img: 'cursor-zoom.png', title: 'Вписать в окно'},
				{name: 'pen', img: 'cursor-pen-freehand.png', title: 'Добавить профиль'},
				{name: 'lay_impost', img: 'cursor-lay-impost.png', title: 'Вставить раскладку или импосты'},
				{name: 'arc', img: 'cursor-arc-r.png', title: 'Арка {Crtl}, {Alt}, {Пробел}'},
				{name: 'ruler', img: 'ruler_ui.png', title: 'Позиционирование и сдвиг'},
				{name: 'text', img: 'text.png', title: 'Произвольный текст'}
			], onclick: function (name) {
				if(_editor.tools[name])
					_editor.tools[name].activate();
			}
		}),

		/**
		 * Верхняя панель инструментов
		 * @type {OTooolBar}
		 */
		tb_top = new $p.iface.OTooolBar({wrapper: _scheme._wrapper, width: '170px', height: '28px', top: '3px', left: '50px', name: 'top',
			buttons: [
				{name: 'save_close', img: 'save.png', title: 'Рассчитать, записать и закрыть', float: 'left'},
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
				{name: 'back', img: 'tb_undo_dis.png', title: 'Шаг назад', float: 'left'},
				{name: 'rewind', img: 'tb_redo_dis.png', title: 'Шаг вперед', float: 'left'}


			], onclick: function (name) {
				switch(name) {
					case 'save_close':
						$p.msg.show_msg(name);
						break;

					case 'calck':
						$p.msg.show_msg(name);
						break;

					case 'stamp':
						load_stamp();
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
			}}),

		/**
		 * Объект для реализации функций масштабирования
		 * @type {StableZoom}
		 */
		pan_zoom = new function StableZoom(){

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

			dhtmlxEvent(_scheme._canvas, "mousewheel", function(evt) {
				var mousePosition, newZoom, offset, viewPosition, _ref1;
				if (event.shiftKey) {
					_view.center = panAndZoom.changeCenter(_view.center, event.deltaX, event.deltaY, 1);
					return event.preventDefault();
				} else if (event.altKey) {
					mousePosition = new paper.Point(event.offsetX, event.offsetY);
					viewPosition = _view.viewToProject(mousePosition);
					_ref1 = panAndZoom.changeZoom(_view.zoom, event.deltaY, _view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
					_view.zoom = newZoom;
					_view.center = _view.center.add(offset);
					event.preventDefault();
					return _view.draw();
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
		},

		selectionBounds = null,
		selectionBoundsShape = null,
		drawSelectionBounds = 0;

	/**
	 * Деструктор
	 */
	this.unload = function () {
		if(paper.tool && paper.tool._callbacks.deactivate.length){
			paper.tool._callbacks.deactivate[0].call(paper.tool);
		}
		for(var t in this.tools){
			if(this.tools[t].remove)
				this.tools[t].remove();
			this.tools[t] = null;

		}
		tb_left.unload();
		tb_top.unload();
		_scheme.dg_layers.close();
	};

	/**
	 * Окно управления слоями dhtmlxTree
	 */
	(function(){

		var options = {
			name: 'layers',
			wnd: {
				caption: "Свойства изделия",
				top: 230,
				left: 920,
				width: 250,
				height: 380
			}};
		$p.wsql.restore_options("editor", options);
		var dg = _scheme.dg_layers = $p.iface.dat_tree(_scheme._acc, options.wnd),
			tb_bottom = dg.bottom_toolbar({wrapper: dg.cell, width: '100%', height: '28px', bottom: '0px', left: '0px', name: 'layers_bottom',
				buttons: [
					{name: 'new', img: 'drafts.gif', title: 'Новый контур', clear: 'left', float: 'left'},
					{name: 'delete', img: 'trash.gif', title: 'Удалить контур', clear: 'right', float: 'right'}],
				onclick: function (name) {
					if(name == 'new')
						$p.msg.show_not_implemented();
					else{
						var cns_no = dg.tree.getSelectedItemId(), l;
						if(cns_no){
							l = _scheme.getItem({cns_no: Number(cns_no)});
						}else if(l = _scheme.activeLayer){
							cns_no = l.cns_no;
						}
						if(cns_no && l){
							dg.tree.deleteItem(cns_no);
							l.remove();
							setTimeout(_scheme.zoom_fit, 100);
						}
					}
					return false;
				},
				image_path: dhtmlx.image_path + 'dhxtree_web/'
			});

		dg.attache = function(){

			var lid;

			dg.setText(_scheme.ox.number_str);

			function load_layer(layer){
				lid = (layer.parent ? "Створка №" : "Рама №") + layer.cns_no + " " + layer.bounds.width.toFixed() + "х" + layer.bounds.height.toFixed();

				dg.tree.insertNewItem(
					layer.parent ? layer.parent.cns_no : 0,
					layer.cns_no,
					lid);


				layer.children.forEach(function (l) {
					if(l instanceof Contour)
						load_layer(l);

				});

			}

			dg.tree.deleteChildItems(0);
			_scheme.layers.forEach(function (l) {
				if(l instanceof Contour){
					load_layer(l);
					dg.tree.setSubChecked(l.cns_no, true);
				}

			});

		};

		// Запоминаем положение окна
		dg.attachEvent("onMoveFinish", function(wnd){
			wnd.wnd_options(options.wnd);
			$p.wsql.save_options("editor", options);
		});

		// комбобоксы системы и цвета
		dg.cb_sys = new $p.iface.OCombo({
			parent: dg.cell_a,
			obj: _scheme,
			field: "osys",
			meta: $p.dp.buyers_order.metadata("sys")
		});

		dg.cb_clr = new $p.iface.OCombo({
			parent: dg.cell_a,
			obj: _scheme,
			field: "clr",
			meta: $p.dp.buyers_order.metadata("clr")
		});

		// рисуем дерево слоёв
		dg.tree.attachEvent("onCheck", function(id, state){
			var l = _scheme.getItem({cns_no: Number(id)}),
				sub = dg.tree.getAllSubItems(id);

			if(l)
				l.visible = !!state;

			if(typeof sub == "string")
				dg.tree.setCheck(sub, state);
			else
				sub.forEach(function (id) {
					dg.tree.setCheck(id, state);
				});

		});
		dg.tree.attachEvent("onSelect", function(id){
			var l = _scheme.getItem({cns_no: Number(id)});
			if(l)
				l.activate();
		});
		dg.tree.enableDragAndDrop(true, false);
		dg.tree.setDragHandler(function(){ return false; });
		dg.tree.dragger.addDragLanding(tb_bottom.cell, {
			_drag : function(sourceHtmlObject, dhtmlObject, targetHtmlObject){
				tb_bottom.buttons["delete"].style.backgroundColor="";
				$p.msg.show_msg({type: "alert-warning",
					text: sourceHtmlObject.parentObject.id,
					title: $p.msg.main_title});
			},
			_dragIn : function(dst, src, x, y, ev){
				if(tb_bottom.buttons["delete"] == ev.target || tb_bottom.buttons["delete"] == ev.target.parentElement){
					tb_bottom.buttons["delete"].style.backgroundColor="#fffacd";
					return dst;
				}
			},
			_dragOut : function(htmlObject){
				tb_bottom.buttons["delete"].style.backgroundColor="";
				return this;
			}
		});

	})();

	this.tools = {};

	/**
	 * Это не настоящий инструмент, а команда вписывания в окно
	 */
	this.tools.zoom_fit = {
		activate: function(){
			_scheme.zoom_fit();
		}
	};

	/**
	 * Свойства и перемещение элемента
	 */
	this.tools.select_elm = new function(){

		var tool = new paper.Tool();
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.changed = false;
		tool.duplicates = null;

		tool.options = {
			name: 'select_elm',
			wnd: {
				caption: "Свойства элемента",
				height: 380
			}};

		tool.update = function () {
			tool.wnd.lazy_update();
		};
		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			/*	if (mode != 'tool-select')
			 return false;*/
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {
			// var hitSize = 4.0; // / view.zoom;
			var hitSize = 6;
			this.hitItem = null;

			// Hit test items.
			if (event.point){
				this.hitItem = _scheme.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
				if (!this.hitItem)
					this.hitItem = _scheme.hitTest(event.point, { fill:true, tolerance: hitSize });
			}

			if (this.hitItem) {
				if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {
					if (this.hitItem.item.selected) {
						setCanvasCursor('cursor-arrow-small');
					} else {
						setCanvasCursor('cursor-arrow-black-shape');
					}
				}
			} else {
				setCanvasCursor('cursor-arrow-black');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.options.name);

				setCanvasCursor('cursor-arrow-black');
				updateSelectionState();
				showSelectionBounds();

				profile_dg_wnd(tool);

			},
			deactivate: function() {
				hideSelectionBounds();

				if(tool.wnd){
					tool.wnd.wnd_options(tool.options.wnd);
					$p.wsql.save_options("editor", tool.options);
					tool.wnd.close();
					tool.wnd = null;
				}
			},
			mousedown: function(event) {
				this.mode = null;
				this.changed = false;

				if (this.hitItem) {
					var is_profile = this.hitItem.item.parent instanceof Profile,
						item = is_profile ? this.hitItem.item.parent.generatrix : this.hitItem.item;
					if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {
						if (event.modifiers.shift) {
							item.selected = !item.selected;
						} else {
							_scheme.deselectAll();
							item.selected = true;
						}
						if (item.selected) {
							this.mode = 'move-shapes';
							_scheme.deselect_all_points();
							this.mouseStartPos = event.point.clone();
							this.originalContent = captureSelectionState();
						}
					}
					if(is_profile)
						profile_dg_attache(this.hitItem.item.parent, tool.wnd);

					//updateSelectionState();
					clearSelectionBounds();

				} else {
					// Clicked on and empty area, engage box select.
					this.mouseStartPos = event.point.clone();
					this.mode = 'box-select';

					if (!event.modifiers.shift)
						tool.wnd.clear();

				}
			},
			mouseup: function(event) {
				if (this.mode == 'move-shapes') {
					if (this.changed) {
						//clearSelectionBounds();
						//undo.snapshot("Move Shapes");
					}
					this.duplicates = null;
				} else if (this.mode == 'box-select') {
					var box = new paper.Rectangle(this.mouseStartPos, event.point);

					if (!event.modifiers.shift)
						_scheme.deselectAll();

					var selectedPaths = getPathsIntersectingRect(box);
					for (var i = 0; i < selectedPaths.length; i++)
						selectedPaths[i].selected = !selectedPaths[i].selected;
				}

				updateSelectionState();

				if (this.hitItem) {
					if (this.hitItem.item.selected) {
						setCanvasCursor('cursor-arrow-small');
					} else {
						setCanvasCursor('cursor-arrow-black-shape');
					}
				}
			},
			mousedrag: function(event) {
				if (this.mode == 'move-shapes') {

					this.changed = true;

					setCanvasCursor('cursor-arrow-small');

					var delta = event.point.subtract(this.mouseStartPos);
					if (event.modifiers.shift) {
						delta = snapDeltaToAngle(delta, Math.PI*2/8);
					}

					restoreSelectionState(this.originalContent);

					var selected = _scheme.selectedItems;
					for (var i = 0; i < selected.length; i++) {
						var path = selected[i];
						if(path.parent instanceof Profile)
							path.parent.move_points(delta, true);
						else
							path.position = path.position.add(delta);
					}
					updateSelectionState();

				} else if (this.mode == 'box-select') {
					dragRect(this.mouseStartPos, event.point);
				}
			},
			mousemove: function(event) {
				this.hitTest(event);
			},
			keydown: function(event) {
				var selected, i, path, point, newpath;
				if (event.key == '+') {

					selected = _scheme.selectedItems;
					for (i = 0; i < selected.length; i++) {
						path = selected[i];

						if(path.parent instanceof Profile){

							point = path.getPointAt(path.length * 0.5);
							path.parent.rays.clear();
							newpath = path.split(path.length * 0.5);
							new Profile({generatrix: newpath, proto: path.parent});

						}

					}

					// Prevent the key event from bubbling
					return false;

				} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

					if(event.event && event.event.target && event.event.target.tagName.toLowerCase() == "input")
						return;

					selected = _scheme.selectedItems;
					for (i = 0; i < selected.length; i++) {
						path = selected[i];
						if(path.parent instanceof Profile){
							path = path.parent;
							path.removeChildren();
							path.remove();
						}else{
							path.remove();
						}
					}

					// Prevent the key event from bubbling
					return false;
				}
			}
		});

		return tool;
	};

	/**
	 * Свойства и перемещение узлов элемента
	 */
	this.tools.select_node = new function(){

		var tool = new paper.Tool();
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.originalHandleIn = null;
		tool.originalHandleOut = null;
		tool.changed = false;
		tool.minDistance = 10;

		tool.options = {
			name: 'select_elm',
			wnd: {
				caption: "Свойства элемента",
				height: 380
			}};

		tool.update = function () {
			tool.wnd.lazy_update();
		};
		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			if (mode != 'tool-direct-select')
				return;
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {
			var hitSize = 4;
			var hit = null;
			this.hitItem = null;

			if (event.point){

				// Hit test items.
				//stroke:true
				this.hitItem = _scheme.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
				if (!this.hitItem)
					this.hitItem = _scheme.hitTest(event.point, { fill:true, guides: false, tolerance: hitSize });

				// Hit test selected handles
				hit = _scheme.hitTest(event.point, { selected: true, handles: true, tolerance: hitSize });
				if (hit)
					this.hitItem = hit;

				// Hit test points
				hit = _scheme.hitPoints(event.point);

				if (hit){
					if(hit.item.parent instanceof Profile){
						if(hit.item.parent.generatrix === hit.item)
							this.hitItem = hit;
					}else
						this.hitItem = hit;
				}

			}

			if (this.hitItem) {
				if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {
					if (this.hitItem.item.selected) {
						setCanvasCursor('cursor-arrow-small');
					} else {
						setCanvasCursor('cursor-arrow-white-shape');
					}
				} else if (this.hitItem.type == 'segment' || this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
					if (this.hitItem.segment.selected) {
						setCanvasCursor('cursor-arrow-small-point');
					} else {
						setCanvasCursor('cursor-arrow-white-point');
					}
				}
			} else {
				setCanvasCursor('cursor-arrow-white');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select('select_node');

				setCanvasCursor('cursor-arrow-white');

				profile_dg_wnd(tool);
			},
			deactivate: function() {
				clearSelectionBounds();

				if(tool.wnd){
					tool.wnd.wnd_options(tool.options.wnd);
					$p.wsql.save_options("editor", tool.options);
					tool.wnd.close();
					tool.wnd = null;
				}
			},
			mousedown: function(event) {
				this.mode = null;
				this.changed = false;

				if (this.hitItem) {
					var is_profile = this.hitItem.item.parent instanceof Profile,
						item = is_profile ? this.hitItem.item.parent.generatrix : this.hitItem.item;
					if (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke') {
						if (event.modifiers.shift) {
							item.selected = !item.selected;
						} else {
							_scheme.deselectAll();
							item.selected = true;
						}
						if (item.selected) {
							this.mode = 'move-shapes';
							_scheme.deselect_all_points();
							this.mouseStartPos = event.point.clone();
							this.originalContent = captureSelectionState();
						}
					} else if (this.hitItem.type == 'segment') {
						if (event.modifiers.shift) {
							this.hitItem.segment.selected = !this.hitItem.segment.selected;
						} else {
							if (!this.hitItem.segment.selected){
								_scheme.deselect_all_points();
								_scheme.deselectAll();
							}
							this.hitItem.segment.selected = true;
						}
						if (this.hitItem.segment.selected) {
							this.mode = consts.move_points;
							this.mouseStartPos = event.point.clone();
							this.originalContent = captureSelectionState();
						}
					} else if (this.hitItem.type == 'handle-in' || this.hitItem.type == 'handle-out') {
						this.mode = consts.move_handle;
						this.mouseStartPos = event.point.clone();
						this.originalHandleIn = this.hitItem.segment.handleIn.clone();
						this.originalHandleOut = this.hitItem.segment.handleOut.clone();

						/*				if (this.hitItem.type == 'handle-out') {
						 this.originalHandlePos = this.hitItem.segment.handleOut.clone();
						 this.originalOppHandleLength = this.hitItem.segment.handleIn.length;
						 } else {
						 this.originalHandlePos = this.hitItem.segment.handleIn.clone();
						 this.originalOppHandleLength = this.hitItem.segment.handleOut.length;
						 }*/
//				this.originalContent = captureSelectionState(); // For some reason this does not work!
					}

					if(is_profile)
						profile_dg_attache(this.hitItem.item.parent, tool.wnd);

					//updateSelectionState();
					clearSelectionBounds();

				} else {
					// Clicked on and empty area, engage box select.
					this.mouseStartPos = event.point.clone();
					this.mode = 'box-select';

					if (!event.modifiers.shift)
						tool.wnd.clear();
				}
			},
			mouseup: function(event) {
				if (this.mode == 'move-shapes') {
					if (this.changed) {
						clearSelectionBounds();
						//undo.snapshot("Move Shapes");
					}
				} else if (this.mode == consts.move_points) {
					if (this.changed) {
						clearSelectionBounds();
						//undo.snapshot("Move Points");
					}
				} else if (this.mode == consts.move_handle) {
					if (this.changed) {
						clearSelectionBounds();
						//undo.snapshot("Move Handle");
					}
				} else if (this.mode == 'box-select') {
					var box = new paper.Rectangle(this.mouseStartPos, event.point);

					if (!event.modifiers.shift)
						_scheme.deselectAll();

					var selectedSegments = getSegmentsInRect(box);
					if (selectedSegments.length > 0) {
						for (var i = 0; i < selectedSegments.length; i++) {
							selectedSegments[i].selected = !selectedSegments[i].selected;
						}
					} else {
						var selectedPaths = getPathsIntersectingRect(box);
						for (var i = 0; i < selectedPaths.length; i++)
							selectedPaths[i].selected = !selectedPaths[i].selected;
					}
				}

				//updateSelectionState();
				clearSelectionBounds();

				if (this.hitItem) {
					if (this.hitItem.item.selected) {
						setCanvasCursor('cursor-arrow-small');
					} else {
						setCanvasCursor('cursor-arrow-white-shape');
					}
				}
			},
			mousedrag: function(event) {
				this.changed = true;

				if (this.mode == 'move-shapes') {
					setCanvasCursor('cursor-arrow-small');

					var delta = event.point.subtract(this.mouseStartPos);
					if (event.modifiers.shift) {
						delta = snapDeltaToAngle(delta, Math.PI*2/8);
					}
					restoreSelectionState(this.originalContent);

					var selected = _scheme.selectedItems;
					for (var i = 0; i < selected.length; i++) {
						var path = selected[i];
						if(path.parent instanceof Profile){
							if(!path.layer.parent)
								path.parent.move_points(delta, true);
						}else
							path.position = path.position.add(delta);
					}
					updateSelectionState();

				} else if (this.mode == consts.move_points) {
					setCanvasCursor('cursor-arrow-small');

					var delta = event.point.subtract(this.mouseStartPos);
					if (event.modifiers.shift) {
						delta = snapDeltaToAngle(delta, Math.PI*2/8);
					}
					restoreSelectionState(this.originalContent);

					var selected = _scheme.selectedItems;
					for (var i = 0; i < selected.length; i++) {
						var path = selected[i];

						if(path.parent instanceof Profile)
							path.parent.move_points(delta);
						else
							for (var j = 0; j < path.segments.length; j++) {
								if (path.segments[j].selected)
									path.segments[j].point = path.segments[j].point.add(delta);
							}
					}
					//updateSelectionState();
					purgeSelection();


				} else if (this.mode == consts.move_handle) {

					var delta = event.point.subtract(this.mouseStartPos);

					if (this.hitItem.type == 'handle-out') {
						var handlePos = this.originalHandleOut.add(delta);
						if (event.modifiers.shift) {
							handlePos = snapDeltaToAngle(handlePos, Math.PI*2/8);
						}
						this.hitItem.segment.handleOut = handlePos;
						this.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
					} else {
						var handlePos = this.originalHandleIn.add(delta);
						if (event.modifiers.shift) {
							handlePos = snapDeltaToAngle(handlePos, Math.PI*2/8);
						}
						this.hitItem.segment.handleIn = handlePos;
						this.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
					}

					this.hitItem.item.parent.rays.clear();

					//updateSelectionState();
					purgeSelection();

				} else if (this.mode == 'box-select') {
					dragRect(this.mouseStartPos, event.point);
				}
			},
			mousemove: function(event) {
				this.hitTest(event);
			},
			keydown: function(event) {
				var selected, i, j, path, segment, index, point, handle, do_select;
				if (event.key == '+') {

					selected = _scheme.selectedItems;
					for (i = 0; i < selected.length; i++) {
						path = selected[i];
						do_select = false;
						if(path.parent instanceof Profile){
							for (j = 0; j < path.segments.length; j++) {
								segment = path.segments[j];
								if (segment.selected){
									do_select = true;
									break;
								}
							}
							if(!do_select){
								j = 0;
								segment = path.segments[j];
								do_select = true;
							}
						}
						if(do_select){
							index = (j < (path.segments.length - 1) ? j + 1 : j);
							point = segment.curve.getPointAt(0.5, true);
							handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
							path.insert(index, new paper.Segment(point, handle.negate(), handle));
						}
					}

					// Prevent the key event from bubbling
					return false;

				} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

					if(event.event && event.event.target && event.event.target.tagName.toLowerCase() == "input")
						return;

					selected = _scheme.selectedItems;
					for (i = 0; i < selected.length; i++) {
						path = selected[i];
						if(path.parent instanceof Profile){
							for (j = 0; j < path.segments.length; j++) {
								segment = path.segments[j];
								if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
									path.removeSegment(j);

									// пересчитываем
									path.parent.x1 = path.parent.x1;

									break;
								}
							}
						}
					}
					// Prevent the key event from bubbling
					return false;
				}
			}
		});

		return tool;
	};

	/**
	 * Панорама и масштабирование без колёсика
	 */
	this.tools.pan = new function(){

		var tool = new paper.Tool();
		tool.name = 'pan';
		tool.distanceThreshold = 8;
		tool.mouseStartPos = new paper.Point();
		tool.mode = 'pan';
		tool.zoomFactor = 1.1;
		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			var spacePressed = event && event.modifiers.space;
			if (mode != 'tool-zoompan' && !spacePressed)
				return false;
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {

			if (event.modifiers.control) {
				setCanvasCursor('cursor-zoom-in');
			} else if (event.modifiers.option) {
				setCanvasCursor('cursor-zoom-out');
			} else {
				setCanvasCursor('cursor-hand');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.name);
				setCanvasCursor('cursor-hand');
			},
			deactivate: function() {
			},
			mousedown: function(event) {
				this.mouseStartPos = event.point.subtract(_view.center);
				this.mode = '';
				if (event.modifiers.control || event.modifiers.option) {
					this.mode = 'zoom';
				} else {
					setCanvasCursor('cursor-hand-grab');
					this.mode = 'pan';
				}
			},
			mouseup: function(event) {
				if (this.mode == 'zoom') {
					var zoomCenter = event.point.subtract(_view.center);
					var moveFactor = this.zoomFactor - 1.0;
					if (event.modifiers.control) {
						_view.zoom *= this.zoomFactor;
						_view.center = _view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
					} else if (event.modifiers.option) {
						_view.zoom /= this.zoomFactor;
						_view.center = _view.center.subtract(zoomCenter.multiply(moveFactor));
					}
				} else if (this.mode == 'zoom-rect') {
					var start = _view.center.add(this.mouseStartPos);
					var end = event.point;
					_view.center = start.add(end).multiply(0.5);
					var dx = _view.bounds.width / Math.abs(end.x - start.x);
					var dy = _view.bounds.height / Math.abs(end.y - start.y);
					_view.zoom = Math.min(dx, dy) * _view.zoom;
				}
				this.hitTest(event);
				this.mode = '';
			},
			mousedrag: function(event) {
				if (this.mode == 'zoom') {
					// If dragging mouse while in zoom mode, switch to zoom-rect instead.
					this.mode = 'zoom-rect';
				} else if (this.mode == 'zoom-rect') {
					// While dragging the zoom rectangle, paint the selected area.
					dragRect(_view.center.add(this.mouseStartPos), event.point);
				} else if (this.mode == 'pan') {
					// Handle panning by moving the view center.
					var pt = event.point.subtract(_view.center);
					var delta = this.mouseStartPos.subtract(pt);
					_view.scrollBy(delta);
					this.mouseStartPos = pt;
				}
			},

			mousemove: function(event) {
				this.hitTest(event);
			},

			keydown: function(event) {
				this.hitTest(event);
			},

			keyup: function(event) {
				this.hitTest(event);
			}
		});

		return tool;
	};

	/**
	 * Манипуляции с арками (дуги правильных окружностей)
	 */
	this.tools.arc = new function(){

		var tool = new paper.Tool();
		tool.name = 'arc';
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.changed = false;
		tool.duplicates = null;

		function do_arc(element, point){
			var end = element.lastSegment.point.clone();
			element.removeSegments(1);

			try{
				element.arcTo(point, end);
			}catch (e){	};

			if(!element.curves.length)
				element.lineTo(end);

			element.parent.rays.clear();
			element.selected = true;

			element.parent.parent.notify({type: consts.move_points, profiles: [element.parent], points: []});
		}

		tool.update = function () {
			//tool.wnd.lazy_update();
		};
		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			/*	if (mode != 'tool-select')
			 return false;*/
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {

			var hitSize = 4;
			this.hitItem = null;

			if (event.point)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
			if(!this.hitItem)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, tolerance: hitSize });

			if (this.hitItem && this.hitItem.item.parent instanceof Profile
				&& (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
				setCanvasCursor('cursor-arc');
			} else {
				setCanvasCursor('cursor-arc-arrow');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.name);
				setCanvasCursor('cursor-arc-arrow');
			},
			deactivate: function() {
				hideSelectionBounds();
			},
			mousedown: function(event) {
				this.mode = null;
				this.changed = false;

				if (this.hitItem && this.hitItem.item.parent instanceof Profile
					&& (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

					this.mode = this.hitItem.item.parent.generatrix;

					if (event.modifiers.control || event.modifiers.option){
						// при зажатом ctrl или alt строим правильную дугу

						var b = this.mode.firstSegment.point,
							e = this.mode.lastSegment.point,
							r = (b.getDistance(e) / 2) + 0.01,
							contour = this.mode.parent.parent;

						do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

						//undo.snapshot("Move Shapes");
						this.mode = null;
						setTimeout(contour.redraw, 10);


					}else if(event.modifiers.space){
						// при зажатом space удаляем кривизну

						var e = this.mode.lastSegment.point,
							contour = this.mode.parent.parent;

						this.mode.removeSegments(1);
						this.mode.firstSegment.linear = true;
						this.mode.lineTo(e);
						this.mode.parent.rays.clear();
						this.mode.selected = true;

						//undo.snapshot("Move Shapes");
						this.mode = null;
						setTimeout(contour.redraw, 10);

					} else {
						_scheme.deselectAll();
						this.mode.selected = true;
						_scheme.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = captureSelectionState();

					}

					//attache_dg(this.hitItem.item.parent, tool.wnd);

				}else{
					//tool.wnd.clear();
					_scheme.deselectAll();
				}
			},
			mouseup: function(event) {
				if (this.mode && this.changed) {
					//undo.snapshot("Move Shapes");
					//_scheme.redraw();
				}

				setCanvasCursor('cursor-arc-arrow');

			},
			mousedrag: function(event) {
				if (this.mode) {

					this.changed = true;

					setCanvasCursor('cursor-arrow-small');

					do_arc(this.mode, event.point);

					//this.mode.parent.parent.redraw();


				}
			},
			mousemove: function(event) {
				this.hitTest(event);
			}
		});

		return tool;

	};

	/**
	 * Добавление профилей
	 */
	this.tools.pen = new function(){

		var tool = new paper.Tool();
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.start_binded = false;

		tool.options = {
			name: 'pen',
			bind_generatrix: true,
			bind_node: false,
			wnd: {
				caption: "Новый сегмент профиля",
				height: 280
			}
		};

		function tool_wnd(){

			var folder, opened = false,
				profile = tool.options;

			$p.wsql.restore_options("editor", profile);

			if(profile.nom)
				profile.nom = $p.cat.nom.get(profile.nom);
			else
				profile.nom = $p.cat.nom.get();

			if(profile.clr)
				profile.clr = $p.cat.clrs.get(profile.clr);
			else
				profile.clr = $p.cat.clrs.predefined("white");

			tool.wnd = $p.iface.dat_gui(_scheme._dxw, tool.options.wnd);

			tool.wnd.add(profile, 'nom', {pos: "hidden", title: "Материал профиля"}).onChange(function(c){
				if(opened)
					return;
				opened = true;
				$p.cat.nom.form_selection({
					o: profile,
					wnd: _scheme._pwnd,
					on_select: function (v) {
						if(v!==undefined)
							profile.nom = v;
						tool.update();
						opened = false;
					},
					on_unload: function () {
						opened = false;
					}

				}, {
					initial_value: profile.nom.ref
				});
			});

			tool.wnd.add(profile, 'clr', {pos: "hidden", title: "Цвет профиля"}).onChange(function(c){
				if(opened)
					return;
				opened = true;
				$p.cat.clrs.form_selection({
					o: profile,
					wnd: _scheme._pwnd,
					on_select: function (v) {
						if(v!==undefined)
							profile.clr = v;
						tool.update();
						opened = false;
					},
					on_unload: function () {
						opened = false;
					}

				}, {
					initial_value: profile.nom.ref
				});
			});

			tool.wnd.add(profile, 'bind_generatrix', {caption: "Магнит к профилю", pos: "before"});

			tool.wnd.add(profile, 'bind_node', {caption: "Магнит к узлам", pos: "before"});
		}

		function decorate_layers(reset){
			var al = _scheme.activeLayer;
			_scheme.layers.forEach(function (l) {
				if(l == al)
					l.opacity = 1;
				else
					l.opacity = reset ? 1 : 0.3;
			})
		}

		function observer(changes){
			changes.forEach(function(change, i){
				if(change.name == "_activeLayer")
					decorate_layers();
			});
		}

		tool.update = function () {
			tool.wnd.lazy_update();
		};
		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			/*	if (mode != 'tool-select')
			 return false;*/
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {
			// var hitSize = 4.0; // / view.zoom;
			var hitSize = 4;
			this.hitItem = null;

			// Hit test items.
			if (event.point)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
			if(!this.hitItem)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, tolerance: hitSize });

			if (this.hitItem && this.hitItem.item.parent instanceof Profile
				&& (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {
				setCanvasCursor('cursor-pen-adjust');
			} else {
				setCanvasCursor('cursor-pen-freehand');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.options.name);
				setCanvasCursor('cursor-pen-freehand');

				tool_wnd();

				Object.observe(_scheme, observer);

				decorate_layers();

			},
			deactivate: function() {
				clearSelectionBounds();

				Object.unobserve(_scheme, observer);

				decorate_layers(true);

				if(tool.wnd){
					tool.wnd.wnd_options(tool.options.wnd);
					tool.options.clr = tool.options.clr.ref;
					tool.options.nom = tool.options.nom.ref;
					$p.wsql.save_options("editor", tool.options);
					tool.wnd.close();
					tool.wnd = null;
				}
			},
			mousedown: function(event) {

				_scheme.deselectAll();
				this.mode = 'continue';
				this.start_binded = false;
				this.mouseStartPos = event.point.clone();

			},
			mouseup: function(event) {

				setCanvasCursor('cursor-pen-freehand');

				if (this.mode && this.path) {
					new Profile({generatrix: this.path, proto: tool.options});
					this.mode = null;
					this.path = null;
				}

			},
			mousedrag: function(event) {

				var delta = event.point.subtract(this.mouseStartPos),
					dragIn = false,
					dragOut = false,
					invert = false;

				if (!this.mode || !this.path && delta.length < consts.sticking)
					return;

				if (!this.path){
					this.path = new paper.Path();
					this.path.strokeColor = 'black';
					this.currentSegment = this.path.add(this.mouseStartPos);
					this.originalHandleIn = this.currentSegment.handleIn.clone();
					this.originalHandleOut = this.currentSegment.handleOut.clone();
					this.currentSegment.selected = true;
				}


				if (this.mode == 'create') {
					dragOut = true;
					if (this.currentSegment.index > 0)
						dragIn = true;
				} else  if (this.mode == 'close') {
					dragIn = true;
					invert = true;
				} else  if (this.mode == 'continue') {
					dragOut = true;
				} else if (this.mode == 'adjust') {
					dragOut = true;
				} else  if (this.mode == 'join') {
					dragIn = true;
					invert = true;
				} else  if (this.mode == 'convert') {
					dragIn = true;
					dragOut = true;
				}

				if (dragIn || dragOut) {
					var delta = event.point.subtract(this.mouseStartPos),
						i, res, element, bind = this.options.bind_node ? "node_" : "";

					if(this.options.bind_generatrix)
						bind += "generatrix";

					if (invert)
						delta = delta.negate();

					if (dragIn && dragOut) {
						var handlePos = this.originalHandleOut.add(delta);
						if (event.modifiers.shift)
							handlePos = snapDeltaToAngle(handlePos, Math.PI*2/8);
						this.currentSegment.handleOut = handlePos;
						this.currentSegment.handleIn = handlePos.negate();
					} else if (dragOut) {
						// upzp

						if (event.modifiers.shift) {
							delta = snapDeltaToAngle(delta, Math.PI*2/8);
						}

						if(this.path.segments.length > 1)
							this.path.lastSegment.point = this.mouseStartPos.add(delta);
						else
							this.path.add(this.mouseStartPos.add(delta));

						// попытаемся привязать концы пути к профилям контура
						if(!this.start_binded){
							res = {distance: 10e9};
							for(i in _scheme.activeLayer.children){
								element = _scheme.activeLayer.children[i];
								if (element instanceof Profile &&
									_scheme.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
									this.path.firstSegment.point = res.point;
									break;
								}
							}
							this.start_binded = true;
						}
						res = {distance: 10e9};
						for(i in _scheme.activeLayer.children){
							element = _scheme.activeLayer.children[i];
							if (element instanceof Profile &&
								_scheme.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
								this.path.lastSegment.point = res.point;
								break;
							}
						}



						//this.currentSegment.handleOut = handlePos;
						//this.currentSegment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
					} else {
						var handlePos = this.originalHandleIn.add(delta);
						if (event.modifiers.shift)
							handlePos = snapDeltaToAngle(handlePos, Math.PI*2/8);
						this.currentSegment.handleIn = handlePos;
						this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
					}
					this.path.selected = true;
				}
			},
			mousemove: function(event) {
				this.hitTest(event);
			}
		});

		return tool;

	};

	/**
	 * Вставка раскладок и импостов
	 */
	this.tools.lay_impost = new function(){

		var tool = new paper.Tool();
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.changed = false;

		tool.options = {
			name: 'lay_impost',
			nom: $p.cat.nom.get(),
			clr: $p.cat.clrs.get()};

		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			/*	if (mode != 'tool-select')
			 return false;*/
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {
			// var hitSize = 4.0; // / view.zoom;
			var hitSize = 2;

			// Hit test items.
			this.hitItem = _scheme.hitTest(event.point, { fill:true, tolerance: hitSize });

			if (this.hitItem && !(this.hitItem.item.parent instanceof Profile) && (this.hitItem.type == 'fill')) {
				setCanvasCursor('cursor-lay-impost');
			} else {
				setCanvasCursor('cursor-arrow-lay');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.options.name);
				setCanvasCursor('cursor-arrow-lay');
			},
			deactivate: function() {
				hideSelectionBounds();
			},
			mousedown: function(event) {
				this.mode = null;
				this.changed = false;

				if (this.hitItem && this.hitItem.item.parent instanceof Profile
					&& (this.hitItem.type == 'fill' || this.hitItem.type == 'stroke')) {

					this.mode = this.hitItem.item.parent.generatrix;

					if (event.modifiers.control || event.modifiers.option){
						// при зажатом ctrl или alt строим правильную дугу

						var b = this.mode.firstSegment.point,
							e = this.mode.lastSegment.point,
							r = (b.getDistance(e) / 2) + 0.01,
							contour = this.mode.parent.parent;

						do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

						//undo.snapshot("Move Shapes");
						this.mode = null;
						setTimeout(contour.redraw, 10);


					}else if(event.modifiers.space){
						// при зажатом space удаляем кривизну

						var e = this.mode.lastSegment.point,
							contour = this.mode.parent.parent;

						this.mode.removeSegments(1);
						this.mode.firstSegment.linear = true;
						this.mode.lineTo(e);
						this.mode.parent.rays.clear();
						this.mode.selected = true;

						//undo.snapshot("Move Shapes");
						this.mode = null;
						setTimeout(contour.redraw, 10);

					} else {
						_scheme.deselectAll();
						this.mode.selected = true;
						_scheme.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = captureSelectionState();

					}

					//attache_dg(this.hitItem.item.parent, tool.wnd);

				}else{
					//tool.wnd.clear();
					_scheme.deselectAll();
				}
			},
			mouseup: function(event) {
				if (this.mode && this.changed) {
					//undo.snapshot("Move Shapes");
				}

				setCanvasCursor('cursor-arrow-lay');

			},
			mousedrag: function(event) {
				if (this.mode) {

					this.changed = true;

					setCanvasCursor('cursor-arrow-small');

					do_arc(this.mode, event.point);


				}
			},
			mousemove: function(event) {
				this.hitTest(event);
			}
		});

		return tool;

	};

	/**
	 * Относительное позиционирование и сдвиг
	 */
	this.tools.ruler = new function(){

		var selected,
			tool = new paper.Tool();
		tool.mouseStartPos = new paper.Point();
		tool.mode = null;
		tool.hitItem = null;
		tool.originalContent = null;
		tool.changed = false;

		tool.options = {
			name: 'ruler',
			wnd: {
				caption: "Размеры и сдвиг",
				height: 280
			}
		};

		function tool_wnd(){

			var folder, opened = false, profile = tool.options,
				div=document.createElement("table"), table, input;

			function onclick(e){

			}

			$p.wsql.restore_options("editor", tool.options);

			tool.wnd = $p.iface.dat_blank(_scheme._dxw, tool.options.wnd);

			div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
				'<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly ></td><td></td></tr>' +
				'<tr><td></td><td align="center"></td><td></td></tr>';
			div.style.width = "130px";
			div.style.margin ="auto";
			table = div.firstChild.childNodes;

			$p.iface.add_button(table[0].childNodes[1], null,
				{name: "top", img: "/imgs/custom_field/align_top.png", title: $p.msg.align_set_top}).onclick = onclick;
			$p.iface.add_button(table[1].childNodes[0], null,
				{name: "left", img: "/imgs/custom_field/align_left.png", title: $p.msg.align_set_left}).onclick = onclick;
			$p.iface.add_button(table[1].childNodes[2], null,
				{name: "right", img: "/imgs/custom_field/align_right.png", title: $p.msg.align_set_right}).onclick = onclick;
			$p.iface.add_button(table[2].childNodes[1], null,
				{name: "bottom", img: "/imgs/custom_field/align_bottom.png", title: $p.msg.align_set_bottom}).onclick = onclick;

			tool.wnd.attachObject(div);

			input = table[1].childNodes[1];
			input.grid = {
				editStop: function (v) {

				},
				getPosition: function (v) {
					var offsetLeft = v.offsetLeft, offsetTop = v.offsetTop;
					while ( v = v.offsetParent ){
						offsetLeft += v.offsetLeft;
						offsetTop  += v.offsetTop;
					}
					return [offsetLeft + 7, offsetTop + 9];
				}
			};

			input.firstChild.onfocus = function (e) {
				tool.__calck = new eXcell_calck(this);
				tool.__calck.edit();
			};

		}

		tool.resetHot = function(type, event, mode) {
		};
		tool.testHot = function(type, event, mode) {
			/*	if (mode != 'tool-select')
			 return false;*/
			return this.hitTest(event);
		};
		tool.hitTest = function(event) {

			var hitSize = 4;
			this.hitItem = null;

			if (event.point)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
			if(!this.hitItem)
				this.hitItem = _scheme.hitTest(event.point, { fill:true, stroke:true, tolerance: hitSize });

			if (this.hitItem && this.hitItem.item.parent instanceof Profile) {
				setCanvasCursor('cursor-arrow-ruler');
			} else {
				setCanvasCursor('cursor-arrow-ruler-light');
			}

			return true;
		};
		tool.on({
			activate: function() {
				tb_left.select(tool.options.name);
				setCanvasCursor('cursor-arrow-ruler-light');

				tool_wnd();
			},
			deactivate: function() {

				if(tool.wnd){
					tool.wnd.wnd_options(tool.options.wnd);
					$p.wsql.save_options("editor", tool.options);
					tool.wnd.close();
					tool.wnd = null;
				}

			},
			mousedown: function(event) {
				this.mode = null;
				this.changed = false;

				if (this.hitItem) {
					var is_profile = this.hitItem.item.parent instanceof Profile,
						item = is_profile ? this.hitItem.item.parent.generatrix : this.hitItem.item;

					if (is_profile) {

						if (event.modifiers.shift) {
							item.selected = !item.selected;
						} else {
							_scheme.deselectAll();
							item.selected = true;
						}
					}

					// Если выделено 2 элемента, рассчитаем сдвиг
					if((selected = _scheme.selectedItems).length == 2){

					}


				} else {
					// Clicked on and empty area, engage box select.
					this.mouseStartPos = event.point.clone();
					this.mode = 'box-select';

					//if (!event.modifiers.shift)
					//	tool.wnd.clear();

				}

			},
			mouseup: function(event) {


			},
			mousedrag: function(event) {

			},
			mousemove: function(event) {
				this.hitTest(event);
			}
		});

		return tool;

	};

	/**
	 * Инициализация окна свойств профиля
	 * @param tool
	 */
	function profile_dg_wnd(tool){
		$p.wsql.restore_options("editor", tool.options);
		tool.wnd = $p.iface.dat_gui(_scheme._dxw, tool.options.wnd);
		var dg = tool.wnd.wnd, minmax = {min: {}, max: {}}, profile;
		dg.buttons = dg.bottom_toolbar({
			wrapper: dg.cell, width: '100%', height: '28px', bottom: '0px', left: '0px', name: 'aling_bottom',
			buttons: [
				{name: 'left', img: 'align_left.png', title: $p.msg.align_node_left, float: 'left'},
				{name: 'bottom', img: 'align_bottom.png', title: $p.msg.align_node_bottom, float: 'left'},
				{name: 'top', img: 'align_top.png', title: $p.msg.align_node_top, float: 'left'},
				{name: 'right', img: 'align_right.png', title: $p.msg.align_node_right, float: 'left'},
				{name: 'delete', img: 'trash.gif', title: 'Удалить элемент', clear: 'right', float: 'right'}
			],
			onclick: function (name) {
				if(!(profile = tool.wnd.first_obj(Profile)))
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

				_view.update();
				return false;
			}
		});
	}

	/**
	 * Подключает редактор свойств профиля
	 */
	function profile_dg_attache(profile, dg){

		function onfocus(e){
			if(this.property == "x1" || this.property == "y1")
				_scheme.select_node(profile, "b");
			else if(this.property == "x2" || this.property == "y2")
				_scheme.select_node(profile, "e");
		}

		// удаляем ранее созданные контролы
		var folder, opened = false;

		// если уже подключено, не перезаполняем
		if(dg.__folders["Начало"] && dg.__folders["Начало"].__controllers[0] && dg.__folders["Начало"].__controllers[0].object === profile)
			return;

		dg.clear();

		dg.add(profile, 'nom', {pos: "hidden", title: "Материал профиля"}).onChange(function(c){
			if(opened)
				return;
			opened = true;
			$p.cat.nom.form_selection({
				o: profile,
				wnd: _scheme._pwnd,
				on_select: function (v) {
					opened = false;
				},
				on_unload: function () {
					opened = false;
				}

			}, {
				initial_value: profile.nom.ref
			});
		});

		dg.add(profile, 'clr', {pos: "hidden", title: "Цвет профиля"}).onChange(function(c){
			if(opened)
				return;
			opened = true;
			$p.cat.clrs.form_selection({
				o: profile,
				wnd: _scheme._pwnd,
				on_select: function (v) {
					if(v!==undefined)
						profile.clr = v;
					opened = false;
				},
				on_unload: function () {
					opened = false;
				}

			}, {
				initial_value: profile.nom.ref
			});
		});

		folder = dg.addFolder("Начало");
		folder.add(profile, 'x1').onChange(profile.project.redraw).onFocus(onfocus);
		folder.add(profile, 'y1').onChange(profile.project.redraw).onFocus(onfocus);
		folder.open();
		folder = dg.addFolder("Конец");
		folder.add(profile, 'x2').onChange(profile.project.redraw).onFocus(onfocus);
		folder.add(profile, 'y2').onChange(profile.project.redraw).onFocus(onfocus);
		folder.open();

		dg.after_update = function () {
			for(var b in dg.wnd.buttons.buttons){
				var btn = dg.wnd.buttons.buttons[b];
				if(b == "right")
					btn.title = $p.msg.align_node_right + " (" + Math.max(profile.x1, profile.x2) + ")";
				else if(b == "left")
					btn.title = $p.msg.align_node_left + " (" + Math.min(profile.x1, profile.x2) + ")";
				else if(b == "top")
					btn.title = $p.msg.align_node_top + " (" + Math.max(profile.y1, profile.y2) + ")";
				else if(b == "bottom")
					btn.title = $p.msg.align_node_bottom + " (" + Math.min(profile.y1, profile.y2) + ")";
			}
		};

		dg.after_update();

	};

	function clearSelectionBounds() {
		if (selectionBoundsShape)
			selectionBoundsShape.remove();
		selectionBoundsShape = null;
		selectionBounds = null;
	}

	function showSelectionBounds() {
		drawSelectionBounds++;
		if (drawSelectionBounds > 0) {
			if (selectionBoundsShape)
				selectionBoundsShape.visible = true;
		}
	}

	function hideSelectionBounds() {
		if (drawSelectionBounds > 0)
			drawSelectionBounds--;
		if (drawSelectionBounds == 0) {
			if (selectionBoundsShape)
				selectionBoundsShape.visible = false;
		}
	}

	function updateSelectionState() {
		clearSelectionBounds();
		//return;
		//selectionBounds = getSelectionBounds();
		//if (selectionBounds != null) {
		//	var rect =  new paper.Path.Rectangle(selectionBounds);
		//	//var color = scheme.activeLayer.getSelectedColor();
		//	rect.strokeColor = 'rgba(0,0,0,0)'; //color ? color : '#009dec';
		//	rect.strokeWidth = 1.0 / _view.zoom;
		//	//rect._boundsSelected = true;
		//	rect.selected = true;
		//	rect.setFullySelected(true);
		//	rect.guide = true;
		//	rect.visible = drawSelectionBounds > 0;
		//	//rect.transformContent = false;
		//	selectionBoundsShape = rect;
		//}
	}

	function purgeSelection(){
		var selected = _scheme.selectedItems, deselect = [];
		for (var i = 0; i < selected.length; i++) {
			var path = selected[i];
			if(path.parent instanceof Profile && path != path.parent.generatrix)
				deselect.push(path);
		}
		while(selected = deselect.pop())
			selected.selected = false;
	}

	/**
	 * Returns bounding box of all selected items
	 * @returns {paper.Rect}
	 */
	function getSelectionBounds() {
		var bounds = null;
		var selected = _scheme.selectedItems;
		for (var i = 0; i < selected.length; i++) {
			if (bounds == null)
				bounds = selected[i].bounds.clone();
			else
				bounds = bounds.unite(selected[i].bounds);
		}
		return bounds;
	}

	/**
	 * Returns all items intersecting the rect.
	 * Note: only the item outlines are tested
	 */
	function getPathsIntersectingRect(rect) {
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

		for (var i = 0, l = _scheme.layers.length; i < l; i++) {
			var layer = _scheme.layers[i];
			checkPathItem(layer);
		}

		boundingRect.remove();

		return paths;
	}

	/**
	 * Returns path points which are contained in the rect
	 * @param rect
	 * @returns {Array}
	 */
	function getSegmentsInRect(rect) {
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

		for (var i = _scheme.layers.length - 1; i >= 0; i--) {
			checkPathItem(_scheme.layers[i]);
		}

		return segments;
	}

	function setCanvasCursor(name) {
		for(var i=0; i<_scheme._canvas.classList.length; i++){
			var class_name = _scheme._canvas.classList[i];
			if(class_name == name)
				return;
			else if((/\bcursor-\S+/g).test(class_name))
				_scheme._canvas.classList.remove(class_name);
		}
		_scheme._canvas.classList.add(name);
	}

	// Returns serialized contents of selected items.
	function captureSelectionState() {
		var originalContent = [];
		var selected = _scheme.selectedItems;
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
	}

	// Restore the state of selected items.
	function restoreSelectionState(originalContent) {
		// TODO: could use findItemById() instead.
		for (var i = 0; i < originalContent.length; i++) {
			var orig = originalContent[i];
			var item = findItemById(orig.id);
			if (!item)
				continue;
			// HACK: paper does not retain item IDs after importJSON,
			// store the ID here, and restore after deserialization.
			var id = item.id;
			item.importJSON(orig.json);
			item._id = id;
		}
	}

	function findItemById(id) {
		if (id == -1) return null;
		function findItem(item) {
			if (item.id == id)
				return item;
			if (item.children) {
				for (var j = item.children.length-1; j >= 0; j--) {
					var it = findItem(item.children[j]);
					if (it != null)
						return it;
				}
			}
			return null;
		}

		for (var i = 0, l = _scheme.layers.length; i < l; i++) {
			var layer = _scheme.layers[i];
			var it = findItem(layer);
			if (it != null)
				return it;
		}
		return null;
	}

	/**
	 * Create pixel perfect dotted rectable for drag selections
	 * @param p1
	 * @param p2
	 * @return {exporters.CompoundPath}
	 */
	function dragRect(p1, p2) {
		var half = new paper.Point(0.5 / _view.zoom, 0.5 / _view.zoom);
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
		rect.strokeWidth = 1.0 / _view.zoom;
		rect.dashOffset = 0.5 / _view.zoom;
		rect.dashArray = [1.0 / _view.zoom, 1.0 / _view.zoom];
		rect.removeOn({
			drag: true,
			up: true
		});
		rect.guide = true;
		return rect;
	}

	function snapDeltaToAngle(delta, snapAngle) {
		var angle = Math.atan2(delta.y, delta.x);
		angle = Math.round(angle/snapAngle) * snapAngle;
		var dirx = Math.cos(angle);
		var diry = Math.sin(angle);
		var d = dirx*delta.x + diry*delta.y;
		return new paper.Point(dirx*d, diry*d);
	}

	/**
	 * Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
	 */
	function load_stamp(confirmed){

		if(_scheme.ox.elm_str && !confirmed){
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
			o: _scheme.ox,
			wnd: _scheme._pwnd,
			on_select: _scheme.load_stamp
		}, {
			initial_value: null, // TODO: возможно, надо запоминать типовой блок в изделии?
			parent: $p.wsql.get_user_param("base_blocks_folder") ? $p.wsql.get_user_param("base_blocks_folder") : null,
			owner: _scheme.ox.calc_order.base
		});
	}

}
