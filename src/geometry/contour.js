/**
 * ### Контур (слой) изделия
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule contour
 */

/* global paper, $p */

/**
 * ### Сегмент заполнения
 * содержит информацию о примыкающем профиле и координатах начала и конца
 * @class GlassSegment
 * @constructor
 */
class GlassSegment {

  constructor(profile, b, e, outer) {

    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = !!outer;

    this.segment();

  }

  segment() {

    let gen;

    if(this.profile.children.some((addl) => {

        if(addl instanceof ProfileAddl && this.outer == addl.outer){

          if(!gen){
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;

          // TODO: учесть импосты, привязанные к добору

          if(b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)){
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })){

      this.segment();
    }

  }

  get _sub() {
    const {sub_path} = this;
    return {
      get b() {
        return sub_path ? sub_path.firstSegment.point : new paper.Point()
      },
      set b(v) {
        sub_path && (sub_path.firstSegment.point = v);
      },
      get e() {
        return sub_path ? sub_path.lastSegment.point : new paper.Point()
      },
      set e(v) {
        sub_path && (sub_path.lastSegment.point = v);
      }
    }
  }
}

/**
 * ### Контур (слой) изделия
 * Унаследован от  [paper.Layer](http://paperjs.org/reference/layer/)
 * новые элементы попадают в активный слой-контур и не могут его покинуть
 * @class Contour
 * @constructor
 * @extends paper.Layer
 * @menuorder 30
 * @tooltip Контур (слой) изделия
 */
class Contour extends AbstractFilling(paper.Layer) {

  constructor (attr) {

    super({parent: attr.parent});

    this._attr = {};

    // за этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
    this._noti = {};

    // метод - нотификатор
    this._notifier = Object.getNotifier(this._noti);

    // строка в таблице конструкций
    if(attr.row){
      this._row = attr.row;
    }
    else{
      const {constructions} = this.project.ox;
      this._row = constructions.add({ parent: attr.parent ? attr.parent.cnstr : 0 });
      this._row.cnstr = constructions.aggregate([], ["cnstr"], "MAX") + 1;
    }

    // добавляем элементы контура
    if(this.cnstr){

      const {coordinates} = this.project.ox;

      // профили и доборы
      coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => {

        const profile = new Profile({row: row, parent: this});

        coordinates.find_rows({cnstr: row.cnstr, parent: {in: [row.elm, -row.elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => {
          new ProfileAddl({row: row,	parent: profile});
        });

      });

      // заполнения
      coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => {
        new Filling({row: row,	parent: this});
      });

      // остальные элементы (текст)
      coordinates.find_rows({cnstr: this.cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => {

        if(row.elm_type == $p.enm.elm_types.Текст){
          new FreeText({row: row, parent: this.l_text});
        }
      });
    }

  }

  /**
   * Врезаем оповещение при активации слоя
   */
  activate(custom) {
    this.project._activeLayer = this;
    if(this._row){
      $p.eve.callEvent("layer_activated", [this, !custom]);
      this.project.register_update();
    }
  }


  /**
   * указатель на фурнитуру
   */
  get furn() {
    return this._row.furn;
  }
  set furn(v) {
    if(this._row.furn == v){
      return;
    }

    this._row.furn = v;

    // при необходимости устанавливаем направление открывания
    if(this.direction.empty()){
      this.project._dp.sys.furn_params.find_rows({
        param: $p.job_prm.properties.direction
      }, function (row) {
        this.direction = row.value;
        return false;
      }.bind(this._row));
    }

    // перезаполняем параметры фурнитуры
    this._row.furn.refill_prm(this);

    this.project.register_change(true);

    setTimeout($p.eve.callEvent.bind($p.eve, "furn_changed", [this]));
  }

  /**
   * Возвращает массив заполнений + створок текущего контура
   * @property glasses
   * @for Contour
   * @param [hide] {Boolean} - если истина, устанавливает для заполнений visible=false
   * @param [glass_only] {Boolean} - если истина, возвращает только заполнения
   * @returns {Array}
   */
  glasses(hide, glass_only) {
    return this.children.filter((elm) => {
      if((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
        if(hide){
          elm.visible = false;
        }
        return true;
      }
    });
  }

  /**
   * Возвращает массив массивов сегментов - база для построения пути заполнений
   * @property glass_contours
   * @type Array
   */
  get glass_contours() {
    const segments = this.glass_segments;
    const res = [];
    let curr, acurr;

    // возвращает массив сегментов, которые могут следовать за текущим
    function find_next(curr){
      if(!curr.anext){
        curr.anext = [];
        segments.forEach((segm) => {
          if(segm == curr || segm.profile == curr.profile)
            return;
          // если конец нашего совпадает с началом следующего...
          // и если существует соединение нашего со следующим
          if(curr.e.is_nearest(segm.b) && curr.profile.has_cnn(segm.profile, segm.b)){

            if(curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
              curr.anext.push(segm);
          }

        });
      }
      return curr.anext;
    }

    // рекурсивно получает следующий сегмент, пока не уткнётся в текущий
    function go_go(segm){
      const anext = find_next(segm);
      for(let i = 0; i < anext.length; i++){
        if(anext[i] == curr){
          return anext;
        }
        else if(acurr.every((el) => el != anext[i] )){
          acurr.push(anext[i]);
          return go_go(anext[i]);
        }
      }
    }

    while(segments.length){

      curr = segments[0];
      acurr = [curr];
      if(go_go(curr) && acurr.length > 1){
        res.push(acurr);
      }

      // удаляем из segments уже задействованные или не пригодившиеся сегменты
      acurr.forEach((el) => {
        const ind = segments.indexOf(el);
        if(ind != -1){
          segments.splice(ind, 1);
        }
      });
    }

    return res;
  }

  /**
   * Ищет и привязывает узлы профилей к пути заполнения
   * @method glass_nodes
   * @for Contour
   * @param path {paper.Path} - массив ограничивается узлами, примыкающими к пути
   * @param [nodes] {Array} - если указано, позволяет не вычислять исходный массив узлов контура, а использовать переданный
   * @param [bind] {Boolean} - если указано, сохраняет пары узлов в path._attr.curve_nodes
   * @returns {Array}
   */
  glass_nodes(path, nodes, bind) {
    const curve_nodes = [];
    const path_nodes = [];
    const ipoint = path.interiorPoint.negate();
    let curve, findedb, findede, d, node1, node2;

    if(!nodes){
      nodes = this.nodes;
    }

    // имеем путь и контур.
    for(let i in path.curves){
      curve = path.curves[i];

      // в node1 и node2 получаем ближайший узел контура к узлам текущего сегмента
      let d1 = Infinity;
      let d2 = Infinity;
      nodes.forEach((n) => {
        if((d = n.getDistance(curve.point1, true)) < d1){
          d1 = d;
          node1 = n;
        }
        if((d = n.getDistance(curve.point2, true)) < d2){
          d2 = d;
          node2 = n;
        }
      });

      // в path_nodes просто накапливаем узлы. наверное, позже они будут упорядочены
      if(path_nodes.indexOf(node1) == -1)
        path_nodes.push(node1);
      if(path_nodes.indexOf(node2) == -1)
        path_nodes.push(node2);

      if(!bind)
        continue;

      // заполнение может иметь больше курв, чем профиль
      if(node1 == node2)
        continue;
      findedb = false;
      for(let n in curve_nodes){
        if(curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2){
          findedb = true;
          break;
        }
      }
      if(!findedb){
        findedb = this.profile_by_nodes(node1, node2);
        const loc1 = findedb.generatrix.getNearestLocation(node1);
        const loc2 = findedb.generatrix.getNearestLocation(node2);
        // уточняем порядок нод
        if(node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
          curve_nodes.push({node1: node2, node2: node1, profile: findedb, out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index});
        else
          curve_nodes.push({node1: node1, node2: node2, profile: findedb, out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index});
      }
    }

    this.sort_nodes(curve_nodes);

    return path_nodes;
  }

  /**
   * Получает замкнутые контуры, ищет подходящие створки или заполнения, при необходимости создаёт новые
   * @method glass_recalc
   * @for Contour
   */
  glass_recalc() {
    const {glass_contours} = this;      // массиы новых рёбер
    const glasses = this.glasses(true); // массив старых заполнений
    const binded = new Set();

    function calck_rating(glcontour, glass) {

      const {outer_profiles} = glass;

      // вычисляем рейтинг
      let crating = 0;

      // если есть привязанные профили, используем их. иначе - координаты узлов
      if (outer_profiles.length) {
        glcontour.some((cnt) => {
          outer_profiles.some((curr) => {
            if (cnt.profile == curr.profile &&
              cnt.b.is_nearest(curr.b) &&
              cnt.e.is_nearest(curr.e)) {
              crating++;
              return true;
            }
          });
          if (crating > 2){
            return true;
          }
        });
      }
      else{
        const {nodes} = glass;
        glcontour.some((cnt) => {
          nodes.some((node) => {
            if (cnt.b.is_nearest(node)) {
              crating++;
              return true;
            }
          });
          if (crating > 2){
            return true;
          }
        })
      }

      return crating;

    }

    // сначала, пробегаем по заполнениям и пытаемся оставить их на месте
    glasses.forEach((glass) => {
      if (glass.visible) {
        return;
      }
      glass_contours.some((glcontour) => {
        if(binded.has(glcontour)){
          return;
        }
        if(calck_rating(glcontour, glass) > 2){
          glass.path = glcontour;
          glass.visible = true;
          if (glass instanceof Filling) {
            glass.redraw();
          }
          binded.add(glcontour);
          return true;
        }
      });
    });

    // бежим по найденным контурам заполнений и выполняем привязку
    glass_contours.forEach((glcontour) => {

      if(binded.has(glcontour)){
        return;
      }

      let rating = 0, glass, crating, cglass, glass_center;

      for (let g in glasses) {

        glass = glasses[g];
        if (glass.visible) {
          continue;
        }

        // вычисляем рейтинг
        crating = calck_rating(glcontour, glass);

        if (crating > rating || !cglass) {
          rating = crating;
          cglass = glass;
        }
        if (crating == rating && cglass != glass) {
          if (!glass_center) {
            glass_center = glcontour.reduce((sum, val) => sum.add(val.b), new paper.Point).divide(glcontour.length)
          }
          if (glass_center.getDistance(glass.bounds.center, true) < glass_center.getDistance(cglass.bounds.center, true)) {
            cglass = glass;
          }
        }
      }

      // TODO реализовать настоящее ранжирование
      if (cglass || (cglass = this.getItem({class: Filling, visible: false}))) {
        cglass.path = glcontour;
        cglass.visible = true;
        if (cglass instanceof Filling) {
          cglass.redraw();
        }
      }
      else {
        // добавляем заполнение
        // 1. ищем в изделии любое заполнение
        // 2. если не находим, используем умолчание системы
        if (glass = this.getItem({class: Filling})) {

        }
        else if (glass = this.project.getItem({class: Filling})) {

        }
        else {

        }
        cglass = new Filling({proto: glass, parent: this, path: glcontour});
        cglass.redraw();
      }
    });
  }

  /**
   * Возвращает массив отрезков, которые потенциально могут образовывать заполнения
   * (соединения с пустотой отбрасываются)
   * @property glass_segments
   * @type Array
   */
  get glass_segments() {
    const nodes = [];

    function fn_sort(a, b) {
      const da = this.getOffsetOf(a.point);
      const db = this.getOffsetOf(b.point);
      if (da < db){
        return -1;
      }
      else if (da > db){
        return 1;
      }
      return 0;
    }

    // для всех профилей контура
    this.profiles.forEach((p) => {

      const sort = fn_sort.bind(p.generatrix);

      // ищем примыкания T к текущему профилю
      const ip = p.joined_imposts();
      const pb = p.cnn_point("b");
      const pe = p.cnn_point("e");

      // для створочных импостов используем не координаты их b и e, а ближайшие точки примыкающих образующих
      const pbg = pb.is_t && pb.profile.d0 ? pb.profile.generatrix.getNearestPoint(p.b) : p.b;
      const peg = pe.is_t && pe.profile.d0 ? pe.profile.generatrix.getNearestPoint(p.e) : p.e;

      // если есть примыкания T, добавляем сегменты, исключая соединения с пустотой
      if(ip.inner.length){

        ip.inner.sort(sort);

        if(!pb.is_i && !pbg.is_nearest(ip.inner[0].point)){
          nodes.push(new GlassSegment(p, pbg, ip.inner[0].point));
        }

        for(let i = 1; i < ip.inner.length; i++){
          nodes.push(new GlassSegment(p, ip.inner[i-1].point, ip.inner[i].point));
        }

        if(!pe.is_i && !ip.inner[ip.inner.length-1].point.is_nearest(peg)){
          nodes.push(new GlassSegment(p, ip.inner[ip.inner.length-1].point, peg));
        }

      }
      if(ip.outer.length){

        ip.outer.sort(sort);

        if(!pb.is_i && !ip.outer[0].point.is_nearest(pbg)){
          nodes.push(new GlassSegment(p, ip.outer[0].point, pbg, true));
        }

        for(let i = 1; i < ip.outer.length; i++){
          nodes.push(new GlassSegment(p, ip.outer[i].point, ip.outer[i-1].point, true));
        }

        if(!pe.is_i && !peg.is_nearest(ip.outer[ip.outer.length-1].point)){
          nodes.push(new GlassSegment(p, peg, ip.outer[ip.outer.length-1].point, true));
        }
      }

      // добавляем, если нет соединений с пустотой
      if(!ip.inner.length){
        if(!pb.is_i && !pe.is_i){
          nodes.push(new GlassSegment(p, pbg, peg));
        }
      }

      // для импостов добавляем сегмент в обратном направлении
      if(!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)){
        if(!pb.is_i && !pe.is_i){
          nodes.push(new GlassSegment(p, peg, pbg, true));
        }
      }

    });

    return nodes;
  }

  /**
   * Признак прямоугольности
   */
  get is_rectangular() {
    return (this.side_count != 4) || !this.profiles.some((profile) => {
        return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 1);
      });
  }

  move(delta) {
    const {contours, profiles, project} = this;
    const crays = (p) => p.rays.clear();
    this.translate(delta);
    contours.forEach((elm) => elm.profiles.forEach(crays));
    profiles.forEach(crays);
    project.register_change();
  }

  /**
   * Возвращает массив узлов текущего контура
   * @property nodes
   * @type Array
   */
  get nodes () {
    const nodes = [];
    this.profiles.forEach((p) => {
      let findedb;
      let findede;
      nodes.forEach((n) => {
        if (p.b.is_nearest(n)) {
          findedb = true
        }
        if (p.e.is_nearest(n)) {
          findede = true
        }
      });
      if (!findedb) {
        nodes.push(p.b.clone())
      }
      if (!findede) {
        nodes.push(p.e.clone())
      }
    });
    return nodes;
  }


  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify(obj) {
    this._notifier.notify(obj);
    this.project.register_change();
  }

  /**
   * Возвращает массив внешних профилей текущего контура. Актуально для створок, т.к. они всегда замкнуты
   * @property outer_nodes
   * @type Array
   */
  get outer_nodes() {
    return this.outer_profiles.map((v) => v.elm);
  }

  /**
   * Возвращает массив внешних и примыкающих профилей текущего контура
   */
  get outer_profiles() {
    // сначала получим все профили
    const {profiles} = this;
    const to_remove = [];
    const res = [];

    let findedb, findede;

    // прочищаем, выкидывая такие, начало или конец которых соединениы не в узле
    for(let i=0; i<profiles.length; i++){
      const elm = profiles[i];
      if(elm._attr.simulated)
        continue;
      findedb = false;
      findede = false;
      for(let j=0; j<profiles.length; j++){
        if(profiles[j] == elm)
          continue;
        if(!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
          findedb = true;
        if(!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
          findede = true;
      }
      if(!findedb || !findede)
        to_remove.push(elm);
    }
    for(let i=0; i<profiles.length; i++){
      const elm = profiles[i];
      if(to_remove.indexOf(elm) != -1)
        continue;
      elm._attr.binded = false;
      res.push({
        elm: elm,
        profile: elm.nearest(),
        b: elm.b,
        e: elm.e
      });
    }
    return res;
  }

  /**
   * Возвращает профиль по номеру стороны фурнитуры, учитывает направление открывания, по умолчанию - левое
   * - первая первая сторона всегда нижняя
   * - далее, по часовой стрелке 2 - левая, 3 - верхняя и т.д.
   * - если направление правое, обход против часовой
   * @param side {Number}
   * @param cache {Object}
   */
  profile_by_furn_side(side, cache) {

    if (!cache) {
      cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side("bottom")
      };
    }

    const profile_node = this.direction == $p.enm.open_directions.Правое ? "b" : "e";
    const other_node = profile_node == "b" ? "e" : "b";

    let profile = cache.bottom;

    const next = () => {
      side--;
      if (side <= 0) {
        return profile;
      }

      cache.profiles.some((curr) => {
        if (curr[other_node].is_nearest(profile[profile_node])) {
          profile = curr;
          return true;
        }
      });

      return next();
    };

    return next();

  }


  /**
   * Возвращает ребро текущего контура по узлам
   * @param n1 {paper.Point} - первый узел
   * @param n2 {paper.Point} - второй узел
   * @param [point] {paper.Point} - дополнительная проверочная точка
   * @returns {Profile}
   */
  profile_by_nodes(n1, n2, point) {
    const profiles = this.profiles;
    for(let i = 0; i < profiles.length; i++){
      const {generatrix} = profiles[i];
      if(generatrix.getNearestPoint(n1).is_nearest(n1) && generatrix.getNearestPoint(n2).is_nearest(n2)){
        if(!point || generatrix.getNearestPoint(point).is_nearest(point))
          return profiles[i];
      }
    }
  }

  /**
   * Удаляет контур из иерархии проекта
   * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
   * @method remove
   */
  remove() {
    //удаляем детей
    const {children, _row} = this;
    while(children.length){
      children[0].remove();
    }

    if(_row){
      const {ox} = this.project;
      ox.coordinates.find_rows({cnstr: this.cnstr}).forEach((row) => ox.coordinates.del(row._row));

      // удаляем себя
      if(ox === _row._owner._owner){
        _row._owner.del(_row);
      }
      this._row = null;
    }

    // стандартные действия по удалению элемента paperjs
    super.remove();
  }

  /**
   * виртуальный датаменеджер для автоформ
   */
  get _manager() {
    return this.project._dp._manager;
  }

  /**
   * виртуальные метаданные для автоформ
   */
  get _metadata() {

    const {tabular_sections} = this.project.ox._metadata;
    const _xfields = tabular_sections.constructions.fields;

    return {
      fields: {
        furn: _xfields.furn,
        direction: _xfields.direction,
        h_ruch: _xfields.h_ruch
      },
      tabular_sections: {
        params: tabular_sections.params
      }
    };

  }

  /**
   * Габариты по внешним краям профилей контура
   */
  get bounds() {
    const {_attr, parent} = this;
    if(!_attr._bounds || !_attr._bounds.width || !_attr._bounds.height){

      this.profiles.forEach((profile) => {
        const path = profile.path && profile.path.segments.length ? profile.path : profile.generatrix;
        if(path){
          _attr._bounds = _attr._bounds ? _attr._bounds.unite(path.bounds) : path.bounds;
          if(!parent){
            const {d0} = profile;
            if(d0){
              _attr._bounds = _attr._bounds.unite(profile.generatrix.bounds)
            }
          }
        }
      });

      if(!_attr._bounds){
        _attr._bounds = new paper.Rectangle();
      }
    }
    return _attr._bounds;
  }

  /**
   * Номер конструкции текущего слоя
   */
  get cnstr() {
    return this._row ? this._row.cnstr : 0;
  }
  set cnstr(v) {
    this._row && (this._row.cnstr = v);
  }

  /**
   * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
   */
  get dimension_bounds() {
    let bounds = super.dimension_bounds;
    const ib = this.l_visualization._by_insets.bounds;
    if(ib.height && ib.bottom > bounds.bottom){
      const delta = ib.bottom - bounds.bottom + 10;
      bounds = bounds.unite(
        new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
      );
    }
    return bounds;
  }

  /**
   * Направление открывания
   */
  get direction() {
    return this._row.direction;
  }
  set direction(v) {
    this._row.direction = v;
    this.project.register_change(true);
  }

  /**
   * ### Изменяет центр и масштаб, чтобы слой вписался в размер окна
   * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
   *
   * @method zoom_fit
   */
  zoom_fit() {
    const {strokeBounds, view} = this;
    if(strokeBounds){
      let {width, height, center} = strokeBounds;
      if(width < 800){
        width = 800;
      }
      if(height < 800){
        height = 800;
      }
      width += 120;
      height += 120;
      view.zoom = Math.min(view.viewSize.height / height, view.viewSize.width / width);
      const shift = (view.viewSize.width - width * view.zoom);
      view.center = center.add([shift, 40]);
    }
  }

  /**
   * Рисует ошибки соединений
   */
  draw_cnn_errors() {

    const {l_visualization} = this;

    if(l_visualization._cnn){
      l_visualization._cnn.removeChildren();
    }
    else{
      l_visualization._cnn = new paper.Group({ parent: l_visualization });
    }

    // ошибки соединений с заполнениями
    this.glasses(false, true).forEach((elm) => {
      let err;
      elm.profiles.forEach(({cnn, sub_path}) => {
        if(!cnn){
          sub_path.parent = l_visualization._cnn;
          sub_path.strokeWidth = 2;
          sub_path.strokeScaling = false;
          sub_path.strokeColor = 'red';
          sub_path.strokeCap = 'round';
          sub_path.dashArray = [12, 8];
          err = true;
        }
      });
      elm.path.fillColor = err ? new paper.Color({
        stops: ["#fee", "#fcc", "#fdd"],
        origin: elm.path.bounds.bottomLeft,
        destination: elm.path.bounds.topRight
      }) : BuilderElement.clr_by_clr.call(elm, elm._row.clr, false);
    });

    // ошибки соединений профиля
    this.profiles.forEach((elm) => {
      const {b, e} = elm.rays;
      if(!b.cnn){
        new paper.Path.Circle({
          center: elm.corns(4).add(elm.corns(1)).divide(2),
          radius: 80,
          strokeColor: 'red',
          strokeWidth: 2,
          strokeCap: 'round',
          strokeScaling: false,
          dashOffset: 4,
          dashArray: [4, 4],
          guide: true,
          parent: l_visualization._cnn
        });
      }
      if(!e.cnn){
        new paper.Path.Circle({
          center: elm.corns(2).add(elm.corns(3)).divide(2),
          radius: 80,
          strokeColor: 'red',
          strokeWidth: 2,
          strokeCap: 'round',
          strokeScaling: false,
          dashOffset: 4,
          dashArray: [4, 4],
          guide: true,
          parent: l_visualization._cnn
        });
      }
    });
  }

  /**
   * Рисут визуализацию москитки
   */
  draw_mosquito() {
    const {l_visualization} = this;
    this.project.ox.inserts.find_rows({cnstr: this.cnstr}, (row) => {
      if(row.inset.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
        const props = {
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          strokeWidth: 3,
          dashArray: [6, 4],
          strokeScaling: false,
        };
        let sz, imposts;
        row.inset.specification.forEach((rspec) => {
          if(!sz && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру && rspec.nom.elm_type == $p.enm.elm_types.Рама){
            sz = rspec.sz;
          }
          if(!imposts && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам && rspec.nom.elm_type == $p.enm.elm_types.Импост){
            imposts = rspec;
          }
        });

        // рисуем контур
        const perimetr = [];
        if(typeof sz != 'number'){
          sz = 20;
        }
        this.outer_profiles.forEach((curr) => {
          // получаем внешнюю палку, на которую будет повешена москитка
          const profile = curr.profile || curr.elm;
          const is_outer = Math.abs(profile.angle_hor - curr.elm.angle_hor) > 60;
          const ray = is_outer ? profile.rays.outer : profile.rays.inner;
          const segm = ray.get_subpath(curr.b, curr.e).equidistant(sz);
          perimetr.push(Object.assign(segm, props));
        });

        const count = perimetr.length - 1;
        perimetr.forEach((curr, index) => {
          const prev = index == 0 ? perimetr[count] : perimetr[index - 1];
          const next = index == count ? perimetr[0] : perimetr[index + 1];
          const b = curr.getIntersections(prev);
          const e = curr.getIntersections(next);
          if(b.length){
            curr.firstSegment.point = b[0].point;
          }
          if(e.length){
            curr.lastSegment.point = e[0].point;
          }
        });

        // добавляем текст
        const {elm_font_size} = consts;
        const {bounds} = props.parent;
        new paper.PointText({
          parent: props.parent,
          fillColor: 'black',
          fontSize: consts.elm_font_size,
          guide: true,
          content: row.inset.presentation,
          point: bounds.bottomLeft.add([elm_font_size * 1.2, -elm_font_size * 0.4]),
        });

        // рисуем поперечину
        if(imposts){
          const {offsets, do_center, step} = imposts;

          function add_impost(y) {
            const impost = Object.assign(new paper.Path({
              insert: false,
              segments: [[bounds.left, y], [bounds.right, y]]
          }), props);
            const {length} = impost;
            perimetr.forEach((curr) => {
              const aloc = curr.getIntersections(impost);
              if(aloc.length){
                const l1 = impost.firstSegment.point.getDistance(aloc[0].point);
                const l2 = impost.lastSegment.point.getDistance(aloc[0].point);
                if(l1 < length / 2){
                  impost.firstSegment.point = aloc[0].point;
                }
                if(l2 < length / 2){
                  impost.lastSegment.point = aloc[0].point;
                }
              }
            });
          }

          if(step){
            const height = bounds.height - offsets;
            if(height >= step){
              if(do_center){
                add_impost(bounds.centerY);
              }
              else{
                for(let y = step; y < height; y += step){
                  add_impost(y);
                }
              }
            }
          }
        }

        return false;
      }
    });
  }

  /**
   * Рисут визуализацию подоконника
   */
  draw_sill() {
    const {l_visualization, project, cnstr} = this;
    const {ox} = project;
    ox.inserts.find_rows({cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.Подоконник) {

        // ищем длину и ширину
        const {length, width} = $p.job_prm.properties;
        const bottom = this.profiles_by_side("bottom");
        let vlen, vwidth;
        ox.params.find_rows({cnstr: cnstr, inset: row.inset}, (prow) => {
          if(prow.param == length){
            vlen = prow.value;
          }
          if(prow.param == width){
            vwidth = prow.value;
          }
        });
        if(!vlen){
          vlen = bottom.length + 160;
        }
        if(vwidth){
          vwidth = vwidth * 0.7;
        }
        else{
          vwidth = 200;
        }
        const delta = (vlen - bottom.length) / 2;

        new paper.Path({
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          fillColor: BuilderElement.clr_by_clr(row.clr),
          shadowColor: 'grey',
          shadowBlur: 20,
          shadowOffset: [10, 20],
          opacity: 0.7,
          strokeWidth: 1,
          strokeScaling: false,
          closed: true,
          segments: [
            bottom.b.add([delta, 0]),
            bottom.e.add([-delta, 0]),
            bottom.e.add([-delta - vwidth, vwidth]),
            bottom.b.add([delta - vwidth, vwidth]),
          ]
        });

        return false;
      }
    });
  }

  /**
   * Рисует направление открывания
   */
  draw_opening() {

    const _contour = this;
    const {l_visualization, furn} = this;

    if(!this.parent || !$p.enm.open_types.is_opening(furn.open_type)){
      if(l_visualization._opening && l_visualization._opening.visible)
        l_visualization._opening.visible = false;
      return;
    }

    // создаём кеш элементов по номеру фурнитуры
    const cache = {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side("bottom")
    };

    // рисует линии открывания на поворотной, поворотнооткидной и фрамужной фурнитуре
    function rotary_folding() {

      const {_opening} = l_visualization;
      const {side_count} = _contour;

      furn.open_tunes.forEach((row) => {

        if(row.rotation_axis){
          const axis = _contour.profile_by_furn_side(row.side, cache);
          const other = _contour.profile_by_furn_side(
            row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

          _opening.moveTo(axis.corns(3));
          _opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
          _opening.lineTo(axis.corns(4));

        }
      });
    }

    // рисует линии открывания на раздвижке
    function sliding() {
      // находим центр
      const {center} = _contour.bounds;
      const {_opening} = l_visualization;

      if(_contour.direction == $p.enm.open_directions.Правое) {
        _opening.moveTo(center.add([-100,0]));
        _opening.lineTo(center.add([100,0]));
        _opening.moveTo(center.add([30,30]));
        _opening.lineTo(center.add([100,0]));
        _opening.lineTo(center.add([30,-30]));
      }
      else {
        _opening.moveTo(center.add([100,0]));
        _opening.lineTo(center.add([-100,0]));
        _opening.moveTo(center.add([-30,30]));
        _opening.lineTo(center.add([-100,0]));
        _opening.lineTo(center.add([-30,-30]));
      }
    }

    // подготавливаем слой для рисования
    if(!l_visualization._opening){
      l_visualization._opening = new paper.CompoundPath({
        parent: _contour.l_visualization,
        strokeColor: 'black'
      });
    }
    else{
      l_visualization._opening.removeChildren();
    }

    // рисуем раправление открывания
    return furn.is_sliding ? sliding() : rotary_folding();

  }

  /**
   * Рисует дополнительную визуализацию. Данные берёт из спецификации и проблемных соединений
   */
  draw_visualization() {

    const {profiles, l_visualization} = this;
    l_visualization._by_spec.removeChildren();

    // получаем строки спецификации с визуализацией
    this.project.ox.specification.find_rows({dop: -1}, (row) => {
      profiles.some((elm) => {
        if(row.elm == elm.elm){
          // есть визуализация для текущего профиля
          row.nom.visualization.draw(elm, l_visualization, row.len * 1000);
          return true;
        }
      });
    });

    // перерисовываем вложенные контуры
    this.contours.forEach((l) => l.draw_visualization());

  }

  get hidden() {
    return !!this._hidden;
  }
  set hidden(v) {
    if(this.hidden != v){
      this._hidden = v;
      const visible = !this._hidden;
      this.children.forEach((elm) => {
        if(elm instanceof BuilderElement){
          elm.visible = visible;
        }
      })
      this.l_visualization.visible = visible;
      this.l_dimensions.visible = visible;
    }

  }

  hide_generatrix() {
    this.profiles.forEach((elm) => {
      elm.generatrix.visible = false;
    })
  }

  /**
   * Возвращает массив импостов текущего + вложенных контуров
   * @property imposts
   * @for Contour
   * @returns {Array.<Profile>}
   */
  get imposts() {
    return this.getItems({class: Profile}).filter((elm) => {
      const {b, e} = elm.rays;
      return b.is_tt || e.is_tt || b.is_i || e.is_i;
    });
  }

  /**
   * виртуальная табличная часть параметров фурнитуры
   */
  get params() {
    return this.project.ox.params;
  }

  /**
   * путь контура - при чтении похож на bounds
   * для вложенных контуров определяет положение, форму и количество сегментов створок
   * @property attr {Array}
   */
  get path() {
    return this.bounds;
  }
  set path(attr) {
    if(!Array.isArray(attr)){
      return;
    }

    const noti = {type: consts.move_points, profiles: [], points: []};
    const {outer_nodes} = this;

    let need_bind = attr.length,
      available_bind = outer_nodes.length,
      elm, curr;

    function set_node(n) {
      if(!curr[n].is_nearest(elm[n], 0)){
        elm.rays.clear(true);
        elm[n] = curr[n];
        if(noti.profiles.indexOf(elm) == -1){
          noti.profiles.push(elm);
        }
        if(!noti.points.some((point) => point.is_nearest(elm[n], 0))){
          noti.points.push(elm[n]);
        }
      }
    }

    // первый проход: по двум узлам либо примыканию к образующей
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];             // curr.profile - сегмент внешнего профиля
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];   // elm - сегмент профиля текущего контура
          if(elm._attr.binded){
            continue;
          }
          if(curr.profile.is_nearest(elm)){
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    // второй проход: по одному узлу
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded)
          continue;
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];
          if(elm._attr.binded)
            continue;
          if(curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)){
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    // третий проход - из оставшихся
    if(need_bind && available_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded)
          continue;
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];
          if(elm._attr.binded)
            continue;
          elm._attr.binded = true;
          curr.binded = true;
          need_bind--;
          available_bind--;
          // TODO заменить на клонирование образующей

          set_node('b');
          set_node('e');

          break;
        }
      }
    }

    // четвертый проход - добавляем
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded){
          continue;
        }
        elm = new Profile({
          generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
          proto: outer_nodes.length ? outer_nodes[0] : {
            parent: this,
            clr: this.project.default_clr()
          }
        });
        elm._attr._nearest = curr.profile;
        elm._attr.binded = true;
        elm._attr.simulated = true;

        curr.profile = elm;
        delete curr.outer;
        curr.binded = true;

        noti.profiles.push(elm);
        noti.points.push(elm.b);
        noti.points.push(elm.e);

        need_bind--;
      }
    }

    // удаляем лишнее
    if(available_bind){
      outer_nodes.forEach((elm) => {
        if(!elm._attr.binded){
          elm.rays.clear(true);
          elm.remove();
          available_bind--;
        }
      });
    }

    // пересчитываем вставки створок
    this.profiles.forEach((p) => p.default_inset());

    // информируем систему об изменениях
    if(noti.points.length){
      this.profiles.forEach((p) => p._attr._rays && p._attr._rays.clear());
      this.notify(noti);
    }

    this._attr._bounds = null;
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter () {
    const res = [];
    this.outer_profiles.forEach((curr) => {
      const tmp = curr.sub_path ? {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle
      } : {
        len: curr.elm.length,
        angle: curr.elm.angle_hor
      };
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
      tmp.profile = curr.profile || curr.elm;
    });
    return res;
  }

  /**
   * Положение контура в изделии или створки в контуре
   */
  get pos() {

  }

  /**
   * Возвращает массив профилей текущего контура
   * @property profiles
   * @for Contour
   * @returns {Array.<Profile>}
   */
  get profiles() {
    return this.children.filter((elm) => elm instanceof Profile);
  }

  /**
   * Перерисовывает элементы контура
   * @method redraw
   * @for Contour
   */
  redraw(on_redrawed) {

    if(!this.visible){
      return;
    }

    // сбрасываем кеш габаритов
    this._attr._bounds = null;

    // чистим визуализацию
    const {l_visualization} = this;

    l_visualization._by_insets.removeChildren();
    !this.project._attr._saving && l_visualization._by_spec.removeChildren();

    // сначала перерисовываем все профили контура
    this.profiles.forEach((elm) => elm.redraw());

    // затем, создаём и перерисовываем заполнения, которые перерисуют свои раскладки
    this.glass_recalc();

    // рисуем направление открывания
    this.draw_opening();

    // перерисовываем вложенные контуры
    this.contours.forEach((elm) => elm.redraw());

    // рисуем ошибки соединений
    this.draw_cnn_errors();

    // рисуем москитки
    this.draw_mosquito();

    // рисуем подоконники
    this.draw_sill();

    // информируем мир о новых размерах нашего контура
    $p.eve.callEvent("contour_redrawed", [this, this._attr._bounds]);

  }

  refresh_links() {

    const {cnstr} = this;
    let notify;

    // пробегаем по всем строкам
    this.params.find_rows({
      cnstr: cnstr || -9999,
      inset: $p.utils.blank.guid,
      hide: {not: true}
    }, (prow) => {
      const {param} = prow;
      const links = param.params_links({grid: {selection: {cnstr}}, obj: prow});
      const hide = links.some((link) => link.hide);

      // проверим вхождение значения в доступные и при необходимости изменим
      if(links.length && param.linked_values(links, prow)){
        this.project.register_change();
        notify = true;
        Object.getNotifier(this).notify({
          type: 'row',
          row: prow,
          tabular: prow._owner._name,
          name: 'value'
        });
      }
      if(!notify){
        notify = hide;
      }
    });

    // информируем мир о новых размерах нашего контура
    if(notify){
      $p.eve.callEvent("refresh_links", [this]);
    }
  }

  /**
   * Вычисляемые поля в таблицах конструкций и координат
   * @method save_coordinates
   * @param short {Boolean} - короткий вариант - только координаты контура
   */
  save_coordinates(short) {

    if(!short){
      // удаляем скрытые заполнения
      this.glasses(false, true).forEach((glass) => !glass.visible && glass.remove());

      // запись в таблице координат, каждый элемент пересчитывает самостоятельно
      const {l_text, l_dimensions} = this;
      for(let elm of this.children){
        if(elm.save_coordinates){
          elm.save_coordinates();
        }
        else if(elm == l_text || elm == l_dimensions){
          elm.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
        }
      }
    }

    // ответственность за строку в таблице конструкций лежит на контуре
    const {bounds} = this;
    this._row.x = bounds ? bounds.width.round(4) : 0;
    this._row.y = bounds ? bounds.height.round(4) : 0;
    this._row.is_rectangular = this.is_rectangular;
    if(this.parent){
      this._row.w = this.w.round(4);
      this._row.h = this.h.round(4);
    }
    else{
      this._row.w = 0;
      this._row.h = 0;
    }
  }

  /**
   * Упорядочивает узлы, чтобы по ним можно было построить путь заполнения
   * @method sort_nodes
   * @param [nodes] {Array}
   */
  sort_nodes(nodes) {
    if (!nodes.length) {
      return nodes;
    }
    let prev = nodes[0];
    const res = [prev];
    let couner = nodes.length + 1;

    while (res.length < nodes.length && couner) {
      couner--;
      for (let i = 0; i < nodes.length; i++) {
        const curr = nodes[i];
        if (res.indexOf(curr) != -1)
          continue;
        if (prev.node2 == curr.node1) {
          res.push(curr);
          prev = curr;
          break;
        }
      }
    }
    if (couner) {
      nodes.length = 0;
      for (let i = 0; i < res.length; i++) {
        nodes.push(res[i]);
      }
      res.length = 0;
    }
  }


  /**
   * Кеш используется при расчете спецификации фурнитуры
   * @return {Object}
   */
  get furn_cache() {
    return {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side("bottom"),
      ox: this.project.ox,
      w: this.w,
      h: this.h,
    }
  }

  /**
   * Возаращает линию, проходящую через ручку
   *
   * @param elm {Profile}
   */
  handle_line(elm) {

    // строим горизонтальную линию от нижней границы контура, находим пересечение и offset
    const {bounds, h_ruch} = this;
    const by_side = this.profiles_by_side();
    return (elm == by_side.top || elm == by_side.bottom) ?
      new paper.Path({
        insert: false,
        segments: [[bounds.left + h_ruch, bounds.top - 200], [bounds.left + h_ruch, bounds.bottom + 200]]
      }) :
      new paper.Path({
        insert: false,
        segments: [[bounds.left - 200, bounds.bottom - h_ruch], [bounds.right + 200, bounds.bottom - h_ruch]]
      });

  }

  /**
   * Уточняет высоту ручки
   * @param cache {Object}
   */
  update_handle_height(cache) {

    const {furn, _row} = this;
    const {furn_set, handle_side} = furn;
    if(!handle_side || furn_set.empty()){
      return;
    }

    if(!cache){
      cache = this.furn_cache;
    }

    // получаем элемент, на котором ручка и длину элемента
    const elm = this.profile_by_furn_side(handle_side, cache);
    if(!elm){
      return;
    }

    const {len} = elm._row;

    function set_handle_height(row){
      const {handle_height_base} = row;
      if(handle_height_base < 0){
        if(handle_height_base == -2 || (handle_height_base == -1 && _row.fix_ruch != -3)){
          _row.h_ruch = (len / 2).round(0);
          return _row.fix_ruch = handle_height_base;
        }
      }
      else if(handle_height_base > 0){
        _row.h_ruch = handle_height_base;
        return _row.fix_ruch = 1;
      }
    }

    // бежим по спецификации набора в поисках строки про ручку
    furn.furn_set.specification.find_rows({dop: 0}, (row) => {

      // проверяем, проходит ли строка
      if(!row.quantity || !row.check_restrictions(this, cache)){
        return;
      }
      if(set_handle_height(row)){
        return false;
      }
      if(row.is_set_row){
        let ok = false;
        row.nom.get_spec(this, cache, true).each((sub_row) => {
          if(set_handle_height(sub_row)){
            return !(ok = true);
          }
        });
        if(ok){
          return false;
        }
      }
    });
    Object.getNotifier(this).notify({
      type: 'update',
      name: 'h_ruch'
    });
  }

  /**
   * Высота ручки
   */
  get h_ruch() {
    const {layer, _row} = this;
    return layer ? _row.h_ruch : 0;
  }
  set h_ruch(v) {
    const {layer, _row, project} = this;
    if(layer){
      if(_row.fix_ruch == -3 && v == 0){
        _row.fix_ruch = -1;
      }
      this.update_handle_height();
      // Высота ручки по умолчению
      // >0: фиксированная высота
      // =0: Высоту задаёт оператор
      // -1: Ручка по центру, но можно редактировать
      // -2: Ручка по центру, нельзя редактировать
      if(v != 0 && (_row.fix_ruch == 0 || _row.fix_ruch == -1 || _row.fix_ruch == -3)){
          _row.h_ruch = v;
        if(_row.fix_ruch == -1){
          _row.fix_ruch = -3;
        }
      }
      project.register_change();
    }
    else{
      _row.h_ruch = 0;
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'h_ruch'
      });
    }
  }

  /**
   * Количество сторон контура
   * TODO: строго говоря, количество сторон != количеству палок
   */
  get side_count() {
    return this.profiles.length;
  }

  /**
   * Ширина контура по фальцу
   */
  get w() {
    const {is_rectangular, bounds} = this;
    const {left, right} = this.profiles_by_side();
    return bounds ? bounds.width - left.nom.sizefurn - right.nom.sizefurn : 0;
  }

  /**
   * Высота контура по фальцу
   */
  get h() {
    const {is_rectangular, bounds} = this;
    const {top, bottom} = this.profiles_by_side();
    return bounds ? bounds.height - top.nom.sizefurn - bottom.nom.sizefurn : 0;
  }

  /**
   * Cлужебная группа текстовых комментариев
   */
  get l_text() {
    const {_attr} = this;
    return _attr._txt || (_attr._txt = new paper.Group({ parent: this }));
  }

  /**
   * Cлужебная группа визуализации допов,  петель и ручек
   */
  get l_visualization() {
    const {_attr} = this;
    if(!_attr._visl){
      _attr._visl = new paper.Group({parent: this, guide: true});
      _attr._visl._by_insets = new paper.Group({parent: _attr._visl});
      _attr._visl._by_spec = new paper.Group({parent: _attr._visl});
    }
    return _attr._visl;
  }

  /**
   * ### Непрозрачность без учета вложенных контуров
   * В отличии от прототипа `opacity`, затрагивает только элементы текущего слоя
   */
  get opacity() {
    return this.children.length ? this.children[0].opacity : 1;
  }
  set opacity(v) {
    this.children.forEach((elm) => {
      if(elm instanceof BuilderElement)
        elm.opacity = v;
    });
  }

  /**
   * Обработчик события при удалении элемента
   */
  on_remove_elm(elm) {
    // при удалении любого профиля, удаляем размрные линии импостов
    if(this.parent){
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading){
      this.l_dimensions.clear();
    }
  }

  /**
   * Обработчик события при вставке элемента
   */
  on_insert_elm(elm) {
    // при вставке любого профиля, удаляем размрные линии импостов
    if(this.parent){
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading){
      this.l_dimensions.clear();
    }
  }

  /**
   * Обработчик при изменении системы
   */
  on_sys_changed() {
    this.profiles.forEach((elm) => elm.default_inset(true));

    this.glasses().forEach((elm) => {
      if (elm instanceof Contour){
        elm.on_sys_changed();
      }
      else{
        // заполнения проверяем по толщине
        if(elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
          elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
        // проверяем-изменяем соединения заполнений с профилями
        elm.profiles.forEach((curr) => {
          if(!curr.cnn || !curr.cnn.check_nom2(curr.profile))
            curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
        });
      }
    });
  }

}

/**
 * Экспортируем конструктор Contour, чтобы фильтровать инстанции этого типа
 * @property Contour
 * @for MetaEngine
 * @type function
 */
Editor.Contour = Contour;

