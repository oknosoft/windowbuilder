/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	var selected = {a: [], b: []},
		tool = this;

	ToolRuler.superclass.constructor.call(this);


	tool.hitItem = null;

	tool.options = {
		name: 'ruler',
		wnd: {
			caption: "Размеры и сдвиг",
			height: 200
		}
	};

	//tool.resetHot = function(type, event, mode) {
	//};
	//tool.testHot = function(type, event, mode) {
	//	/*	if (mode != 'tool-select')
	//	 return false;*/
	//	return tool.hitTest(event);
	//};
	tool.hitTest = function(event) {

		var hitSize = 4;
		tool.hitItem = null;

		if (event.point)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:false, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile) {
			paper.canvas_cursor('cursor-arrow-ruler');

		} else {
			paper.canvas_cursor('cursor-arrow-ruler-light');
			tool.hitItem = null;
		}

		return true;
	};
	tool.on({
		activate: function() {
			selected.a.length = 0;
			selected.b.length = 0;
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arrow-ruler-light');
			paper.project.deselectAll();
			tool.wnd = new RulerWnd(tool.options);
			tool.wnd.size = 0;
		},
		deactivate: function() {

			tool.detache_wnd();

		},
		mousedown: function(event) {

			if (tool.hitItem) {
				var item = tool.hitItem.item.parent;

				if (paper.Key.isDown('1') || paper.Key.isDown('a')) {

					item.path.selected = true;

					if(selected.a.indexOf(item) == -1)
						selected.a.push(item);

					if(selected.b.indexOf(item) != -1)
						selected.b.splice(selected.b.indexOf(item), 1);

				} else if (paper.Key.isDown('2') || paper.Key.isDown('b') || event.modifiers.shift) {
					item.path.selected = true;

					if(selected.b.indexOf(item) == -1)
						selected.b.push(item);

					if(selected.a.indexOf(item) != -1)
						selected.a.splice(selected.a.indexOf(item), 1);

				}else {
					paper.project.deselectAll();
					item.path.selected = true;
					selected.a.length = 0;
					selected.b.length = 0;
					selected.a.push(item);
				}

				// Если выделено 2 элемента, рассчитаем сдвиг
				if(selected.a.length && selected.b.length){
					if(selected.a[0].orientation == selected.b[0].orientation){
						if(selected.a[0].orientation == $p.enm.orientations.Вертикальная){
							tool.wnd.size = Math.abs(selected.a[0].b.x - selected.b[0].b.x);

						}else if(selected.a[0].orientation == $p.enm.orientations.Горизонтальная){
							tool.wnd.size = Math.abs(selected.a[0].b.y - selected.b[0].b.y).round(1);

						}else{
							// для наклонной ориентации используем interiorpoint

						}
					}

				}else if(tool.wnd.size != 0)
					tool.wnd.size = 0;


			}else {
				paper.project.deselectAll();
				selected.a.length = 0;
				selected.b.length = 0;
				if(tool.wnd.size != 0)
					tool.wnd.size = 0;
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

}
ToolRuler._extend(ToolElement);

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
		{name: "top", img: "dist/imgs/align_top.png", title: $p.msg.align_set_top}).onclick = onclick;
	$p.iface.add_button(table[1].childNodes[0], null,
		{name: "left", img: "dist/imgs/align_left.png", title: $p.msg.align_set_left}).onclick = onclick;
	$p.iface.add_button(table[1].childNodes[2], null,
		{name: "right", img: "dist/imgs/align_right.png", title: $p.msg.align_set_right}).onclick = onclick;
	$p.iface.add_button(table[2].childNodes[1], null,
		{name: "bottom", img: "dist/imgs/align_bottom.png", title: $p.msg.align_set_bottom}).onclick = onclick;

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
				input.firstChild.value = parseFloat(v);
			},
			enumerable: false
		}
	});

	return wnd;
}