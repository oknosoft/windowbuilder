/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2018
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

class Filling extends AbstractFilling(BuilderElement) {

  constructor(attr) {

    const {path} = attr;
    if(path){
      delete attr.path;
    }

    super(attr);

    if(path){
      attr.path = path;
    }

    // initialize
    this.initialize(attr);

  }

  initialize(attr) {

    const _row = attr.row;
    const {_attr, project} = this;
    const h = project.bounds.height + project.bounds.y;

    if(_row.path_data){
      _attr.path = new paper.Path(_row.path_data);
    }

    else if(attr.path){
      _attr.path = new paper.Path();
      this.path = attr.path;
    }
    else{
      _attr.path = new paper.Path([
        [_row.x1, h - _row.y1],
        [_row.x1, h - _row.y2],
        [_row.x2, h - _row.y2],
        [_row.x2, h - _row.y1]
      ]);
    }

    _attr.path.closePath(true);
    _attr.path.reduce();
    _attr.path.strokeWidth = 0;

    // для нового устанавливаем вставку по умолчанию
    if(_row.inset.empty()){
      _row.inset = project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
    }

    // для нового устанавливаем цвет по умолчанию
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({nom: _row.inset}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    this.clr = _row.clr;

    if(_row.elm_type.empty()){
      _row.elm_type = $p.enm.elm_types.Стекло;
    }

    _attr.path.visible = false;

    this.addChild(_attr.path);

    // раскладки текущего заполнения
    project.ox.coordinates.find_rows({
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

    const {_row, project, profiles, bounds, imposts, nom} = this;
    const h = project.bounds.height + project.bounds.y;
    const {cnns} = project;
    const length = profiles.length;

    // строка в таблице заполнений продукции
    project.ox.glasses.add({
      elm: _row.elm,
      nom: nom,
      formula: this.formula(),
      width: bounds.width,
      height: bounds.height,
      s: this.area,
      is_rectangular: this.is_rectangular,
      is_sandwich: nom.elm_type == $p.enm.elm_types.Заполнение,
      thickness: this.thickness,
    });

    let curr, prev,	next

    // координаты bounds
    _row.x1 = (bounds.bottomLeft.x - project.bounds.x).round(3);
    _row.y1 = (h - bounds.bottomLeft.y).round(3);
    _row.x2 = (bounds.topRight.x - project.bounds.x).round(3);
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

      curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e)._reversed ?
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
    imposts.forEach((curr) => curr.save_coordinates());
  }

  /**
   * Создаёт створку в текущем заполнении
   */
  create_leaf() {

    const {project} = this;

    // прибиваем соединения текущего заполнения
    project.cnns.clear({elm1: this.elm});

    // создаём пустой новый слой
    const contour = new Contour( {parent: this.parent});

    // задаём его путь - внутри будут созданы профили
    contour.path = this.profiles;

    // помещаем себя вовнутрь нового слоя
    this.parent = contour;
    this._row.cnstr = contour.cnstr;

    // фурнитура и параметры по умолчанию
    contour.furn = project.default_furn;

    // оповещаем мир о новых слоях
    project.notify(contour, 'rows', {constructions: true});

    // делаем створку текущей
    contour.activate();
  }

  /**
   * Возвращает сторону соединения заполнения с профилем раскладки
   */
  cnn_side() {
    return $p.enm.cnn_sides.Изнутри;
  }

  /**
   * Примыкающий внешний элемент - для заполнений всегда null
   */
  nearest() {
    return null;
  }

  select_node(v) {
    let point, segm, delta = Infinity;
    if(v === "b"){
      point = this.bounds.bottomLeft;
    }else{
      point = this.bounds.topRight;
    }
    this._attr.path.segments.forEach((curr) => {
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
    if(selection){
      const {path} = this;
      for(let elm of this.children){
        if(elm != path){
          elm.selected = false;
        }
      }
    }
  }

  /**
   * Перерисовывает раскладки текущего заполнения
   */
  redraw() {

    this.sendToBack();

    const {path, imposts, _attr, is_rectangular} = this;
    const {elm_font_size, font_family} = consts;
    const fontSize = elm_font_size * (2 / 3);
    const maxTextWidth = 490;
    path.visible = true;
    imposts.forEach((elm) => elm.redraw());
    
    // прочистим пути
    this.purge_paths();
    
    // если текст не создан - добавляем
    if(!_attr._text){
      _attr._text = new paper.PointText({
        parent: this,
        fillColor: 'black',
        fontFamily: font_family,
        fontSize,
        guide: true,
        visible: true,
      });
    }

    // Задаем надпись формулы
    const {bounds} = path;
    let turn = bounds.width * 1.5 < bounds.height;
    _attr._text.content = this.formula();

    const textBounds = bounds.scale(0.9);
    textBounds.width = textBounds.width > maxTextWidth ? maxTextWidth : textBounds.width;
    textBounds.height = textBounds.height > maxTextWidth ? maxTextWidth : textBounds.height;

    if(is_rectangular){
      _attr._text.fitBounds(textBounds);
      _attr._text.point = turn
        ? bounds.bottomRight.add([-fontSize, -fontSize * 0.6])
        : bounds.bottomLeft.add([fontSize * 0.6, -fontSize]);
      _attr._text.rotation = turn ? 270 : 0;
    }
    else{
      _attr._text.fitBounds(textBounds.scale(0.8));
      // Поиск самой длинной кривой пути
      const maxCurve = path.curves.reduce((curv, item) => item.length > curv.length ? item : curv, path.curves[0]);
      const {angle, angleInRadians} = maxCurve.line.vector;
      const {PI} = Math;
      _attr._text.rotation = angle;
      _attr._text.point = maxCurve.point1.add([Math.cos(angleInRadians + PI / 4) * 100, Math.sin(angleInRadians + PI / 4) * 100]);
      // Перевернуть с головы на ноги
      if(Math.abs(angle) > 90 && Math.abs(angle) < 180){
        _attr._text.point = _attr._text.bounds.rightCenter;
        _attr._text.rotation += 180;
      }
    }
  }

  /**
   * ### Рисует заполнение отдельным элементом
   */
  draw_fragment() {
    const {l_dimensions, layer, path} = this;
    this.visible = true;
    path.set({
      strokeColor: 'black',
      strokeWidth: 1,
      strokeScaling: false,
      opacity: 0.6,
    });
    l_dimensions.redraw(true);
    layer.zoom_fit();
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param [ignore_select] {Boolean}
   */
  set_inset(v, ignore_select) {

    const inset = $p.cat.inserts.get(v);

    if(!ignore_select){
      const {project, elm, clr} = this;
      const {glass_specification} = project.ox;
      const proto = glass_specification.find_rows({elm});

      // проверим доступность цветов
      if(!inset.clr_group.empty() && inset.clr_group.clr_conformity.count() &&
          !inset.clr_group.clr_conformity._obj.some((row) => row.clr1 == clr || row.clr1 == clr.parent)) {
        const {clr1} = inset.clr_group.clr_conformity.get(0);
        if(clr1.is_folder) {
          $p.cat.clrs.find_rows({parent: clr1}, (v) => {
            this.clr = v;
            return false;
          });
        }
        else {
          this.clr = clr1;
        }
      }

      // если для заполнение определён состав - корректируем
      if(proto.length) {
        glass_specification.clear({elm});
        proto.length = 0;
        inset.specification.forEach((row) => {
          if(row.nom instanceof $p.CatInserts){
            proto.push(glass_specification.add({
              elm,
              inset: row.nom,
              clr: row.clr,
            }))
          }
        });
      }

      // транслируем изменения на остальные выделенные заполнения
      project.selected_glasses().forEach((selm) => {
        if(selm !== this){
          // копируем вставку
          selm.set_inset(inset, true);
          // копируем состав заполнения
          glass_specification.clear({elm: selm.elm});
          proto.forEach((row) => glass_specification.add({
            elm: selm.elm,
            inset: row.inset,
            clr: row.clr,
          }));
        }
      });
    }
    super.set_inset(inset);
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

  /**
   * Прочищает паразитные пути
   */
  purge_paths() {
    const paths = this.children.filter((child) => child instanceof paper.Path);
    const {path} = this;
    paths.forEach((p) => p !== path && p.remove());
  }

  fill_error() {
    const {path} = this;
    path.fillColor = new paper.Color({
      stops: ["#fee", "#fcc", "#fdd"],
      origin: path.bounds.bottomLeft,
      destination: path.bounds.topRight
    });
  }

  /**
   * Возвращает формулу (код состава) заполнения
   * @type String
   */
  formula(by_art) {
    let res;
    this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
      let {name, article} = row.inset;
      const aname = row.inset.name.split(' ');
      if(by_art && article){
        name = article;
      }
      else if(aname.length){
        name = aname[0];
      }
      if(!res){
        res = name;
      }
      else{
        res += (by_art ? '*' : 'x') + name;
      }
    });
    return res || (by_art ? this.inset.article || this.inset.name : this.inset.name);
  }

  /**
   * сбрасывает выделение с точек раскладки
   */
  deselect_onlay_points() {
    for(const {generatrix} of this.imposts) {
      generatrix.segments.forEach((segm) => {
        if(segm.selected) {
          segm.selected = false;
        }
      });
      if(generatrix.selected) {
        generatrix.selected = false;
      }
    }
  }

  /**
   * Массив раскладок
   */
  get imposts() {
    return this.getItems({class: Onlay});
  }

  get profiles() {
    return this._attr._profiles || [];
  }

  /**
   * Удаляет все раскладки заполнения
   */
  remove_onlays() {
    for(let onlay of this.imposts){
      onlay.remove();
    }
  }


  /**
   * Габаритная площадь заполнения
   * @return {number}
   */
  get area() {
    return (this.bounds.area / 1e6).round(5);
  }

  /**
   * площадь заполнения с учетом наклонов-изгибов сегментов
   * @return {number}
   */
  get form_area() {
    return (this.path.area/1e6).round(5);
  }

  /**
   * ### Точка внутри пути
   * Возвращает точку, расположенную гарантированно внутри pfgjk
   *
   * @property interiorPoint
   * @type paper.Point
   */
  interiorPoint() {
    return this.path.interiorPoint;
  }

  /**
   * Признак прямоугольности
   */
  get is_rectangular() {
    const {profiles, path} = this;
    return profiles.length === 4 && !path.hasHandles() && !profiles.some(({profile}) => !(Math.abs(profile.angle_hor % 90) < 0.2));
  }

  get generatrix() {
    return this.path;
  }

  /**
   * путь элемента - состоит из кривых, соединяющих вершины элемента
   * @property path
   * @type paper.Path
   */
  get path() {
    return this._attr.path;
  }
  set path(attr) {
    let {_attr, path} = this;

    // чистим старый путь
    if(path){
      path.removeSegments();
    }
    else{
      path = _attr.path = new paper.Path({parent: this});
    }

    // чистим старые сегменты
    if(Array.isArray(_attr._profiles)){
      _attr._profiles.length = 0;
    }
    else{
      _attr._profiles = [];
    }

    if(attr instanceof paper.Path){
      path.addSegments(attr.segments);
    }
    else if(Array.isArray(attr)){
      let {length} = attr;
      let prev, curr, next, sub_path;
      // получам эквидистанты сегментов, смещенные на размер соединения
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

        curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile, $p.enm.cnn_types.acn.ii,
          curr.cnn || this.project.elm_cnn(this, curr.profile), false, curr.outer);

        curr.sub_path = sub_path.equidistant(
          (sub_path._reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

      }
      // получам пересечения
      for (let i = 0; i < length; i++) {
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

      // прочищаем для пересечений
      const remove = [];
      for (let i = 0; i < length; i++) {
        prev = i === 0 ? attr[length-1] : attr[i-1];
        next = i === length-1 ? attr[0] : attr[i+1];
        const crossings =  prev.sub_path.getCrossings(next.sub_path);
        if(crossings.length){
          if((prev.e.getDistance(crossings[0].point) < prev.profile.width * 2) ||  (next.b.getDistance(crossings[0].point) < next.profile.width * 2)) {
            remove.push(attr[i]);
            prev.sub_path.splitAt(crossings[0]);
            const nloc = next.sub_path.getLocationOf(crossings[0].point);
            next.sub_path = next.sub_path.splitAt(nloc);
          }
        }
      }
      for(const segm of remove) {
        attr.splice(attr.indexOf(segm), 1);
        length--;
      }

      // формируем путь
      for (let i = 0; i < length; i++) {
        curr = attr[i];
        path.addSegments(curr.sub_path.segments);
        ["anext","pb","pe"].forEach((prop) => { delete curr[prop] });
        _attr._profiles.push(curr);
      }
    }

    if(path.segments.length && !path.closed){
      path.closePath(true);
    }

    // прочищаем самопересечения
    const intersections = path.self_intersections();
    if(intersections.length) {

      // ищем лишние рёбра
      const {curves, segments} = path;
      const purge = new Set();
      for(const {point} of intersections) {
        for(const rib of attr) {
          rib._sub.b.is_nearest(point, true) && rib._sub.e.is_nearest(point, true) && purge.add(rib);
        }
      }
      if(purge.size) {
        purge.forEach((rib) => {
          const ind = attr.indexOf(rib);
          attr.splice(ind, 1);
        });

        // пересоздаём путь по новому массиву профилей
        return this.path = attr;
      }
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
        angle: curr.e.subtract(curr.b).angle,
        profile: curr.profile
      }
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
    });
    return res;
  }

  get bounds() {
    const {path} = this;
    return path ? path.bounds : new paper.Rectangle();
  }

  /**
   * Массив с рёбрами периметра по внутренней стороне профилей
   * @return {Array}
   */
  perimeter_inner(size = 0) {
    // накопим в res пути внутренних рёбер профилей
    const {center} = this.bounds;
    const res = this.outer_profiles.map((curr) => {
      const profile = curr.profile || curr.elm;
      const {inner, outer} = profile.rays;
      const sub_path = inner.getNearestPoint(center).getDistance(center, true) < outer.getNearestPoint(center).getDistance(center, true) ?
        inner.get_subpath(inner.getNearestPoint(curr.b), inner.getNearestPoint(curr.e)) :
        outer.get_subpath(outer.getNearestPoint(curr.b), outer.getNearestPoint(curr.e));
      let angle = curr.e.subtract(curr.b).angle.round(1);
      if(angle < 0) angle += 360;
      return {
        profile,
        sub_path,
        angle,
        b: curr.b,
        e: curr.e,
      };
    });
    const ubound = res.length - 1;
    return res.map((curr, index) => {
      let sub_path = curr.sub_path.equidistant(size);
      const prev = !index ? res[ubound] : res[index - 1];
      const next = (index == ubound) ? res[0] : res[index + 1];
      const b = sub_path.intersect_point(prev.sub_path.equidistant(size), curr.b, true);
      const e = sub_path.intersect_point(next.sub_path.equidistant(size), curr.e, true);
      if (b && e) {
        sub_path = sub_path.get_subpath(b, e);
      }
      return {
        profile: curr.profile,
        angle: curr.angle,
        len: sub_path.length,
        sub_path,
      };
    });
  }

  /**
   * Габариты по световому проему
   * @param size
   * @return {Rectangle}
   */
  bounds_light(size = 0) {
    const path = new paper.Path({insert: false});
    for (const {sub_path} of this.perimeter_inner(size)) {
      path.addSegments(sub_path.segments);
    }
    if (path.segments.length && !path.closed) {
      path.closePath(true);
    }
    path.reduce();
    return path.bounds;
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

  // виртуальная ссылка для заполнений равна толщине
  get ref() {
    return this.thickness.toFixed();
  }

  // переопределяем геттер вставки
  get inset() {
    const {_attr, _row} = this;
    if(!_attr._ins_proxy || _attr._ins_proxy.ref != _row.inset){
      _attr._ins_proxy = new Proxy(_row.inset, {
        get: (target, prop) => {
          switch (prop){
            case 'presentation':
              return this.formula();

            case 'thickness':
              let res = 0;
              this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
                res += row.inset.thickness;
              });
              return res || _row.inset.thickness;

            default:
              return target[prop];
          }
        }
      });
    }
    return _attr._ins_proxy;
  }
  set inset(v) {
    this.set_inset(v);
  }

}

EditorInvisible.Filling = Filling;
