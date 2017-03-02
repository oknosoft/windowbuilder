/**
 * ### Раскладка
 * &copy; http://www.oknosoft.ru 2014-2015<br />
 * Created 16.05.2016
 *
 * @module geometry
 * @submodule profile_onlay
 *
 */

/**
 * ### Раскладка
 * Класс описывает поведение элемента раскладки
 *
 * - у раскладки есть координаты конца и начала
 * - есть путь образующей - прямая или кривая линия, такая же, как у {{#crossLink "Profile"}}{{/crossLink}}
 * - владелец типа {{#crossLink "Filling"}}{{/crossLink}}
 * - концы могут соединяться не только с пустотой или другими раскладками, но и с рёбрами заполнения
 *
 * @class Onlay
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 44
 * @tooltip Раскладка
 */
class Onlay extends ProfileItem {

  /**
   * Расстояние от узла до опорной линии, для соединителей и раскладок == 0
   * @property d0
   * @type Number
   */
  get d0() {
    return 0;
  }

  /**
   * Расстояние от узла до внешнего ребра элемента
   * для рамы, обычно = 0, для импоста 1/2 ширины
   * зависит от ширины элементов и свойств примыкающих соединений
   * @property d1
   * @type Number
   */
  get d1() {
    return this.sizeb;
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

  /**
   * Возвращает тип элемента (раскладка)
   */
  get elm_type() {
    return $p.enm.elm_types.Раскладка;
  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   * @for Onlay
   */
  save_coordinates() {

    if(!this.data.generatrix){
      return;
    }

    const {_row, project, rays, generatrix} = this;
    const {cnns} = project.connections;
    const {b, e} = rays;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: "b",
      cnn: b.cnn ? b.cnn.ref : "",
      aperture_len: this.corns(1).getDistance(this.corns(4))
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: "e",
      cnn: e.cnn ? e.cnn.ref : "",
      aperture_len: this.corns(2).getDistance(this.corns(3))
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;
    _row.parent = this.parent.elm;


    // добавляем припуски соединений
    _row.len = this.length;

    // сохраняем информацию о соединениях
    if(b.profile){
      row_b.elm2 = b.profile.elm;
      if(b.profile instanceof Filling)
        row_b.node2 = "t";
      else if(b.profile.e.is_nearest(b.point))
        row_b.node2 = "e";
      else if(b.profile.b.is_nearest(b.point))
        row_b.node2 = "b";
      else
        row_b.node2 = "t";
    }
    if(e.profile){
      row_e.elm2 = e.profile.elm;
      if(e.profile instanceof Filling)
        row_e.node2 = "t";
      else if(e.profile.b.is_nearest(e.point))
        row_e.node2 = "b";
      else if(e.profile.e.is_nearest(e.point))
        row_e.node2 = "b";
      else
        row_e.node2 = "t";
    }

    // получаем углы между элементами и к горизонту
    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0)
      _row.alp1 = _row.alp1 + 360;

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0)
      _row.alp2 = _row.alp2 + 360;

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;
  }

  /**
   * С этой функции начинается пересчет и перерисовка сегмента раскладки
   * Возвращает объект соединения конца профиля
   * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
   * - Не делает подмену соединения, хотя могла бы
   * - Не делает подмену вставки, хотя могла бы
   *
   * @method cnn_point
   * @for Onlay
   * @param node {String} - имя узла профиля: "b" или "e"
   * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node, point) {

    const res = this.rays[node];

    if(!point){
      point = this[node];
    }

    // Если привязка не нарушена, возвращаем предыдущее значение
    if(res.profile && res.profile.children.length){

      if(res.profile instanceof Filling){
        const np = res.profile.path.getNearestPoint(point);
        if(np.getDistance(point) < consts.sticking_l){
          res.point = np;
          return res;
        }
      }
      else{
        if(this.check_distance(res.profile, res, point, true) === false){
          return res;
        }
      }
    }

    // TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
    res.clear();
    if(this.parent){
      const res_bind = this.bind_node(point);
      if(res_bind.binded){
        res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
      }
    }
    return res;
  }

  /**
   * Пытается привязать точку к рёбрам и раскладкам
   * @param point {paper.Point}
   * @param glasses {Array.<Filling>}
   * @return {Object}
   */
  bind_node(point, glasses) {

    if(!glasses){
      glasses = [this.parent];
    }

    let res = {distance: Infinity, is_l: true};

    // сначала, к образующим заполнений
    glasses.some((glass) => {
      const np = glass.path.getNearestPoint(point);
      let distance = np.getDistance(point);

      if(distance < res.distance){
        res.distance = distance;
        res.point = np;
        res.profile = glass;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }

      if(distance < consts.sticking_l){
        res.binded = true;
        return true;
      }

      // затем, если не привязалось - к сегментам раскладок текущего заполнения
      glass.onlays.some((elm) => {
        if (elm.project.check_distance(elm, null, res, point, "node_generatrix") === false ){
          return true;
        }
      });

    });

    if(!res.binded && res.point && res.distance < consts.sticking){
      res.binded = true;
    }

    return res;
  }

}

