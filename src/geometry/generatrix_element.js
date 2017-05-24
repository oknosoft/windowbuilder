/**
 * ### Элемент c образующей
 * Виртуальный класс - BuilderElement, у которго есть образующая
 *
 * @class GeneratrixElement
 * @extends BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @menuorder 41
 * @tooltip Элемент c образующей
 */
class GeneratrixElement extends BuilderElement {

  constructor(attr = {}) {
    const {generatrix} = attr;
    if (generatrix) {
      delete attr.generatrix;
    }
    super(attr);
    if (generatrix) {
      attr.generatrix = generatrix;
    }
    this.initialize(attr);
  }

  /**
   * ### Координаты начала элемента
   * @property b
   * @type paper.Point
   */
  get b() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.firstSegment.point;
  }
  set b(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.firstSegment.point = v;
  }

  /**
   * Координаты конца элемента
   * @property e
   * @type Point
   */
  get e() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.lastSegment.point;
  }
  set e(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.lastSegment.point = v;
  }

  /**
   * ### Координата x начала профиля
   *
   * @property x1
   * @type Number
   */
  get x1() {
    const {bounds} = this.project;
    return bounds ? (this.b.x - bounds.x).round(1) : 0;
  }
  set x1(v) {
    const {bounds} = this.project;
    if(bounds){
      this.select_node("b");
      this.move_points(new paper.Point(parseFloat(v) + bounds.x - this.b.x, 0));
    }
  }

  /**
   * ### Координата y начала профиля
   *
   * @property y1
   * @type Number
   */
  get y1() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.b.y).round(1) : 0;
  }
  set y1(v) {
    const {bounds} = this.project;
    if(bounds){
      v = bounds.height + bounds.y - parseFloat(v);
      this.select_node("b");
      this.move_points(new paper.Point(0, v - this.b.y));
    }
  }

  /**
   * ###Координата x конца профиля
   *
   * @property x2
   * @type Number
   */
  get x2() {
    const {bounds} = this.project;
    return bounds ? (this.e.x - bounds.x).round(1) : 0;
  }
  set x2(v) {
    const {bounds} = this.project;
    if(bounds){
      this.select_node("e");
      this.move_points(new paper.Point(parseFloat(v) + bounds.x - this.e.x, 0));
    }
  }

  /**
   * ### Координата y конца профиля
   *
   * @property y2
   * @type Number
   */
  get y2() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.e.y).round(1) : 0;
  }
  set y2(v) {
    const {bounds} = this.project;
    if(bounds){
      v = bounds.height + bounds.y - parseFloat(v);
      this.select_node("e");
      this.move_points(new paper.Point(0, v - this.e.y));
    }
  }

  /**
   * ### Выделяет начало или конец профиля
   *
   * @method select_node
   * @param node {String} b, e - начало или конец элемента
   */
  select_node(node) {
    const {generatrix, project, _attr, view} = this;
    project.deselect_all_points();
    if(_attr.path){
      _attr.path.selected = false;
    }
    if(node == "b"){
      generatrix.firstSegment.selected = true;
    }
    else{
      generatrix.lastSegment.selected = true;
    }
    view.update();
  }

  /**
   * ### Двигает узлы
   * Обрабатывает смещение выделенных сегментов образующей профиля
   *
   * @method move_points
   * @param delta {paper.Point} - куда и насколько смещать
   * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
   * @param [start_point] {paper.Point} - откуда началось движение
   */
  move_points(delta, all_points, start_point) {

    if(!delta.length){
      return;
    }

    const	other = [];
    const noti = {type: consts.move_points, profiles: [this], points: []};

    let changed;

    // если не выделено ни одного сегмента, двигаем все сегменты
    if(!all_points){
      all_points = !this.generatrix.segments.some((segm) => {
        if (segm.selected)
          return true;
      });
    }

    this.generatrix.segments.forEach((segm) => {

      let cnn_point;

      if (segm.selected || all_points){

        const noti_points = {old: segm.point.clone(), delta: delta};

        // собственно, сдвиг узлов
        const free_point = segm.point.add(delta);

        if(segm.point == this.b){
          cnn_point = this.rays.b;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("b", free_point);
          }
        }
        else if(segm.point == this.e){
          cnn_point = this.rays.e;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("e", free_point);
          }
        }

        if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
          segm.point = cnn_point.point;
        }
        else{
          segm.point = free_point;
          // если соединение угловое диагональное, тянем тянем соседние узлы сразу
          if(cnn_point && !paper.Key.isDown('control')){
            if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
              other.push(cnn_point.profile_point == "b" ? cnn_point.profile._attr.generatrix.firstSegment : cnn_point.profile._attr.generatrix.lastSegment );
              cnn_point.profile[cnn_point.profile_point] = free_point;
              noti.profiles.push(cnn_point.profile);
            }
          }
        }

        // накапливаем точки в нотификаторе
        noti_points.new = segm.point;
        if(start_point){
          noti_points.start = start_point;
        }
        noti.points.push(noti_points);

        changed = true;
      }

    });


    // информируем систему об изменениях
    if(changed){

      this._attr._rays.clear();

      this.layer && this.layer.notify && this.layer.notify(noti);

      const notifier = Object.getNotifier(this);
      notifier.notify({ type: 'update', name: "x1" });
      notifier.notify({ type: 'update', name: "y1" });
      notifier.notify({ type: 'update', name: "x2" });
      notifier.notify({ type: 'update', name: "y2" });
    }

    return other;
  }

}
