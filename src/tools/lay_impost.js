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
 * @extends ToolElement
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
			height: 420,
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
		tool.profile._metadata.fields.inset_by_y.choice_links = tool.profile._metadata.fields.inset_by_y.choice_links = [{
			name: ["selection",	"ref"],
			path: [
				function(o, f){
					if($p.utils.is_data_obj(o)){
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

		if(!tool.options.wnd.bounds_open){
			tool._grid.collapseKids(tool._grid.getRowById(
				tool._grid.getAllRowIds().split(",")[13]
			));
		}
		tool._grid.attachEvent("onOpenEnd", function(id,state){
			if(id == this.getAllRowIds().split(",")[13])
				tool.options.wnd.bounds_open = state > 0;
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
		tool._grid.getAllRowIds().split(",").forEach(function (id, ind) {
			if(id.match(/^\d+$/)){

				var cell = tool._grid.cells(id, 1);
				cell.cell.style.position = "relative";

				if(ind < 10){
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
				}else{
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
								{name: 'clear', text: '<i class="fa fa-trash-o"></i>', title: 'Очистить габариты', class_name: "md_otooolbar_grid_button"},
							],
							onclick: function () {
								tool.profile.w = tool.profile.h = 0;
							}
						})
					});
				}

				cell.cell.title = "";
			}

		});

		var wnd_options = tool.wnd.wnd_options;
		tool.wnd.wnd_options = function (opt) {
			wnd_options.call(tool.wnd, opt);

			for(var prop in tool.profile._metadata.fields) {
				if(prop.indexOf("step") == -1 && prop.indexOf("inset") == -1 && prop != "clr" && prop != "w" && prop != "h"){
					var val = tool.profile[prop];
					opt[prop] = $p.utils.is_data_obj(val) ? val.ref : val;
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
			this.on_activate('cursor-arrow-lay');
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

			if(this.profile.inset_by_y.empty() && this.profile.inset_by_x.empty())
				return;

			if(!this.hitItem && (tool.profile.elm_type == $p.enm.elm_types.Раскладка || !this.profile.w || !this.profile.h))
				return;

			this.check_layer();

			var layer = tool.hitItem ? tool.hitItem.layer : _editor.project.activeLayer,
				lgeneratics = layer.profiles.map(function (p) {
					return p.nearest() ? p.rays.outer : p.generatrix
				}),
				nprofiles = [];

			function n1(p) {
				return p.segments[0].point.add(p.segments[3].point).divide(2);
			}

			function n2(p) {
				return p.segments[1].point.add(p.segments[2].point).divide(2);
			}

			function check_inset(inset, pos){

				var nom = inset.nom(),
					rows = [];

				_editor.project._dp.sys.elmnts.each(function(row){
					if(row.nom.nom() == nom)
						rows.push(row);
				});

				for(var i=0; i<rows.length; i++){
					if(rows[i].pos == pos)
						return rows[i].nom;
				}

				return inset;
			}

			function rectification() {
				// получаем таблицу расстояний профилей от рёбер габаритов
				var bounds, ares = [],
					group = new paper.Group({ insert: false });

				function reverce(p) {
					var s = p.segments.map(function(s){return s.point.clone()})
					p.removeSegments();
					p.addSegments([s[1], s[0], s[3], s[2]]);
				}

				function by_side(name) {

					ares.sort(function (a, b) {
						return a[name] - b[name];
					});

					ares.forEach(function (p) {
						if(ares[0][name] == p[name]){
							var p1 = n1(p.profile),
								p2 = n2(p.profile),
								angle = p2.subtract(p1).angle.round(0);
							if(angle < 0)
								angle += 360;

							if(name == "left" && angle != 270){
								reverce(p.profile);
							}else if(name == "top" && angle != 0){
								reverce(p.profile);
							}else if(name == "right" && angle != 90){
								reverce(p.profile);
							}else if(name == "bottom" && angle != 180){
								reverce(p.profile);
							}

							if(name == "left" || name == "right")
								p.profile._inset = check_inset(tool.profile.inset_by_x, $p.enm.positions[name]);
							else
								p.profile._inset = check_inset(tool.profile.inset_by_y, $p.enm.positions[name]);
						}
					});

				}

				tool.paths.forEach(function (p) {
					if(p.segments.length)
						p.parent = group;
				});
				bounds = group.bounds;

				group.children.forEach(function (p) {
					ares.push({
						profile: p,
						left: Math.abs(n1(p).x + n2(p).x - bounds.left * 2),
						top: Math.abs(n1(p).y + n2(p).y - bounds.top * 2),
						bottom: Math.abs(n1(p).y + n2(p).y - bounds.bottom * 2),
						right: Math.abs(n1(p).x + n2(p).x - bounds.right * 2)
					});
				});

				["left","top","bottom","right"].forEach(by_side);
			}

			// уточним направления путей для витража
			if(!this.hitItem){
				rectification();
			}

			tool.paths.forEach(function (p) {

				var p1, p2, iter = 0, angle, proto = {clr: tool.profile.clr};

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

					p1 = n1(p);
					p2 = n2(p);

					// в зависимости от наклона разные вставки
					angle = p2.subtract(p1).angle;
					if((angle > -40 && angle < 40) || (angle > 180-40 && angle < 180+40)){
						proto.inset = p._inset || tool.profile.inset_by_y;
					}else{
						proto.inset = p._inset || tool.profile.inset_by_x;
					}

					if(tool.profile.elm_type == $p.enm.elm_types.Раскладка){

						nprofiles.push(new Onlay({
							generatrix: new paper.Path({
								segments: [p1, p2]
							}),
							parent: tool.hitItem,
							proto: proto
						}));

					}else{

						while (iter < 10){

							iter++;
							do_bind();
							angle = p2.subtract(p1).angle;
							var delta = Math.abs(angle % 90);

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
						if(p2.getDistance(p1) > proto.inset.nom().width)
							nprofiles.push(new Profile({
								generatrix: new paper.Path({
									segments: [p1, p2]
								}),
								parent: layer,
								proto: proto
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

			if(!this.hitItem)
				setTimeout(function () {
					_editor.tools[1].activate();
				}, 100);

		},

		mousemove: function(event) {

			this.hitTest(event);

			this.paths.forEach(function (p) {
				p.removeSegments();
			});

			if(this.profile.inset_by_y.empty() && this.profile.inset_by_x.empty())
				return;

			var bounds, gen, hit = !!this.hitItem;

			if(hit){
				bounds = this.hitItem.bounds;
				gen = this.hitItem.path;
			}else if(this.profile.w && this.profile.h) {
				gen = new paper.Path({
					insert: false,
					segments: [[0,0], [0, -this.profile.h], [this.profile.w, -this.profile.h], [this.profile.w, 0]],
					closed: true
				});
				bounds = gen.bounds;
				_editor.project.zoom_fit(_editor.project.strokeBounds.unite(bounds));

			}else
				return;

			var stepy = this.profile.step_by_y || (this.profile.elm_by_y && bounds.height / (this.profile.elm_by_y + ((hit || this.profile.elm_by_y < 2) ? 1 : -1))),
				county = this.profile.elm_by_y > 0 ? this.profile.elm_by_y.round(0) : Math.round(bounds.height / stepy) - 1,
				stepx = this.profile.step_by_x || (this.profile.elm_by_x && bounds.width / (this.profile.elm_by_x + ((hit || this.profile.elm_by_x < 2) ? 1 : -1))),
				countx = this.profile.elm_by_x > 0 ? this.profile.elm_by_x.round(0) : Math.round(bounds.width / stepx) - 1,
				w2x = this.profile.inset_by_x.nom().width / 2,
				w2y = this.profile.inset_by_y.nom().width / 2,
				clr = BuilderElement.clr_by_clr(this.profile.clr, false),
				by_x = [], by_y = [], base, pos, path, i, j, pts;

			function get_path() {
				base++;
				if(base < tool.paths.length){
					path = tool.paths[base];
					path.fillColor = clr;
					if(!path.isInserted())
						path.parent = tool.hitItem ? tool.hitItem.layer : _editor.project.activeLayer;
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
							get_path().addSegments([[pts.p1.x-w2x, pts.p1.y], [pts.p2.x-w2x, pts.p2.y], [pts.p2.x+w2x, pts.p2.y], [pts.p1.x+w2x, pts.p1.y]]);

					}else{
						by_y.sort(function (a,b) { return b-a; });
						for(j = 0; j < by_y.length; j++){

							if(j == 0){
								if(hit && (pts = get_points([by_x[i], bounds.bottom], [by_x[i], by_y[j]])))
									get_path().addSegments([[pts.p1.x-w2x, pts.p1.y], [pts.p2.x-w2x, pts.p2.y+w2x], [pts.p2.x+w2x, pts.p2.y+w2x], [pts.p1.x+w2x, pts.p1.y]]);

							}else{
								if(pts = get_points([by_x[i], by_y[j-1]], [by_x[i], by_y[j]]))
									get_path().addSegments([[pts.p1.x-w2x, pts.p1.y-w2x], [pts.p2.x-w2x, pts.p2.y+w2x], [pts.p2.x+w2x, pts.p2.y+w2x], [pts.p1.x+w2x, pts.p1.y-w2x]]);

							}

							if(j == by_y.length -1){
								if(hit && (pts = get_points([by_x[i], by_y[j]], [by_x[i], bounds.top])))
									get_path().addSegments([[pts.p1.x-w2x, pts.p1.y-w2x], [pts.p2.x-w2x, pts.p2.y], [pts.p2.x+w2x, pts.p2.y], [pts.p1.x+w2x, pts.p1.y-w2x]]);

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
							get_path().addSegments([[pts.p1.x, pts.p1.y-w2y], [pts.p2.x, pts.p2.y-w2y], [pts.p2.x, pts.p2.y+w2y], [pts.p1.x, pts.p1.y+w2y]]);

					}else{
						by_x.sort(function (a,b) { return a-b; });
						for(j = 0; j < by_x.length; j++){

							if(j == 0){
								if(hit && (pts = get_points([bounds.left, by_y[i]], [by_x[j], by_y[i]])))
									get_path().addSegments([[pts.p1.x, pts.p1.y-w2y], [pts.p2.x-w2y, pts.p2.y-w2y], [pts.p2.x-w2y, pts.p2.y+w2y], [pts.p1.x, pts.p1.y+w2y]]);

							}else{
								if(pts = get_points([by_x[j-1], by_y[i]], [by_x[j], by_y[i]]))
									get_path().addSegments([[pts.p1.x+w2y, pts.p1.y-w2y], [pts.p2.x-w2y, pts.p2.y-w2y], [pts.p2.x-w2y, pts.p2.y+w2y], [pts.p1.x+w2y, pts.p1.y+w2y]]);

							}

							if(j == by_x.length -1){
								if(hit && (pts = get_points([by_x[j], by_y[i]], [bounds.right, by_y[i]])))
									get_path().addSegments([[pts.p1.x+w2y, pts.p1.y-w2y], [pts.p2.x, pts.p2.y-w2y], [pts.p2.x, pts.p2.y+w2y], [pts.p1.x+w2y, pts.p1.y+w2y]]);

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

						if(pos + w2y + consts.sticking_l < bounds.bottom)
							by_y.push(pos);

						if(county % 2)
							pos = base - stepy * i;
						else
							pos = base - stepy / 2 - (i > 1 ? stepy * (i - 1) : 0);

						if(pos - w2y - consts.sticking_l > bounds.top)
							by_y.push(pos);
					}

				}else if(tool.profile.align_by_y == $p.enm.positions.Верх){

					if(hit){
						for(i = 1; i <= county; i++){
							pos = bounds.top + stepy * i;
							if(pos + w2y + consts.sticking_l < bounds.bottom)
								by_y.push(pos);
						}
					}else{
						for(i = 0; i < county; i++){
							pos = bounds.top + stepy * i;
							if(pos - w2y - consts.sticking_l < bounds.bottom)
								by_y.push(pos);
						}
					}

				}else if(tool.profile.align_by_y == $p.enm.positions.Низ){

					if(hit){
						for(i = 1; i <= county; i++){
							pos = bounds.bottom - stepy * i;
							if(pos - w2y - consts.sticking_l > bounds.top)
								by_y.push(bounds.bottom - stepy * i);
						}
					}else{
						for(i = 0; i < county; i++){
							pos = bounds.bottom - stepy * i;
							if(pos + w2y + consts.sticking_l > bounds.top)
								by_y.push(bounds.bottom - stepy * i);
						}
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

						if(pos + w2x + consts.sticking_l < bounds.right)
							by_x.push(pos);

						if(countx % 2)
							pos = base - stepx * i;
						else
							pos = base - stepx / 2 - (i > 1 ? stepx * (i - 1) : 0);

						if(pos - w2x - consts.sticking_l > bounds.left)
							by_x.push(pos);
					}

				}else if(tool.profile.align_by_x == $p.enm.positions.Лев){

					if(hit){
						for(i = 1; i <= countx; i++){
							pos = bounds.left + stepx * i;
							if(pos + w2x + consts.sticking_l < bounds.right)
								by_x.push(pos);
						}
					}else{
						for(i = 0; i < countx; i++){
							pos = bounds.left + stepx * i;
							if(pos - w2x - consts.sticking_l < bounds.right)
								by_x.push(pos);
						}
					}


				}else if(tool.profile.align_by_x == $p.enm.positions.Прав){

					if(hit){
						for(i = 1; i <= countx; i++){
							pos = bounds.right - stepx * i;
							if(pos - w2x - consts.sticking_l > bounds.left)
								by_x.push(pos);
						}
					}else{
						for(i = 0; i < countx; i++){
							pos = bounds.right - stepx * i;
							if(pos + w2x + consts.sticking_l > bounds.left)
								by_x.push(pos);
						}
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

}
ToolLayImpost._extend(ToolElement);
