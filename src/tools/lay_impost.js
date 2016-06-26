/**
 * Вставка раскладок и импостов
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_lay_impost
 */

function ToolLayImpost(){

	var _editor = paper,
		tool = this,
		sys;

	ToolLayImpost.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'lay_impost',
		wnd: {
			caption: "Импосты и раскладки",
			height: 340,
			width: 320
		}
	};

	// подключает окно редактора
	function tool_wnd(){

		sys = _editor.project._dp.sys;

		// создаём экземпляр обработки
		tool.profile = $p.dp.builder_lay_impost.create();

		// восстанавливаем сохранённые параметры
		$p.wsql.restore_options("editor", tool.options);
		for(var prop in tool.profile._metadata.fields) {
			if(tool.options.wnd.hasOwnProperty(prop))
				tool.profile[prop] = tool.options.wnd[prop];
		}

		// если в текущем слое есть профили, выбираем импост
		if(tool.profile.elm_type.empty())
			tool.profile.elm_type = $p.enm.elm_types.Импост;
		
		// вставку по умолчанию получаем эмулируя событие изменения типа элемента
		$p.dp.builder_lay_impost.handle_event(tool.profile, "value_change", {
			field: "elm_type"
		});

		// выравнивание по умолчанию
		if(tool.profile.align_by_width.empty())
			tool.profile.align_by_width = $p.enm.positions.Центр;
		if(tool.profile.align_by_height.empty())
			tool.profile.align_by_height = $p.enm.positions.Центр;

		// цвет по умолчанию
		if(tool.profile.clr.empty())
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
		tool.wnd.attachHeadFields({
			obj: tool.profile
		});

		var wnd_options = tool.wnd.wnd_options;
		tool.wnd.wnd_options = function (opt) {
			wnd_options.call(tool.wnd, opt);

			for(var prop in tool.profile._metadata.fields) {
				if(prop.indexOf("step") == -1 && prop != "inset" && prop != "clr"){
					var val = tool.profile[prop];
					opt[prop] = $p.is_data_obj(val) ? val.ref : val;
				}
			}
		};

	}


	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return this.hitTest(event);
	};

	tool.hitTest = function(event) {

		// Hit test items.
		tool.hitItem = _editor.project.hitTest(event.point, { fill: true, class: paper.Path });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Filling){
			_editor.canvas_cursor('cursor-lay-impost');

		} else {
			_editor.canvas_cursor('cursor-arrow-lay');
		}

		return true;
	};

	tool.detache_wnd = function(){
		if(this.wnd){

			if(this._grid && this._grid.destructor){
				if(this.wnd.detachObject)
					this.wnd.detachObject();
				delete this._grid;
			}

			if(this.wnd.wnd_options){
				this.wnd.wnd_options(this.options.wnd);
				$p.wsql.save_options("editor", this.options);
				this.wnd.close();
			}

			delete this.wnd;
		}
		this.profile = null;
	};

	tool.on({

		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-lay');

			tool_wnd();
		},

		deactivate: function() {

			_editor.clear_selection_bounds();

			tool.detache_wnd();
		},

		mousedown: function(event) {

			var b, e, r, contour;

			this.mode = null;
			this.changed = false;

			if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {

				this.mode = tool.hitItem.item.parent.generatrix;

				if (event.modifiers.control || event.modifiers.option){
					// при зажатом ctrl или alt строим правильную дугу

					b = this.mode.firstSegment.point;
					e = this.mode.lastSegment.point;
					r = (b.getDistance(e) / 2) + 0.01;
					contour = this.mode.layer;

					//do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw.bind(contour), 10);


				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					contour = this.mode.layer;

					this.mode.removeSegments(1);
					this.mode.firstSegment.linear = true;
					this.mode.lineTo(e);
					this.mode.parent.rays.clear();
					this.mode.selected = true;

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw.bind(contour), 10);

				} else {
					_editor.project.deselectAll();
					this.mode.selected = true;
					_editor.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = _editor.capture_selection_state();

				}

				//attache_dg(tool.hitItem.item.parent, tool.wnd);

			}else{
				//tool.detache_wnd();
				_editor.project.deselectAll();
			}
		},

		mouseup: function(event) {
			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
			}

			_editor.canvas_cursor('cursor-arrow-lay');

		},

		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				//do_arc(this.mode, event.point);


			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolLayImpost._extend(paper.Tool);
