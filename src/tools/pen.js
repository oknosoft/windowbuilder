/**
 * ### Добавление (рисование) профилей
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_pen
 */

/**
 * ### Добавление (рисование) профилей
 *
 * @class ToolPen
 * @extends ToolElement
 * @constructor
 * @menuorder 54
 * @tooltip Рисование
 */
function ToolPen(){

	var _editor = paper,
		tool = this,
		on_layer_activated,
		on_scheme_changed,
		sys;

	ToolPen.superclass.constructor.call(this);

	tool.point1 = new paper.Point();
	tool.last_profile = null;
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
		
		// создаём экземпляр обработки
		tool.profile = $p.dp.builder_pen.create();
		
		// восстанавливаем сохранённые параметры
		$p.wsql.restore_options("editor", tool.options);
		["elm_type","inset","bind_generatrix","bind_node"].forEach(function (prop) {
			if(prop == "bind_generatrix" || prop == "bind_node" || tool.options.wnd[prop])
				tool.profile[prop] = tool.options.wnd[prop];
		});

		// если в текущем слое есть профили, выбираем импост
		if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Рама) &&
			_editor.project.activeLayer instanceof Contour && _editor.project.activeLayer.profiles.length)
			tool.profile.elm_type = $p.enm.elm_types.Импост;

		else if((tool.profile.elm_type.empty() || tool.profile.elm_type == $p.enm.elm_types.Импост) &&
			_editor.project.activeLayer instanceof Contour && !_editor.project.activeLayer.profiles.length)
			tool.profile.elm_type = $p.enm.elm_types.Рама;

		// вставку по умолчанию получаем эмулируя событие изменения типа элемента
		$p.dp.builder_pen.handle_event(tool.profile, "value_change", {
			field: "elm_type"
		});

		// цвет по умолчанию
		tool.profile.clr = _editor.project.clr;

		// параметры отбора для выбора вставок
		tool.profile._metadata.fields.inset.choice_links = [{
			name: ["selection",	"ref"],
			path: [
				function(o, f){
					if($p.is_data_obj(o)){
						return tool.profile.rama_impost.indexOf(o) != -1;

					}else{
						var refs = "";
						tool.profile.rama_impost.forEach(function (o) {
							if(refs)
								refs += ", ";
							refs += "'" + o.ref + "'";
						});
						return "_t_.ref in (" + refs + ")";
					}
				}]
		}];

		// дополняем свойства поля цвет отбором по служебным цветам
		$p.cat.clrs.selection_exclude_service(tool.profile._metadata.fields.clr);

		tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);
		tool._grid = tool.wnd.attachHeadFields({
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
			l.opacity = (l == active || reset) ? 1 : 0.5;
		})

	}
	
	tool.hitTest = function(event) {

		var hitSize = 16;

		tool.addl_hit = null;
		tool.hitItem = null;

		if(tool.profile.elm_type == $p.enm.elm_types.Добор || tool.profile.elm_type == $p.enm.elm_types.Соединитель){


			// Hit test items.
			if (event.point)
				tool.hitItem = _editor.project.hitTest(event.point, { stroke:true, curves:true, tolerance: hitSize });

			if (tool.hitItem) {

				if(tool.hitItem.item.layer == _editor.project.activeLayer &&  tool.hitItem.item.parent instanceof ProfileItem && !(tool.hitItem.item.parent instanceof Onlay)){
					// для профиля, определяем внешнюю или внутреннюю сторону и ближайшее примыкание

					var hit = {
						point: tool.hitItem.point,
						profile: tool.hitItem.item.parent
					};

					// выясним, с какой стороны примыкает профиль
					if(hit.profile.rays.inner.getNearestPoint(event.point).getDistance(event.point, true) <
							hit.profile.rays.outer.getNearestPoint(event.point).getDistance(event.point, true))
						hit.side = "inner";
					else
						hit.side = "outer";
					
					// бежим по всем заполнениям и находим ребро
					hit.profile.layer.glasses(false, true).some(function (glass) {

						for(var i=0; i<glass.profiles.length; i++){
							var rib = glass.profiles[i];
							if(rib.profile == hit.profile && rib.sub_path && rib.sub_path.getNearestPoint(hit.point).is_nearest(hit.point, true)){

								if(hit.side == "outer" && rib.outer || hit.side == "inner" && !rib.outer){
									hit.rib = i;
									hit.glass = glass;
									return true;
								}
							}
						}
					});

					if(hit.glass){
						tool.addl_hit = hit;
						_editor.canvas_cursor('cursor-pen-adjust');
					}

				}else if(tool.hitItem.item.parent instanceof Filling){
					// для заполнения, ищем ребро и примыкающий профиль

					// tool.addl_hit = tool.hitItem;
					// _editor.canvas_cursor('cursor-pen-adjust');

				}else{
					_editor.canvas_cursor('cursor-pen-freehand');
				}

			} else {

				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });
				_editor.canvas_cursor('cursor-pen-freehand');
			}

		}else{
			// var hitSize = 4.0; // / view.zoom;
			hitSize = 6;

			// Hit test items.
			if (event.point)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });

			if(!tool.hitItem)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize  });

			if (tool.hitItem && tool.hitItem.item.parent instanceof ProfileItem
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
				_editor.canvas_cursor('cursor-pen-adjust');

			} else {
				_editor.canvas_cursor('cursor-pen-freehand');
			}
		}


		return true;
	};


	tool.on({

		activate: function() {

			this.on_activate('cursor-pen-freehand');

			this._controls = new PenControls(this);

			tool_wnd();

			if(!on_layer_activated)
				on_layer_activated = $p.eve.attachEvent("layer_activated", function (contour, virt) {

					if(!virt && contour.project == _editor.project && !_editor.project.data._loading && !_editor.project.data._snapshot){
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

			if(this.path){
				this.path.removeSegments();
				this.path.remove();
			}
			this.path = null;
			this.last_profile = null;
			this.mode = null;

			tool._controls.unload();

		},

		mousedown: function(event) {

			_editor.project.deselectAll();

			tool.last_profile = null;

			if(tool.profile.elm_type == $p.enm.elm_types.Добор || tool.profile.elm_type == $p.enm.elm_types.Соединитель){

				// для доборов и соединителей, создаём элемент, если есть addl_hit
				if(this.addl_hit){

				}

			}else{

				if(this.mode == 'continue'){
					// для профилей и раскладок, начинаем рисовать
					this.mode = 'create';
					this.start_binded = false;

				}
			}
		},

		mouseup: function(event) {

			_editor.canvas_cursor('cursor-pen-freehand');

			this.check_layer();

			var whas_select;

			if(this.addl_hit && this.addl_hit.glass && this.profile.elm_type == $p.enm.elm_types.Добор && !this.profile.inset.empty()){
				// рисуем доборный профиль
				new ProfileAddl({
					generatrix: this.addl_hit.generatrix,
					proto: this.profile,
					parent: this.addl_hit.profile,
					side: this.addl_hit.side
				});


			}else if(this.mode == 'create' && this.path) {

				if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

					// находим заполнение под линией
					_editor.project.activeLayer.glasses(false, true).some(function (glass) {

						if(glass.contains(this.path.firstSegment.point) && glass.contains(this.path.lastSegment.point)){
							new Onlay({
								generatrix: this.path,
								proto: this.profile,
								parent: glass
							});
							this.path = null;
							return true;
						}
						
					}.bind(this));



				}else{
					// Рисуем профиль
					this.last_profile = new Profile({generatrix: this.path, proto: this.profile});

				}

				this.path = null;

			}else if (this.hitItem && this.hitItem.item && (event.modifiers.shift || event.modifiers.control || event.modifiers.option)) {

				var item = this.hitItem.item;

				// TODO: Выделяем элемент, если он подходящего типа
				if(item.parent instanceof ProfileItem && item.parent.isInserted()){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					item.parent.generatrix.selected = true;
					whas_select = true;
					tool._controls.blur();

				}else if(item.parent instanceof Filling && item.parent.visible){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					item.selected = true;
					whas_select = true;
					tool._controls.blur();
				}

				if(item.selected && item.layer)
					item.layer.activate(true);

			}

			if(!whas_select && !this.mode && !this.addl_hit) {

				this.mode = 'continue';
				this.point1 = tool._controls.point;

				if (!this.path){
					this.path = new paper.Path({
						strokeColor: 'black',
						segments: [this.point1]
					});
					this.currentSegment = this.path.segments[0];
					this.originalHandleIn = this.currentSegment.handleIn.clone();
					this.originalHandleOut = this.currentSegment.handleOut.clone();
					this.currentSegment.selected = true;
				}
				this.start_binded = false;
				return;

			}

			if(this.path){
				this.path.remove();
				this.path = null;
			}				
			this.mode = null;

		},

		mousemove: function(event) {

			this.hitTest(event);

			// елси есть addl_hit - рисуем прототип элемента
			if(this.addl_hit && this.addl_hit.glass){

				if (!this.path){
					this.path = new paper.Path({
						strokeColor: 'black',
						fillColor: 'white',
						strokeScaling: false,
						guide: true
					});
				}

				this.path.removeSegments();

				// находим 2 точки на примыкающем профиле и 2 точки на предыдущем и последующем сегментах
				var profiles = this.addl_hit.glass.profiles,
					prev = this.addl_hit.rib==0 ? profiles[profiles.length-1] : profiles[this.addl_hit.rib-1],
					curr = profiles[this.addl_hit.rib],
					next = this.addl_hit.rib==profiles.length-1 ? profiles[0] : profiles[this.addl_hit.rib+1];

				var path_prev = prev.outer ? prev.profile.rays.outer : prev.profile.rays.inner,
					path_curr = curr.outer ? curr.profile.rays.outer : curr.profile.rays.inner,
					path_next = next.outer ? next.profile.rays.outer : next.profile.rays.inner;

				var p1 = path_curr.intersect_point(path_prev, curr.b),
					p2 = path_curr.intersect_point(path_next, curr.e),
					sub_path = path_curr.get_subpath(p1, p2);
					
				// рисуем внушнюю часть прототипа пути доборного профиля
				this.path.addSegments(sub_path.segments);

				// завершим рисование прототипа пути доборного профиля
				sub_path = sub_path.equidistant(-(this.profile.inset.nom().width || 20));
				sub_path.reverse();
				this.path.addSegments(sub_path.segments);
				sub_path.removeSegments();
				sub_path.remove();
				this.path.closePath();

				// получаем generatrix
				if(!this.addl_hit.generatrix){
					this.addl_hit.generatrix = new paper.Path({insert: false});
				}
				p1 = prev.profile.generatrix.getNearestPoint(p1);
				p2 = next.profile.generatrix.getNearestPoint(p2);
				this.addl_hit.generatrix.removeSegments();
				this.addl_hit.generatrix.addSegments(path_curr.get_subpath(p1, p2).segments);
				

			}else if(this.path){

				if(this.mode){

					var delta = event.point.subtract(this.point1),
						dragIn = false,
						dragOut = false,
						invert = false,
						handlePos;

					if (delta.length < consts.sticking)
						return;

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
								this.path.lastSegment.point = this.point1.add(delta);
							else
								this.path.add(this.point1.add(delta));

							// попытаемся привязать начало пути к профилям (и или заполнениям - для раскладок) контура
							if(!this.start_binded){

								if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

									res = Onlay.prototype.bind_node(this.path.firstSegment.point, _editor.project.activeLayer.glasses(false, true));
									if(res.binded)
										tool.path.firstSegment.point = tool.point1 = res.point;

								}else{

									res = {distance: Infinity};
									for(i in _editor.project.activeLayer.children){

										element = _editor.project.activeLayer.children[i];
										if (element instanceof Profile){

											// сначала смотрим на доборы, затем - на сам профиль
											if(element.children.some(function (addl) {
													if(addl instanceof ProfileAddl && _editor.project.check_distance(addl, null, res, tool.path.firstSegment.point, bind) === false){
														tool.path.firstSegment.point = tool.point1 = res.point;
														return true;
													}
												})){
												break;

											}else if (_editor.project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
												tool.path.firstSegment.point = tool.point1 = res.point;
												break;
											}
										}
									}
									this.start_binded = true;
								}
							}

							// попытаемся привязать конец пути к профилям (и или заполнениям - для раскладок) контура
							if(this.profile.elm_type == $p.enm.elm_types.Раскладка){

								res = Onlay.prototype.bind_node(this.path.lastSegment.point, _editor.project.activeLayer.glasses(false, true));
								if(res.binded)
									this.path.lastSegment.point = res.point;

							}else{

								res = {distance: Infinity};
								for(i = 0; i < _editor.project.activeLayer.children.length; i++){

									element = _editor.project.activeLayer.children[i];
									if (element instanceof Profile){

										// сначала смотрим на доборы, затем - на сам профиль
										if(element.children.some(function (addl) {
												if(addl instanceof ProfileAddl && _editor.project.check_distance(addl, null, res, tool.path.lastSegment.point, bind) === false){
													tool.path.lastSegment.point = res.point;
													return true;
												}
											})){
											break;

										}else if (_editor.project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
											this.path.lastSegment.point = res.point;
											break;

										}
									}
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

				}else{
					this.path.removeSegments();
					this.path.remove();
					this.path = null;
				}

				if(event.className != "ToolEvent"){
					_editor.project.register_update();
				}
			}

		},

		keydown: function(event) {

			// удаление сегмента или элемента
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				paper.project.selectedItems.forEach(function (path) {
					if(path.parent instanceof ProfileItem){
						path = path.parent;
						path.removeChildren();
						path.remove();
					}
				});

				this.mode = null;
				this.path = null;

				event.stop();
				return false;

			}else if(event.key == 'escape'){

				if(this.path){
					this.path.remove();
					this.path = null;
				}
				this.mode = null;
				this._controls.blur();
			}
		}
	});


}
ToolPen._extend(ToolElement);

/**
 * ### Элементы управления рядом с указателем мыши инструмента `ToolPen`
 *
 * @class PenControls
 * @constructor
 */
function PenControls(tool) {

	var _editor = paper,
		t = this;

	t._cont = document.createElement('div');
	
	function mousemove(event, ignore_pos) {

		var bounds = _editor.project.bounds,
			pos = ignore_pos || _editor.project.view.projectToView(event.point);

		if(!ignore_pos){
			t._cont.style.top = pos.y + 16 + "px";
			t._cont.style.left = pos.x - 20 + "px";

		}

		if(bounds){
			t._x.value = (event.point.x - bounds.x).toFixed(0);
			t._y.value = (bounds.height + bounds.y - event.point.y).toFixed(0);

			if(!ignore_pos){

				if(tool.path){
					t._l.value = tool.point1.getDistance(t.point).round(1);
					var angle = t.point.subtract(tool.point1).angle;
					if(angle < 0)
						angle = 360 + angle;
					t._a.value = angle.round(1);

				}else{
					t._l.value = 0;
					t._a.value = 0;
				}

			}

		}

	}
	
	function input_change() {
		
		switch(this.name) {

			case 'x':
			case 'y':
				setTimeout(function () {
					tool.emit("mousemove", {
						point: t.point,
						modifiers: {}
					});
				});
				break;

			case 'l':
			case 'a':

				if(!tool.path)
					return false;

				var p = new paper.Point();
				p.length = parseFloat(t._l.value || 0);
				p.angle = parseFloat(t._a.value || 0);
				p = tool.point1.add(p);

				mousemove({point: p}, true);

				input_change.call({name: "x"});
				break;
		} 
	}

	function create_click() {
		setTimeout(function () {
			tool.emit("mousedown", {
				modifiers: {}
			});
			setTimeout(function () {

				if(tool.mode == 'create' && tool.path){
					setTimeout(function () {
						if(tool.last_profile){
							mousemove({point: tool.last_profile.e}, true);
							tool.last_profile = null;
							create_click();
						}
					}, 50);
				}

				tool.emit("mouseup", {
					point: t.point,
					modifiers: {}
				});
			});
		});
	}

	_editor._wrapper.appendChild(t._cont);
	t._cont.className = "pen_cont";
	_editor.project.view.on('mousemove', mousemove);

	t._cont.innerHTML = "<table><tr><td>x:</td><td><input type='number' name='x' /></td><td>y:</td><td><input type='number' name='y' /></td></tr>" +
		"<tr><td>l:</td><td><input type='number' name='l' /></td><td>α:</td><td><input type='number' name='a' /></td></tr>" +
		"<tr><td colspan='4'><input type='button' name='click' value='Создать точку' /></td></tr></table>";

	t._x = t._cont.querySelector("[name=x]");
	t._y = t._cont.querySelector("[name=y]");
	t._l = t._cont.querySelector("[name=l]");
	t._a = t._cont.querySelector("[name=a]");

	t._x.onchange = input_change;
	t._y.onchange = input_change;
	t._l.onchange = input_change;
	t._a.onchange = input_change;

	t._cont.querySelector("[name=click]").onclick = create_click;
	
	this.unload = function () {
		_editor.project.view.off('mousemove', mousemove);
		_editor._wrapper.removeChild(t._cont);
		t._cont = null;
	}
}
PenControls.prototype.__define({

	point: {
		get: function () {
			var bounds = paper.project.bounds,
				x = parseFloat(this._x.value || 0) + (bounds ? bounds.x : 0),
				y = (bounds ? (bounds.height + bounds.y) : 0) - parseFloat(this._y.value || 0);
			return new paper.Point([x, y]);
		}
	},

	blur: {
		value: function () {
			var focused = document.activeElement;
			if(focused == this._x)
				this._x.blur();
			else if(focused == this._y)
				this._y.blur();
			else if(focused == this._l)
				this._l.blur();
			else if(focused == this._a)
				this._a.blur();
		}
	}
});
