/**
 * Добавление (рисование) профилей
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_pen
 */

function ToolPen(){

	var _editor = paper,
		tool = this,
		on_layer_activated,
		on_scheme_changed,
		sys;

	ToolPen.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.start_binded = false;

	tool.options = {
		name: 'pen',
		wnd: {
			caption: "Новый сегмент профиля",
			width: 320,
			height: 240,
			bind_generatrix: true,
			bind_node: false,
			inset: "",
			clr: ""
		}
	};

	// подключает окно редактора
	function tool_wnd(){

		sys = _editor.project._dp.sys;

		var rama_impost = sys.inserts([$p.enm.elm_types.Рама, $p.enm.elm_types.Импост, $p.enm.elm_types.Раскладка]);

		// создаём экземпляр обработки
		tool.profile = $p.dp.builder_pen.create();

		// восстанавливаем сохранённые параметры
		$p.wsql.restore_options("editor", tool.options);
		["elm_type","inset","bind_generatrix","bind_node"].forEach(function (prop) {
			if(prop == "bind_generatrix" || prop == "bind_node" || tool.options.wnd[prop])
				tool.profile[prop] = tool.options.wnd[prop];
		});

		// вставка по умолчанию
		if(rama_impost.length){
			
			// если в текущем слое есть профили, выбираем импост
			if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Рама) &&
					_editor.project.activeLayer instanceof Contour && _editor.project.activeLayer.profiles.length)
				tool.profile.elm_type = $p.enm.elm_types.Импост;
				
			else if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Импост) &&
				_editor.project.activeLayer instanceof Contour && !_editor.project.activeLayer.profiles.length)
				tool.profile.elm_type = $p.enm.elm_types.Рама;

			tool.profile.inset = _editor.project.default_inset({elm_type: tool.profile.elm_type});
			
		}else
			tool.profile.inset = $p.blank.guid;

		// цвет по умолчанию
		tool.profile.clr = _editor.project.clr;

		// параметры отбора для выбора вставок
		tool.profile._metadata.fields.inset.choice_links = [{
			name: ["selection",	"ref"],
			path: [
				function(o, f){
					if($p.is_data_obj(o)){
						return rama_impost.indexOf(o) != -1;

					}else{
						var refs = "";
						rama_impost.forEach(function (o) {
							if(refs)
								refs += ", ";
							refs += "'" + o.ref + "'";
						});
						return "_t_.ref in (" + refs + ")";
					}
				}]
		}];

		tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);
		tool.wnd.attachHeadFields({
			obj: tool.profile
		});

		var wnd_options = tool.wnd.wnd_options;
		tool.wnd.wnd_options = function (opt) {
			wnd_options.call(tool.wnd, opt);
			opt.bind_generatrix = tool.profile.bind_generatrix;
			opt.bind_node = tool.profile.bind_node;
		}

	}

	// делает полупрозрачными элементы неактивных контуров
	function decorate_layers(reset){
		var active = _editor.project.activeLayer;
		_editor.project.getItems({class: Contour}).forEach(function (l) {
			l.children.forEach(function(elm){
				if(!(elm instanceof Contour))
					elm.opacity = (l == active || reset) ? 1 : 0.5;
			});
		})
	}
	
	tool.hitTest = function(event) {
		// var hitSize = 4.0; // / view.zoom;
		var hitSize = 4;
		tool.hitItem = null;

		// Hit test items.
		if (event.point)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			_editor.canvas_cursor('cursor-pen-adjust');
		} else {
			_editor.canvas_cursor('cursor-pen-freehand');
		}

		return true;
	};
	tool.on({

		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-pen-freehand');

			if(!_editor.project.contours.length){

				// создаём пустой новый слой
				new Contour( {parent: undefined});

				// оповещаем мир о новых слоях
				Object.getNotifier(_editor.project._noti).notify({
					type: 'rows',
					tabular: "constructions"
				});

			}

			if(_editor.project._dp.sys.empty()){
				$p.msg.show_msg({
					type: "alert-warning",
					text: $p.msg.bld_not_sys,
					title: $p.msg.bld_title
				});
			}

			tool_wnd();

			if(!on_layer_activated)
				on_layer_activated = $p.eve.attachEvent("layer_activated", function (contour) {
					if(contour.project == _editor.project){
						decorate_layers();
					}
				});

			// при изменении системы, переоткрываем окно доступных вставок
			if(!on_scheme_changed)
				on_scheme_changed = $p.eve.attachEvent("scheme_changed", function (scheme) {
				if(scheme == _editor.project && sys != scheme._dp.sys){

					delete tool.profile._metadata.fields.inset.choice_links;
					tool.detache_wnd();
					tool_wnd();

				}
			});

			decorate_layers();

		},

		deactivate: function() {
			_editor.clear_selection_bounds();

			if(on_layer_activated){
				$p.eve.detachEvent(on_layer_activated);
				on_layer_activated = null;
			}

			if(on_scheme_changed){
				$p.eve.detachEvent(on_scheme_changed);
				on_scheme_changed = null;
			}

			decorate_layers(true);

			delete tool.profile._metadata.fields.inset.choice_links;

			tool.detache_wnd();

		},

		mousedown: function(event) {

			_editor.project.deselectAll();
			this.mode = 'continue';
			this.start_binded = false;
			this.mouseStartPos = event.point.clone();

		},

		mouseup: function(event) {

			_editor.canvas_cursor('cursor-pen-freehand');

			if (this.mode && this.path) {

				// Рисуем профиль
				new Profile({generatrix: this.path, proto: this.profile});
				this.mode = null;
				this.path = null;

			}else if (this.hitItem && this.hitItem.item) {

				var item = this.hitItem.item;
				this.mode = null;
				this.path = null;

				// TODO: Выделяем элемент, если он подходящего типа
				if(item.parent instanceof Profile && item.parent.isInserted()){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					item.parent.generatrix.selected = true;

				}else if(item instanceof Filling && item.visible){
					item.attache_wnd(paper._acc.elm.cells("a"));
					item.selected = true;
				}

				if(item.selected && item.layer)
					item.layer.activate();

			}

		},

		mousedrag: function(event) {

			var delta = event.point.subtract(this.mouseStartPos),
				dragIn = false,
				dragOut = false,
				invert = false,
				handlePos;

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
				var i, res, element, bind = this.profile.bind_node ? "node_" : "";

				if(this.profile.bind_generatrix)
					bind += "generatrix";

				if (invert)
					delta = delta.negate();

				if (dragIn && dragOut) {
					handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);
					this.currentSegment.handleOut = handlePos;
					this.currentSegment.handleIn = handlePos.negate();
				} else if (dragOut) {
					// upzp

					if (event.modifiers.shift) {
						delta = _editor.snap_to_angle(delta, Math.PI*2/8);
					}

					if(this.path.segments.length > 1)
						this.path.lastSegment.point = this.mouseStartPos.add(delta);
					else
						this.path.add(this.mouseStartPos.add(delta));

					// попытаемся привязать концы пути к профилям контура
					if(!this.start_binded){
						res = {distance: 10e9};
						for(i in _editor.project.activeLayer.children){
							element = _editor.project.activeLayer.children[i];
							if (element instanceof Profile &&
								_editor.project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
								this.path.firstSegment.point = res.point;
								break;
							}
						}
						this.start_binded = true;
					}
					res = {distance: 10e9};
					for(i in _editor.project.activeLayer.children){
						element = _editor.project.activeLayer.children[i];
						if (element instanceof Profile &&
							_editor.project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
							this.path.lastSegment.point = res.point;
							break;
						}
					}



					//this.currentSegment.handleOut = handlePos;
					//this.currentSegment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);
					this.currentSegment.handleIn = handlePos;
					this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}
				this.path.selected = true;
			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		},

		keydown: function(event) {

			// удаление сегмента или элемента
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				paper.project.selectedItems.forEach(function (path) {
					if(path.parent instanceof Profile){
						path = path.parent;
						path.removeChildren();
						path.remove();
					}
				});

				this.mode = null;
				this.path = null;

				event.stop();
				return false;
			}
		}
	});

	return tool;


}
ToolPen._extend(ToolElement);
