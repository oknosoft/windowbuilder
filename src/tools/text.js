/**
 * Ввод и редактирование произвольного текста
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_text
 */

function ToolText(){

	var _editor = paper,
		tool = this;

	ToolText.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'text',
		wnd: {
			caption: "Произвольный текст",
			width: 290,
			height: 290
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
		var hitSize = 6;

		// хит над текстом обрабатываем особо
		tool.hitItem = _editor.project.hitTest(event.point, { class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill: true, stroke: false, tolerance: hitSize });

		if (tool.hitItem){
			if(tool.hitItem.item instanceof paper.PointText)
				_editor.canvas_cursor('cursor-text');     // указатель с черным Т
			else
				_editor.canvas_cursor('cursor-text-add'); // указатель с серым Т
		} else
			_editor.canvas_cursor('cursor-text-select');  // указатель с вопросом

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-text-select');
		},
		deactivate: function() {
			_editor.hide_selection_bounds();
			tool.detache_wnd();
		},
		mousedown: function(event) {
			this.text = null;
			this.changed = false;

			_editor.project.deselectAll();
			this.mouseStartPos = event.point.clone();

			if (tool.hitItem) {

				if(tool.hitItem.item instanceof paper.PointText){
					this.text = tool.hitItem.item;
					this.text.selected = true;

				}else {
					this.text = new FreeText({
						parent: tool.hitItem.item.layer.l_text,
						point: this.mouseStartPos,
						content: '...',
						selected: true
					});
				}

				this.textStartPos = this.text.point;

				// включить диалог свойст текстового элемента
				if(!tool.wnd || !tool.wnd.elmnts){
					$p.wsql.restore_options("editor", tool.options);
					tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);
					tool._grid = tool.wnd.attachHeadFields({
						obj: this.text
					});
				}else{
					tool._grid.attach({obj: this.text})
				}

			}else
				tool.detache_wnd();

		},
		mouseup: function(event) {

			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
			}

			_editor.canvas_cursor('cursor-arrow-lay');

		},
		mousedrag: function(event) {

			if (this.text) {
				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);

				this.text.move_points(this.textStartPos.add(delta));
				
			}

		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, text;
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					text = selected[i];
					if(text instanceof FreeText){
						text.text = "";
						setTimeout(function () {
							_editor.view.update();
						}, 100);
					}
				}

				event.preventDefault();
				return false;
			}
		}
	});

	return tool;


}
ToolText._extend(ToolElement);
