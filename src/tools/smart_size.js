
/**
 * @summary Умная размерная линия
 *
 * @class ToolSmartSize
 * @extends ToolElement
 */
class ToolSmartSize extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      options: {name: 'smart_size'},
      disable_size: true,
      mode: 0,
      hitItem: null,
      hitPoint: null,
      b: null,
      e: null,
      paths: new Map(),
    });

    this.on({
      activate: this.on_activate,
      deactivate: this.on_deactivate,
      mouseup: this.on_mouseup,
      mousemove: this.on_mousemove,
      keyup: this.on_keyup,
    });
  }

  on_activate() {
    super.on_activate('cursor-autodesk');
    Object.assign(this, {
      mode: 0,
      b: null,
      e: null,
    });
  }

  on_deactivate() {
    for(const [name, path] of this.paths) {
      path.remove?.();
    }
    this.paths.clear();
    this.mode = 0;
  }

  on_mouseup(event) {

  }

  on_mousemove(event) {
    this._scope.canvas_cursor('cursor-autodesk');
    this.hitTest(event);
    const {mode, paths} = this;
  }

  on_keyup(event) {
    const {code, target} = event.event;
    if(target && ['textarea', 'input'].includes(target.tagName.toLowerCase())) {
      return;
    }
    // удаление размерной линии
    if(['Escape'].includes(code)) {
      this.on_deactivate();
    }
    event.stop();
  }

  hitTest({point}) {
    let hit = this.project.hitPoints(point, 10, 1, true);
    if (hit) {
      if(hit.item.parent instanceof Editor.ProfileItem) {
        this.hitItem = hit;
        this.hitPoint = hit.item.parent.select_corn(point);
      }
    }
  }

}

Editor.ToolSmartSize = ToolSmartSize;
