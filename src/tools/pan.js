/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 25.08.2015
 * 
 * @module tools
 * @submodule tool_pan
 */

/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 * 
 * @class ToolPan
 * @extends ToolElement
 * @constructor
 * @menuorder 52
 * @tooltip Панорама и масштаб
 */
function ToolPan(){

	var _editor = paper,
		tool = this;

	ToolPan.superclass.constructor.call(this);

	tool.options = {name: 'pan'};
	tool.distanceThreshold = 8;
	tool.mouseStartPos = new paper.Point();
	tool.mode = 'pan';
	tool.zoomFactor = 1.1;
	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		var spacePressed = event && event.modifiers.space;
		if (mode != 'tool-zoompan' && !spacePressed)
			return false;
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		if (event.modifiers.control) {
			_editor.canvas_cursor('cursor-zoom-in');
		} else if (event.modifiers.option) {
			_editor.canvas_cursor('cursor-zoom-out');
		} else {
			_editor.canvas_cursor('cursor-hand');
		}

		return true;
	};
	tool.on({

		activate: function() {
			this.on_activate('cursor-hand');
		},

		deactivate: function() {
		},

		mousedown: function(event) {
			this.mouseStartPos = event.point.subtract(_editor.view.center);
			this.mode = '';
			if (event.modifiers.control || event.modifiers.option) {
				this.mode = 'zoom';
			} else {
				_editor.canvas_cursor('cursor-hand-grab');
				this.mode = 'pan';
			}
		},

		mouseup: function(event) {
			if (this.mode == 'zoom') {
				var zoomCenter = event.point.subtract(_editor.view.center);
				var moveFactor = this.zoomFactor - 1.0;
				if (event.modifiers.control) {
					_editor.view.zoom *= this.zoomFactor;
					_editor.view.center = _editor.view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
				} else if (event.modifiers.option) {
					_editor.view.zoom /= this.zoomFactor;
					_editor.view.center = _editor.view.center.subtract(zoomCenter.multiply(moveFactor));
				}
			} else if (this.mode == 'zoom-rect') {
				var start = _editor.view.center.add(this.mouseStartPos);
				var end = event.point;
				_editor.view.center = start.add(end).multiply(0.5);
				var dx = _editor.view.bounds.width / Math.abs(end.x - start.x);
				var dy = _editor.view.bounds.height / Math.abs(end.y - start.y);
				_editor.view.zoom = Math.min(dx, dy) * _editor.view.zoom;
			}
			this.hitTest(event);
			this.mode = '';
		},
		mousedrag: function(event) {
			if (this.mode == 'zoom') {
				// If dragging mouse while in zoom mode, switch to zoom-rect instead.
				this.mode = 'zoom-rect';
			} else if (this.mode == 'zoom-rect') {
				// While dragging the zoom rectangle, paint the selected area.
				_editor.drag_rect(_editor.view.center.add(this.mouseStartPos), event.point);
			} else if (this.mode == 'pan') {
				// Handle panning by moving the view center.
				var pt = event.point.subtract(_editor.view.center);
				var delta = this.mouseStartPos.subtract(pt);
				_editor.view.scrollBy(delta);
				this.mouseStartPos = pt;
			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		},

		keydown: function(event) {
			this.hitTest(event);
		},

		keyup: function(event) {
			this.hitTest(event);
		}
	});

}
ToolPan._extend(ToolElement);
