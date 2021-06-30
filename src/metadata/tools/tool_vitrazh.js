/**
 * Редактор каркаса витража
 *
 * @module tool_vitrazh
 *
 * Created by Evgeniy Malyarov on 21.11.2020.
 */

// http://localhost:3000/builder/b0b0fcf0-d593-11eb-8d4e-01b541f37852
import ToolWnd from '../../components/Builder/ToolWnds/VitrazhWnd';

export default function tool_vitrazh ({Editor, classes: {BaseDataObj}, dp: {builder_lay_impost}, cat: {characteristics}, utils, ui: {dialogs}}) {

  const {ToolElement, Filling, Profile} = Editor;
  const {Path} = Object.getPrototypeOf(Editor).prototype;

  class ToolVitrazh extends ToolElement {

    constructor() {
      super();
      Object.assign(this, {
        options: {name: 'vitrazh'},
        _obj: null,
      });
      this.on({
        activate: this.on_activate,
        deactivate: this.on_deactivate,
      });
    }

    on_activate() {
      super.on_activate('cursor-text-select');
      const {options, project, _scope} = this;
      _scope.tb_left && _scope.tb_left.select(options.name);
      if(!project._attr._vitrazh) {
        const obj = builder_lay_impost.create();
        if(!project.contours.length) {
          Editor.Contour.create({project});
        }
        const {bounds, l_dimensions} = project.contours[0];
        obj.w = bounds.width;
        obj.h = bounds.height;
        for(const dl of l_dimensions.ihor.sizes()) {
          obj.sizes.add({elm: 1, sz: dl.size});
          obj.elm_by_y++;
        }
        for(const dl of l_dimensions.ivert.sizes()) {
          obj.sizes.add({elm: 0, sz: dl.size});
          obj.elm_by_x++;
        }
        project._attr._vitrazh = obj;
      }
      this._obj = project._attr._vitrazh;
    }

    on_deactivate() {
      this._obj = null;
    }

  }

  ToolVitrazh.ToolWnd = ToolWnd;
  Editor.ToolVitrazh = ToolVitrazh;
}
