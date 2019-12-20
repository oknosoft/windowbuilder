/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
 * @author  Evgeniy Malyarov
 *
 * @module geometry
 * @submodule profile
 */

/**
 * Объект, описывающий геометрию соединения
 * @class CnnPoint
 * @constructor
 */
class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  /**
   * Проверяет, является ли соединение в точке Т-образным.
   * L для примыкающих рассматривается, как Т
   */
  get is_t() {
    const {cnn, parent, profile, profile_point} = this;
    const {cnn_types, orientations} = $p.enm;

    // если примыкание не в углу, это точно Т
    if(profile && !profile_point) {
      return true;
    }

    // если это угол, то точно не T
    if(!cnn || cnn.cnn_type == cnn_types.ad) {
      return false;
    }

    // если это Ʇ, или † то без вариантов T
    if(cnn.cnn_type == cnn_types.t) {
      return true;
    }

    // если это Ꞁ или └─, то может быть T в разрыв - проверяем
    if(cnn.cnn_type == cnn_types.av && parent.orientation != orientations.vert) {
      return true;
    }
    if(cnn.cnn_type == cnn_types.ah && parent.orientation != orientations.hor) {
      return true;
    }

    return false;
  }

  /**
   * Строгий вариант свойства is_t: Ꞁ и └ не рассматриваются, как T
   */
  get is_tt() {
    // если это угол, то точно не T
    return !(this.is_i || this.profile_point == 'b' || this.profile_point == 'e' || this.profile == this.parent);
  }

  /**
   * Проверяет, является ли соединение в точке L-образным
   * Соединения Т всегда L-образные
   */
  get is_l() {
    const {cnn} = this;
    const {cnn_types} = $p.enm;
    return this.is_t || !!(cnn && (cnn.cnn_type === cnn_types.av || cnn.cnn_type === cnn_types.ah));
  }

  /**
   * Проверяет, является ли соединение в точке соединением с пустотой
   */
  get is_i() {
    return !this.profile && !this.is_cut;
  }

  /**
   * Проверяет, является ли соединение в точке соединением крест в стык
   */
  get is_x() {
    const {cnn} = this;
    return cnn && cnn.cnn_type === $p.enm.cnn_types.xx;
  }

  /**
   * Профиль, которому принадлежит точка соединения
   * @type Profile
   */
  get parent() {
    return this._parent;
  }

  /**
   * Имя точки соединения (b или e)
   * @type String
   */
  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point) {
      this.profile_point = '';
    }
    if(this.is_cut) {
      this.is_cut = false;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.i) {
      this.cnn = null;
    }
    const {_corns} = this._parent._attr;
    if(_corns.length > 5) {
      _corns.length = 5;
    };
  }

  /**
   * Массив ошибок соединения
   * @type Array
   */
  get err() {
    return this._err;
  }

  set err(v) {
    if(!v) {
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1) {
      this._err.push(v);
    }
  }

  /**
   * Проверяет ошибки в узле профиля
   * @param style
   */
  check_err(style) {
    const {_node, _parent} = this;
    const {_corns, _rays} = _parent._attr;
    const len = _node == 'b' ? _corns[1].getDistance(_corns[4]) : _corns[2].getDistance(_corns[3]);
    const angle = _parent.angle_at(_node);
    const {cnn} = this;
    if(!cnn ||
      (cnn.lmin && cnn.lmin > len) ||
      (cnn.lmax && cnn.lmax < len) ||
      (cnn.amin && cnn.amin > angle) ||
      (cnn.amax && cnn.amax < angle)
    ) {
      if(style) {
        Object.assign(new paper.Path.Circle({
          center: _node == 'b' ? _corns[4].add(_corns[1]).divide(2) : _corns[2].add(_corns[3]).divide(2),
          radius: style.radius || 70,
        }), style);
      }
      else {
        _parent.err_spec_row($p.job_prm.nom.critical_error, cnn ? $p.msg.err_seam_len : $p.msg.err_no_cnn);
      }
    }
  }

  /**
   * Профиль, с которым пересекается наш элемент в точке соединения
   * @property profile
   * @type Profile
   */
  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2) {
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }

  set profile(v) {
    this._profile = v;
  }

  get npoint() {
    const point = this.point || this.parent[this.node];
    if(!this.is_tt) {
      return point;
    }
    const {profile} = this;
    if(!profile || !profile.nearest(true)) {
      return point;
    }
    return profile.nearest(true).generatrix.getNearestPoint(point) || point;
  }

  initialize() {

    const {_parent, _node} = this;

    //  массив ошибок соединения
    this._err = [];

    // строка в таблице соединений
    this._row = _parent.project.cnns.find({elm1: _parent.elm, node1: _node});

    // примыкающий профиль
    this._profile;

    if(this._row) {

      /**
       * Текущее соединение - объект справочника соединения
       * @type _cat.cnns
       */
      this.cnn = this._row.cnn;

      /**
       * Массив допустимых типов соединений
       * По умолчанию - соединение с пустотой
       * @type Array
       */
      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1) {
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else {
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else {
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    /**
     * Расстояние до ближайшего профиля
     * @type Number
     */
    this.distance = Infinity;

    this.point = null;

    this.profile_point = '';

  }
}

/**
 * Объект, описывающий лучи пути профиля
 * @class ProfileRays
 * @constructor
 */
class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, 'b');
    this.e = new CnnPoint(this.parent, 'e');
    this.inner = new paper.Path({insert: false});
    this.outer = new paper.Path({insert: false});
  }

  clear_segments() {
    if(this.inner.segments.length) {
      this.inner.removeSegments();
    }
    if(this.outer.segments.length) {
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn) {
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const gen = parent.generatrix;
    const len = gen.length;

    this.clear();

    if(!len) {
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    // первая точка эквидистанты. аппроксимируется касательной на участке (from < начала пути)
    let point_b = gen.firstSegment.point,
      tangent_b = gen.getTangentAt(0),
      normal_b = gen.getNormalAt(0),
      point_e = gen.lastSegment.point,
      tangent_e, normal_e;

    // добавляем первые точки путей
    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    // для прямого пути, строим в один проход
    if(gen.is_linear()) {
      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));
    }
    else {

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for (let i = step; i < len; i += step) {
        point_b = gen.getPointAt(i);
        normal_b = gen.getNormalAt(i);
        this.outer.add(point_b.add(normal_b.normalize(d1)));
        this.inner.add(point_b.add(normal_b.normalize(d2)));
      }

      normal_e = gen.getNormalAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)));
      this.inner.add(point_e.add(normal_e.multiply(d2)));

      tangent_e = gen.getTangentAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
      this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

    }

    this.inner.reverse();
  }

}


/**
 * ### Элемент профиля
 * Виртуальный класс описывает общие свойства профиля и раскладки
 *
 * @class ProfileItem
 * @extends BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @menuorder 41
 * @tooltip Элемент профиля
 */
class ProfileItem extends GeneratrixElement {

  /**
   * Расстояние от узла до внешнего ребра элемента
   * для рамы, обычно = 0, для импоста 1/2 ширины, зависит от `d0` и `sizeb`
   * @property d1
   * @type Number
   */
  get d1() {
    return -(this.d0 - this.sizeb);
  }

  /**
   * Расстояние от узла до внутреннего ребра элемента
   * зависит от ширины элементов и свойств примыкающих соединений
   * @property d2
   * @type Number
   */
  get d2() {
    return this.d1 - this.width;
  }

  get offset() {
    const {_row} = this;
    return (_row && _row.offset) || 0;
  }

  set offset(v) {
    const {_row, _attr, selected} = this;
    v = parseFloat(v) || 0;
    if(_row && _row.offset !== v) {
      _row.offset = v;
      if(selected) {
        this.selected = false;
      }
      const nearests = this.joined_nearests ? this.joined_nearests() : [];
      if(this.joined_imposts) {
        const imposts = this.joined_imposts();
        nearests.push.apply(nearests, imposts.inner.map((v) => v.profile).concat(imposts.outer.map((v) => v.profile)));
      }
      for(const profile of nearests) {
        profile._attr._rays && profile._attr._rays.clear();
      }
      _attr._rays && _attr._rays.clear();
      this.project.register_change(true);
      if(selected) {
        this.selected = true;
      }
    }
  }

  /**
   * ### Точка проекции высоты ручки на ребро профиля
   *
   * @param side
   * @return Point|undefined
   */
  hhpoint(side) {
    const {layer, rays} = this;
    const {h_ruch, furn} = layer;
    const {furn_set, handle_side} = furn;
    if(!h_ruch || !handle_side || furn_set.empty()) {
      return;
    }
    // получаем элемент, на котором ручка и длину элемента
    if(layer.profile_by_furn_side(handle_side) == this) {
      return rays[side].intersect_point(layer.handle_line(this));
    }
  }

  /**
   * ### Точка проекции высоты ручки на внутреннее ребро профиля
   *
   * @property hhi
   * @type Point|undefined
   */
  get hhi() {
    return this.hhpoint('inner');
  }

  /**
   * ### Точка проекции высоты ручки на внешнее ребро профиля
   *
   * @property hho
   * @type Point|undefined
   */
  get hho() {
    return this.hhpoint('outer');
  }

  /**
   * ### Соединение в точке 'b' для диалога свойств
   *
   * @property cnn1
   * @type _cat.cnns
   * @private
   */
  get cnn1() {
    return this.cnn_point('b').cnn || $p.cat.cnns.get();
  }

  set cnn1(v) {
    const {rays} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.b.cnn != cnn) {
      rays.b.cnn = cnn;
      this.project.register_change();
    }
  }

  /**
   * Соединение в точке 'e' для диалога свойств
   *
   * @property cnn2
   * @type _cat.cnns
   * @private
   */
  get cnn2() {
    return this.cnn_point('e').cnn || $p.cat.cnns.get();
  }

  set cnn2(v) {
    const {rays} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.e.cnn != cnn) {
      rays.e.cnn = cnn;
      this.project.register_change();
    }
  }

  angle_at(p) {
    const {profile, point} = this.cnn_point(p);
    if(!profile || !point) {
      return 90;
    }
    const g1 = this.generatrix;
    const g2 = profile.generatrix;
    let offset1 = g1.getOffsetOf(g1.getNearestPoint(point)),
      offset2 = g2.getOffsetOf(g2.getNearestPoint(point));
    if(offset1 < 10){
      offset1 = 10;
    }
    else if(Math.abs(offset1 - g1.length) < 10){
      offset1 = g1.length - 10;
    }
    if(offset2 < 10){
      offset2 = 10;
    }
    else if(Math.abs(offset2 - g2.length) < 10){
      offset2 = g2.length - 10;
    }
    const t1 = g1.getTangentAt(offset1) || new paper.Point();
    const t2 = g2.getTangentAt(offset2) || new paper.Point();
    const a = t2.negate().getDirectedAngle(t1).round(1);
    return a > 180 ? a - 180 : (a < 0 ? -a : a);
  }

  /**
   * Угол к соседнему элементу в точке 'b'
   */
  get a1() {
    return this.angle_at('b');
  }

  /**
   * Угол к соседнему элементу в точке 'e'
   */
  get a2() {
    return this.angle_at('e');
  }

  /**
   * информация для диалога свойств
   *
   * @property info
   * @type String
   * @final
   * @private
   */
  get info() {
    return '№' + this.elm + ' α:' + this.angle_hor.toFixed(0) + '° l:' + this.length.toFixed(0);
  }

  /**
   * ### Радиус сегмента профиля
   *
   * @property r
   * @type Number
   */
  get r() {
    return this._row.r;
  }

  set r(v) {
    const {_row, _attr} = this;
    if(_row.r != v) {
      _attr._rays.clear();
      _row.r = v;
      this.set_generatrix_radius();
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  /**
   * ### Минимальный радиус, высисляемый по кривизне элемента
   * для прямых = 0
   */
  get rmin() {
    return this.generatrix.rmin();
  }

  /**
   * ### Максимальный радиус, высисляемый по кривизне элемента
   * для прямых = 0
   */
  get rmax() {
    return this.generatrix.rmax();
  }

  /**
   * ### Направление дуги сегмента профиля против часовой стрелки
   *
   * @property arc_ccw
   * @type Boolean
   */
  get arc_ccw() {
    return this._row.arc_ccw;
  }

  set arc_ccw(v) {
    const {_row, _attr} = this;
    if(_row.arc_ccw != v) {
      _attr._rays.clear();
      _row.arc_ccw = v;
      this.set_generatrix_radius();
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  /**
   * ### Высота дуги сегмента профиля
   *
   * @property arc_ccw
   * @type Boolean
   */
  get arc_h() {
    const {_row, b, e, generatrix} = this;
    if(_row.r) {
      const p = generatrix.getPointAt(generatrix.length / 2);
      return paper.Line.getSignedDistance(b.x, b.y, e.x, e.y, p.x, p.y).round(1);
    }
    return 0;
  }

  set arc_h(v) {
    const {_row, _attr, b, e, arc_h} = this;
    v = parseFloat(v);
    if(arc_h != v) {
      _attr._rays.clear();
      if(v < 0) {
        v = -v;
        _row.arc_ccw = true;
      }
      else {
        _row.arc_ccw = false;
      }
      _row.r = b.arc_r(b.x, b.y, e.x, e.y, v);
      this.set_generatrix_radius(v);
      this.project.notify(this, 'update', {r: true, arc_h: true, arc_ccw: true});
    }
  }

  /**
   * ### Угол к горизонту
   * Рассчитывается для прямой, проходящей через узлы
   *
   * @property angle_hor
   * @type Number
   * @final
   */
  get angle_hor() {
    const {b, e} = this;
    const res = (new paper.Point(e.x - b.x, b.y - e.y)).angle.round(2);
    return res < 0 ? res + 360 : res;
  }

  /**
   * ### Длина профиля с учетом соединений
   *
   * @property length
   * @type Number
   * @final
   */
  get length() {
    const {b, e, outer} = this.rays;
    const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
    const ppoints = {};

    // находим проекции четырёх вершин на образующую
    for (let i = 1; i <= 4; i++) {
      ppoints[i] = gen.getNearestPoint(this.corns(i));
    }

    // находим точки, расположенные ближе к концам
    ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
    ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

    // получаем фрагмент образующей
    const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
    const res = sub_gen.length + (b.cnn ? b.cnn.size(this) : 0) + (e.cnn ? e.cnn.size(this) : 0);
    sub_gen.remove();

    return res;
  }

  /**
   * ### Ориентация профиля
   * Вычисляется по гулу к горизонту.
   * Если угол в пределах `orientation_delta`, элемент признаётся горизонтальным или вертикальным. Иначе - наклонным
   *
   * @property orientation
   * @type _enm.orientations
   * @final
   */
  get orientation() {
    let {angle_hor} = this;
    if(angle_hor > 180) {
      angle_hor -= 180;
    }
    if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
      (angle_hor > 180 - consts.orientation_delta && angle_hor < 180 + consts.orientation_delta)) {
      return $p.enm.orientations.hor;
    }
    if((angle_hor > 90 - consts.orientation_delta && angle_hor < 90 + consts.orientation_delta) ||
      (angle_hor > 270 - consts.orientation_delta && angle_hor < 270 + consts.orientation_delta)) {
      return $p.enm.orientations.vert;
    }
    return $p.enm.orientations.incline;
  }

  /**
   * ### Опорные точки и лучи
   *
   * @property rays
   * @type ProfileRays
   * @final
   */
  get rays() {
    const {_rays} = this._attr;
    if(!_rays.inner.segments.length || !_rays.outer.segments.length) {
      _rays.recalc();
    }
    return _rays;
  }

  /**
   * ### Доборы текущего профиля
   *
   * @property addls
   * @type Array.<ProfileAddl>
   * @final
   */
  get addls() {
    return this.children.filter((elm) => elm instanceof ProfileAddl);
  }

  /**
   * ### Создаёт-удаляет дополнительные свойства элемента в зависимости от их наличия в Системе
   * @return {Array}
   */
  elm_props() {
    const {_attr, _row, project} = this;
    // получаем список свойств
    const props = [];
    project._dp.sys.product_params.find_rows({elm: true}, ({param}) => {
      props.push(param);
    });
    // удаляем возможные паразитные свойства
    _attr.props && _attr.props.forEach((prop) => {
      if(!props.includes(prop)) {
        delete this[prop.ref];
      }
    });
    _attr.props = props;
    // создаём свойства
    props.forEach((prop) => {
      if(!this.hasOwnProperty(prop.ref)) {
        Object.defineProperty(this, prop.ref, {
          get() {
            let prow;
            project.ox.params.find_rows({
              param: prop,
              cnstr: {in: [0, -_row.row]},
              inset: $p.utils.blank.guid
            }, (row) => {
              if(!prow || row.cnstr) {
                prow = row;
              }
            });
            return prow && prow.value;
          },
          set(v) {
            let prow, prow0;
            project.ox.params.find_rows({
              param: prop,
              cnstr: {in: [0, -_row.row]},
              inset: $p.utils.blank.guid
            }, (row) => {
              if(row.cnstr) {
                prow = row;
              }
              else {
                prow0 = row;
              }
            });
            // если устанавливаемое значение совпадает со значением изделия - удаляем
            if(prow0 && prow0.value == v) {
              prow && prow._owner.del(prow);
            }
            else if(prow) {
              prow.value = v;
            }
            else {
              project.ox.params.add({
                param: prop,
                cnstr: -_row.row,
                inset: $p.utils.blank.guid,
                value: v,
              });
            }
          },
          configurable: true,
        });
      }
    });

    return props;
  }

  /**
   * Описание полей диалога свойств элемента
   */
  get oxml() {
    const oxml = {
      ' ': [
        {id: 'info', path: 'o.info', type: 'ro'},
        'inset',
        'clr',
        'offset'
      ],
      'Начало': ['x1','y1','a1','cnn1'],
      'Конец': ['x2','y2','a2','cnn2']
    };
    if(this.selected_cnn_ii()) {
      oxml.Примыкание = ['cnn3'];
    }
    const props = this.elm_props();
    if(props.length) {
      oxml.Свойства = props.map(({ref}) => ref);
    }
    return oxml;
  }

  /**
   * Строка цвета по умолчанию для эскиза
   */
  get default_clr_str() {
    return 'FEFEFE';
  }

  /**
   * ### Непрозрачность профиля
   * В отличии от прототипа `opacity`, не изменяет прозрачость образующей
   */
  get opacity() {
    return this.path ? this.path.opacity : 1;
  }

  set opacity(v) {
    this.path && (this.path.opacity = v);
  }

  /**
   * Припуск для соединения "сварной шов"
   */
  get dx0() {
    const {cnn} = this.rays.b;
    const main_row = cnn && cnn.main_row(this);
    return main_row && main_row.angle_calc_method == $p.enm.angle_calculating_ways.СварнойШов ? -main_row.sz : 0;
  }

  setSelection(selection) {
    super.setSelection(selection);

    const {generatrix, path} = this._attr;

    generatrix.setSelection(selection);
    this.ruler_line_select(false);

    if(selection) {

      const {inner, outer} = this.rays;

      if(this._hatching) {
        this._hatching.removeChildren();
      }
      else {
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        });
      }

      path.setSelection(0);

      for (let t = 0; t < inner.length; t += 50) {
        const ip = inner.getPointAt(t);
        const np = inner.getNormalAt(t).multiply(400).rotate(-35).negate();
        const fp = new paper.Path({
          insert: false,
          segments: [ip, ip.add(np)]
        });
        const op = fp.intersect_point(outer, ip);

        if(ip && op) {
          const cip = path.getNearestPoint(ip);
          const cop = path.getNearestPoint(op);
          const nip = cip.is_nearest(ip);
          const nop = cop.is_nearest(op);
          if(nip && nop) {
            this._hatching.moveTo(cip);
            this._hatching.lineTo(cop);
          }
          else if(nip && !nop) {
            const pp = fp.intersect_point(path, op);
            if(pp) {
              this._hatching.moveTo(cip);
              this._hatching.lineTo(pp);
            }
          }
          else if(!nip && nop) {
            const pp = fp.intersect_point(path, ip);
            if(pp) {
              this._hatching.moveTo(pp);
              this._hatching.lineTo(cop);
            }
          }
        }
      }

    }
    else {
      if(this._hatching) {
        this._hatching.remove();
        this._hatching = null;
      }
    }
  }

  // выделяет внутреннее или внешнее ребро профиля
  ruler_line_select(mode) {

    const {_attr} = this;

    if(_attr.ruler_line_path) {
      _attr.ruler_line_path.remove();
      delete _attr.ruler_line_path;
    }

    if(mode) {
      switch (_attr.ruler_line = mode) {

      case 'inner':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(3), this.corns(4));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      case 'outer':
        _attr.ruler_line_path = this.path.get_subpath(this.corns(1), this.corns(2));
        _attr.ruler_line_path.parent = this;
        _attr.ruler_line_path.selected = true;
        break;

      default:
        this.generatrix.selected = true;
        break;
      }
    }
    else if(_attr.ruler_line) {
      delete _attr.ruler_line;
    }
  }

  // координата стороны или образующей профиля
  ruler_line_coordin(xy) {
    switch (this._attr.ruler_line) {
    case 'inner':
      return (this.corns(3)[xy] + this.corns(4)[xy]) / 2;
    case 'outer':
      return (this.corns(1)[xy] + this.corns(2)[xy]) / 2;
    default:
      return (this.b[xy] + this.e[xy]) / 2;
    }
  }

  /**
   * ### Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {

    const {_attr, _row, rays, generatrix, project: {cnns}} = this;

    if(!generatrix) {
      return;
    }

    const b = rays.b;
    const e = rays.e;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: 'b',
      cnn: b.cnn,
      aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: 'e',
      cnn: e.cnn,
      aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;

    // радиус, как дань традиции
    const rmin = generatrix.rmin();
    if(rmin) {
      // записываем среднее значение, дельту не анализируем
      // если овал или несколько перегибов, мы это увидим в path_data
      _row.r = ((rmin + generatrix.rmax()) / 2).round();
    }
    else {
      _row.r = 0;
    }

    // добавляем припуски соединений
    _row.len = this.length.round(1);

    // сохраняем информацию о соединениях
    if(b.profile) {
      row_b.elm2 = b.profile.elm;
      if(b.profile.e.is_nearest(b.point)) {
        row_b.node2 = 'e';
      }
      else if(b.profile.b.is_nearest(b.point)) {
        row_b.node2 = 'b';
      }
      else {
        row_b.node2 = 't';
      }
    }
    if(e.profile) {
      row_e.elm2 = e.profile.elm;
      if(e.profile.b.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else if(e.profile.e.is_nearest(e.point)) {
        row_e.node2 = 'b';
      }
      else {
        row_e.node2 = 't';
      }
    }

    // для створочных и доборных профилей добавляем соединения с внешними элементами
    const nrst = this.nearest();
    if(nrst) {
      cnns.add({
        elm1: _row.elm,
        elm2: nrst.elm,
        cnn: _attr._nearest_cnn,
        aperture_len: _row.len
      });
    }

    // получаем углы между элементами и к горизонту
    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0) {
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0) {
      _row.alp2 = _row.alp2 + 360;
    }

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

    // TODO: Рассчитать положение и ориентацию
    _row.orientation = this.orientation;
    _row.pos = this.pos;

    // координаты доборов
    this.addls.forEach((addl) => addl.save_coordinates());
  }

  /**
   * Вызывается из конструктора - создаёт пути и лучи
   * @method initialize
   * @private
   */
  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    if(attr.r) {
      _row.r = attr.r;
    }

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
      if(_attr.generatrix._reversed) {
        delete _attr.generatrix._reversed;
      }
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else {
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r) {
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2, _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else {
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    // точки пересечения профиля с соседями с внутренней стороны
    _attr._corns = [];

    // кеш лучей в узлах профиля
    _attr._rays = new ProfileRays(this);

    _attr.generatrix.strokeColor = 'gray';

    _attr.path = new paper.Path();
    _attr.path.strokeColor = 'black';
    _attr.path.strokeWidth = 1;
    _attr.path.strokeScaling = false;
    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;

    this.addChild(_attr.path);
    this.addChild(_attr.generatrix);

  }

  /**
   * ### Обсервер
   * Наблюдает за изменениями контура и пересчитывает путь элемента при изменении соседних элементов
   *
   * @method observer
   * @private
   */
  observer(an) {
    const {profiles} = an;
    if(profiles) {
      let binded;
      if(!profiles.includes(this)) {
        // если среди профилей есть такой, к которму примыкает текущий, пробуем привязку
        for(const profile of profiles) {
          if(profile instanceof Onlay && !(this instanceof Onlay)) {
            continue;
          }
          binded = true;
          this.do_bind(profile, this.cnn_point('b'), this.cnn_point('e'), an);
        }
        binded && profiles.push(this);
      }
    }
    else if(an instanceof Profile || an instanceof ProfileConnective) {
      this.do_bind(an, this.cnn_point('b'), this.cnn_point('e'));
    }
  }

  /**
   * Вспомогательная функция обсервера, выполняет привязку узлов
   */
  do_bind(profile, bcnn, ecnn, moved) {

    const {acn, ad} = $p.enm.cnn_types;
    let moved_fact;

    if(profile instanceof ProfileConnective) {
      const gen = profile.generatrix.clone({insert: false}).elongation(3000);
      this._attr._rays.clear();
      const b = gen.getNearestPoint(this.b);
      const e = gen.getNearestPoint(this.e);
      const db = b.subtract(this.b);
      const de = e.subtract(this.e);
      if(db.length || de.length) {
        const selected = this.project.deselect_all_points(true);
        if(db.subtract(de).length < consts.epsilon) {
          this.move_points(de, true);
        }
        else {
          this.select_node('b');
          this.move_points(db);
          this.project.deselectAll();
          this.select_node('e');
          this.move_points(de);
        }
        this.project.deselectAll();
        for(const el of selected) {
          el.selected = true;
        }
      }
    }
    else {
      if(bcnn.cnn && bcnn.profile == profile) {
        // обрабатываем угол
        if(bcnn.profile_point && !bcnn.is_x) {
          const pp = profile[bcnn.profile_point];
          if(!this.b.is_nearest(pp, 0)) {
            if(bcnn.is_t || bcnn.cnn.cnn_type == ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.b.getDistance(pp, true) < consts.sticking2) {
                  this.b = pp;
                }
                moved_fact = true;
              }
            }
            // отрываем привязанный ранее профиль
            else {
              bcnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        // обрабатываем T
        else if(acn.t.indexOf(bcnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'b')) {
          moved_fact = true;
        }
      }

      if(ecnn.cnn && ecnn.profile == profile) {
        // обрабатываем угол
        if(ecnn.profile_point && !ecnn.is_x) {
          const pp = profile[ecnn.profile_point];
          if(!this.e.is_nearest(pp, 0)) {
            if(ecnn.is_t || ecnn.cnn.cnn_type == ad) {
              if(paper.Key.isDown('control')) {
                console.log('control');
              }
              else {
                if(this.e.getDistance(pp, true) < consts.sticking2) {
                  this.e = pp;
                }
                moved_fact = true;
              }
            }
            else {
              // отрываем привязанный ранее профиль
              ecnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        // обрабатываем T
        else if(acn.t.indexOf(ecnn.cnn.cnn_type) != -1 && this.do_sub_bind(profile, 'e')) {
          moved_fact = true;
        }
      }
    }

    // если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
    if(moved && moved_fact) {
      const imposts = this.joined_imposts();
      imposts.inner.concat(imposts.outer).forEach((impost) => {
        if(moved.profiles.indexOf(impost) == -1) {
          impost.profile.observer(this);
        }
      });
    }
  }

  /**
   * Возвращает сторону соединения текущего профиля с указанным
   */
  cnn_side(profile, interior, rays) {
    if(!interior) {
      interior = profile.interiorPoint();
    }
    if(!rays) {
      rays = this.rays;
    }
    if(!rays || !interior || !rays.inner.length || ! rays.outer.length) {
      return $p.enm.cnn_sides.Изнутри;
    }
    return rays.inner.getNearestPoint(interior).getDistance(interior, true) <
    rays.outer.getNearestPoint(interior).getDistance(interior, true) ? $p.enm.cnn_sides.Изнутри : $p.enm.cnn_sides.Снаружи;
  }

  /**
   * Искривляет образующую в соответствии с радиусом
   */
  set_generatrix_radius(height) {
    const {generatrix, _row, layer, selected} = this;
    const b = generatrix.firstSegment.point.clone();
    const e = generatrix.lastSegment.point.clone();
    const min_radius = b.getDistance(e) / 2;

    generatrix.removeSegments(1);
    generatrix.firstSegment.handleIn = null;
    generatrix.firstSegment.handleOut = null;

    let full;
    if(_row.r && _row.r <= min_radius) {
      _row.r = min_radius + 0.0001;
      full = true;
    }
    // if(height && height > min_radius) {
    //   height = min_radius;
    // }

    if(selected) {
      this.selected = false;
    }

    if(_row.r) {
      let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
      if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw) {
        p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
      }
      if(full || height) {
        const start = b.add(e).divide(2);
        const vector = p.subtract(start);
        vector.length = (height || min_radius);
        p = start.add(vector);
      }
      generatrix.arcTo(p, e);
    }
    else {
      generatrix.lineTo(e);
    }

    layer.notify({
      type: consts.move_points,
      profiles: [this],
      points: []
    });

    if(selected) {
      setTimeout(() => this.selected = selected, 100);
    }
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param ignore_select {Boolean}
   */
  set_inset(v, ignore_select) {

    const {_row, _attr, project} = this;

    if(!ignore_select && project.selectedItems.length > 1) {
      project.selected_profiles(true).forEach((elm) => {
        if(elm != this && elm.elm_type == this.elm_type) {
          elm.set_inset(v, true);
        }
      });
    }

    if(_row.inset != v) {

      _row.inset = v;

      // для уже нарисованных элементов...
      if(_attr && _attr._rays) {

        _attr._rays.clear(true);
        delete _attr.d0;

        // прибиваем соединения в точках b и e
        const b = this.cnn_point('b');
        const e = this.cnn_point('e');
        const {cnns} = project;

        if(b.profile && b.profile_point == 'e') {
          const {_rays} = b.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.e.cnn = null;
          }
        }
        if(e.profile && e.profile_point == 'b') {
          const {_rays} = e.profile._attr;
          if(_rays) {
            _rays.clear();
            _rays.b.cnn = null;
          }
        }

        // прибиваем соединения примыкающих к текущему импостов
        const {inner, outer} = this.joined_imposts();
        const elm2 = this.elm;
        for (const {profile} of inner.concat(outer)) {
          const {b, e} = profile.rays;
          b.profile == this && b.clear(true);
          e.profile == this && e.clear(true);
        }

        // для соединительных профилей и элементов со створками, пересчитываем соседей
        for (const {_attr, elm} of this.joined_nearests()) {
          _attr._rays && _attr._rays.clear(true);
          _attr._nearest_cnn = null;
          cnns.clear({elm1: elm, elm2});
        }

        // так же, пересчитываем соединения с примыкающими заполнениями
        this.layer.glasses(false, true).forEach((glass) => {
          cnns.clear({elm1: glass.elm, elm2});
        });
      }

      project.register_change();
    }
  }

  /**
   * Сеттер цвета элемента
   * @param v {CatClrs}
   * @param ignore_select {Boolean}
   */
  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1) {
      this.project.selected_profiles(true).forEach((elm) => {
        if(elm != this) {
          elm.set_clr(v, true);
        }
      });
    }
    BuilderElement.prototype.set_clr.call(this, v);
  }

  /**
   * ### Дополняет cnn_point свойствами соединения
   *
   * @method postcalc_cnn
   * @param node {String} b, e - начало или конец элемента
   * @return CnnPoint
   */
  postcalc_cnn(node) {
    const cnn_point = this.cnn_point(node);

    cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

    if(!cnn_point.point) {
      cnn_point.point = this[node];
    }

    return cnn_point;
  }

  /**
   * ### Пересчитывает вставку после пересчета соединений
   * Контроль пока только по типу элемента
   *
   * @method postcalc_inset
   * @chainable
   */
  postcalc_inset() {
    // если слева и справа T - и тип не импост или есть не T и тпи импост
    this.set_inset(this.project.check_inset({elm: this}), true);
    return this;
  }

  /**
   * ### Пересчитывает вставку при смене системы или добавлении створки
   * Контроль пока только по типу элемента
   *
   * @method default_inset
   * @param all {Boolean} - пересчитывать для любых (не только створочных) элементов
   */
  default_inset(all) {
    const {orientation, project, _attr, elm_type} = this;
    const nearest = this.nearest(true);

    if(nearest || all) {
      let pos = nearest && project._dp.sys.flap_pos_by_impost && elm_type == $p.enm.elm_types.Створка ? nearest.pos : this.pos;
      if(pos == $p.enm.positions.Центр) {
        if(orientation == $p.enm.orientations.vert) {
          pos = [pos, $p.enm.positions.ЦентрВертикаль];
        }
        if(orientation == $p.enm.orientations.hor) {
          pos = [pos, $p.enm.positions.ЦентрГоризонталь];
        }
      }
      this.set_inset(this.project.default_inset({
        elm_type: elm_type,
        pos: pos,
        inset: this.inset
      }), true);
    }
    if(nearest) {
      _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, _attr._nearest, $p.enm.cnn_types.acn.ii, _attr._nearest_cnn);
    }
  }

  /**
   * ### Рассчитывает точки пути
   * на пересечении текущего и указанного профилей
   *
   * @method path_points
   * @param cnn_point {CnnPoint}
   */
  path_points(cnn_point, profile_point) {

    const {_attr, rays, generatrix} = this;
    if(!generatrix.curves.length) {
      return cnn_point;
    }
    const _profile = this;
    const {_corns} = _attr;


    // ищет точку пересечения открытых путей
    // если указан индекс, заполняет точку в массиве _corns. иначе - возвращает расстояние от узла до пересечения
    function intersect_point(path1, path2, index, ipoint = cnn_point.point) {
      const intersections = path1.getIntersections(path2);
      let delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1) {
        if(index) {
          _corns[index] = intersections[0].point;
        }
        else {
          return intersections[0].point.getDistance(ipoint, true);
        }
      }
      else if(intersections.length > 1) {
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(ipoint, true);
          if(tdelta < delta) {
            delta = tdelta;
            point = o.point;
          }
        });
        if(index) {
          _corns[index] = point;
        }
        else {
          return delta;
        }
      }
    }

    // если пересечение в узлах, используем лучи профиля
    const prays = cnn_point.profile instanceof ProfileItem ?
      cnn_point.profile.rays :
      (cnn_point.profile instanceof Filling ? {inner: cnn_point.profile.path, outer: cnn_point.profile.path} : undefined);

    const {cnn_type} = cnn_point.cnn || {};
    const {cnn_types} = $p.enm;
    // импосты рисуем с учетом стороны примыкания
    if(cnn_point.is_t || (cnn_type == cnn_types.xx && !cnn_point.profile_point)) {

      // при необходимости, перерисовываем ведущий элемент
      if(!cnn_point.profile.path.segments.length) {
        const {_attr, row} = cnn_point.profile;
        if(_attr.force_redraw) {
          if(cnn_point.profile.generatrix && cnn_point.profile.generatrix.segments.length) {
            cnn_point.profile.path.addSegments(cnn_point.profile.generatrix.segments);
            _attr.force_redraw = false;
          }
          else if(cnn_point.profile.row && cnn_point.profile.row.path_data) {
            cnn_point.profile.path.pathData = cnn_point.profile.row.path_data;
            _attr.force_redraw = false;
          }
          else {
            throw new Error('cycle redraw');
          }
        }
        else {
          _attr.force_redraw = true;
          cnn_point.profile.redraw();
          _attr.force_redraw = false;
        }
      }

      const nodes = new Set();
      let profile2;
      cnn_point.point && !(this instanceof Onlay) && this.layer.profiles.forEach((profile) => {
        if(profile !== this){
          if(cnn_point.point.is_nearest(profile.b, true)) {
            const cp = profile.cnn_point('b').profile;
            if(cp !== this) {
              if(cp !== cnn_point.profile || cnn_point.profile.cnn_side(this) === cnn_point.profile.cnn_side(profile)) {
                nodes.add(profile);
              }
            }
          }
          else if(cnn_point.point.is_nearest(profile.e, true)) {
            const cp = profile.cnn_point('e').profile;
            if(cp !== this) {
              if(cp !== cnn_point.profile || cnn_point.profile.cnn_side(this) === cnn_point.profile.cnn_side(profile)) {
                nodes.add(profile);
              }
            }
          }
          else if(profile.generatrix.is_nearest(cnn_point.point, true)) {
            nodes.add(profile);
          }
        }
      });
      // убираем из nodes тех, кто соединяется с нами в окрестности cnn_point.point
      nodes.forEach((p2) => {
        if(p2 !== cnn_point.profile) {
          profile2 = p2;
        }
      });

      const side = cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи ? 'outer' : 'inner';

      if(profile2) {
        const interior = generatrix.getPointAt(generatrix.length/2)
        const prays2 = profile2 && profile2.rays;
        const side2 = profile2.cnn_side(this, null, prays2) === $p.enm.cnn_sides.Снаружи ? 'outer' : 'inner';
        const pt1 = intersect_point(prays[side], rays.outer, 0, interior);
        const pt2 = intersect_point(prays[side], rays.inner, 0, interior);
        const pt3 = intersect_point(prays2[side2], rays.outer, 0, interior);
        const pt4 = intersect_point(prays2[side2], rays.inner, 0, interior);

        if(profile_point == 'b') {
          pt1 < pt3 ? intersect_point(prays[side], rays.outer, 1) : intersect_point(prays2[side2], rays.outer, 1);
          pt2 < pt4 ? intersect_point(prays[side], rays.inner, 4) : intersect_point(prays2[side2], rays.inner, 4);
          intersect_point(prays2[side2], prays[side], 5);
          if(rays.inner.point_pos(_corns[5]) >= 0 || rays.outer.point_pos(_corns[5]) >= 0) {
            delete _corns[5];
          }
        }
        else if(profile_point == 'e') {
          pt1 < pt3 ? intersect_point(prays[side], rays.outer, 2) : intersect_point(prays2[side2], rays.outer, 2);
          pt2 < pt4 ? intersect_point(prays[side], rays.inner, 3) : intersect_point(prays2[side2], rays.inner, 3);
          intersect_point(prays2[side2], prays[side], 6);
          if(rays.inner.point_pos(_corns[6]) >= 0 || rays.outer.point_pos(_corns[6]) >= 0) {
            delete _corns[6];
          }
        }
      }
      else {
        // для Т-соединений сначала определяем, изнутри или снаружи находится наш профиль
        if(profile_point == 'b') {
          // в зависимости от стороны соединения
          intersect_point(prays[side], rays.outer, 1);
          intersect_point(prays[side], rays.inner, 4);
          delete _corns[5];
        }
        else if(profile_point == 'e') {
          // в зависимости от стороны соединения
          intersect_point(prays[side], rays.outer, 2);
          intersect_point(prays[side], rays.inner, 3);
          delete _corns[6];
        }
      }

    }
    // крест в стык
    else if(cnn_type == cnn_types.xx) {

      // для раскладок, отступаем ширину профиля
      if(cnn_point.profile instanceof Onlay) {
        const width = this.width * 0.7;
        const l = profile_point == 'b' ? width : generatrix.length - width;
        const p = generatrix.getPointAt(l);
        const n = generatrix.getNormalAt(l).normalize(width);
        const np = new paper.Path({
          insert: false,
          segments: [p.subtract(n), p.add(n)],
        });
        if(profile_point == 'b') {
          intersect_point(np, rays.outer, 1);
          intersect_point(np, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(np, rays.outer, 2);
          intersect_point(np, rays.inner, 3);
        }
      }
      else {
        // получаем второй примыкающий профиль
        const cnn_point2 = cnn_point.profile.cnn_point(cnn_point.profile_point);
        const profile2 = cnn_point2 && cnn_point2.profile;
        if(profile2) {
          const prays2 = profile2 && profile2.rays;
          const pt1 = intersect_point(prays.inner, rays.outer);
          const pt2 = intersect_point(prays.inner, rays.inner);
          const pt3 = intersect_point(prays2.inner, rays.outer);
          const pt4 = intersect_point(prays2.inner, rays.inner);

          if(profile_point == 'b') {
            intersect_point(prays2.inner, prays.inner, 5);
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 1) : intersect_point(prays2.inner, rays.outer, 1);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 4) : intersect_point(prays2.inner, rays.inner, 4);
          }
          else if(profile_point == 'e') {
            pt1 > pt3 ? intersect_point(prays.inner, rays.outer, 2) : intersect_point(prays2.inner, rays.outer, 2);
            pt2 > pt4 ? intersect_point(prays.inner, rays.inner, 3) : intersect_point(prays2.inner, rays.inner, 3);
            intersect_point(prays2.inner, prays.inner, 6);
          }
        }
        else{
          if(profile_point == 'b') {
            delete _corns[1];
            delete _corns[4];
          }
          else if(profile_point == 'e') {
            delete _corns[2];
            delete _corns[3];
          }
        }
      }

    }
    // соединение с пустотой
    else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_type == cnn_types.i) {
      // точки рассчитаются автоматически, как для ненайденных
      if(profile_point == 'b') {
        delete _corns[1];
        delete _corns[4];
      }
      else if(profile_point == 'e') {
        delete _corns[2];
        delete _corns[3];
      }
    }
    // угловое диагональное
    else if(cnn_type == cnn_types.ad) {
      if(profile_point == 'b') {
        intersect_point(prays.outer, rays.outer, 1);
        intersect_point(prays.inner, rays.inner, 4);
      }
      else if(profile_point == 'e') {
        intersect_point(prays.outer, rays.outer, 2);
        intersect_point(prays.inner, rays.inner, 3);
      }

    }
    // угловое к вертикальной
    else if(cnn_type == cnn_types.av) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }
    // угловое к горизонтальной
    else if(cnn_type == cnn_types.ah) {
      if(this.orientation == $p.enm.orientations.vert) {
        if(profile_point == 'b') {
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
      else if(this.orientation == $p.enm.orientations.hor) {
        if(profile_point == 'b') {
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else if(profile_point == 'e') {
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }
      else {
        cnn_point.err = 'orientation';
      }
    }

    // если точка не рассчиталась - рассчитываем по умолчанию - как с пустотой
    if(profile_point == 'b') {
      if(!_corns[1]) {
        _corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]) {
        _corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == 'e') {
      if(!_corns[2]) {
        _corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]) {
        _corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }

    return cnn_point;
  }

  /**
   * ### Точка внутри пути
   * Возвращает точку, расположенную гарантированно внутри профиля
   *
   * @property interiorPoint
   * @type paper.Point
   */
  interiorPoint() {
    const {generatrix, d1, d2} = this;
    const igen = generatrix.curves.length == 1 ? generatrix.firstCurve.getPointAt(0.5, true) : (
      generatrix.curves.length == 2 ? generatrix.firstCurve.point2 : generatrix.curves[1].point2
    );
    const normal = generatrix.getNormalAt(generatrix.getOffsetOf(igen));
    return igen.add(normal.multiply(d1).add(normal.multiply(d2)).divide(2));
  }


  /**
   * ### Выделяет сегмент пути профиля, ближайший к точке
   *
   * @method select_corn
   * @param point {paper.Point}
   */
  select_corn(point) {

    const res = this.corns(point);

    this.path.segments.forEach((segm) => {
      if(segm.point.is_nearest(res.point)) {
        res.segm = segm;
      }
    });

    if(!res.segm && res.point == this.b) {
      res.segm = this.generatrix.firstSegment;
    }

    if(!res.segm && res.point == this.e) {
      res.segm = this.generatrix.lastSegment;
    }

    if(res.segm && res.dist < consts.sticking0) {
      this.project.deselectAll();
      res.segm.selected = true;
    }

    return res;
  }

  /**
   * ### Признак прямолинейности
   * Вычисляется, как `is_linear()` {{#crossLink "BuilderElement/generatrix:property"}}образующей{{/crossLink}}
   *
   * @method is_linear
   * @return Boolean
   */
  is_linear() {
    return this.generatrix.is_linear();
  }

  /**
   * ### Выясняет, примыкает ли указанный профиль к текущему
   * Вычисления делаются на основании близости координат концов текущего профиля образующей соседнего
   *
   * @method is_nearest
   * @param p {ProfileItem}
   * @return Boolean
   */
  is_nearest(p) {
    return (this.b.is_nearest(p.b, true) || this.generatrix.is_nearest(p.b)) &&
      (this.e.is_nearest(p.e, true) || this.generatrix.is_nearest(p.e));
  }

  /**
   * ### Выясняет, параллельны ли профили
   * в пределах `consts.orientation_delta`
   *
   * @method is_collinear
   * @param p {ProfileItem}
   * @return Boolean
   */
  is_collinear(p) {
    let angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
    if(angl < -180) {
      angl += 180;
    }
    return Math.abs(angl) < consts.orientation_delta;
  }

  /**
   * Возвращает массив примыкающих профилей
   */
  joined_nearests() {
    return [];
  }

  /**
   * ### Формирует путь сегмента профиля
   * Пересчитывает соединения с соседями и стоит путь профиля на основании пути образующей
   * - Сначала, вызывает {{#crossLink "ProfileItem/postcalc_cnn:method"}}postcalc_cnn(){{/crossLink}} для узлов `b` и `e`
   * - Внутри `postcalc_cnn`, выполняется {{#crossLink "ProfileItem/cnn_point:method"}}cnn_point(){{/crossLink}} для пересчета соединений на концах профиля
   * - Внутри `cnn_point`:
   *    + {{#crossLink "ProfileItem/check_distance:method"}}check_distance(){{/crossLink}} - проверяет привязку, если вернулось false, `cnn_point` завершает свою работы
   *    + цикл по всем профилям и поиск привязки
   * - {{#crossLink "ProfileItem/postcalc_inset:method"}}postcalc_inset(){{/crossLink}} - проверяет корректность вставки, заменяет при необходимости
   * - {{#crossLink "ProfileItem/path_points:method"}}path_points(){{/crossLink}} - рассчитывает координаты вершин пути профиля
   *
   * @method redraw
   * @chainable
   */
  redraw() {
    // получаем узлы
    const bcnn = this.postcalc_cnn('b');
    const ecnn = this.postcalc_cnn('e');
    const {path, generatrix, rays, project} = this;

    // получаем соединения концов профиля и точки пересечения с соседями
    this.path_points(bcnn, 'b');
    this.path_points(ecnn, 'e');

    // очищаем существующий путь
    path.removeSegments();

    // TODO отказаться от повторного пересчета и задействовать клоны rays-ов
    this.corns(5) && path.add(this.corns(5));
    path.add(this.corns(1));

    if(generatrix.is_linear()) {
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));
    }
    else {

      let tpath = new paper.Path({insert: false});
      let offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
      let offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
      let step = (offset2 - offset1) / 50;

      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.outer.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);
      path.add(this.corns(2));
      this.corns(6) && path.add(this.corns(6));
      path.add(this.corns(3));

      tpath = new paper.Path({insert: false});
      offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
      offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
      step = (offset2 - offset1) / 50;
      for (let i = offset1 + step; i < offset2; i += step) {
        tpath.add(rays.inner.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);

    }

    path.add(this.corns(4));
    path.closePath();
    path.reduce();

    this.children.forEach((elm) => {
      if(elm instanceof ProfileAddl) {
        elm.observer(elm.parent);
        elm.redraw();
      }
    });

    return this;
  }

  /**
   * рисует стрелочку направления элемента
   */
  mark_direction() {
    const {generatrix, rays: {inner, outer}} = this;
    const gb = generatrix.getPointAt(130);
    const ge = generatrix.getPointAt(230);
    const ib = inner.getNearestPoint(gb);
    const ie = inner.getNearestPoint(ge);
    const ob = outer.getNearestPoint(gb);
    const oe = outer.getNearestPoint(ge);

    const b = ib.add(ob).divide(2);
    const e = ie.add(oe).divide(2);
    const c = b.add(e).divide(2);
    const n = e.subtract(b).rotate(90).normalize(10);
    const c1 = c.add(n);
    const c2 = c.subtract(n);

    const path = new paper.Path({
      parent: this,
      segments: [b, e, c1, c2, e],
      strokeColor: 'darkblue',
      strokeCap: 'round',
      strokeWidth: 2,
      strokeScaling: false,
    })
  }

  /**
   * ### Координаты вершин (cornx1...corny4)
   *
   * @method corns
   * @param corn {String|Number} - имя или номер вершины
   * @return {Point|Number} - координата или точка
   */
  corns(corn) {
    const {_corns} = this._attr;
    if(typeof corn == 'number') {
      return corn < 10 ? _corns[corn] : this.generatrix.getPointAt(corn);
    }
    else if(corn instanceof paper.Point) {

      const res = {dist: Infinity, profile: this};
      let dist;

      for (let i = 1; i < 5; i++) {
        dist = _corns[i].getDistance(corn);
        if(dist < res.dist) {
          res.dist = dist;
          res.point = _corns[i];
          res.point_name = i;
        }
      }

      const {hhi} = this;
      if(hhi) {
        dist = hhi.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hhi.getDistance(corn);
          res.point = hhi;
          res.point_name = 'hhi';
        }
        const {hho} = this;
        dist = hho.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = hho.getDistance(corn);
          res.point = hho;
          res.point_name = 'hho';
        }
      }

      dist = this.b.getDistance(corn);
      if(dist <= res.dist) {
        res.dist = this.b.getDistance(corn);
        res.point = this.b;
        res.point_name = 'b';
      }
      else {
        dist = this.e.getDistance(corn);
        if(dist <= res.dist) {
          res.dist = this.e.getDistance(corn);
          res.point = this.e;
          res.point_name = 'e';
        }
      }

      return res;
    }
    else {
      const index = corn.substr(corn.length - 1, 1);
      const axis = corn.substr(corn.length - 2, 1);
      return _corns[index][axis];
    }
  }

  /**
   * Выясняет, имеет ли текущий профиль соединение с `profile` в окрестности точки `point`
   */
  has_cnn(profile, point) {

    let t = this;
    while (t.parent instanceof ProfileItem) {
      t = t.parent;
    }
    while (profile.parent instanceof ProfileItem) {
      profile = profile.parent;
    }

    if(
      (t.b.is_nearest(point, true) && t.cnn_point('b').profile == profile) ||
      (t.e.is_nearest(point, true) && t.cnn_point('e').profile == profile) ||
      (profile.b.is_nearest(point, true) && profile.cnn_point('b').profile == t) ||
      (profile.e.is_nearest(point, true) && profile.cnn_point('e').profile == t)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Вызывает одноименную функцию _scheme в контексте текущего профиля
   */
  check_distance(element, res, point, check_only) {
    return this.project.check_distance(element, this, res, point, check_only);
  }

  /**
   * Дополняет и сортирует массив свойств примыкающих профилей
   * @param ares
   * @return {boolean}
   */
  max_right_angle(ares) {
    const {generatrix} = this;
    let has_a = true;
    ares.forEach((res) => {
      res._angle = generatrix.angle_to(res.profile.generatrix, res.point);
      if(res._angle > 180) {
        res._angle = 360 - res._angle;
      }
    });
    ares.sort((a, b) => {
      const aa = Math.abs(a._angle - 90);
      const ab = Math.abs(b._angle - 90);
      return aa - ab;
    });
    return has_a;
  }

  /**
   * Выводит текст с номером элемента
   * @param show
   */
  show_number(show = true) {
    let {elm_number} = this.children;
    if(!show) {
      return elm_number && elm_number.remove();
    }
    if(elm_number) {
      elm_number.position = this.path.interiorPoint;
    }
    else {
      elm_number = new paper.PointText({
        parent: this,
        guide: true,
        name: 'elm_number',
        justification: 'center',
        fillColor: 'darkblue',
        fontFamily: consts.font_family,
        fontSize: consts.font_size * 1.1,
        fontWeight: 'bold',
        content: this.elm,
        position: this.interiorPoint(),
      });
    }

  }

}


/**
 * ### Профиль
 * Класс описывает поведение сегмента профиля (створка, рама, импост)<br />
 * У профиля есть координаты конца и начала, есть путь образующей - прямая или кривая линия
 *
 * @class Profile
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 42
 * @tooltip Профиль
 *
 * @example
 *
 *     // Создаём элемент профиля на основании пути образующей
 *     // одновременно, указываем контур, которому будет принадлежать профиль, вставку и цвет
 *     new Profile({
 *       generatrix: new paper.Path({
 *         segments: [[1000,100], [0, 100]]
 *       }),
 *       proto: {
 *         parent: _contour,
 *         inset: _inset
 *         clr: _clr
 *       }
 *     });
 */
class Profile extends ProfileItem {

  constructor(attr) {

    const fromCoordinates = !!attr.row;

    super(attr);

    if(this.parent) {
      const {project: {_scope, ox}, observer} = this;

      // Подключаем наблюдателя за событиями контура с именем _consts.move_points_
      this.observer = observer.bind(this);
      _scope.eve.on(consts.move_points, this.observer);

      // Информируем контур о том, что у него появился новый ребёнок
      this.layer.on_insert_elm(this);

      // ищем и добавляем доборные профили
      if(fromCoordinates){
        const {cnstr, elm} = attr.row;
        ox.coordinates.find_rows({cnstr, parent: {in: [elm, -elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => new ProfileAddl({row, parent: this}));
      }
    }

  }

  /**
   * Расстояние от узла до опорной линии
   * для сегментов створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
   * @property d0
   * @type Number
   */
  get d0() {
    const {_attr} = this;
    if(!_attr.hasOwnProperty('d0')) {
      _attr.d0 = this.offset;
      const nearest = this.nearest();
      if(nearest) {
        _attr.d0 -= nearest.d2 + (_attr._nearest_cnn ? _attr._nearest_cnn.size(this) : 20);
      }
    }
    return _attr.d0;
  }

  /**
   * Возвращает тип элемента (рама, створка, импост)
   */
  get elm_type() {
    const {_rays, _nearest} = this._attr;

    // если начало или конец элемента соединены с соседями по Т, значит это импост
    if(_rays && !_nearest && (_rays.b.is_tt || _rays.e.is_tt)) {
      return $p.enm.elm_types.Импост;
    }

    // Если вложенный контур, значит это створка
    if(this.layer.parent instanceof Contour) {
      return $p.enm.elm_types.Створка;
    }

    return $p.enm.elm_types.Рама;
  }

  /**
   * Положение элемента в контуре
   */
  get pos() {
    const by_side = this.layer.profiles_by_side();
    if(by_side.top == this) {
      return $p.enm.positions.Верх;
    }
    if(by_side.bottom == this) {
      return $p.enm.positions.Низ;
    }
    if(by_side.left == this) {
      return $p.enm.positions.Лев;
    }
    if(by_side.right == this) {
      return $p.enm.positions.Прав;
    }
    // TODO: рассмотреть случай с выносом стоек и разрывами
    return $p.enm.positions.Центр;
  }

  /**
   * Примыкающий внешний элемент - имеет смысл для сегментов створок, доборов и рам с внешними соединителями
   * @property nearest
   * @type Profile
   */
  nearest(ign_cnn) {

    const {b, e, _attr, layer, project} = this;
    let {_nearest, _nearest_cnn} = _attr;

    if(!ign_cnn && this.inset.empty()) {
      ign_cnn = true;
    }

    const check_nearest = (elm) => {
      if(!(elm instanceof Profile || elm instanceof ProfileConnective) || !elm.isInserted()) {
        return;
      }
      let {generatrix} = elm;
      if(elm.elm_type === $p.enm.elm_types.Импост) {
        const pb = elm.cnn_point('b').profile;
        const pe = elm.cnn_point('e').profile;
        if(pb && pb.nearest(true) || pe && pe.nearest(true)) {
          generatrix = generatrix.clone({insert: false}).elongation(100);
        }
      }
      let is_nearest = [];
      if(generatrix.is_nearest(b)) {
        is_nearest.push(b);
      }
      if(generatrix.is_nearest(e)) {
        is_nearest.push(e);
      }
      if(is_nearest.length < 2 && elm instanceof ProfileConnective) {
        if(this.generatrix.is_nearest(elm.b)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.b))) {
            is_nearest.push(elm.b);
          }
        }
        if(this.generatrix.is_nearest(elm.e)) {
          if(is_nearest.every((point) => !point.is_nearest(elm.e))) {
            is_nearest.push(elm.e);
          }
        }
      }

      if(is_nearest.length > 1) {
        if(!ign_cnn) {
          if(!_nearest_cnn) {
            _nearest_cnn = project.elm_cnn(this, elm);
          }
          // выясним сторону соединения
          let outer;
          if(elm.is_linear()) {
            outer = Math.abs(elm.angle_hor - this.angle_hor) > 60;
          }
          else {
            const ob = generatrix.getOffsetOf(generatrix.getNearestPoint(b));
            const oe = generatrix.getOffsetOf(generatrix.getNearestPoint(e));
            outer = ob > oe;
          }
          _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, elm, $p.enm.cnn_types.acn.ii, _nearest_cnn, false, outer);
        }
        _attr._nearest = elm;
        return true;
      }

      _attr._nearest = null;
      _attr._nearest_cnn = null;
    };

    const find_nearest = (children) => children.some((elm) => {
      if(_nearest == elm || !elm.generatrix) {
        return;
      }
      if(check_nearest(elm)) {
        return true;
      }
      else {
        _attr._nearest = null;
      }
    });

    if(layer && !check_nearest(_attr._nearest)) {
      if(layer.parent) {
        find_nearest(layer.parent.profiles);
      }
      else {
        find_nearest(project.l_connective.children);
      }
    }

    return _attr._nearest;
  }

  /**
   * Возвращает массив примыкающих ипостов
   */
  joined_imposts(check_only) {

    const {rays, generatrix, layer} = this;
    const tinner = [];
    const touter = [];

    // точки, в которых сходятся более 2 профилей
    const candidates = {b: [], e: []};

    const {Снаружи} = $p.enm.cnn_sides;
    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === Снаружи) {
        touter.push(res);
      }
      else {
        tinner.push(res);
      }
    };

    if(layer.profiles.some((curr) => {
        if(curr != this) {
          for(const pname of ['b', 'e']) {
            const cpoint = curr.cnn_point(pname);
            if(cpoint.profile == this && cpoint.cnn) {
              if(!cpoint.profile_point) {
                if(check_only) {
                  return true;
                }
                add_impost(curr.corns(1), curr, cpoint.point);
              }
              else {
                candidates[pname].push(curr.corns(1));
              }
            }
          }
        }
      })) {
      return true;
    }

    // если в точке примыкает более 1 профиля...
    ['b', 'e'].forEach((node) => {
      if(candidates[node].length > 1) {
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) === Снаружи) {
            this.cnn_point(node).is_cut = true;
            return true;
          }
        });
      }
    });

    return check_only ? false : {inner: tinner, outer: touter};

  }

  /**
   * Возвращает массив примыкающих створочных элементов
   */
  joined_nearests() {
    const res = [];

    this.layer.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) == this) {
          res.push(profile);
        }
      });
    });

    return res;
  }

  /**
   * ### Соединение конца профиля
   * С этой функции начинается пересчет и перерисовка профиля
   * Возвращает объект соединения конца профиля
   * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
   * - Попутно устанавливает признак `is_cut`, если в точке сходятся больше двух профилей
   * - Не делает подмену соединения, хотя могла бы
   * - Не делает подмену вставки, хотя могла бы
   *
   * @method cnn_point
   * @param node {String} - имя узла профиля: "b" или "e"
   * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node, point) {
    const res = this.rays[node];
    const {cnn, profile, profile_point} = res;

    if(!point) {
      point = this[node];
    }

    // Если привязка не нарушена, возвращаем предыдущее значение
    if(profile && profile.children.length) {
      if(this.check_distance(profile, res, point, true) === false || res.distance < consts.epsilon) {
        return res;
      }
    }

    // TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
    res.clear();
    if(this.parent) {
      const {allow_open_cnn} = this.project._dp.sys;
      const ares = [];

      for(const profile of this.parent.profiles) {
        if(this.check_distance(profile, res, point, false) === false || (res.distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l))) {
          ares.push({
            profile_point: res.profile_point,
            profile: profile,
            cnn_types: res.cnn_types,
            point: res.point
          });
          res.clear();
        }
      }

      if(ares.length === 1) {
        res._mixin(ares[0]);
      }
      // если в точке сходятся 3 и более профиля, ищем тот, который смотрит на нас под максимально прямым углом
      else if(ares.length >= 2) {
        if(this.max_right_angle(ares)) {
          res._mixin(ares[0]);
          // если установленное ранее соединение проходит по типу, нового не ищем
          if(cnn && res.cnn_types && res.cnn_types.indexOf(cnn.cnn_type) != -1) {
            res.cnn = cnn;
          }
        }
        // и среди соединений нет углового диагонального, вероятно, мы находимся в разрыве - выбираем соединение с пустотой
        else {
          res.clear();
        }
        res.is_cut = true;
      }
    }

    return res;
  }

  /**
   * тот, к кому примыкает импост
   * @return {BuilderElement}
   */
  t_parent(be) {
    if(this.elm_type != $p.enm.elm_types.Импост) {
      return this;
    }
    const {_rays} = this._attr;
    if(be === 'b') {
      return _rays && _rays.b.profile;
    }
    if(be === 'e') {
      return _rays && _rays.e.profile;
    }
    return _rays && (_rays.b.profile || _rays.e.profile);
  }
}

EditorInvisible.Profile = Profile;
EditorInvisible.ProfileItem = ProfileItem;
