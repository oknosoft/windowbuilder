/**
 * ### Добавдение штульповых створок
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule stulp_flap
 */

import ToolWnd from '../../components/Builder/ToolWnds/StulpFlapWnd';

const title = 'Штульповые створки';

export default function tool_stulp_flap ({Editor, classes: {BaseDataObj}, dp: {builder_pen}, cat: {characteristics}, utils, ui: {dialogs}}) {

  const {ToolElement, Filling, Profile} = Editor;
  const {Path} = Object.getPrototypeOf(Editor).prototype;

  class FakeStulpFlap extends BaseDataObj {

    constructor(project) {
      //inset, furn1, furn2
      super({}, builder_pen, false, true);
      this._data._is_new = false;
      this.project = project;

      this._meta = utils._clone(builder_pen.metadata());
      this._meta.fields.inset.synonym = 'Штульп';
      const {furn} = characteristics.metadata('constructions').fields;
      const furn1 = this._meta.fields.furn1 = utils._clone(furn);
      const furn2 = this._meta.fields.furn2 = utils._clone(furn);
      furn1.synonym += ' лев';
      furn2.synonym += ' прав';

      for(const fld of ['inset', 'furn1', 'furn2']) {
        this._meta.fields[fld].mandatory = true;
      }
    }

    /**
     * При изменении одной фурнитуры, пересчитаем другую
     * @param field
     * @param type
     * @param value
     */
    value_change(field, type, value) {
      if(!['furn1', 'furn2'].includes(field)) {
        return;
      }
      let {_dp, ox, activeLayer} = this.project;
      if(activeLayer) {
        ox = activeLayer._ox;
      }
      const sys = activeLayer?.sys || _dp.sys;

      const other = field === 'furn1' ? 'furn2' : 'furn1';
      this[field] = value;
      const shtulp_kind = this[field].shtulp_kind() === 2 ? 1 : 2;
      if(this[other].shtulp_kind() !== shtulp_kind) {
        sys.furns(ox, activeLayer).some(({furn}) => {
          if(furn.parent === this[field].parent && furn.shtulp_kind() === shtulp_kind) {
            this[other] = furn;
            return true;
          }
        });
      }
    }


    _metadata(fld) {
      return fld ? this._meta.fields[fld] : this._meta;
    }

    get inset() {
      return this._getter('inset');
    }
    set inset(v) {
      this._setter('inset', v);
    }

    get furn1() {
      return this._getter('furn1');
    }
    set furn1(v) {
      this._setter('furn1', v);
    }

    get furn2() {
      return this._getter('furn2');
    }
    set furn2(v) {
      this._setter('furn2', v);
    }

    /**
     * Заполняет умолчания по системе и корректирует отбор в метаданных
     * @param sys
     */
    by_sys({_dp, ox, activeLayer}) {
      const {inset, furn1, furn2} = this._meta.fields;
      const {Штульп: elm_type} = $p.enm.elm_types;
      if(activeLayer) {
        ox = activeLayer._ox;
      }
      const sys = activeLayer?.sys || _dp.sys;

      inset.choice_params = [{
        name: 'ref',
        path: {'in': []}
      }];
      sys.elmnts.find_rows({elm_type}, ({nom, by_default}) => {
        inset.choice_params[0].path.in.push(nom);
        if(by_default && this.inset.empty()) {
          this.inset = nom;
        }
      });
      if(this.inset.empty() && inset.choice_params[0].path.in.length) {
        this.inset = inset.choice_params[0].path.in[0];
      }

      const furns = sys.furns(ox, activeLayer).filter(({furn}) => furn.shtulp_kind()).map(({furn}) => furn);
      furn1.choice_params = [{
        name: 'ref',
        path: {'in': furns}
      }];
      furn2.choice_params = [{
        name: 'ref',
        path: {'in': furns}
      }];
      let furn_parent;
      furns.some((furn) => {
        if(this.furn1.empty() && furn.shtulp_kind() === 2) {
          this.furn1 = furn;
          furn_parent = furn.parent;
          return true;
        }
      });
      furns.some((furn) => {
        if(this.furn2.empty() && furn.shtulp_kind() === 1 && (!furn_parent || furn_parent === furn.parent)) {
          this.furn2 = furn;
        }
      });
    }
  }

  class ToolStulpFlap extends ToolElement {

    constructor() {

      super();

      Object.assign(this, {
        options: {name: 'stulp_flap'},
        _obj: null,
      });

      this.on({
        activate: this.on_activate,
        deactivate: this.on_deactivate,
        mousedown: this.mousedown,
        mousemove: this.hitTest,
      });
    }

    on_activate() {
      super.on_activate('cursor-text-select');
      const {options, project} = this;
      this._scope.tb_left.select(options.name);
      this._obj = new FakeStulpFlap(project);
      this._obj.by_sys(project);
    }

    on_deactivate() {
      this._obj = null;
    }

    hitTest(event) {

      this.hitItem = null;

      // Hit test items.
      if(event.point) {
        this.hitItem = this.project.hitTest(event.point, {fill: true, class: Path});
      }

      if(this.hitItem && this.hitItem.item.parent instanceof Filling) {
        this._scope.canvas_cursor('cursor-stulp-flap');
        this.hitItem = this.hitItem.item.parent;
      }
      else {
        this._scope.canvas_cursor('cursor-text-select');
        this.hitItem = null;
      }

      return true;
    }

    mousedown(/*event*/) {
      const {hitItem: filling, _scope, _obj: {inset, furn1, furn2}, project} = this;
      if(!filling) {
        return;
      }
      if(inset.empty()) {
        return dialogs.alert({text: `Не указан штульп`, title});
      }
      if(furn1.empty()) {
        return dialogs.alert({text: `Не указана фурнитура слева`, title});
      }
      if(furn2.empty()) {
        return dialogs.alert({text: `Не указана фурнитура справа`, title});
      }
      if(furn2.shtulp_kind() === furn1.shtulp_kind()) {
        return dialogs.alert({text: `Неверное сочетание типов фурнитур (две активных, либо две пассивных)`, title});
      }
      // проверки закончены, строим вертикальный путь в середине заполнения
      const {top, bottom} = filling.profiles_by_side();
      if(!top || !bottom) {
        return dialogs.alert({
          text: `Не найден верхний или нижний профиль заполнения (сложная форма)`,
          title
        });
      }
      const pt = filling.interiorPoint();
      const path = new Path([pt.add([0, 2000]), pt.add([0, -2000])]);
      const pb = path.intersect_point(bottom.profile.generatrix);
      const pe = path.intersect_point(top.profile.generatrix);
      if(!pe || !pb) {
        return dialogs.alert({
          text: `Не найдено пересечение вертикальной линии через центр заполнения с профилями (сложная форма)`,
          title
        });
      }
      path.firstSegment.point = pb;
      path.lastSegment.point = pe;
      const {layer, clr} = top.profile;
      const shtulp = new Profile({
        generatrix: path,
        proto: {inset, clr, parent: layer.children.profiles}
      });
      layer.redraw();
      while (project._ch.length) {
        project.redraw();
      }
      const {Левое, Правое} = $p.enm.open_directions;
      const flaps = {l: null, r: null};
      // сначала создаём пассивную створку
      for(const glass of layer.glasses(false, true)) {
        if(glass.profiles.some((segm) => segm.profile === shtulp)) {
          const line = new _scope.Line(pb, pe);
          if(line.getSide(glass.interiorPoint()) > 0 && !flaps.l && furn1.shtulp_kind() === 2) {
            flaps.l = glass.create_leaf(furn1, Левое);
          }
          else if(!flaps.r && furn2.shtulp_kind() === 2) {
            flaps.r = glass.create_leaf(furn2, Правое);
          }
        }
      }
      for(const glass of layer.glasses(false, true)) {
        if(glass.profiles.some((segm) => segm.profile === shtulp)) {
          const line = new _scope.Line(pb, pe);
          if(line.getSide(glass.interiorPoint()) > 0 && !flaps.l) {
            flaps.l = glass.create_leaf(furn1, Левое);
          }
          else if(!flaps.r) {
            flaps.r = glass.create_leaf(furn2, Правое);
          }
        }
      }
      _scope.tools.find(t => t.options.name === 'select_node').activate();
    }

  }

  ToolStulpFlap.ToolWnd = ToolWnd;
  Editor.ToolStulpFlap = ToolStulpFlap;

}

