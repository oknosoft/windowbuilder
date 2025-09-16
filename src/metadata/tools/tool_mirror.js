


import ToolWnd from '../../components/Builder/ToolWnds/ToolMirrorWnd';

const title = 'Зеркалирование';

export default function tool_mirror ({Editor}) {

  const {ToolElement, Contour, Filling, ProfileConnective, ConnectiveLayer} = Editor;
  const {Point, Path} = Object.getPrototypeOf(Editor).prototype;

  /**
   * ### Зеркалирование фрагментов изделия
   *
   * @class ToolMirror
   * @extends ToolElement
   * @constructor
   * @menuorder 52
   * @tooltip Зеркалирование
   */
  class ToolMirror extends ToolElement {

    constructor() {
      super();
      Object.assign(this, {
        options: {name: 'mirror', title},
        distanceThreshold: 10,
        minDistance: 10,
        layers: new Set(),
        profilesMap: new Map(),
        mode: 'copy',
      });

      this.on({

        activate() {
          this.on_activate('cursor-arrow-white');
          const {project, _scope, options} = this;
          const {contours} = project;
          if(contours.length === 1) {
            this.layers.add(contours[0]);
          }
          this.decorate_layers();
          project.deselectAll();
          _scope.tb_left?.select(options.name);
        },

        deactivate() {
          this.layers.clear();
          this.profilesMap.clear();
          this.decorate_layers(true);
          this.project.register_change();
        },

        mouseup(event) {
          const {hitLayer, layers} = this;
          if(hitLayer) {
            if(layers.has(hitLayer)) {
              layers.delete(hitLayer);
            }
            else {
              layers.add(hitLayer);
            }
            this.emit('layers_change');
          }
          this.decorate_layers();
        },

        mousemove: this.hitTest,

      });
    }


    hitTest({point}) {
      const {project} = this;
      this.hitItem = null;
      this.hitLayer = null;

      if (point) {
        this.hitItem = project.hitTest(point, {fill: true, stroke: true});
        if(this.hitItem) {
          let {layer} = this.hitItem.item;
          while (layer) {
            this.hitLayer = layer;
            layer = layer.layer;
          }
        }
      }
    }

    /**
     * Делает полупрозрачными элементы неактивных слоёв
     */
    decorate_layers(reset) {
      const {project, layers} = this;
      function setOpacity(layer, opacity) {
        layer.opacity = opacity;
        for(const sub of layer.contours) {
          setOpacity(sub, opacity);
        }
      }
      for(const layer of project.contours) {
        setOpacity(layer, (reset || layers.has(layer)) ? 1 : 0.4);
      }
    }

    mirrorProfile(profile, bounds, direction) {
      const mapped = {};
      for(const node of 'be') {
        const point = profile[node];
        const x = direction === 'right' ?
          bounds.right + bounds.right - point.x :
          bounds.left + bounds.left - point.x;
        mapped[node === 'b' ? 'e' : 'b'] = new Point(x, point.y);
      }
      return mapped;
    }

    mirrored(layer, direction) {
      const {bounds, l_connective} = this.project;
      const profilesMap = new Map();
      this.profilesMap.set(layer, profilesMap);
      for(const profile of layer.profiles) {
        profilesMap.set(profile, this.mirrorProfile(profile, bounds, direction));
        const nearest = profile.nearest(true);
        if(nearest instanceof ProfileConnective) {
          let cnnMap = this.profilesMap.get(l_connective);
          if(!cnnMap) {
            cnnMap = new Map();
            this.profilesMap.set(l_connective, cnnMap);
          }
          if(!cnnMap.has(nearest)) {
            cnnMap.set(nearest, this.mirrorProfile(nearest, bounds, direction));
          }
        }
      }
    }

    createGlasses(srcLayer, layer, map) {
      const {glass_specification} = this.project.ox;
      for(const src of srcLayer.glasses(false, true)) {
        const path = src.generatrix.clone({insert: false});
        const filling = new Filling({
          layer,
          parent: layer.children.fillings,
          path,
          proto: {inset: src.inset, clr: src.clr},
        });
        map.set(src, filling);
        glass_specification.find_rows({elm: src.elm}, (trow) => {
          const gproto = Object.assign({}, trow._obj);
          gproto.elm = filling.elm;
          glass_specification.add(gproto);
        });
        for(const impost of src.imposts) {

        }
        for(const tearing of src.children.tearings.children) {
          this.createProfiles(tearing, filling.children.tearings);
        }
      }
    }

    createProfiles(layer, parent) {
      const {project} = this;
      const profilesMap = this.profilesMap.get(layer);
      let dop;
      if(!parent) {
        parent = layer.layer ? this.profilesMap.get(layer.layer).get(layer.layer) : null;
      }
      else {
        dop = {grp: 'top', parent: parent.parent.elm};
      }
      const newLayer = Contour.create({project, parent, kind: layer.kind});
      newLayer.sys = layer.sys;
      if(dop) {
        newLayer.dop = layer.sys;
      }
      profilesMap.set(layer, newLayer);
      // TODO: соединители
      // TODO: раскладки
      // TODO: разрывы и типы заполнений /builder/10e86ca0-5b34-11f0-a440-e31382da7398?order=6aec9930-5731-11f0-aebe-475b4b61bfad
      for(const proto of layer.profiles) {
        const mapped = profilesMap.get(proto);
        const {b, e} = mapped;
        const attr = {
          parent: newLayer.children.profiles,
          generatrix: new Path({insert: false, segments: [b, e]}),
          proto: {
            layer: newLayer,
            inset: proto.inset,
            clr: proto.clr,
          },
        };
        const nearest = proto.nearest(true);
        if(nearest) {
          const profilesMap = this.profilesMap.get(nearest.layer);
          attr._nearest = profilesMap.get(nearest).profile;
        }
        mapped.profile = new newLayer.ProfileConstructor(attr);
      }

      this.createGlasses(layer, newLayer, profilesMap);

      if(parent) {
        const {params} = project.ox;
        newLayer.direction = layer.direction.inverse;
        newLayer.furn = layer.furn;
        newLayer.h_ruch = layer.h_ruch;
        params.find_rows({cnstr: layer.cnstr}, ({inset, param, value, hide}) => {
          const prow = params.find({cnstr: newLayer.cnstr, inset, param}) || params.add({cnstr: newLayer.cnstr, inset, param, value, hide});
          prow.value = value;
        });
      }
      for(const sub of layer.contours) {
        this.createProfiles(sub);
      }
    }

    createConnectives() {
      const layer = this.project.l_connective;
      const cnnMap = this.profilesMap.get(layer);
      if(cnnMap) {
        for(const [proto, mapped] of cnnMap) {
          const {b, e} = mapped;
          const attr = {
            parent: layer,
            generatrix: new Path({insert: false, segments: [b, e]}),
            proto: {
              inset: proto.inset,
              clr: proto.clr,
            },
          };
          mapped.profile = new ProfileConnective(attr);
        }
      }
    }

    execute(direction, layers) {
      let execFin = false;
      if(!layers) {
        layers = this.layers;
        this.profilesMap.clear();
        execFin = true;
      }
      for(const layer of layers) {
        this.mirrored(layer, direction);
        this.execute(direction, layer.contours.concat(layer.tearings));
      }
      if(execFin) {
        this.createConnectives();
        for(const layer of layers) {
          this.createProfiles(layer);
          if(this.mode !== 'copy') {
            layer.remove();
          }
        }
        for(const [layer, map] of this.profilesMap) {
          if(this.mode !== 'copy' && layer instanceof ConnectiveLayer) {
            for(const [profile] of map) {
              profile.remove();
            }
          }
          map.get(layer)?.redraw();
          map.clear();
        }
        this.profilesMap.clear();
        this.layers.clear();
        this.decorate_layers();
        const {project} = this;
        project.register_change(true, () => {
          project.zoom_fit();
        });
      }
    }

  }

  ToolMirror.ToolWnd = ToolWnd;
  Editor.ToolMirror = ToolMirror;

}
