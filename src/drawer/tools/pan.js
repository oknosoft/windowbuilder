/**
 * ### Панорама и масштабирование с колёсиком и без колёсика
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule tool_pan
 */

export default function pan (Editor) {

  const {Point} = Object.getPrototypeOf(Editor).prototype;

  /**
   * ### Панорама и масштабирование с колёсиком и без колёсика
   *
   * @class ToolPan
   * @extends ToolElement
   * @constructor
   * @menuorder 52
   * @tooltip Панорама и масштаб
   */
  Editor.ToolPan = class ToolPan extends Editor.ToolElement {

    constructor() {

      super();

      Object.assign(this, {
        options: {name: 'pan'},
        distanceThreshold: 10,
        minDistance: 10,
        mouseStartPos: new Point(),
        mode: 'pan',
        zoomFactor: 1.1,
      });

      this.on({

        activate() {
          this.on_activate('cursor-hand');
        },

        deactivate() {
        },

        mousedown: this.mousedown,

        mouseup: this.mouseup,

        mousedrag: this.mousedrag,

        mousemove: this.hitTest,

        keydown: this.keydown,

        keyup: this.hitTest,
      });

    }

    testHot(type, event, mode) {
      var spacePressed = event && event.modifiers.space;
      if (mode != 'tool-zoompan' && !spacePressed)
        return false;
      return this.hitTest(event);
    }

    hitTest(event) {

      if (event.modifiers.control) {
        this._scope.canvas_cursor('cursor-zoom-in');
      } else if (event.modifiers.option) {
        this._scope.canvas_cursor('cursor-zoom-out');
      } else {
        this._scope.canvas_cursor('cursor-hand');
      }

      return true;
    }

    mousedown(event) {
      if (event.modifiers.shift) {
        this.mouseStartPos = event.point;
      }
      else{
        this.mouseStartPos = event.point.subtract(this._scope.view.center);
      }
      this.mode = '';
      if (event.modifiers.control || event.modifiers.option) {
        this.mode = 'zoom';
      }
      else {
        this._scope.canvas_cursor('cursor-hand-grab');
        this.mode = 'pan';
      }
    }

    mouseup(event) {
      const {view} = this._scope;
      if(this.mode == 'zoom') {
        const zoomCenter = event.point.subtract(view.center);
        const moveFactor = this.zoomFactor - 1.0;
        if(event.modifiers.control) {
          view.zoom *= this.zoomFactor;
          view.center = view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
        }
        else if(event.modifiers.option) {
          view.zoom /= this.zoomFactor;
          view.center = view.center.subtract(zoomCenter.multiply(moveFactor));
        }
      }
      else if(this.mode == 'zoom-rect') {
        const start = view.center.add(this.mouseStartPos);
        const end = event.point;
        view.center = start.add(end).multiply(0.5);
        const dx = view.bounds.width / Math.abs(end.x - start.x);
        const dy = view.bounds.height / Math.abs(end.y - start.y);
        view.zoom = Math.min(dx, dy) * view.zoom;
      }
      this.hitTest(event);
      this.mode = '';
    }

    mousedrag(event) {
      const {view} = this._scope;
      if (this.mode == 'zoom') {
        // If dragging mouse while in zoom mode, switch to zoom-rect instead.
        this.mode = 'zoom-rect';
      }
      else if (this.mode == 'zoom-rect') {
        // While dragging the zoom rectangle, paint the selected area.
        this._scope.drag_rect(view.center.add(this.mouseStartPos), event.point);
      }
      else if (this.mode == 'pan') {
        if (event.modifiers.shift) {
          const {project} = this._scope;
          const delta = this.mouseStartPos.subtract(event.point);
          this.mouseStartPos = event.point;
          project.rootLayer().move(delta.negate());
        }
        else{
          // Handle panning by moving the view center.
          const pt = event.point.subtract(view.center);
          const delta = this.mouseStartPos.subtract(pt);
          this.mouseStartPos = pt;
          view.scrollBy(delta);
        }
      }
    }

    keydown(event) {
      const rootLayer = this._scope.project.rootLayer();
      switch (event.key) {
      case 'left':
        rootLayer.move(new Point(-10, 0));
        break;
      case 'right':
        rootLayer.move(new Point(10, 0));
        break;
      case 'up':
        rootLayer.move(new Point(0, -10));
        break;
      case 'down':
        rootLayer.move(new Point(0, 10));
        break;
      }
    }

  };

}

