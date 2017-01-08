/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
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
class ToolPan extends ToolElement {

  constructor() {

    super()

    Object.assign(this, {
      options: {name: 'pan'},
      distanceThreshold: 8,
      mouseStartPos: new paper.Point(),
      mode: 'pan',
      zoomFactor: 1.1
    })

    this.on({

      activate: function() {
        this.on_activate('cursor-hand');
      },

      deactivate: function() {
      },

      mousedown: function(event) {
        this.mouseStartPos = event.point.subtract(paper.view.center);
        this.mode = '';
        if (event.modifiers.control || event.modifiers.option) {
          this.mode = 'zoom';
        } else {
          paper.canvas_cursor('cursor-hand-grab');
          this.mode = 'pan';
        }
      },

      mouseup: function(event) {
        if (this.mode == 'zoom') {
          var zoomCenter = event.point.subtract(paper.view.center);
          var moveFactor = this.zoomFactor - 1.0;
          if (event.modifiers.control) {
            paper.view.zoom *= this.zoomFactor;
            paper.view.center = paper.view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
          } else if (event.modifiers.option) {
            paper.view.zoom /= this.zoomFactor;
            paper.view.center = paper.view.center.subtract(zoomCenter.multiply(moveFactor));
          }
        } else if (this.mode == 'zoom-rect') {
          var start = paper.view.center.add(this.mouseStartPos);
          var end = event.point;
          paper.view.center = start.add(end).multiply(0.5);
          var dx = paper.view.bounds.width / Math.abs(end.x - start.x);
          var dy = paper.view.bounds.height / Math.abs(end.y - start.y);
          paper.view.zoom = Math.min(dx, dy) * paper.view.zoom;
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
          paper.drag_rect(paper.view.center.add(this.mouseStartPos), event.point);
        } else if (this.mode == 'pan') {
          // Handle panning by moving the view center.
          var pt = event.point.subtract(paper.view.center);
          var delta = this.mouseStartPos.subtract(pt);
          paper.view.scrollBy(delta);
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
    })

  }

  testHot(type, event, mode) {
    var spacePressed = event && event.modifiers.space;
    if (mode != 'tool-zoompan' && !spacePressed)
      return false;
    return this.hitTest(event);
  }

  hitTest(event) {

    if (event.modifiers.control) {
      paper.canvas_cursor('cursor-zoom-in');
    } else if (event.modifiers.option) {
      paper.canvas_cursor('cursor-zoom-out');
    } else {
      paper.canvas_cursor('cursor-hand');
    }

    return true;
  }

}
