/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	var selected,
		_editor = paper,
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
			height: 280
		}
	};

	function tool_wnd(){

		var folder, opened = false, profile = tool.options,
			div=document.createElement("table"), table, input;

		function onclick(e){

		}

		$p.wsql.restore_options("editor", tool.options);

		tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);

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

		tool.wnd.attachObject(div);

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
			tool.__calck = new eXcell_calck(this);
			tool.__calck.edit();
		};

	}

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
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile) {
			_editor.canvas_cursor('cursor-arrow-ruler');
		} else {
			_editor.canvas_cursor('cursor-arrow-ruler-light');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-ruler-light');

			tool_wnd();
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
						_editor.project.deselectAll();
						item.selected = true;
					}
				}

				// Если выделено 2 элемента, рассчитаем сдвиг
				if((selected = _editor.project.selectedItems).length == 2){

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
ToolRuler._extend(paper.Tool);
