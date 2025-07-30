


import ToolWnd from '../../components/Builder/ToolWnds/ToolMirrorWnd';

const title = 'Зеркалирование';

export default function tool_mirror ({Editor, ui: {dialogs}}) {

  const {ToolElement, Filling, Profile} = Editor;
  const {Path} = Object.getPrototypeOf(Editor).prototype;

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
        mode: 'copy',
      });

      this.on({

        activate() {
          this.on_activate('cursor-arrow-white');
          const {project : {contours}, _scope, options} = this;
          if(contours.length === 1) {
            this.layers.add(contours[0]);
          }
          this.decorate_layers();
          _scope.tb_left?.select(options.name);
        },

        deactivate() {
          this.layers.clear();
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
            this.emit('layers_change')
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
    decorate_layers() {
      const {project, layers} = this;
      function setOpacity(layer, opacity) {
        layer.opacity = opacity;
        for(const sub of layer.contours) {
          setOpacity(sub, opacity);
        }
      }
      for(const layer of project.contours) {
        setOpacity(layer, layers.has(layer) ? 1 : 0.4);
      }
    }

  }

  ToolMirror.ToolWnd = ToolWnd;
  Editor.ToolMirror = ToolMirror;

}
