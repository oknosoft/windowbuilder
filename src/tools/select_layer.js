/* eslint-disable no-duplicate-case */

class ToolSelectLayer extends ToolElement {

  constructor() {
    super();
    Object.assign(this, {
      name: 'selectLayer',
      options: {name: 'select_node'},
      buttons: [],
    });
    this.on({
      activate: this.on_activate,
      deactivate: this.onDeactivate,
      mousedown: this.mousedown,
      keydown: this.keydown,
    });
  }

  button(pos) {
    const parent = this.project.l_dimensions;
    const {generatrix} = pos.profile;
    const button = new paper.Path({
      parent,
      owner: this,
      pos,
      pathData: `M -40,-15 h 25 v -25 h 30 v 25 H 40 V 15 H 15 V 40 H -15 V 15 h -25 z`,
      fillColor: 'green',
      closed: true,
      position: generatrix.interiorPoint.add(generatrix.getNormalAt(generatrix.length / 2).multiply(100)),
      onClick() {
        this.owner.onSelect?.(this);
        this.owner.deactivate();
      },
      onMouseEnter() {
        this.fillColor = 'red';
        this.owner._scope.canvas_cursor('cursor-arrow-white-point');
      },
      onMouseLeave() {
        this.fillColor = 'green';
        this.owner._scope.canvas_cursor('cursor-text-select');
      }
    });
    this.buttons.push(button);
  }

  on_activate() {
    //'cursor-arrow-white-point'
    //'cursor-text-select'
    //'cursor-disabled'
    super.on_activate('cursor-text-select');
    let bounds;
    const {contours, props} = this.project;
    for(const layer of contours) {
      if(layer === this.currentLayer) {
        layer.opacity = 0.2;
      }
      else {
        layer.opacity = 0.7;
        // накапливаем bounds
        if(bounds) {
          bounds = layer.bounds.unite(bounds);
        }
        else {
          bounds = layer.bounds;
        }
      }
    }
    for(const layer of contours) {
      if(layer !== this.currentLayer) {
        // рисуем кнопки
        const bySide = layer.profiles_by_side();
        for(const pos of ['top', 'bottom', 'left', 'right']) {
          if(layer.is_pos(pos, bounds) && bySide[pos]) {
            this.button({layer, bind: pos, profile: bySide[pos]});
          }
        }
      }
    }
  }

  onDeactivate() {
    this.onCancel?.();
    this.currentLayer = null;
    this.onSelect = null;
    this.onCancel = null;
    for(const layer of this.project.contours) {
      layer.opacity = 1;
    }
    for(const button of this.buttons) {
      button.remove();
    }
  }

  deactivate() {
    this._scope.tools[1].activate();
  }

  mousedown(ev) {
    if(ev.event?.which > 1) {
      this.deactivate();
    }
  }

  keydown(ev) {
    const {project, mode} = this;
    const {event: {code, key}, modifiers} = ev;
    if (code === 'Escape' || code === 'Delete') {
      this.deactivate();
    }
  }

  bounds(profiles) {
    if(Array.isArray(profiles)) {
      let left = Infinity, right = -Infinity, top = -Infinity, bottom = Infinity;
      for(const {b, e} of profiles) {
        if(b[0] < left) {
          left = b[0];
        }
        if(e[0] < left) {
          left = e[0];
        }
        if(b[0] > right) {
          right = b[0];
        }
        if(e[0] > right) {
          right = e[0];
        }

        if(b[1] < bottom) {
          bottom = b[1];
        }
        if(e[1] < bottom) {
          bottom = e[1];
        }
        if(b[1] > top) {
          top = b[1];
        }
        if(e[1] > top) {
          top = e[1];
        }
      }
      return new paper.Rectangle({from: [left, bottom], to: [right, top]});
    }
    return new paper.Rectangle({from: [0, 1000], to: [1000, 0]});
  }

  createLayer() {
    const {project, _scope} = this;
    const layer = Editor.Contour.create({project});
    let {bounds, contours} = project;
    if(bounds?.area) {
      return new Promise((resolve, reject) => {
        this.currentLayer = layer;
        this.onSelect = resolve;
        this.onCancel = reject;
        this.activate();
      })
        .then(({pos: {bind, layer, profile}}) => {
          let width = 1000, height = 1000;
          const offset = new _scope.Point();
          offset.bind = bind;
          bounds = layer.bounds;
          const light = 0;
          switch (bind) {
            case 'left':
            case 'right':
              height = bounds.height;
              break;
            default:
              width = bounds.width;
          }
          let profiles = [
            {b: [width, height], e: [0, height]},
            {b: [0, height], e: [0, 0]},
            {b: [0, 0], e: [width, 0]},
            {b: [width, 0], e: [width, height]},
          ];
          const profilesBounds = this.bounds(profiles);
          switch (bind) {
            case 'left':
              offset.x = bounds.bottomLeft.x - profilesBounds.width - light;
              offset.y = bounds.topLeft.y - light;
              break;
            case 'top':
              offset.x = bounds.topLeft.x - light;
              offset.y = bounds.topLeft.y - profilesBounds.height - light;
              break;
            case 'bottom':
              offset.x = bounds.bottomLeft.x + light;
              offset.y = bounds.bottomLeft.y + light;
              break;
            default:
              offset.x = bounds.bottomRight.x + light;
              offset.y = bounds.topLeft.y - light;
          }
          const {dp, utils} = $p;
          const pen = _scope.tools.find((v) => v.options.name === 'pen');
          const rm_dp = !pen.profile;
          if(rm_dp) {
            pen.profile = dp.builder_pen.create();
          }
          pen.profile.bind_sys = true;
          pen.profile.clr = project.clr;
          pen.add_sequence(profiles.map((attr) => {
            attr.b[0] += offset.x;
            attr.e[0] += offset.x;
            attr.b[1] += offset.y;
            attr.e[1] += offset.y;
            return [attr.b, attr.e];
          }));
          if(rm_dp) {
            pen.profile.unload();
            pen.profile = null;
          }
          return utils.sleep(100);
        })
        .then(() => {
          layer.redraw();
          project.zoom_fit();
        })
        .catch((err) => {
          return err;
        });
    }
  }
}

Editor.ToolSelectLayer = ToolSelectLayer;
