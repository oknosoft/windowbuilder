/**
 * Свойства и перемещение элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_select_elm
 */

/**
 * Свойства и перемещение элемента
 */
function ToolSelectElm(){

	var _editor = paper,
		tool = this;

	ToolSelectElm.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;
	tool.duplicates = null;
	tool.options = {
		name: 'select_elm',
		wnd: {
			caption: "Свойства элемента",
			height: 380
		}};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		// var hitSize = 4.0; // / view.zoom;
		var hitSize = 6;
		tool.hitItem = null;

		// Hit test items.
		if (event.point){
			tool.hitItem = _editor.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			if (!tool.hitItem)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });
		}

		if (tool.hitItem) {
			if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-black-shape');
				}
			}
		} else {
			_editor.canvas_cursor('cursor-arrow-black');
		}

		return true;
	};
	tool.on({
		activate: function() {

			_editor.tb_left.select(tool.options.name);

			_editor.canvas_cursor('cursor-arrow-black');
			_editor.clear_selection_bounds();

		},
		deactivate: function() {
			_editor.hide_selection_bounds();
			tool.detache_wnd();

		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof Profile,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;
				if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						_editor.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = 'move-shapes';
						_editor.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = _editor.capture_selection_state();
					}
				}
				if(is_profile)
					tool.attache_wnd(tool.hitItem.item.parent, _editor);

				_editor.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

			}
		},
		mouseup: function(event) {
			if (this.mode == 'move-shapes') {
				if (this.changed) {
					//_editor.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}
				this.duplicates = null;
			} else if (this.mode == 'box-select') {
				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					_editor.project.deselectAll();

				var selectedPaths = _editor.paths_intersecting_rect(box);
				for (var i = 0; i < selectedPaths.length; i++)
					selectedPaths[i].selected = !selectedPaths[i].selected;
			}

			_editor.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-black-shape');
				}
			}
		},
		mousedrag: function(event) {
			if (this.mode == 'move-shapes') {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift) {
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);
				}

				_editor.restore_selection_state(this.originalContent);

				var selected = _editor.project.selectedItems;
				for (var i = 0; i < selected.length; i++) {
					var path = selected[i];
					if(path.parent instanceof Profile)
						path.parent.move_points(delta, true);
					else
						path.position = path.position.add(delta);
				}
				_editor.clear_selection_bounds();

			} else if (this.mode == 'box-select') {
				_editor.drag_rect(this.mouseStartPos, event.point);
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, path, point, newpath;
			if (event.key == '+') {

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];

					if(path.parent instanceof Profile){

						point = path.getPointAt(path.length * 0.5);
						path.parent.rays.clear();
						newpath = path.split(path.length * 0.5);
						new Profile({generatrix: newpath, proto: path.parent});

					}

				}

				// Prevent the key event from bubbling
				return false;

			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					if(path.parent instanceof Profile){
						path = path.parent;
						path.removeChildren();
						path.remove();
					}else{
						path.remove();
					}
				}

				// Prevent the key event from bubbling
				return false;
			}
		}
	});

	return tool;
}
ToolSelectElm._extend(paper.Tool);