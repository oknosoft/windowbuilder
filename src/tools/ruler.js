/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

/**
 * ### Относительное позиционирование и сдвиг
 * 
 * @class ToolRuler
 * @extends ToolElement
 * @constructor
 * @menuorder 57
 * @tooltip Позиция и сдвиг
 */
function ToolRuler(){

	ToolRuler.superclass.constructor.call(this);

	this.mouseStartPos = new paper.Point();
	this.hitItem = null;
	this.hitPoint = null;
	this.changed = false;
	this.minDistance = 10;
	this.selected = {
		a: [],
		b: []
	};

	this.options = {
		name: 'ruler',
		mode: 0,
		wnd: {
			caption: "Размеры и сдвиг",
			height: 200
		}
	};

	var modes = ["Элементы","Узлы","Новая линия","Новая линия узел2"];
	this.__define({
		mode: {
			get: function () {
				return this.options.mode || 0;
			},
			set: function (v) {
				paper.project.deselectAll();
				this.options.mode = parseInt(v);
			}
		}
	});


	this.hitTest = function(event) {

		this.hitItem = null;
		this.hitPoint = null;

		if (event.point){

			// ловим профили, а точнее - заливку путей
			this.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: 10 });

			// Hit test points
			var hit = paper.project.hitPoints(event.point, 20);
			if (hit && hit.item.parent instanceof ProfileItem){
				this.hitItem = hit;
			}
		}

		if (this.hitItem && this.hitItem.item.parent instanceof ProfileItem) {

			if(this.mode){
				var elm = this.hitItem.item.parent,
					corn = elm.corns(event.point);

				if(corn.dist < consts.sticking){
					paper.canvas_cursor('cursor-arrow-white-point');
					this.hitPoint = corn;
					elm.select_corn(event.point);
				}
				else
					paper.canvas_cursor('cursor-arrow-ruler');
			}

		} else {
			if(this.mode)
				paper.canvas_cursor('cursor-text-select');
			else
				paper.canvas_cursor('cursor-arrow-ruler-light');
			this.hitItem = null;
		}

		return true;
	};

	this.remove_path = function () {
		if (this.path){
			this.path.removeSegments();
			this.path.remove();
			this.path = null;
		}

		if (this.path_text){
			this.path_text.remove();
			this.path_text = null;
		}
	};

	this.on({

		activate: function() {

			this.selected.a.length = 0;
			this.selected.b.length = 0;

			this.on_activate('cursor-arrow-ruler-light');

			paper.project.deselectAll();
			this.wnd = new RulerWnd(this.options, this);
			this.wnd.size = 0;
		},

		deactivate: function() {

			this.remove_path();

			this.detache_wnd();

		},

		mousedown: function(event) {

			if (this.hitItem) {

				if(this.mode > 1 && this.hitPoint){

					if(this.mode == 2){

						this.selected.a.push(this.hitPoint);

						if (!this.path){
							this.path = new paper.Path({
								parent: this.hitPoint.profile.layer.l_dimensions,
								segments: [this.hitPoint.point, event.point]
							});
							this.path.strokeColor = 'black';
						}

						this.mode = 3;

					}else {

						this.remove_path();

						this.selected.b.push(this.hitPoint);
						
						// создаём размерную линию
						new DimensionLineCustom({
							elm1: this.selected.a[0].profile,
							elm2: this.hitPoint.profile,
							p1: this.selected.a[0].point_name,
							p2: this.hitPoint.point_name,
							parent: this.hitPoint.profile.layer.l_dimensions
						});

						this.mode = 2;

						this.hitPoint.profile.project.register_change(true);

					}

				}else{

					var item = this.hitItem.item.parent;

					if (paper.Key.isDown('1') || paper.Key.isDown('a')) {

						item.path.selected = true;

						if(this.selected.a.indexOf(item) == -1)
							this.selected.a.push(item);

						if(this.selected.b.indexOf(item) != -1)
							this.selected.b.splice(this.selected.b.indexOf(item), 1);

					} else if (paper.Key.isDown('2') || paper.Key.isDown('b') ||
						event.modifiers.shift || (this.selected.a.length && !this.selected.b.length)) {

						item.path.selected = true;

						if(this.selected.b.indexOf(item) == -1)
							this.selected.b.push(item);

						if(this.selected.a.indexOf(item) != -1)
							this.selected.a.splice(this.selected.a.indexOf(item), 1);

					}else {
						paper.project.deselectAll();
						item.path.selected = true;
						this.selected.a.length = 0;
						this.selected.b.length = 0;
						this.selected.a.push(item);
					}

					// Если выделено 2 элемента, рассчитаем сдвиг
					if(this.selected.a.length && this.selected.b.length){
						if(this.selected.a[0].orientation == this.selected.b[0].orientation){
							if(this.selected.a[0].orientation == $p.enm.orientations.Вертикальная){
								this.wnd.size = Math.abs(this.selected.a[0].b.x - this.selected.b[0].b.x);

							}else if(this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная){
								this.wnd.size = Math.abs(this.selected.a[0].b.y - this.selected.b[0].b.y);

							}else{
								// для наклонной ориентации используем interiorpoint

							}
						}

					}else if(this.wnd.size != 0)
						this.wnd.size = 0;
				}

			}else {

				this.remove_path();
				this.mode = 2;

				paper.project.deselectAll();
				this.selected.a.length = 0;
				this.selected.b.length = 0;
				if(this.wnd.size != 0)
					this.wnd.size = 0;
			}

		},

		mouseup: function(event) {


		},

		mousedrag: function(event) {

		},

		mousemove: function(event) {
			this.hitTest(event);

			if(this.mode == 3 && this.path){

				if(this.path.segments.length == 4)
					this.path.removeSegments(1, 3, true);

				if(!this.path_text)
					this.path_text = new paper.PointText({
						justification: 'center',
						fillColor: 'black',
						fontSize: 72});

				this.path.lastSegment.point = event.point;
				var length = this.path.length;
				if(length){
					var normal = this.path.getNormalAt(0).multiply(120);
					this.path.insertSegments(1, [this.path.firstSegment.point.add(normal), this.path.lastSegment.point.add(normal)]);
					this.path.firstSegment.selected = true;
					this.path.lastSegment.selected = true;

					this.path_text.content = length.toFixed(0);
					//this.path_text.rotation = e.subtract(b).angle;
					this.path_text.point = this.path.curves[1].getPointAt(.5, true);

				}else
					this.path_text.visible = false;
			}

		},

		keydown: function(event) {

			// удаление размерной линии
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				paper.project.selectedItems.some(function (path) {
					if(path.parent instanceof DimensionLineCustom){
						path.parent.remove();
						return true;
					}
				});

				// Prevent the key event from bubbling
				event.stop();
				return false;

			}
		}

	});

	$p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

}
ToolRuler._extend(ToolElement);

ToolRuler.prototype.__define({

	_move_points: {
		value: function (event, xy) {

			// сортируем группы выделенных элеметов по правл-лево или верх-низ
			// left_top == true, если элементы в массиве _a_ выше или левее элементов в массиве _b_
			var pos1 = this.selected.a.reduce(function(sum, curr) {
					return sum + curr.b[xy] + curr.e[xy];
				}, 0) / (this.selected.a.length * 2),
				pos2 = this.selected.b.reduce(function(sum, curr) {
					return sum + curr.b[xy] + curr.e[xy];
				}, 0) / (this.selected.b.length * 2),
				delta = Math.abs(pos2 - pos1),
				to_move;

			if(xy == "x")
				if(event.name == "right")
					delta = new paper.Point(event.size - delta, 0);
				else
					delta = new paper.Point(delta - event.size, 0);
			else{
				if(event.name == "bottom")
					delta = new paper.Point(0, event.size - delta);
				else
					delta = new paper.Point(0, delta - event.size);
			}

			if(delta.length){

				paper.project.deselectAll();

				if(event.name == "right" || event.name == "bottom")
					to_move = pos1 < pos2 ? this.selected.b : this.selected.a;
				else
					to_move = pos1 < pos2 ? this.selected.a : this.selected.b;

				to_move.forEach(function (p) {
					p.generatrix.segments.forEach(function (segm) {
						segm.selected = true;
					})
				});

				paper.project.move_points(delta);
				setTimeout(function () {
					paper.project.deselectAll();
					this.selected.a.forEach(function (p) {
						p.path.selected = true;
					});
					this.selected.b.forEach(function (p) {
						p.path.selected = true;
					});
					paper.project.register_update();
				}.bind(this), 200);
			}

		}
	},

	_sizes_wnd: {
		value: function (event) {

			if(event.wnd == this.wnd){

				if(!this.selected.a.length || !this.selected.b.length)
					return;

				switch(event.name) {

					case 'left':
					case 'right':
						if(this.selected.a[0].orientation == $p.enm.orientations.Вертикальная)
							this._move_points(event, "x");
						break;

					case 'top':
					case 'bottom':
						if(this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная)
							this._move_points(event, "y");
						break;
				}
			}
		}
	}

});

function RulerWnd(options, tool){

	if(!options)
		options = {
			name: 'sizes',
			wnd: {
				caption: "Размеры и сдвиг",
				height: 200,
				allow_close: true,
				modal: true
			}
		};
	$p.wsql.restore_options("editor", options);
	options.wnd.on_close = function () {

		if(wnd.elmnts.calck && wnd.elmnts.calck.obj && wnd.elmnts.calck.obj.removeSelf)
			wnd.elmnts.calck.obj.removeSelf();

		$p.eve.detachEvent(wnd_keydown);

		$p.eve.callEvent("sizes_wnd", [{
			wnd: wnd,
			name: "close",
			size: wnd.size,
			tool: tool
		}]);

		wnd = null;

		return true;
	};

	var wnd = $p.iface.dat_blank(paper._dxw, options.wnd),
		
		wnd_keydown = $p.eve.attachEvent("keydown", function (ev) {

			if(wnd){
				switch(ev.keyCode) {
					case 27:        // закрытие по {ESC}
						wnd.close();
						break;
					case 37:        // left
						on_button_click({
							currentTarget: {name: "left"}
						});
						break;
					case 38:        // up
						on_button_click({
							currentTarget: {name: "top"}
						});
						break;
					case 39:        // right
						on_button_click({
							currentTarget: {name: "right"}
						});
						break;
					case 40:        // down
						on_button_click({
							currentTarget: {name: "bottom"}
						});
						break;

					case 109:       // -
					case 46:        // del
					case 8:         // backspace
						if(ev.target && ["textarea", "input"].indexOf(ev.target.tagName.toLowerCase())!=-1)
							return;

						paper.project.selectedItems.some(function (path) {
							if(path.parent instanceof DimensionLineCustom){
								path.parent.remove();
								return true;
							}
						});

						// Prevent the key event from bubbling
						return $p.cancel_bubble(ev);

						break;
				}
				return $p.cancel_bubble(ev);
			}
			
		}),
		div=document.createElement("table"),
		table, input;

	function on_button_click(e){

		if(!paper.project.selectedItems.some(function (path) {
				if(path.parent instanceof DimensionLineCustom){

					switch(e.currentTarget.name) {

						case "left":
						case "bottom":
							path.parent.offset -= 20;
							break;

						case "top":
						case "right":
							path.parent.offset += 20;
							break;

					}

					return true;
				}
			})){

			$p.eve.callEvent("sizes_wnd", [{
				wnd: wnd,
				name: e.currentTarget.name,
				size: wnd.size,
				tool: tool
			}]);
		}
	}

	div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
		'<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly ></td><td></td></tr>' +
		'<tr><td></td><td align="center"></td><td></td></tr>';
	div.style.width = "130px";
	div.style.margin = "auto";
	div.style.borderSpacing = 0;
	table = div.firstChild.childNodes;

	$p.iface.add_button(table[0].childNodes[1], null,
		{name: "top", css: 'tb_align_top', tooltip: $p.msg.align_set_top}).onclick = on_button_click;
	$p.iface.add_button(table[1].childNodes[0], null,
		{name: "left", css: 'tb_align_left', tooltip: $p.msg.align_set_left}).onclick = on_button_click;
	$p.iface.add_button(table[1].childNodes[2], null,
		{name: "right", css: 'tb_align_right', tooltip: $p.msg.align_set_right}).onclick = on_button_click;
	$p.iface.add_button(table[2].childNodes[1], null,
		{name: "bottom", css: 'tb_align_bottom', tooltip: $p.msg.align_set_bottom}).onclick = on_button_click;

	wnd.attachObject(div);

	if(tool instanceof ToolRuler){

		div.style.marginTop = "22px";

		wnd.tb_mode = new $p.iface.OTooolBar({
			wrapper: wnd.cell,
			width: '100%',
			height: '28px',
			class_name: "",
			name: 'tb_mode',
			buttons: [
				{name: '0', img: 'ruler_elm.png', tooltip: $p.msg.ruler_elm, float: 'left'},
				{name: '1', img: 'ruler_node.png', tooltip: $p.msg.ruler_node, float: 'left'},
				{name: '2', img: 'ruler_arrow.png', tooltip: $p.msg.ruler_new_line, float: 'left'},

				{name: 'sep_0', text: '', float: 'left'},
				{name: 'base', img: 'ruler_base.png', tooltip: $p.msg.ruler_base, float: 'left'},
				{name: 'inner', img: 'ruler_inner.png', tooltip: $p.msg.ruler_inner, float: 'left'},
				{name: 'outer', img: 'ruler_outer.png', tooltip: $p.msg.ruler_outer, float: 'left'}
			],
			image_path: "dist/imgs/",
			onclick: function (name) {
				
				if(['0','1','2'].indexOf(name) != -1){
					wnd.tb_mode.select(name);
					tool.mode = name;						
				}else{
					['base','inner','outer'].forEach(function (btn) {
						if(btn != name)
							wnd.tb_mode.buttons[btn].classList.remove("muted");
					});
					wnd.tb_mode.buttons[name].classList.add("muted");
				}

				return false;
			}
		});

		wnd.tb_mode.select(options.mode);
		wnd.tb_mode.buttons.base.classList.add("muted");
		wnd.tb_mode.cell.style.backgroundColor = "#f5f5f5";
	}

	input = table[1].childNodes[1];
	input.grid = {
		editStop: function (v) {
			$p.eve.callEvent("sizes_wnd", [{
				wnd: wnd,
				name: "size_change",
				size: wnd.size,
				tool: tool
			}]);
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
		wnd.elmnts.calck = new eXcell_calck(this);
		wnd.elmnts.calck.edit();
	};

	wnd.__define({
		size: {
			get: function () {
				return parseFloat(input.firstChild.value);
			},
			set: function (v) {
				input.firstChild.value = parseFloat(v).round(1);
			}
		}
	});

	setTimeout(function () {
		input.firstChild.focus();
	}, 100);

	

	return wnd;
}