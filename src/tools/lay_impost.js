/**
 * ### Вставка раскладок и импостов
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 25.08.2015
 * 
 * @module tools
 * @submodule tool_lay_impost
 */

/**
 * ### Вставка раскладок и импостов
 * 
 * @class ToolLayImpost
 * @extends paper.Tool
 * @constructor
 * @menuorder 55
 * @tooltip Импосты и раскладки
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

			_editor.canvas_cursor('cursor-arrow-lay');

			if(!this.hitItem || this.profile.inset.empty())
				return;

			var layer = tool.hitItem.layer,
				lgeneratics = layer.profiles.map(function (p) {
					return p.nearest() ? p.rays.outer : p.generatrix
				}),
				nprofiles = [];

			tool.paths.forEach(function (p) {

				var p1, p2, iter = 0;

				function do_bind() {

					var correctedp1 = false,
						correctedp2 = false;

					// пытаемся вязать к профилям контура
					lgeneratics.forEach(function (gen) {
						var np = gen.getNearestPoint(p1);
						if(!correctedp1 && np.getDistance(p1) < consts.sticking){
							correctedp1 = true;
							p1 = np;
						}
						np = gen.getNearestPoint(p2);
						if(!correctedp2 && np.getDistance(p2) < consts.sticking){
							correctedp2 = true;
							p2 = np;
						}
					});

					// если не привязалось - ищем точки на вновь добавленных профилях
					if(tool.profile.split != $p.enm.lay_split_types.КрестВСтык && (!correctedp1 || !correctedp2)){
						nprofiles.forEach(function (p) {
							var np = p.generatrix.getNearestPoint(p1);
							if(!correctedp1 && np.getDistance(p1) < consts.sticking){
								correctedp1 = true;
								p1 = np;
							}
							np = p.generatrix.getNearestPoint(p2);
							if(!correctedp2 && np.getDistance(p2) < consts.sticking){
								correctedp2 = true;
								p2 = np;
							}
						});
					}
				}

				p.remove();
				if(p.segments.length){

					p1 = p.segments[0].point.add(p.segments[3].point).divide(2);
					p2 = p.segments[1].point.add(p.segments[2].point).divide(2);


					if(tool.profile.elm_type == $p.enm.elm_types.Раскладка){
						nprofiles.push(new Onlay({
							generatrix: new paper.Path({
								segments: [p1, p2]
							}),
							parent: tool.hitItem,
							proto: tool.profile
						}));

					}else{

						while (iter < 10){

							iter++;
							do_bind();
							var angle = p2.subtract(p1).angle,
								delta = Math.abs(angle % 90);

							if(delta > 45)
								delta -= 90;

							if(delta < 0.02)
								break;

							if(angle > 180)
								angle -= 180;
							else if(angle < 0)
								angle += 180;

							if((angle > -40 && angle < 40) || (angle > 180-40 && angle < 180+40)){
								p1.y = p2.y = (p1.y + p2.y) / 2;

							}else if((angle > 90-40 && angle < 90+40) || (angle > 270-40 && angle < 270+40)){
								p1.x = p2.x = (p1.x + p2.x) / 2;

							}else
								break;
						}

						// создаём новые профили
						if(p2.getDistance(p1) > tool.profile.inset.nom().width)
							nprofiles.push(new Profile({
								generatrix: new paper.Path({
									segments: [p1, p2]
								}),
								parent: layer,
								proto: tool.profile
							}));
					}
				}
			});
			tool.paths.length = 0;

			// пытаемся выполнить привязку
			nprofiles.forEach(function (p) {
				var bcnn = p.cnn_point("b"),
					ecnn = p.cnn_point("e");
			});


		},

		mousemove: function(event) {

			this.hitTest(event);

			this.paths.forEach(function (p) {
				p.removeSegments();
			});

			if(!this.hitItem || this.profile.inset.empty())
				return;

			var bounds = this.hitItem.bounds,
				gen = this.hitItem.path,
				stepy = this.profile.step_by_y || (this.profile.elm_by_y && bounds.height / (this.profile.elm_by_y + 1)),
				county = this.profile.elm_by_y > 0 ? this.profile.elm_by_y.round(0) : Math.round(bounds.height / stepy) - 1,
				stepx = this.profile.step_by_x || (this.profile.elm_by_x && bounds.width / (this.profile.elm_by_x + 1)),
				countx = this.profile.elm_by_x > 0 ? this.profile.elm_by_x.round(0) : Math.round(bounds.width / stepx) - 1,
				w2 = this.profile.inset.nom().width / 2, clr = BuilderElement.clr_by_clr(this.profile.clr, false),
				by_x = [], by_y = [], base, pos, path, i, j, pts;

			function get_path() {
				base++;
				if(base < tool.paths.length){
					path = tool.paths[base];
					path.fillColor = clr;
					if(!path.isInserted())
						path.parent = tool.hitItem.layer;
				}else{
					path = new paper.Path({
						strokeColor: 'black',
						fillColor: clr,
						strokeScaling: false,
						guide: true,
						closed: true
					});
					tool.paths.push(path);
				}
				return path;
			}

			function get_points(p1, p2) {

				var res = {
					p1: new paper.Point(p1),
					p2: new paper.Point(p2)
				},
					c1 = gen.contains(res.p1),
					c2 = gen.contains(res.p2);

				if(c1 && c2)
					return res;

				var intersect = gen.getIntersections(new paper.Path({ insert: false, segments: [res.p1, res.p2] }));

				if(c1){
					intersect.reduce(function (sum, curr) {
						var dist = sum.point.getDistance(curr.point);
						if(dist < sum.dist){
							res.p2 = curr.point;
							sum.dist = dist;
						}
						return sum;
					}, {dist: Infinity, point: res.p2});
				}else if(c2){
					intersect.reduce(function (sum, curr) {
						var dist = sum.point.getDistance(curr.point);
						if(dist < sum.dist){
							res.p1 = curr.point;
							sum.dist = dist;
						}
						return sum;
					}, {dist: Infinity, point: res.p1});
				}else if(intersect.length > 1){
					intersect.reduce(function (sum, curr) {
						var dist = sum.point.getDistance(curr.point);
						if(dist < sum.dist){
							res.p2 = curr.point;
							sum.dist = dist;
						}
						return sum;
					}, {dist: Infinity, point: res.p2});
					intersect.reduce(function (sum, curr) {
						var dist = sum.point.getDistance(curr.point);
						if(dist < sum.dist){
							res.p1 = curr.point;
							sum.dist = dist;
						}
						return sum;
					}, {dist: Infinity, point: res.p1});
				}else{
					return null;
				}

				return res;
			}

			function do_x() {
				for(i = 0; i < by_x.length; i++){

					// в зависимости от типа деления, рисуем прямые или разорванные отрезки
					if(!by_y.length || tool.profile.split.empty() ||
						tool.profile.split == $p.enm.lay_split_types.ДелениеГоризонтальных ||
						tool.profile.split == $p.enm.lay_split_types.КрестПересечение){

						if(pts = get_points([by_x[i], bounds.bottom], [by_x[i], bounds.top]))
							get_path().addSegments([[pts.p1.x-w2, pts.p1.y], [pts.p2.x-w2, pts.p2.y], [pts.p2.x+w2, pts.p2.y], [pts.p1.x+w2, pts.p1.y]]);

					}else{
						by_y.sort(function (a,b) { return b-a; });
						for(j = 0; j < by_y.length; j++){

							if(j == 0){
								if(pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]]))
									get_path().addSegments([[pts.p1.x-w2, pts.p1.y], [pts.p2.x-w2, pts.p2.y+w2], [pts.p2.x+w2, pts.p2.y+w2], [pts.p1.x+w2, pts.p1.y]]);

							}else{
								if(pts = get_points([by_x[i], by_y[j-1]], [by_x[i], by_y[j]]))
									get_path().addSegments([[pts.p1.x-w2, pts.p1.y-w2], [pts.p2.x-w2, pts.p2.y+w2], [pts.p2.x+w2, pts.p2.y+w2], [pts.p1.x+w2, pts.p1.y-w2]]);

							}

							if(j == by_y.length -1){
								if(pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top]))
									get_path().addSegments([[pts.p1.x-w2, pts.p1.y-w2], [pts.p2.x-w2, pts.p2.y], [pts.p2.x+w2, pts.p2.y], [pts.p1.x+w2, pts.p1.y-w2]]);

							}

						}
					}
				}
			}

			function do_y() {
				for(i = 0; i < by_y.length; i++){

					// в зависимости от типа деления, рисуем прямые или разорванные отрезки
					if(!by_x.length || tool.profile.split.empty() ||
						tool.profile.split == $p.enm.lay_split_types.ДелениеВертикальных ||
						tool.profile.split == $p.enm.lay_split_types.КрестПересечение){

						if(pts = get_points([bounds.left, by_y[i]], [bounds.right, by_y[i]]))
							get_path().addSegments([[pts.p1.x, pts.p1.y-w2], [pts.p2.x, pts.p2.y-w2], [pts.p2.x, pts.p2.y+w2], [pts.p1.x, pts.p1.y+w2]]);

					}else{
						by_x.sort(function (a,b) { return a-b; });
						for(j = 0; j < by_x.length; j++){

							if(j == 0){
								if(pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]]))
									get_path().addSegments([[pts.p1.x, pts.p1.y-w2], [pts.p2.x-w2, pts.p2.y-w2], [pts.p2.x-w2, pts.p2.y+w2], [pts.p1.x, pts.p1.y+w2]]);

							}else{
								if(pts = get_points([by_x[j-1], by_y[i]], [by_x[j], by_y[i]]))
									get_path().addSegments([[pts.p1.x+w2, pts.p1.y-w2], [pts.p2.x-w2, pts.p2.y-w2], [pts.p2.x-w2, pts.p2.y+w2], [pts.p1.x+w2, pts.p1.y+w2]]);

							}

							if(j == by_x.length -1){
								if(pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]]))
									get_path().addSegments([[pts.p1.x+w2, pts.p1.y-w2], [pts.p2.x, pts.p2.y-w2], [pts.p2.x, pts.p2.y+w2], [pts.p1.x+w2, pts.p1.y+w2]]);

							}

						}
					}
				}
			}

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

						if(pos + w2 + consts.sticking_l < bounds.bottom)
							by_y.push(pos);

						if(county % 2)
							pos = base - stepy * i;
						else
							pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

						if(pos - w2 - consts.sticking_l > bounds.top)
							by_y.push(pos);
					}

				}else if(tool.profile.align_by_y == $p.enm.positions.Верх){

					for(i = 1; i <= county; i++){
						pos = bounds.top + stepy * i;
						if(pos + w2 + consts.sticking_l < bounds.bottom)
							by_y.push(pos);
					}
				}else if(tool.profile.align_by_y == $p.enm.positions.Низ){

					for(i = 1; i <= county; i++){
						pos = bounds.bottom - stepy * i;
						if(pos - w2 - consts.sticking_l > bounds.top)
							by_y.push(bounds.bottom - stepy * i);
					}
				}
			}

			if(stepx){
				if(tool.profile.align_by_x == $p.enm.positions.Центр){

					base = bounds.left + bounds.width / 2;
					if(countx % 2){
						by_x.push(base);
					}
					for(i = 1; i < countx; i++){

						if(countx % 2)
							pos = base + stepx * i;
						else
							pos = base + stepx / 2 + (i > 1 ? stepx * (i - 1) : 0);

						if(pos + w2 + consts.sticking_l < bounds.right)
							by_x.push(pos);

						if(countx % 2)
							pos = base - stepx * i;
						else
							pos = base - stepx / 2 - (i > 1 ? stepx * (i - 1) : 0);

						if(pos - w2 - consts.sticking_l > bounds.left)
							by_x.push(pos);
					}

				}else if(tool.profile.align_by_x == $p.enm.positions.Лев){

					for(i = 1; i <= countx; i++){
						pos = bounds.left + stepx * i;
						if(pos + w2 + consts.sticking_l < bounds.right)
							by_x.push(pos);
					}

				}else if(tool.profile.align_by_x == $p.enm.positions.Прав){

					for(i = 1; i <= countx; i++){
						pos = bounds.right - stepx * i;
						if(pos - w2 - consts.sticking_l > bounds.left)
							by_x.push(pos);
					}
				}
			}

			base = 0;
			if(tool.profile.split == $p.enm.lay_split_types.ДелениеВертикальных){
				do_y();
				do_x();
			}else{
				do_x();
				do_y();
			}

		}
	});

	return tool;


}
ToolLayImpost._extend(paper.Tool);
