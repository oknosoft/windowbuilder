/**
 * Манипуляции с арками (дуги правильных окружностей)
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_arc
 */

function ToolArc(){

	var _editor = paper,
		tool = this;

	ToolArc.superclass.constructor.call(this);

	tool.options = {name: 'arc'};
	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;
	tool.duplicates = null;

	function do_arc(element, point){
		var end = element.lastSegment.point.clone();
		element.removeSegments(1);

		try{
			element.arcTo(point, end);
		}catch (e){	}

		if(!element.curves.length)
			element.lineTo(end);

		element.parent.rays.clear();
		element.selected = true;

		element.parent.parent.notify({type: consts.move_points, profiles: [element.parent], points: []});
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
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			_editor.canvas_cursor('cursor-arc');
		} else {
			_editor.canvas_cursor('cursor-arc-arrow');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arc-arrow');
		},
		deactivate: function() {
			_editor.hide_selection_bounds();
		},
		mousedown: function(event) {

			var b, e, r, contour;

			this.mode = null;
			this.changed = false;

			if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {

				this.mode = tool.hitItem.item.parent.generatrix;

				if (event.modifiers.control || event.modifiers.option){
					// при зажатом ctrl или alt строим правильную дугу

					b = this.mode.firstSegment.point;
					e = this.mode.lastSegment.point;
					r = (b.getDistance(e) / 2) + 0.01;
					contour = this.mode.parent.parent;

					do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);


				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					contour = this.mode.parent.parent;

					this.mode.removeSegments(1);
					this.mode.firstSegment.linear = true;
					this.mode.lineTo(e);
					this.mode.parent.rays.clear();
					this.mode.selected = true;

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);

				} else {
					_editor.project.deselectAll();
					this.mode.selected = true;
					_editor.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = _editor.capture_selection_state();

				}

				//attache_dg(tool.hitItem.item.parent, tool.wnd);

			}else{
				//tool.detache_wnd();
				_editor.project.deselectAll();
			}
		},
		mouseup: function(event) {
			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
				//_editor.project.redraw();
			}

			_editor.canvas_cursor('cursor-arc-arrow');

		},
		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				do_arc(this.mode, event.point);

				//this.mode.parent.parent.redraw();


			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolArc._extend(paper.Tool);

