/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	ToolRuler.superclass.constructor.call(this);

	this.hitItem = null;

	this.options = {
		name: 'ruler',
		wnd: {
			caption: "Размеры и сдвиг",
			height: 200
		}
	};

	this.selected = {
		a: [],
		b: []
	};

	//tool.resetHot = function(type, event, mode) {
	//};
	//tool.testHot = function(type, event, mode) {
	//	/*	if (mode != 'tool-select')
	//	 return false;*/
	//	return tool.hitTest(event);
	//};
	this.hitTest = function(event) {

		var hitSize = 4;
		this.hitItem = null;

		if (event.point)
			this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:false, tolerance: hitSize });

		if (this.hitItem && this.hitItem.item.parent instanceof Profile) {
			paper.canvas_cursor('cursor-arrow-ruler');

		} else {
			paper.canvas_cursor('cursor-arrow-ruler-light');
			this.hitItem = null;
		}

		return true;
	};
	this.on({
		activate: function() {
			this.selected.a.length = 0;
			this.selected.b.length = 0;
			paper.tb_left.select(this.options.name);
			paper.canvas_cursor('cursor-arrow-ruler-light');
			paper.project.deselectAll();
			this.wnd = new RulerWnd(this.options);
			this.wnd.size = 0;
		},
		deactivate: function() {

			this.detache_wnd();

		},
		mousedown: function(event) {

			if (this.hitItem) {
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


			}else {
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
				}
					.bind(this), 200);
			}

		},
		enumerable: false
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
		},
		enumerable: false
	}

});

function RulerWnd(options){

	if(!options)
		options = {
			name: 'sizes',
			wnd: {
				caption: "Размеры и сдвиг",
				height: 200,
				allow_close: true,
				modal: true,
				on_close: function () {
					if(wnd.elmnts.calck && wnd.elmnts.calck.removeSelf)
						wnd.elmnts.calck.removeSelf();
					$p.eve.callEvent("sizes_wnd", [{
						wnd: wnd,
						name: "close",
						size: wnd.size
					}]);
					return true;
				}
			}
		};
	$p.wsql.restore_options("editor", options);

	var wnd = $p.iface.dat_blank(paper._dxw, options.wnd),
		div=document.createElement("table"),
		table, input, calck;

	function onclick(e){
		$p.eve.callEvent("sizes_wnd", [{
			wnd: wnd,
			name: e.currentTarget.name,
			size: wnd.size
		}]);
	}

	div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
		'<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly ></td><td></td></tr>' +
		'<tr><td></td><td align="center"></td><td></td></tr>';
	div.style.width = "130px";
	div.style.margin ="auto";
	table = div.firstChild.childNodes;

	$p.iface.add_button(table[0].childNodes[1], null,
		{name: "top", img: "dist/imgs/align_top.png", tooltip: $p.msg.align_set_top}).onclick = onclick;
	$p.iface.add_button(table[1].childNodes[0], null,
		{name: "left", img: "dist/imgs/align_left.png", tooltip: $p.msg.align_set_left}).onclick = onclick;
	$p.iface.add_button(table[1].childNodes[2], null,
		{name: "right", img: "dist/imgs/align_right.png", tooltip: $p.msg.align_set_right}).onclick = onclick;
	$p.iface.add_button(table[2].childNodes[1], null,
		{name: "bottom", img: "dist/imgs/align_bottom.png", tooltip: $p.msg.align_set_bottom}).onclick = onclick;

	wnd.attachObject(div);

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
			},
			enumerable: false
		}
	});

	return wnd;
}