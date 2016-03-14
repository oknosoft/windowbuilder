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

	var tool = this;

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
			tool.hitItem = paper.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			if (!tool.hitItem)
				tool.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });
		}

		if (tool.hitItem) {
			if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
				if (tool.hitItem.item instanceof paper.PointText){

				}else if (tool.hitItem.item.selected) {
					paper.canvas_cursor('cursor-arrow-small');

				} else {
					paper.canvas_cursor('cursor-arrow-black-shape');

				}
			}
		} else {
			paper.canvas_cursor('cursor-arrow-black');
		}

		return true;
	};
	tool.on({
		activate: function() {

			paper.tb_left.select(tool.options.name);

			paper.canvas_cursor('cursor-arrow-black');
			paper.clear_selection_bounds();

		},
		deactivate: function() {
			paper.hide_selection_bounds();
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
						paper.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = 'move-shapes';
						paper.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = paper.capture_selection_state();
					}
				}
				if(is_profile)
					tool.attache_wnd(tool.hitItem.item.parent, paper);

				paper.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

			}
		},
		mouseup: function(event) {
			if (this.mode == 'move-shapes') {
				if (this.changed) {
					//paper.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}
				this.duplicates = null;
			} else if (this.mode == 'box-select') {
				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					paper.project.deselectAll();

				var selectedPaths = paper.paths_intersecting_rect(box);
				for (var i = 0; i < selectedPaths.length; i++)
					selectedPaths[i].selected = !selectedPaths[i].selected;
			}

			paper.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					paper.canvas_cursor('cursor-arrow-small');
				} else {
					paper.canvas_cursor('cursor-arrow-black-shape');
				}
			}
		},
		mousedrag: function(event) {
			if (this.mode == 'move-shapes') {

				this.changed = true;

				paper.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = paper.snap_to_angle(delta, Math.PI*2/8);

				paper.restore_selection_state(this.originalContent);
				paper.project.move_points(delta, true);
				paper.clear_selection_bounds();

			} else if (this.mode == 'box-select') {
				paper.drag_rect(this.mouseStartPos, event.point);
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, path, point;
			if (event.key == '+') {

				selected = paper.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];

					if(path.parent instanceof Profile){

						var cnn_point = path.parent.cnn_point("e");
						if(cnn_point && cnn_point.profile)
							cnn_point.profile.rays.clear(true);
						path.parent.rays.clear(true);

						point = path.getPointAt(path.length * 0.5);
						var newpath = path.split(path.length * 0.5);
						path.lastSegment.point = path.lastSegment.point.add(paper.Point.random());
						newpath.firstSegment.point = path.lastSegment.point;
						new Profile({generatrix: newpath, proto: path.parent});
					}
				}

				// Prevent the key event from bubbling
				event.stop();
				return false;

			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = paper.project.selectedItems;
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
				event.stop();
				return false;

			} else if (event.key == 'left') {
				paper.project.move_points(new paper.Point(-10, 0), true);

			} else if (event.key == 'right') {
				paper.project.move_points(new paper.Point(10, 0), true);

			} else if (event.key == 'up') {
				paper.project.move_points(new paper.Point(0, -10), true);

			} else if (event.key == 'down') {
				paper.project.move_points(new paper.Point(0, 10), true);

			}
		}
	});

	return tool;
}
ToolSelectElm._extend(ToolElement);