/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule filling
 */


/**
 * ### Заполнение
 * - Инкапсулирует поведение элемента заполнения
 * - У заполнения есть коллекция рёбер, образующая путь контура
 * - Путь всегда замкнутый, образует простой многоугольник без внутренних пересечений, рёбра могут быть гнутыми
 *
 * @class Filling
 * @param attr {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 * @menuorder 45
 * @tooltip Заполнение
 */

class Filling extends BuilderElement {

  constructor(attr) {

    super(attr);

    /**
     * За этим полем будут "следить" элементы раскладок и пересчитывать - перерисовывать себя при изменениях соседей
     */
    this._noti = {};

    /**
     * Формирует оповещение для тех, кто следит за this._noti
     * @param obj
     */
    this.notify = function (obj) {
      Object.getNotifier(this._noti).notify(obj);
      this.project.register_change();
    }.bind(this);


    // initialize
    this.initialize(attr);

  }

  initialize(attr) {

    const _row = attr.row;
    const h = this.project.bounds.height + this.project.bounds.y;

    if(_row.path_data){
      this.data.path = new paper.Path(_row.path_data);
    }

    else if(attr.path){
      this.data.path = new paper.Path();
      this.path = attr.path;
    }
    else{
      this.data.path = new paper.Path([
        [_row.x1, h - _row.y1],
        [_row.x1, h - _row.y2],
        [_row.x2, h - _row.y2],
        [_row.x2, h - _row.y1]
      ]);
    }

    this.data.path.closePath(true);
    this.data.path.reduce();
    this.data.path.strokeWidth = 0;

    // для нового устанавливаем вставку по умолчанию
    if(_row.inset.empty()){
      _row.inset = this.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
    }

    // для нового устанавливаем цвет по умолчанию
    if(_row.clr.empty()){
      this.project._dp.sys.elmnts.find_rows({nom: _row.inset}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    if(_row.clr.empty()){
      this.project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    this.clr = _row.clr;

    if(_row.elm_type.empty()){
      _row.elm_type = $p.enm.elm_types.Стекло;
    }

    this.data.path.visible = false;

    this.addChild(this.data.path);

    // раскладки текущего заполнения
    this.project.ox.coordinates.find_rows({
      cnstr: this.layer.cnstr,
      parent: this.elm,
      elm_type: $p.enm.elm_types.Раскладка
    }, (row) => new Onlay({row: row, parent: this}));

  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   * @for Filling
   */
  save_coordinates() {

    const {_row, project, profiles, bounds} = this;
    const h = project.bounds.height + project.bounds.y;
    const cnns = project.connections.cnns;
    const length = profiles.length;

    // строка в таблице заполнений продукции
    this.project.ox.glasses.add({
        elm: _row.elm,
        nom: this.nom,
        width: bounds.width,
        height: bounds.height,
        s: this.s,
        is_rectangular: this.is_rectangular,
        thickness: this.thickness
      });

    let curr, prev,	next

    // координаты bounds
    _row.x1 = (bounds.bottomLeft.x - this.project.bounds.x).round(3);
    _row.y1 = (h - bounds.bottomLeft.y).round(3);
    _row.x2 = (bounds.topRight.x - this.project.bounds.x).round(3);
    _row.y2 = (h - bounds.topRight.y).round(3);
    _row.path_data = this.path.pathData;

    // получаем пути граней профиля
    for(let i=0; i<length; i++ ){

      curr = profiles[i];

      if(!curr.profile || !curr.profile._row || !curr.cnn){
        if($p.job_prm.debug)
          throw new ReferenceError("Не найдено ребро заполнения");
        else
          return;
      }

      curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e).data.reversed ?
        curr.profile.rays.outer : curr.profile.rays.inner;
    }

    // получам пересечения
    for(let i=0; i<length; i++ ){

      prev = i === 0 ? profiles[length-1] : profiles[i-1];
      curr = profiles[i];
      next = i === length-1 ? profiles[0] : profiles[i+1];

      const pb = curr.aperture_path.intersect_point(prev.aperture_path, curr.b, true);
      const pe = curr.aperture_path.intersect_point(next.aperture_path, curr.e, true);

      if(!pb || !pe){
        if($p.job_prm.debug)
          throw "Filling:path";
        else
          return;
      }

      // соединения с профилями
      cnns.add({
        elm1: _row.elm,
        elm2: curr.profile._row.elm,
        node1: "",
        node2: "",
        cnn: curr.cnn.ref,
        aperture_len: curr.aperture_path.get_subpath(pb, pe).length.round(1)
      });

    }

    // удаляем лишние ссылки
    for(let i=0; i<length; i++ ){
      delete profiles[i].aperture_path;
    }

    // дочерние раскладки
    this.onlays.forEach((curr) => curr.save_coordinates());
  }

  /**
   * Создаёт створку в текущем заполнении
   */
  create_leaf() {
    // создаём пустой новый слой
    const contour = new Contour( {parent: this.parent});

    // задаём его путь - внутри будут созданы профили
    contour.path = this.profiles;

    // помещаем себя вовнутрь нового слоя
    this.parent = contour;
    this._row.cnstr = contour.cnstr;

    // фурнитура и параметры по умолчанию
    contour.furn = this.project.default_furn;

    // оповещаем мир о новых слоях
    Object.getNotifier(this.project._noti).notify({
      type: 'rows',
      tabular: "constructions"
    });
  }

  select_node(v) {
    let point, segm, delta = Infinity;
    if(v === "b"){
      point = this.bounds.bottomLeft;
    }else{
      point = this.bounds.topRight;
    }
    this.data.path.segments.forEach((curr) => {
      curr.selected = false;
      if(point.getDistance(curr.point) < delta){
        delta = point.getDistance(curr.point);
        segm = curr;
      }
    });
    if(segm){
      segm.selected = true;
      this.view.update();
    }
  }

  setSelection(selection) {
    super.setSelection(selection);
    const {_text} = this.data;
    _text && _text.setSelection(0);
  }

  /**
   * Перерисовывает раскладки текущего заполнения
   */
  redraw() {

    this.sendToBack();

    const {path, onlays, data, is_rectangular} = this;
    const {elm_font_size} = consts;

    path.visible = true;
    onlays.forEach((elm) => elm.redraw());

    // если текст не создан - добавляем
    if(!data._text){
      data._text = new paper.PointText({
        parent: this,
        fillColor: 'black',
        fontSize: elm_font_size,
        guide: true,
      });
    }
    data._text.visible = is_rectangular;

    if(is_rectangular){
      const {bounds} = path;
      data._text.content = this.formula;
      data._text.point = bounds.bottomLeft.add([elm_font_size,-elm_font_size]);
      if(data._text.bounds.width > (bounds.width - 2 * elm_font_size)){
        const atext = data._text.content.split(' ');
        if(atext.length > 1){
          data._text.content = '';
          atext.forEach((text, index) => {
            if(!data._text.content){
              data._text.content = text;
            }
            else{
              data._text.content += ((index === atext.length - 1) ? '\n' : ' ') + text;
            }
          })
          data._text.point.y -= elm_font_size;
        }
      }
    }
    else{

    }
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param [ignore_select] {Boolean}
   */
  set_inset(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){

      const {glass_specification} = this.project.ox;
      const proto = glass_specification.find_rows({elm: this.elm});

      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          // копируем вставку
          elm.set_inset(v, true);
          // копируем состав заполнения
          glass_specification.clear(true, {elm: elm.elm});
          proto.forEach((row) => glass_specification.add({
            elm: elm.elm,
            inset: row.inset,
            clr: row.clr,
          }));
        }
      });
    }
    super.set_inset(v);
  }

  /**
   * Сеттер цвета элемента
   * @param v {CatClrs}
   * @param ignore_select {Boolean}
   */
  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){
      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          elm.set_clr(v, true);
        }
      });
    }
    super.set_clr(v);
  }

  get profiles() {
    return this.data._profiles || [];
  }

  /**
   * Массив раскладок
   */
  get onlays() {
    return this.getItems({class: Onlay});
  }

  /**
   * Площадь заполнения
   * @return {number}
   */
  get s() {
    return this.bounds.width * this.bounds.height / 1000000;
  }

  /**
   * Признак прямоугольности
   */
  get is_rectangular() {
    return this.profiles.length === 4 && !this.data.path.hasHandles();
  }

  get is_sandwich() {
    return false;
  }

  /**
   * путь элемента - состоит из кривых, соединяющих вершины элемента
   * @property path
   * @type paper.Path
   */
  get path() {
    return this.data.path;
  }
  set path(attr) {
    let {data, path} = this;

    if(path){
      path.removeSegments();
    }
    else{
      path = data.path = new paper.Path({parent: this});
    }

    data._profiles = [];

    if(attr instanceof paper.Path){

      // Если в передаваемом пути есть привязка к профилям контура - используем
      if(attr.data.curve_nodes){
        path.addSegments(attr.segments);
      }
      else{
        path.addSegments(attr.segments);
      }
    }
    else if(Array.isArray(attr)){
      const {length} = attr;
      let prev, curr, next, sub_path;
      // получам эквидистанты сегментов, смещенные на размер соединения
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);
        curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile);

        curr.sub_path = sub_path.equidistant(
          (sub_path.data.reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

      }
      // получам пересечения
      for(let i=0; i<length; i++ ){
        prev = i === 0 ? attr[length-1] : attr[i-1];
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        if(!curr.pb)
          curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
        if(!curr.pe)
          curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
        if(!curr.pb || !curr.pe){
          if($p.job_prm.debug)
            throw "Filling:path";
          else
            continue;
        }
        curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
      }
      // формируем путь
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        path.addSegments(curr.sub_path.segments);
        ["anext","pb","pe"].forEach((prop) => { delete curr[prop] });
        data._profiles.push(curr);
      }
    }

    if(path.segments.length && !path.closed){
      path.closePath(true);
    }

    path.reduce();
  }

  // возвращает текущие (ранее установленные) узлы заполнения
  get nodes() {
    let res = this.profiles.map((curr) => curr.b);
    if(!res.length){
      const {path, parent} = this;
      if(path){
        res = parent.glass_nodes(path);
      }
    }
    return res;
  }

  /**
   * Возвращает массив внешних примыкающих профилей текущего заполнения
   */
  get outer_profiles() {
    return this.profiles;
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter() {
    const res = [];
    this.profiles.forEach((curr) => {
      const tmp = {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle
      }
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
    });
    return res;
  }

  /**
   * Координата x левой границы (только для чтения)
   */
  get x1() {
    return (this.bounds.left - this.project.bounds.x).round(1);
  }

  /**
   * Координата x правой границы (только для чтения)
   */
  get x2() {
    return (this.bounds.right - this.project.bounds.x).round(1);
  }

  /**
   * Координата y нижней границы (только для чтения)
   */
  get y1() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
  }

  /**
   * Координата y верхней (только для чтения)
   */
  get y2() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
  }

  /**
   * информация для редактора свойста
   */
  get info() {
    const {elm, bounds, thickness} = this;
    return "№" + elm + " w:" + bounds.width.toFixed(0) + " h:" + bounds.height.toFixed(0) + " z:" + thickness.toFixed(0);
  }

  /**
   * Описание полей диалога свойств элемента
   */
  get oxml() {
    const oxml = {
      " ": [
        {id: "info", path: "o.info", type: "ro"},
        "inset",
        "clr"
      ],
      "Начало": [
        {id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
        {id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
      ],
      "Конец": [
        {id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
        {id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
      ]
    };
    if(this.selected_cnn_ii()){
      oxml["Примыкание"] = ["cnn3"];
    }
    return oxml;
  }

  get default_clr_str() {
    return "#def,#d0ddff,#eff";
  }

  /**
   * Возвращает формулу (код состава) заполнения
   */
  get formula() {
    let res;
    this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
      const aname = row.inset.name.split(' ');
      const name = aname.length ? aname[0] : ''
      if(!res){
        res = name;
      }
      else{
        res += "x" + name;
      }
    });
    return res || this.inset.name;
  }

  // виртуальная ссылка для заполнений равна толщине
  get ref() {
    return this.thickness.toFixed();
  }

  // переопределяем геттер вставки
  get inset() {
    const ins = super.inset;
    const {data} = this;
    if(!data._ins_proxy || data._ins_proxy._ins !== ins){
      data._ins_proxy = new Proxy(ins, {
        get: (target, prop) => {
          switch (prop){
            case 'presentation':
              return this.formula;

            case 'thickness':
              let res = 0;
              this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
                res += row.inset.thickness;
              });
              return res || ins.thickness;

            default:
              return target[prop];
          }
        }
      });
      data._ins_proxy._ins = ins;
    }
    return data._ins_proxy;
  }
  set inset(v) {
    this.set_inset(v);
  }

}

Editor.Filling = Filling;
