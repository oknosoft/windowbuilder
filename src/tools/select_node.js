/**
 * Свойства и перемещение узлов элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module tool_select_node
 */

function ToolSelectNode(){

	var _editor = paper,
		tool = this;

	ToolSelectNode.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.originalHandleIn = null;
	tool.originalHandleOut = null;
	tool.changed = false;
	tool.minDistance = 10;

	tool.options = {
		name: 'select_node',
		wnd: {
			caption: "Свойства элемента",
			height: 380
		}};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		if (mode != 'tool-direct-select')
			return;
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		var hitSize = 4;
		var hit = null;
		tool.hitItem = null;

		if (event.point){

			// Hit test items.
			//stroke:true
			tool.hitItem = _editor.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			if (!tool.hitItem)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, guides: false, tolerance: hitSize });

			// Hit test selected handles
			hit = _editor.project.hitTest(event.point, { selected: true, handles: true, tolerance: hitSize });
			if (hit)
				tool.hitItem = hit;

			// Hit test points
			hit = _editor.project.hitPoints(event.point);

			if (hit){
				if(hit.item.parent instanceof Profile){
					if(hit.item.parent.generatrix === hit.item)
						tool.hitItem = hit;
				}else
					tool.hitItem = hit;
			}

		}

		if (tool.hitItem) {
			if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
				if (tool.hitItem.item instanceof paper.PointText){

				}else if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');

				} else {
					_editor.canvas_cursor('cursor-arrow-white-shape');

				}
			} else if (tool.hitItem.type == 'segment' || tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
				if (tool.hitItem.segment.selected) {
					_editor.canvas_cursor('cursor-arrow-small-point');
				} else {
					_editor.canvas_cursor('cursor-arrow-white-point');
				}
			}
		} else {
			_editor.canvas_cursor('cursor-arrow-white');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-white');
		},
		deactivate: function() {
			_editor.clear_selection_bounds();
			tool.detache_wnd();
		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if(event.event.which == 3){

			}

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
				} else if (tool.hitItem.type == 'segment') {
					if (event.modifiers.shift) {
						tool.hitItem.segment.selected = !tool.hitItem.segment.selected;
					} else {
						if (!tool.hitItem.segment.selected){
							_editor.project.deselect_all_points();
							_editor.project.deselectAll();
						}
						tool.hitItem.segment.selected = true;
					}
					if (tool.hitItem.segment.selected) {
						this.mode = consts.move_points;
						this.mouseStartPos = event.point.clone();
						this.originalContent = _editor.capture_selection_state();
					}
				} else if (tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
					this.mode = consts.move_handle;
					this.mouseStartPos = event.point.clone();
					this.originalHandleIn = tool.hitItem.segment.handleIn.clone();
					this.originalHandleOut = tool.hitItem.segment.handleOut.clone();

					/*				if (tool.hitItem.type == 'handle-out') {
					 this.originalHandlePos = tool.hitItem.segment.handleOut.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleIn.length;
					 } else {
					 this.originalHandlePos = tool.hitItem.segment.handleIn.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleOut.length;
					 }*/
//				this.originalContent = capture_selection_state(); // For some reason this does not work!
				}

				if(is_profile)
					tool.attache_wnd(tool.hitItem.item.parent, _editor);

				_editor.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				if (!event.modifiers.shift)
					tool.detache_wnd();
			}
		},
		mouseup: function(event) {
			if (this.mode == 'move-shapes') {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}
			} else if (this.mode == consts.move_points) {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Points");
				}
			} else if (this.mode == consts.move_handle) {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Handle");
				}
			} else if (this.mode == 'box-select') {
				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					_editor.project.deselectAll();

				var selectedSegments = _editor.segments_in_rect(box);
				if (selectedSegments.length > 0) {
					for (var i = 0; i < selectedSegments.length; i++) {
						selectedSegments[i].selected = !selectedSegments[i].selected;
					}
				} else {
					var selectedPaths = _editor.paths_intersecting_rect(box);
					for (var i = 0; i < selectedPaths.length; i++)
						selectedPaths[i].selected = !selectedPaths[i].selected;
				}
			}

			_editor.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-white-shape');
				}
			}
		},
		mousedrag: function(event) {
			this.changed = true;

			if (this.mode == 'move-shapes') {
				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);

				_editor.restore_selection_state(this.originalContent);
				_editor.project.move_points(delta, true);
				_editor.clear_selection_bounds();

			} else if (this.mode == consts.move_points) {
				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift) {
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);
				}
				_editor.restore_selection_state(this.originalContent);
				_editor.project.move_points(delta);
				_editor.purge_selection();


			} else if (this.mode == consts.move_handle) {

				var delta = event.point.subtract(this.mouseStartPos),
					noti = {
						type: consts.move_handle,
						profiles: [tool.hitItem.item.parent],
						points: []};

				if (tool.hitItem.type == 'handle-out') {
					var handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleOut = handlePos;
					tool.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					var handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleIn = handlePos;
					tool.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}

				noti.profiles[0].rays.clear();
				noti.profiles[0].parent.notify(noti);

				_editor.purge_selection();

			} else if (this.mode == 'box-select') {
				_editor.drag_rect(this.mouseStartPos, event.point);
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, j, path, segment, index, point, handle, do_select;
			if (event.key == '+') {

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					do_select = false;
					if(path.parent instanceof Profile){
						for (j = 0; j < path.segments.length; j++) {
							segment = path.segments[j];
							if (segment.selected){
								do_select = true;
								break;
							}
						}
						if(!do_select){
							j = 0;
							segment = path.segments[j];
							do_select = true;
						}
					}
					if(do_select){
						index = (j < (path.segments.length - 1) ? j + 1 : j);
						point = segment.curve.getPointAt(0.5, true);
						handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
						path.insert(index, new paper.Segment(point, handle.negate(), handle));
					}
				}

				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

				// удаление сегмента или элемента
			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					do_select = false;
					if(path.parent instanceof Profile){
						for (j = 0; j < path.segments.length; j++) {
							segment = path.segments[j];
							do_select = do_select || segment.selected;
							if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
								path.removeSegment(j);

								// пересчитываем
								path.parent.x1 = path.parent.x1;
								break;
							}
						}
						// если не было обработки узлов - удаляем элемент
						if(!do_select){
							path = path.parent;
							path.removeChildren();
							path.remove();
						}
					}
				}
				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

			} else if (event.key == 'left') {
				_editor.project.move_points(new paper.Point(-10, 0));

			} else if (event.key == 'right') {
				_editor.project.move_points(new paper.Point(10, 0));

			} else if (event.key == 'up') {
				_editor.project.move_points(new paper.Point(0, -10));

			} else if (event.key == 'down') {
				_editor.project.move_points(new paper.Point(0, 10));

			}
		}
	});

	return tool;

}
ToolSelectNode._extend(paper.Tool);