/**
 * Свойства и перемещение узлов элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module tool_select_node
 */

function ToolSelectNode(){

	var tool = this;

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

			// отдаём предпочтение выделенным ранее элементам
			tool.hitItem = paper.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });

			// во вторую очередь - тем элементам, которые не скрыты
			if (!tool.hitItem)
				tool.hitItem = paper.project.hitTest(event.point, { fill:true, visible: true, tolerance: hitSize });

			// Hit test selected handles
			hit = paper.project.hitTest(event.point, { selected: true, handles: true, tolerance: hitSize });
			if (hit)
				tool.hitItem = hit;

			// Hit test points
			hit = paper.project.hitPoints(event.point);

			if (hit){
				if(hit.item.parent instanceof ProfileItem){
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
					paper.canvas_cursor('cursor-arrow-small');

				} else {
					paper.canvas_cursor('cursor-arrow-white-shape');

				}

			} else if (tool.hitItem.type == 'segment' || tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
				if (tool.hitItem.segment.selected) {
					paper.canvas_cursor('cursor-arrow-small-point');
				} else {
					paper.canvas_cursor('cursor-arrow-white-point');
				}
			}
		} else {
			paper.canvas_cursor('cursor-arrow-white');
		}

		return true;
	};
	tool.on({

		activate: function() {
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arrow-white');
		},

		deactivate: function() {
			paper.clear_selection_bounds();
			if(tool.profile){
				tool.profile.detache_wnd();
				delete tool.profile;
			}
		},

		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if(event.event.which == 3){

			}

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof ProfileItem,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;

				if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {

					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						paper.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = consts.move_shapes;
						paper.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = paper.capture_selection_state();

						if(item.layer)
							$p.eve.callEvent("layer_activated", [item.layer]);
					}

				} else if (tool.hitItem.type == 'segment') {
					if (event.modifiers.shift) {
						tool.hitItem.segment.selected = !tool.hitItem.segment.selected;
					} else {
						if (!tool.hitItem.segment.selected){
							paper.project.deselect_all_points();
							paper.project.deselectAll();
						}
						tool.hitItem.segment.selected = true;
					}
					if (tool.hitItem.segment.selected) {
						this.mode = consts.move_points;
						this.mouseStartPos = event.point.clone();
						this.originalContent = paper.capture_selection_state();
					}
				} else if (tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
					this.mode = consts.move_handle;
					this.mouseStartPos = event.point.clone();
					this.originalHandleIn = tool.hitItem.segment.handleIn.clone();
					this.originalHandleOut = tool.hitItem.segment.handleOut.clone();

					/* if (tool.hitItem.type == 'handle-out') {
					 this.originalHandlePos = tool.hitItem.segment.handleOut.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleIn.length;
					 } else {
					 this.originalHandlePos = tool.hitItem.segment.handleIn.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleOut.length;
					 }
					 this.originalContent = capture_selection_state(); // For some reason this does not work!
					 */
				}

				if(is_profile){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					this.profile = item.parent;

				}else if(item.parent instanceof Filling){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					this.profile = item.parent;
				}

				paper.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				if(!event.modifiers.shift && this.profile){
					this.profile.detache_wnd();
					delete this.profile;
				}

			}
		},

		mouseup: function(event) {

			if (this.mode == consts.move_shapes) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}

			} else if (this.mode == consts.move_points) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Points");
				}

			} else if (this.mode == consts.move_handle) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Handle");
				}
			} else if (this.mode == 'box-select') {

				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					paper.project.deselectAll();

				// при зажатом ctrl или alt добавляем элемент иначе - узел
				if (event.modifiers.control || event.modifiers.option) {

					var selectedPaths = paper.paths_intersecting_rect(box);
					for (var i = 0; i < selectedPaths.length; i++)
						selectedPaths[i].selected = !selectedPaths[i].selected;

				}else {

					var selectedSegments = paper.segments_in_rect(box);
					if (selectedSegments.length > 0) {
						for (var i = 0; i < selectedSegments.length; i++) {
							selectedSegments[i].selected = !selectedSegments[i].selected;
						}
					} else {
						var selectedPaths = paper.paths_intersecting_rect(box);
						for (var i = 0; i < selectedPaths.length; i++)
							selectedPaths[i].selected = !selectedPaths[i].selected;
					}
				}
			}

			paper.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					paper.canvas_cursor('cursor-arrow-small');
				} else {
					paper.canvas_cursor('cursor-arrow-white-shape');
				}
			}
		},

		mousedrag: function(event) {
			this.changed = true;

			if (this.mode == consts.move_shapes) {
				paper.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = paper.snap_to_angle(delta, Math.PI*2/8);

				paper.restore_selection_state(this.originalContent);
				paper.project.move_points(delta, true);
				paper.clear_selection_bounds();

			} else if (this.mode == consts.move_points) {
				paper.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift) {
					delta = paper.snap_to_angle(delta, Math.PI*2/8);
				}
				paper.restore_selection_state(this.originalContent);
				paper.project.move_points(delta);
				paper.purge_selection();


			} else if (this.mode == consts.move_handle) {

				var delta = event.point.subtract(this.mouseStartPos),
					noti = {
						type: consts.move_handle,
						profiles: [tool.hitItem.item.parent],
						points: []};

				if (tool.hitItem.type == 'handle-out') {
					var handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = paper.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleOut = handlePos;
					tool.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					var handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = paper.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleIn = handlePos;
					tool.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}

				noti.profiles[0].rays.clear();
				noti.profiles[0].layer.notify(noti);

				paper.purge_selection();

			} else if (this.mode == 'box-select') {
				paper.drag_rect(this.mouseStartPos, event.point);
			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		},

		keydown: function(event) {
			var selected, i, j, path, segment, index, point, handle, do_select;

			if (event.key == '+' || event.key == 'insert') {

				selected = paper.project.selectedItems;

				// при зажатом ctrl или alt добавляем элемент иначе - узел
				if (event.modifiers.space) {

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

				}else{

					for (i = 0; i < selected.length; i++) {
						path = selected[i];
						do_select = false;
						if(path.parent instanceof ProfileItem){
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
				}

				// Prevent the key event from bubbling
				event.stop();
				return false;

				// удаление сегмента или элемента
			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = paper.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					do_select = false;
					if(path.parent instanceof ProfileItem){
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
				event.stop();
				return false;

			} else if (event.key == 'left') {
				paper.project.move_points(new paper.Point(-10, 0));

			} else if (event.key == 'right') {
				paper.project.move_points(new paper.Point(10, 0));

			} else if (event.key == 'up') {
				paper.project.move_points(new paper.Point(0, -10));

			} else if (event.key == 'down') {
				paper.project.move_points(new paper.Point(0, 10));

			}
		}
	});

	return tool;

}
ToolSelectNode._extend(ToolElement);