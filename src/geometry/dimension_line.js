/**
 * ### Размерные линии на эскизе
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 21.08.2015
 *
 * @module geometry
 * @submodule dimension_line
 */

/**
 * ### Размерная линия на эскизе
 * Унаследована от [paper.Group](http://paperjs.org/reference/group/)<br />
 * См. так же, {{#crossLink "DimensionLineCustom"}}{{/crossLink}} - размерная линия, устанавливаемая пользователем
 *
 * @class DimensionLine
 * @extends paper.Group
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @constructor
 * @menuorder 46
 * @tooltip Размерная линия
 */

class DimensionLine extends paper.Group {

  constructor(attr) {

    super(attr);

    this._row = attr.row;

    if(this._row && this._row.path_data){
      attr._mixin(JSON.parse(this._row.path_data));
      if(attr.elm1){
        attr.elm1 = this.project.getItem({elm: attr.elm1});
      }
      if(attr.elm2){
        attr.elm2 = this.project.getItem({elm: attr.elm2});
      }
    }

    this.data.pos = attr.pos;
    this.data.elm1 = attr.elm1;
    this.data.elm2 = attr.elm2 || this.data.elm1;
    this.data.p1 = attr.p1 || "b";
    this.data.p2 = attr.p2 || "e";
    this.data.offset = attr.offset;

    if(attr.impost){
      this.data.impost = true;
    }

    if(attr.contour){
      this.data.contour = true;
    }

    if(!this.data.pos && (!this.data.elm1 || !this.data.elm2)){
      this.remove();
      return null;
    }

    // создаём детей
    new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
    new paper.PointText({
      parent: this,
      name: 'text',
      justification: 'center',
      fillColor: 'black',
      fontSize: 72});

    this.on({
      mouseenter: this._mouseenter,
      mouseleave: this._mouseleave,
      click: this._click
    });

    $p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

  }

  // виртуальные метаданные для автоформ
  get _metadata() {
    return $p.dp.builder_text.metadata();
  }

  // виртуальный датаменеджер для автоформ
  get _manager() {
    return $p.dp.builder_text;
  }

  _mouseenter() {
    paper.canvas_cursor('cursor-arrow-ruler');
  }

  _mouseleave() {
    //paper.canvas_cursor('cursor-arrow-white');
  }

  _click(event) {
    event.stop();
    this.wnd = new RulerWnd(null, this);
    this.wnd.size = this.size;
  }

  _move_points(event, xy) {

    let _bounds, delta;

    // получаем дельту - на сколько смещать
    if(this.data.elm1){

      // в _bounds[event.name] надо поместить координату по x или у (в зависисмости от xy), которую будем двигать
      _bounds = {};

      if(this.pos == "top" || this.pos == "bottom"){

        const size = Math.abs(this.data.elm1[this.data.p1].x - this.data.elm2[this.data.p2].x);

        if(event.name == "right"){
          delta = new paper.Point(event.size - size, 0);
          _bounds[event.name] = Math.max(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);

        }else{
          delta = new paper.Point(size - event.size, 0);
          _bounds[event.name] = Math.min(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);
        }


      }else{

        const size = Math.abs(this.data.elm1[this.data.p1].y - this.data.elm2[this.data.p2].y);

        if(event.name == "bottom"){
          delta = new paper.Point(0, event.size - size);
          _bounds[event.name] = Math.max(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);

        }
        else{
          delta = new paper.Point(0, size - event.size);
          _bounds[event.name] = Math.min(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);
        }
      }

    }else {

      _bounds = this.layer.bounds;

      if(this.pos == "top" || this.pos == "bottom")
        if(event.name == "right")
          delta = new paper.Point(event.size - _bounds.width, 0);
        else
          delta = new paper.Point(_bounds.width - event.size, 0);
      else{
        if(event.name == "bottom")
          delta = new paper.Point(0, event.size - _bounds.height);
        else
          delta = new paper.Point(0, _bounds.height - event.size);
      }

    }

    if(delta.length){

      paper.project.deselect_all_points();

      paper.project.getItems({class: Profile}).forEach(function (p) {
        if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0 && Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
          p.generatrix.segments.forEach(function (segm) {
            segm.selected = true;
          })

        }else if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0){
          p.generatrix.firstSegment.selected = true;

        }else if(Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
          p.generatrix.lastSegment.selected = true;

        }

      });
      this.project.move_points(delta);
      setTimeout(function () {
        this.deselect_all_points(true);
        this.register_update();
        //this.zoom_fit();
      }.bind(this.project), 200);
    }

  }

  _sizes_wnd(event) {

    if(this.wnd && event.wnd == this.wnd.wnd){

      switch(event.name) {
        case 'close':
          if(this.children.text){
            this.children.text.selected = false;
          }
          this.wnd = null;
          break;

        case 'left':
        case 'right':
          if(this.pos == "top" || this.pos == "bottom"){
            this._move_points(event, "x");
          }
          break;

        case 'top':
        case 'bottom':
          if(this.pos == "left" || this.pos == "right"){
            this._move_points(event, "y");
          }
          break;
      }
    }

  }

  redraw() {

    const {layer, project, children, data, pos} = this;
    if(!children.length){
      return;
    }
    const _bounds = layer.bounds;
    const _dim_bounds = layer instanceof DimensionLayer ? project.dimension_bounds : layer.dimension_bounds;
    let offset = 0, b, e, bs, es;

    if(!pos){
      b = typeof data.p1 == "number" ? data.elm1.corns(data.p1) : data.elm1[data.p1];
      e = typeof data.p2 == "number" ? data.elm2.corns(data.p2) : data.elm2[data.p2];
    }
    else if(pos == "top"){
      b = _bounds.topLeft;
      e = _bounds.topRight;
      offset = _bounds[pos] - _dim_bounds[pos];
    }
    else if(pos == "left"){
      b = _bounds.bottomLeft;
      e = _bounds.topLeft;
      offset = _bounds[pos] - _dim_bounds[pos];
    }
    else if(pos == "bottom"){
      b = _bounds.bottomLeft;
      e = _bounds.bottomRight;
      offset = _bounds[pos] - _dim_bounds[pos];
    }
    else if(pos == "right"){
      b = _bounds.bottomRight;
      e = _bounds.topRight;
      offset = _bounds[pos] - _dim_bounds[pos];
    }

    // если точки профиля еще не нарисованы - выходим
    if(!b || !e){
      this.visible = false;
      return;
    }

    const tmp = new paper.Path({ insert: false, segments: [b, e] });

    if(data.elm1 && pos){
      b = tmp.getNearestPoint(data.elm1[data.p1]);
      e = tmp.getNearestPoint(data.elm2[data.p2]);
      if(tmp.getOffsetOf(b) > tmp.getOffsetOf(e)){
        [b, e] = [e, b]
      }
      tmp.firstSegment.point = b;
      tmp.lastSegment.point = e;
    }

    // прячем крошечные размеры
    const length = tmp.length;
    if(length < consts.sticking_l){
      this.visible = false;
      return;
    }

    this.visible = true;

    const normal = tmp.getNormalAt(0).multiply(this.offset + offset);

    bs = b.add(normal.multiply(0.8));
    es = e.add(normal.multiply(0.8));

    if(children.callout1.segments.length){
      children.callout1.firstSegment.point = b;
      children.callout1.lastSegment.point = b.add(normal);
    }
    else{
      children.callout1.addSegments([b, b.add(normal)]);
    }

    if(children.callout2.segments.length){
      children.callout2.firstSegment.point = e;
      children.callout2.lastSegment.point = e.add(normal);
    }
    else{
      children.callout2.addSegments([e, e.add(normal)]);
    }

    if(children.scale.segments.length){
      children.scale.firstSegment.point = bs;
      children.scale.lastSegment.point = es;
    }
    else{
      children.scale.addSegments([bs, es]);
    }

    children.text.content = length.toFixed(0);
    children.text.rotation = e.subtract(b).angle;
    children.text.point = bs.add(es).divide(2);
  }

  // размер
  get size() {
    return parseFloat(this.children.text.content) || 0;
  }
  set size(v) {
    this.children.text.content = parseFloat(v).round(1);
  }

  // угол к горизонту в направлении размера
  get angle() {
    return 0;
  }
  set angle(v) {

  }

  // расположение относительно контура $p.enm.pos
  get pos() {
    return this.data.pos || "";
  }
  set pos(v) {
    this.data.pos = v;
    this.redraw();
  }

  // отступ от внешней границы изделия
  get offset() {
    return this.data.offset || 90;
  }
  set offset(v) {
    const offset = (parseInt(v) || 90).round(0);
    if(this.data.offset != offset){
      this.data.offset = offset;
      this.project.register_change(true);
    }
  }

  /**
   * Удаляет элемент из контура и иерархии проекта
   * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
   * @method remove
   */
  remove() {
    if(this._row){
      this._row._owner.del(this._row);
      this._row = null;
      this.project.register_change();
    }
    super.remove();
  }
}


/**
 * ### Служебный слой размерных линий
 * Унаследован от [paper.Layer](http://paperjs.org/reference/layer/)
 *
 * @class DimensionLayer
 * @extends paper.Layer
 * @param attr
 * @constructor
 */
class DimensionLayer extends paper.Layer {

  get bounds() {
    return this.project.bounds;
  }

}


/**
 * ### Размерные линии, определяемые пользователем
 * @class DimensionLineCustom
 * @extends DimensionLine
 * @param attr
 * @constructor
 */
class DimensionLineCustom extends DimensionLine {

  constructor(attr) {

    if(!attr.row){
      attr.row = attr.parent.project.ox.coordinates.add();
    }

    // слой, которому принадлежит размерная линия
    if(!attr.row.cnstr){
      attr.row.cnstr = attr.parent.layer.cnstr;
    }

    // номер элемента
    if(!attr.row.elm){
      attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    super(attr);

    this.on({
      mouseenter: this._mouseenter,
      mouseleave: this._mouseleave,
      click: this._click
    });

  }

  /**
   * Возвращает тип элемента (размерная линия)
   */
  get elm_type() {
    return $p.enm.elm_types.Размер;
  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {
    const _row = this._row;

    // сохраняем размер
    _row.len = this.size;

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

    // сериализованные данные
    _row.path_data = JSON.stringify({
      pos: this.pos,
      elm1: this.data.elm1.elm,
      elm2: this.data.elm2.elm,
      p1: this.data.p1,
      p2: this.data.p2,
      offset: this.offset
    });
  }

  _click(event) {
    event.stop();
    this.selected = true;
  }


}

