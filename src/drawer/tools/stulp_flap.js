/**
 * ### Добавдение штульповых створок
 *
 * Created 25.08.2015
 *
 * @module tools
 * @submodule stulp_flap
 */

import StulpFlapWnd from '../../components/Builder/ToolWnds/StulpFlapWnd';

export default function stulp_flap (Editor, {classes: {BaseDataObj}, dp: {builder_pen}, cat: {characteristics}, utils, ui: {dialogs}}) {

  const {ToolElement, Filling, Profile} = Editor;
  const {Path} = Object.getPrototypeOf(Editor).prototype;

  class FakeStulpFlap extends BaseDataObj {

    constructor() {
      //inset, furn1, furn2
      super({}, builder_pen, false, true);
      this._data._is_new = false;

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
    by_sys({_dp, ox}) {
      const {inset, furn1, furn2} = this._meta.fields;
      const {Штульп: elm_type} = $p.enm.elm_types;

      inset.choice_params = [{
        name: 'ref',
        path: {'in': []}
      }];
      _dp.sys.elmnts.find_rows({elm_type}, ({nom, by_default}) => {
        inset.choice_params[0].path.in.push(nom);
        if(by_default && this.inset.empty()) {
          this.inset = nom;
        }
      });
      if(this.inset.empty() && inset.choice_params[0].path.in.length) {
        this.inset = inset.choice_params[0].path.in[0];
      }

      const furns = _dp.sys.furns(ox).filter(({furn}) => furn.shtulp_kind()).map(({furn}) => furn);
      furn1.choice_params = [{
        name: 'ref',
        path: {'in': furns}
      }];
      furn2.choice_params = [{
        name: 'ref',
        path: {'in': furns}
      }];
      furns.some((furn) => {
        if(this.furn1.empty()) {
          if(furn.shtulp_kind() === 2) {
            this.furn1 = furn;
          }
        }
        else if(this.furn2.empty()) {
          if(furn.shtulp_kind() === 1) {
            this.furn2 = furn;
          }
        }
        else {
          return true;
        }
      });
    }
  }

  Editor.ToolStulpFlap = class ToolStulpFlap extends ToolElement {

    constructor() {

      super();

      Object.assign(this, {
        options: {name: 'stulp_flap'},
        ToolWnd: StulpFlapWnd,
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
      this._obj = new FakeStulpFlap();
      this._obj.by_sys(this.project);
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
        return dialogs.alert({text: `Не указан штульп`, title: 'Штульповые створки'});
      }
      if(furn1.empty()) {
        return dialogs.alert({text: `Не указана фурнитура слева`, title: 'Штульповые створки'});
      }
      if(furn2.empty()) {
        return dialogs.alert({text: `Не указана фурнитура справа`, title: 'Штульповые створки'});
      }
      if(furn2.shtulp_kind() === furn1.shtulp_kind()) {
        return dialogs.alert({text: `Неверное сочетание типов фурнитур (две активных, либо две пассивных)`, title: 'Штульповые створки'});
      }
      // проверки закончены, строим вертикальный путь в середине заполнения
      const {top, bottom} = filling.profiles_by_side();
      const pt = filling.interiorPoint();
      const path = new Path([pt.add([0, 2000]), pt.add([0, -2000])]);
      const pb = path.intersect_point(bottom.profile.generatrix);
      const pe = path.intersect_point(top.profile.generatrix);
      if(!pe || !pb) {
        return dialogs.alert({
          text: `Не найдено пересечение вертикальной линии через центр заполнения с профилями (сложная форма)`,
          title: 'Штульповые створки'
        });
      }
      path.firstSegment.point = pb;
      path.lastSegment.point = pe;
      const {layer} = top.profile;
      const shtulp = new Profile({
        generatrix: path,
        proto: {
          inset,
          clr: top.clr,
          parent: layer,
        }
      });
      project.redraw();
      const {Левое, Правое} = $p.enm.open_directions;
      const flaps = {l: null, r: null};
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
    }

  };

}

