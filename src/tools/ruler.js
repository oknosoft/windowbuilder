/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	var selected,
		tool = this;

	ToolRuler.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'ruler',
		wnd: {
			caption: "Размеры и сдвиг",
			height: 200
		}
	};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		var hitSize = 4;
		tool.hitItem = null;

		if (event.point)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile) {
			paper.canvas_cursor('cursor-arrow-ruler');
		} else {
			paper.canvas_cursor('cursor-arrow-ruler-light');
		}

		return true;
	};
	tool.on({
		activate: function() {
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arrow-ruler-light');
			tool.wnd = new RulerWnd(tool.options);
		},
		deactivate: function() {

			tool.detache_wnd();

		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof Profile,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;

				if (is_profile) {

					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						paper.project.deselectAll();
						item.selected = true;
					}
				}

				// Если выделено 2 элемента, рассчитаем сдвиг
				if((selected = paper.project.selectedItems).length == 2){

				}


			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				//if (!event.modifiers.shift)
				//tool.detache_wnd();

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