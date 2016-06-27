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

	tool.mode = null;
	tool.hitItem = null;
	tool.paths = [];
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
		if(tool.profile.align_by_y.empty())
			tool.profile.align_by_y = $p.enm.positions.Центр;
		if(tool.profile.align_by_x.empty())
			tool.profile.align_by_x = $p.enm.positions.Центр;

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
		tool._grid = tool.wnd.attachHeadFields({
			obj: tool.profile
		});

		//
		if(!tool._grid_button_click)
			tool._grid_button_click = function (btn, bar) {
				tool.wnd.elmnts._btns.forEach(function (val, ind) {
					if(val.id == bar){
						var suffix = (ind == 0) ? "y" : "x";
						tool.profile["step_by_" + suffix] = 0;

						if(btn == "clear"){
							tool.profile["elm_by_" + suffix] = 0;

						}else if(btn == "del"){

							if(tool.profile["elm_by_" + suffix] > 0)
								tool.profile["elm_by_" + suffix] = tool.profile["elm_by_" + suffix] - 1;
							else if(tool.profile["elm_by_" + suffix] < 0)
								tool.profile["elm_by_" + suffix] = 0;

						}else if(btn == "add"){

							if(tool.profile["elm_by_" + suffix] < 1)
								tool.profile["elm_by_" + suffix] = 1;
							else
								tool.profile["elm_by_" + suffix] = tool.profile["elm_by_" + suffix] + 1;
						}

					}
				})
			};

		tool.wnd.elmnts._btns = [];
		tool._grid.getAllRowIds().split(",").forEach(function (id) {
			if(id.match(/^\d+$/)){

				var cell = tool._grid.cells(id, 1);
				cell.cell.style.position = "relative";
				
				tool.wnd.elmnts._btns.push({
					id: id,
					bar: new $p.iface.OTooolBar({
						wrapper: cell.cell,
						top: '0px',
						right: '1px',
						name: id,
						width: '80px',
						height: '20px',
						class_name: "",
						buttons: [
							{name: 'clear', text: '<i class="fa fa-trash-o"></i>', title: 'Очистить направление', class_name: "md_otooolbar_grid_button"},
							{name: 'del', text: '<i class="fa fa-minus-square-o"></i>', title: 'Удалить ячейку', class_name: "md_otooolbar_grid_button"},
							{name: 'add', text: '<i class="fa fa-plus-square-o"></i>', title: 'Добавить ячейку', class_name: "md_otooolbar_grid_button"}
						],
						onclick: tool._grid_button_click
					})
				});

				cell.cell.title = "";
			}

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

		tool.hitItem = null;

		// Hit test items.
		if (event.point)
			tool.hitItem = _editor.project.hitTest(event.point, { fill: true, class: paper.Path });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Filling){
			_editor.canvas_cursor('cursor-lay-impost');
			tool.hitItem = tool.hitItem.item.parent;

		} else {
			_editor.canvas_cursor('cursor-arrow-lay');
			tool.hitItem = null;
		}

		return true;
	};

	tool.detache_wnd = function(){
		if(this.wnd){

			tool.wnd.elmnts._btns.forEach(function (btn) {
				if(btn.bar && btn.bar.unload)
					btn.bar.unload();
			});

			if(this._grid && this._grid.destructor){
				if(this.wnd.detachObject)
					this.wnd.detachObject(true);
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

			tool.paths.forEach(function (p) {
				p.remove();
			});
			tool.paths.length = 0;

			tool.detache_wnd();
		},

		mouseup: function(event) {
			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
			}

			_editor.canvas_cursor('cursor-arrow-lay');

		},

		mousemove: function(event) {

			this.hitTest(event);

			tool.paths.forEach(function (p) {
				p.removeSegments();
			});

			if(!this.hitItem || tool.profile.inset.empty())
				return;

			var bounds = this.hitItem.bounds,
				stepy = tool.profile.step_by_y || (tool.profile.elm_by_y && bounds.height / (tool.profile.elm_by_y + 1)),
				county = tool.profile.elm_by_y > 0 ? tool.profile.elm_by_y.round(0) : Math.round(bounds.height / stepy) - 1,
				stepx = tool.profile.step_by_x || (tool.profile.elm_by_x && bounds.width / (tool.profile.elm_by_x + 1)),
				countx = tool.profile.elm_by_x > 0 ? tool.profile.elm_by_x.round(0) : Math.round(bounds.width / stepx) - 1,
				by_x = [], by_y = [], base, pos, path, i;

			if(stepy){
				if(tool.profile.align_by_y == $p.enm.positions.Центр){
					base = bounds.top + bounds.height / 2;
					if(county % 2){
						by_y.push(base);
					}
					for(i = 1; i < county; i++){

						if(county % 2)
							pos = base + stepy * i;
						else
							pos = base + stepy / 2 + (i > 1 ? stepy * (i - 1) : 0);

						if(pos + consts.sticking_l < bounds.bottom)
							by_y.push(pos);

						if(county % 2)
							pos = base - stepy * i;
						else
							pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

						if(pos - consts.sticking_l > bounds.top)
							by_y.push(pos);
					}

				}else if(tool.profile.align_by_y == $p.enm.positions.Верх){

					for(i = 1; i <= county; i++){
						by_y.push(bounds.top + stepy * i);
					}


				}else if(tool.profile.align_by_y == $p.enm.positions.Низ){
					for(i = 1; i <= county; i++){
						by_y.push(bounds.bottom - stepy * i);
					}

				}
			}

			if(stepx){
				if(tool.profile.align_by_x == $p.enm.positions.Центр)
					by_x.push(bounds.left + bounds.width / 2);

				else if(tool.profile.align_by_x == $p.enm.positions.Лев)
					by_x.push(bounds.left + stepx);

				else if(tool.profile.align_by_x == $p.enm.positions.Прав)
					by_x.push(bounds.right - stepx);
			}

			for(i = 0; i < by_y.length; i++){

				if(i < tool.paths.length)
					path = tool.paths[i];

				else{
					path = new paper.Path({
						strokeColor: 'black',
						fillColor: 'white',
						strokeScaling: false,
						guide: true,
						closed: true
					});
					tool.paths.push(path);
				}

				path.addSegments([[bounds.left, by_y[i] - 10], [bounds.right, by_y[i] - 10], [bounds.right, by_y[i] + 10], [bounds.left, by_y[i] + 10]]);

			}

			for(i = 0; i < by_x.length; i++){

				if(i + by_y.length < tool.paths.length)
					path = tool.paths[i + by_y.length];

				else{
					path = new paper.Path({
						strokeColor: 'black',
						fillColor: 'white',
						strokeScaling: false,
						guide: true,
						closed: true
					});
					tool.paths.push(path);
				}

				path.addSegments([[by_x[i] - 10, bounds.bottom], [by_x[i] - 10, bounds.top], [by_x[i] + 10, bounds.top], [by_x[i] + 10, bounds.bottom]]);

			}


		}
	});

	return tool;


}
ToolLayImpost._extend(paper.Tool);
