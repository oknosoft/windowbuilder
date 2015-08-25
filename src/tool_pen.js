/**
 * Добавление (рисование) профилей
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_pen
 */

function ToolPen(){

	var _editor = paper,
		tool = this;

	ToolPen.superclass.constructor.call(this);

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

		tool.wnd = $p.iface.dat_gui(_editor._dxw, tool.options.wnd);

		tool.wnd.add(profile, 'nom', {pos: "hidden", title: "Материал профиля"}).onChange(function(c){
			if(opened)
				return;
			opened = true;
			$p.cat.nom.form_selection({
				o: profile,
				wnd: _editor._pwnd,
				on_select: function (v) {
					if(v!==undefined)
						profile.nom = v;
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
				wnd: _editor._pwnd,
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

		tool.wnd.add(profile, 'bind_generatrix', {caption: "Магнит к профилю", pos: "before"});

		tool.wnd.add(profile, 'bind_node', {caption: "Магнит к узлам", pos: "before"});
	}

	function decorate_layers(reset){
		var al = _editor.project.activeLayer;
		_editor.project.layers.forEach(function (l) {
			if(l == al)
				l.opacity = 1;
			else
				l.opacity = reset ? 1 : 0.3;
		})
	}

	function observer(changes){
		changes.forEach(function(change){
			if(change.name == "_activeLayer")
				decorate_layers();
		});
	}

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
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

			tool_wnd();

			Object.observe(_editor.project, observer);

			decorate_layers();

		},
		deactivate: function() {
			_editor.clear_selection_bounds();

			Object.unobserve(_editor.project, observer);

			decorate_layers(true);

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
				new Profile({generatrix: this.path, proto: tool.options});
				this.mode = null;
				this.path = null;
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
				var i, res, element, bind = this.options.bind_node ? "node_" : "";

				if(this.options.bind_generatrix)
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
		}
	});

	return tool;


}
ToolPen._extend(paper.Tool);
