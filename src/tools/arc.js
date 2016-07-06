/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 25.08.2015
 * 
 * @module tools
 * @submodule tool_arc
 */

/**
 * ### Манипуляции с арками (дуги правильных окружностей)
 * 
 * @class ToolArc
 * @extends ToolElement
 * @constructor
 */
function ToolArc(){

	var tool = this;

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

		element.layer.notify({type: consts.move_points, profiles: [element.parent], points: []});
	}

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		var hitSize = 6;
		tool.hitItem = null;

		if (event.point)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof ProfileItem
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			paper.canvas_cursor('cursor-arc');
		} else {
			paper.canvas_cursor('cursor-arc-arrow');
		}

		return true;
	};
	tool.on({
		
		activate: function() {
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arc-arrow');
		},
		
		deactivate: function() {
			paper.hide_selection_bounds();
		},
		
		mousedown: function(event) {

			var b, e, r;

			this.mode = null;
			this.changed = false;

			if (tool.hitItem && tool.hitItem.item.parent instanceof ProfileItem
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {

				this.mode = tool.hitItem.item.parent.generatrix;

				if (event.modifiers.control || event.modifiers.option){
					// при зажатом ctrl или alt строим правильную дугу

					b = this.mode.firstSegment.point;
					e = this.mode.lastSegment.point;
					r = (b.getDistance(e) / 2) + 0.001;

					do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					r = this.mode;
					this.mode = null;
					

				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					r = this.mode;
					this.mode = null;

					r.removeSegments(1);
					r.firstSegment.handleIn = null;
					r.firstSegment.handleOut = null;
					r.lineTo(e);
					r.parent.rays.clear();
					r.selected = true;
					r.layer.notify({type: consts.move_points, profiles: [r.parent], points: []});

				} else {
					paper.project.deselectAll();

					r = this.mode;
					r.selected = true;
					paper.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = paper.capture_selection_state();

				}

				setTimeout(function () {
					r.layer.redraw();
					r.parent.attache_wnd(paper._acc.elm.cells("a"));
					$p.eve.callEvent("layer_activated", [r.layer]);
				}, 10);

			}else{
				//tool.detache_wnd();
				paper.project.deselectAll();
			}
		},
		
		mouseup: function(event) {

			var item = this.hitItem ? this.hitItem.item : null;

			if(item instanceof Filling && item.visible){
				item.attache_wnd(paper._acc.elm.cells("a"));
				item.selected = true;

				if(item.selected && item.layer)
					$p.eve.callEvent("layer_activated", [item.layer]);
			}

			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
				//paper.project.redraw();
			}

			paper.canvas_cursor('cursor-arc-arrow');

		},
		
		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				paper.canvas_cursor('cursor-arrow-small');

				do_arc(this.mode, event.point);

				//this.mode.layer.redraw();


			}
		},
		
		mousemove: function(event) {
			this.hitTest(event);
		}
		
	});

	return tool;


}
ToolArc._extend(paper.Tool);

