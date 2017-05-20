/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule scheme
 */

/**
 * ### Изделие
 * - Расширение [paper.Project](http://paperjs.org/reference/project/)
 * - Стандартные слои (layers) - это контуры изделия, в них живут элементы
 * - Размерные линии, фурнитуру и визуализацию располагаем в отдельных слоях
 *
 * @class Scheme
 * @constructor
 * @extends paper.Project
 * @param _canvas {HTMLCanvasElement} - канвас, в котором будет размещено изделие
 * @menuorder 20
 * @tooltip Изделие
 */

class Scheme extends paper.Project {

  constructor(_canvas, _editor) {

    // создаём объект проекта paperjs
    super(_canvas);

    const _scheme = _editor.project = this;

    const _attr = this._attr = {
        _bounds: null,
        _calc_order_row: null,
        _update_timer: 0
      };

    // массив с моментами времени изменений изделия
    const _changes = this._ch = [];

    // наблюдатель за изменениями свойств изделия
    this._dp_observer = (changes) => {

        if(_attr._loading || _attr._snapshot){
          return;
        }

        const scheme_changed_names = ["clr","sys"];
        const row_changed_names = ["quantity","discount_percent","discount_percent_internal"];
        let evented

        changes.forEach((change) => {

          if(scheme_changed_names.indexOf(change.name) != -1){

            if(change.name == "clr"){
              _scheme.ox.clr = change.object.clr;
              _scheme.getItems({class: ProfileItem}).forEach((p) => {
                if(!(p instanceof Onlay)){
                  p.clr = change.object.clr;
                }
              })
            }

            if(change.name == "sys" && !change.object.sys.empty()){

              change.object.sys.refill_prm(_scheme.ox);

              // обновляем свойства изделия
              Object.getNotifier(change.object).notify({
                type: 'rows',
                tabular: 'extra_fields'
              });

              // обновляем свойства створки
              if(_scheme.activeLayer)
                Object.getNotifier(_scheme.activeLayer).notify({
                  type: 'rows',
                  tabular: 'params'
                });

              // информируем контуры о смене системы, чтобы пересчитать материал профилей и заполнений
              _scheme.contours.forEach((l) => l.on_sys_changed());


              if(change.object.sys != $p.wsql.get_user_param("editor_last_sys"))
                $p.wsql.set_user_param("editor_last_sys", change.object.sys.ref);

              if(_scheme.ox.clr.empty())
                _scheme.ox.clr = change.object.sys.default_clr;

              _scheme.register_change(true);
            }

            if(!evented){
              // информируем мир об изменениях
              $p.eve.callEvent("scheme_changed", [_scheme]);
              evented = true;
            }

          }
          else if(row_changed_names.indexOf(change.name) != -1){

            _attr._calc_order_row[change.name] = change.object[change.name];

            _scheme.register_change(true);

          }

        });
      };

    // наблюдатель за изменениями параметров створки
    this._papam_observer = (changes) => {
        if(_attr._loading || _attr._snapshot){
          return;
        }
        changes.some((change) => {
          if(change.tabular == "params"){
            _scheme.register_change();
            return true;
          }
        });
      };

    /**
     * За этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
     */
    this._noti = {};

    /**
     * Объект обработки с табличными частями
     */
    this._dp = $p.dp.buyers_order.create();

    /**
     * Менеджер соединений изделия
     * Хранит информацию о соединениях элементов и предоставляет методы для поиска-манипуляции
     * @property connections
     * @type Connections
     */
    this.connections = {

      get cnns() {
        return _scheme.ox.cnn_elmnts;
      },

      elm_cnn(elm1, elm2) {
        let res;
        this.cnns.find_rows({
          elm1: elm1.elm,
          elm2: elm2.elm
        }, (row) => {
          res = row.cnn;
          return false;
        });
        return res;
      }

    };


    /**
     * Перерисовывает все контуры изделия. Не занимается биндингом.
     * Предполагается, что взаимное перемещение профилей уже обработано
     */
    this.redraw = () => {

      _attr._opened && typeof requestAnimationFrame == 'function' && requestAnimationFrame(_scheme.redraw);

      if(_attr._saving || !_changes.length){
        return;
      }

      _changes.length = 0;

      if(_scheme.contours.length){

        // перерисовываем все контуры
        for(let contour of _scheme.contours){
          contour.redraw();
          if(_changes.length && typeof requestAnimationFrame == 'function'){
            return;
          }
        }

        // пересчитываем параметры изделия и фурнитур, т.к. они могут зависеть от размеров

        // если перерисованы все контуры, перерисовываем их размерные линии
        _attr._bounds = null;
        _scheme.contours.forEach((l) => {
          l.contours.forEach((l) => {
            l.save_coordinates(true);
            l.refresh_links();
          });
          l.l_dimensions.redraw();
        });

        // перерисовываем габаритные размерные линии изделия
        _scheme.draw_sizes();

        // перерисовываем соединительные профили
        _scheme.l_connective.redraw();

        // обновляем изображение на эуране
        _scheme.view.update();

      }
      else{
        _scheme.draw_sizes();
      }

    }

    // начинаем следить за _dp, чтобы обработать изменения цвета и параметров
    Object.observe(this._dp, this._dp_observer, ["update"]);

  }

  /**
   * ХарактеристикаОбъект текущего изделия
   * @property ox
   * @type _cat.characteristics
   */
  get ox() {
    return this._dp.characteristic;
  }
  set ox(v) {
    const {_dp, _attr, _papam_observer} = this;
    let setted;

    // пытаемся отключить обсервер от табчасти
    Object.unobserve(_dp.characteristic, _papam_observer);

    // устанавливаем в _dp характеристику
    _dp.characteristic = v;

    const ox = _dp.characteristic;

    _dp.len = ox.x;
    _dp.height = ox.y;
    _dp.s = ox.s;

    // устанавливаем строку заказа
    _attr._calc_order_row = ox.calc_order_row;

    // устанавливаем в _dp свойства строки заказа
    if(_attr._calc_order_row){
      "quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note".split(",").forEach((fld) => _dp[fld] = _attr._calc_order_row[fld]);
    }else{
      // TODO: установить режим только просмотр, если не найдена строка заказа
    }


    // устанавливаем в _dp систему профилей
    if(ox.empty()){
      _dp.sys = "";
    }
    // для пустой номенклатуры, ставим предыдущую выбранную систему
    else if(ox.owner.empty()){
      _dp.sys = $p.wsql.get_user_param("editor_last_sys");
      setted = !_dp.sys.empty();
    }
    // иначе, ищем первую подходящую систему
    else if(_dp.sys.empty()){
      $p.cat.production_params.find_rows({is_folder: false}, (o) => {
        if(setted){
          return false;
        }
        o.production.find_rows({nom: ox.owner}, () => {
          _dp.sys = o;
          setted = true;
          return false;
        });
      });
    }

    // пересчитываем параметры изделия при установке системы
    if(setted){
      _dp.sys.refill_prm(ox);
    }

    // устанавливаем в _dp цвет по умолчанию
    if(_dp.clr.empty()){
      _dp.clr = _dp.sys.default_clr;
    }

    // оповещаем о новых слоях и свойствах изделия
    Object.getNotifier(this._noti).notify({
      type: 'rows',
      tabular: 'constructions'
    });
    Object.getNotifier(_dp).notify({
      type: 'rows',
      tabular: 'extra_fields'
    });

    // начинаем следить за ox, чтобы обработать изменения параметров фурнитуры
    Object.observe(ox, _papam_observer, ["row", "rows"]);

  }

  /**
   * ### Читает изделие по ссылке или объекту продукции
   * Выполняет следующую последовательность действий:
   * - Если передана ссылка, получает объект из базы данных
   * - Удаляет все слои и элементы текущего графисеского контекста
   * - Рекурсивно создаёт контуры изделия по данным табличной части конструкций текущей продукции
   * - Рассчитывает габариты эскиза
   * - Згружает пользовательские размерные линии
   * - Делает начальный снапшот для {{#crossLink "UndoRedo"}}{{/crossLink}}
   * - Рисует автоматические размерные линии
   * - Активирует текущий слой в дереве слоёв
   * - Рисует дополнительные элементы визуализации
   *
   * @method load
   * @param id {String|CatObj} - идентификатор или объект продукции
   * @async
   */
  load(id) {
    const {_attr} = this;
    const _scheme = this;

    /**
     * Рекурсивно создаёт контуры изделия
     * @param [parent] {Contour}
     */
    function load_contour(parent) {
      // создаём семейство конструкций
      _scheme.ox.constructions.find_rows({parent: parent ? parent.cnstr : 0}, (row) => {
        // и вложенные створки
        load_contour(new Contour({parent: parent, row: row}));
      });
    }

    /**
     * Загружает пользовательские размерные линии
     * Этот код нельзя выполнить внутри load_contour, т.к. линия может ссылаться на элементы разных контуров
     */
    function load_dimension_lines() {
      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, (row) => new DimensionLineCustom({
        parent: _scheme.getItem({cnstr: row.cnstr}).l_dimensions,
        row: row
      }));
    }

    function load_object(o){

      _scheme.ox = o;

      // включаем перерисовку
      _attr._opened = true;
      _attr._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });

      // первым делом создаём соединители
      o.coordinates.find_rows({cnstr: 0, elm_type: $p.enm.elm_types.Соединитель}, (row) => new ProfileConnective({row: row}));
      o = null;

      // создаём семейство конструкций
      load_contour(null);

      // перерисовываем каркас
      _scheme.redraw();

      // запускаем таймер, чтобы нарисовать размерные линии и визуализацию
      return new Promise((resolve, reject) => {

        _attr._bounds = null;

        // згружаем пользовательские размерные линии
        load_dimension_lines();

        setTimeout(() => {

          _attr._bounds = null;
          _scheme.zoom_fit();

          // виртуальное событие, чтобы UndoRedo сделал начальный снапшот
          !_attr._snapshot && $p.eve.callEvent("scheme_changed", [_scheme]);

          // регистрируем изменение, чтобы отрисовались размерные линии
          _scheme.register_change(true);

          // виртуальное событие, чтобы активировать слой в дереве слоёв
          if(_scheme.contours.length){
            $p.eve.callEvent("layer_activated", [_scheme.contours[0], true]);
          }

          delete _attr._loading;

          // виртуальное событие, чтобы нарисовать визуализацию или открыть шаблоны
          setTimeout(() => {
            if(_scheme.ox.coordinates.count()){
              if(_scheme.ox.specification.count()){
                _scheme.draw_visualization();
                $p.eve.callEvent("coordinates_calculated", [_scheme, {onload: true}]);
              }
              else{
                // если нет спецификации при заполненных координатах, скорее всего, прочитали типовой блок или снапшот - запускаем пересчет
                $p.eve.callEvent("save_coordinates", [_scheme, {}]);
              }
            }
            else{
              paper.load_stamp && paper.load_stamp();
            }
            delete _attr._snapshot;

            resolve();

          });

        });

      });

    }

    _attr._loading = true;
    if(id != this.ox){
      this.ox = null;
    }
    this.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new()){
      return load_object(id);
    }
    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)){
      return $p.cat.characteristics.get(id, true, true)
        .then((ox) =>
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(() => load_object(ox))
        );
    }
  }

  /**
   * ### Рисует фрагмент загруженного изделия
   * @param attr {Object}
   * @param [attr.elm] {Number} - Элемент или Контур
   *        = 0, формируется эскиз изделия,
   *        > 0, эскиз элемента (заполнения или палки)
   *        < 0, эскиз контура (рамы или створки)
   * @param [attr.width] {Number} - если указано, эскиз будет вписан в данную ширину (по умолчению - 600px)
   * @param [attr.height] {Number} - если указано, эскиз будет вписан в данную высоту (по умолчению - 600px)
   * @param [attr.sz_lines] {enm.ТипыРазмерныхЛиний} - правила формирования размерных линий (по умолчению - Обычные)
   * @param [attr.txt_cnstr] {Boolean} - выводить текст, привязанный к слоям изделия (по умолчению - Да)
   * @param [attr.txt_elm] {Boolean} - выводить текст, привязанный к элементам (например, формулы заполнений, по умолчению - Да)
   * @param [attr.visualisation] {Boolean} - выводить визуализацию (по умолчению - Да)
   * @param [attr.opening] {Boolean} - выводить направление открывания (по умолчению - Да)
   * @param [attr.select] {Number} - выделить на эскизе элемент по номеру (по умолчению - 0)
   * @param [attr.format] {String} - [svg, png, pdf] - (по умолчению - png)
   * @param [attr.children] {Boolean} - выводить вложенные контуры (по умолчению - Нет)
   */
  draw_fragment(attr) {

    const {l_dimensions, l_connective} = this;

    // скрываем все слои
    const contours = this.getItems({class: Contour});
    contours.forEach((l) => l.hidden = true);
    l_dimensions.visible = false;
    l_connective.visible = false;

    if(attr.elm > 0){
      const elm = this.getItem({class: BuilderElement, elm: attr.elm});
      elm.draw_fragment && elm.draw_fragment();
    }
    else if(attr.elm < 0){
      const cnstr = -attr.elm;
      contours.some((l) => {
        if(l.cnstr == cnstr){
          l.hidden = false;
          l.hide_generatrix();
          l.l_dimensions.redraw(true);
          l.zoom_fit();
          return true;
        }
      })
    }
    this.view.update();
  }

  /**
   * информирует о наличии изменений
   */
  has_changes() {
    return this._ch.length > 0;
  }

  /**
   * Регистрирует необходимость обновить изображение
   */
  register_update() {
    const {_attr} = this;
    if(_attr._update_timer){
      clearTimeout(_attr._update_timer);
    }
    _attr._update_timer = setTimeout(() => {
      this.view && this.view.update();
      _attr._update_timer = 0;
    }, 100);
  }

  /**
   * Регистрирует факты изменения элемнтов
   */
  register_change(with_update) {

    const {_attr, _ch} = this;

    if(!_attr._loading){

      // сбрасываем габариты
      _attr._bounds = null;

      // сбрасываем d0 для всех профилей
      this.getItems({class: Profile}).forEach((p) => {
        delete p._attr.d0;
      });

      // регистрируем изменённость характеристики
      this.ox._data._modified = true;
      $p.eve.callEvent("scheme_changed", [this]);
    }
    _ch.push(Date.now());

    if(with_update){
      this.register_update();
    }
  }

  /**
   * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
   * @property bounds
   * @type Rectangle
   */
  get bounds() {
    const {_attr} = this;
    if(!_attr._bounds){
      this.contours.forEach((l) => {
        if(!_attr._bounds)
          _attr._bounds = l.bounds;
        else
          _attr._bounds = _attr._bounds.unite(l.bounds);
      });
    }
    return _attr._bounds;
  }

  /**
   * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
   */
  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLine}).forEach((dl) => {
      if(dl instanceof DimensionLineCustom || dl._attr.impost || dl._attr.contour){
        bounds = bounds.unite(dl.bounds);
      }
    });
    this.contours.forEach(({l_visualization}) => {
      const ib = l_visualization._by_insets.bounds;
      if(ib.height && ib.bottom > bounds.bottom){
        const delta = ib.bottom - bounds.bottom + 10;
        bounds = bounds.unite(
          new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
        );
      }
    });
    return bounds;
  }

  /**
   * ### Габариты эскиза со всеми видимыми дополнениями
   * В свойстве `strokeBounds` учтены все видимые дополнения - размерные линии, визуализация и т.д.
   *
   * @property strokeBounds
   */
  get strokeBounds() {
    let bounds = new paper.Rectangle();
    this.contours.forEach((l) => bounds = bounds.unite(l.strokeBounds));
    return bounds;
  }

  /**
   * Строка табчасти продукция текущего заказа, соответствующая редактируемому изделию
   */
  get _calc_order_row() {
    const {_attr, ox} = this;
    if(!_attr._calc_order_row && !ox.empty()){
      _attr._calc_order_row = ox.calc_order_row;
    }
    return _attr._calc_order_row;
  }

  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify(obj) {
    Object.getNotifier(this._noti).notify(obj);
  }

  /**
   * Чистит изображение
   */
  clear() {
    const pnames = '_bounds,_update_timer,_loading,_snapshot';
    for(let fld in this._attr){
      if(!pnames.match(fld)){
        delete this._attr[fld];
      }
    }
    super.clear();
  }

  /**
   * Деструктор
   */
  unload() {
    const {_dp, _attr, _papam_observer, _dp_observer} = this;
    _attr._loading = true;
    this.clear();
    this.remove();
    Object.unobserve(_dp, _dp_observer);
    Object.unobserve(_dp.characteristic, _papam_observer);
    this._attr._calc_order_row = null;
  }

  /**
   * Двигает выделенные точки путей либо все точки выделенных элементов
   * @method move_points
   * @param delta {paper.Point}
   * @param [all_points] {Boolean}
   */
  move_points(delta, all_points) {
    const other = [];
    const layers = [];
    const profiles = [];

    this.selectedItems.forEach((item) => {

      const {parent, layer} = item;

      if(item instanceof paper.Path && parent instanceof ProfileItem){

        if(profiles.indexOf(parent) != -1){
          return;
        }

        profiles.push(parent);

        if(parent._hatching){
          parent._hatching.remove();
          parent._hatching = null;
        }

        if(layer instanceof ConnectiveLayer){
          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));
        }
        else if(!parent.nearest || !parent.nearest()){

          let check_selected;
          item.segments.forEach((segm) => {
            if(segm.selected && other.indexOf(segm) != -1){
              check_selected = !(segm.selected = false);
            }
          });

          // если уже двигали и не осталось ни одного выделенного - выходим
          if(check_selected && !item.segments.some((segm) => segm.selected)){
            return;
          }

          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));

          if(layers.indexOf(layer) == -1){
            layers.push(layer);
            layer.l_dimensions.clear();
          }
        }
      }
      else if(item instanceof Filling){
        item.purge_path();
      }
    });
    // TODO: возможно, здесь надо подвигать примыкающие контуры
  }

  /**
   * Сохраняет координаты и пути элементов в табличных частях характеристики
   * @method save_coordinates
   */
  save_coordinates(attr) {

    const {_attr, bounds, ox} = this;

    if(!bounds){
      return;
    }

    // переводим характеристику в тихий режим, чтобы она не создавала лишнего шума при изменениях
    ox._silent();

    _attr._saving = true;

    // устанавливаем размеры в характеристике
    ox.x = bounds.width.round(1);
    ox.y = bounds.height.round(1);
    ox.s = this.area;

    // чистим табчасти, которые будут перезаполнены
    ox.cnn_elmnts.clear();
    ox.glasses.clear();

    // смещаем слои, чтобы расположить изделие в начале координат
    //var bpoint = this.bounds.point;
    //if(bpoint.length > consts.sticking0){
    //	this.getItems({class: Contour}).forEach(function (contour) {
    //		contour.position = contour.position.subtract(bpoint);
    //	});
    //	this._attr._bounds = null;
    //};

    // вызываем метод save_coordinates в дочерних слоях
    this.contours.forEach((contour) => contour.save_coordinates());

    // вызываем метод save_coordinates в слое соединителей
    this.l_connective.save_coordinates();

    $p.eve.callEvent("save_coordinates", [this, attr]);
  }

  /**
   * ### Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
   * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
   *
   * @method zoom_fit
   */
  zoom_fit(bounds) {

    if(!bounds){
      bounds = this.strokeBounds;
    }

    const height = (bounds.height < 1000 ? 1000 : bounds.height) + 320;
    const width = (bounds.width < 1000 ? 1000 : bounds.width) + 320;
    let shift;

    if(bounds){
      const {view} = this;
      view.zoom = Math.min((view.viewSize.height - 40) / height, (view.viewSize.width - 40) / width);
      shift = (view.viewSize.width - bounds.width * view.zoom) / 2;
      if(shift < 180){
        shift = 0;
      }
      view.center = bounds.center.add([shift, 60]);
    }
  }

  /**
   * ### Bозвращает строку svg эскиза изделия
   * Вызывается при записи изделия. Полученный эскиз сохраняется во вложении к характеристике
   *
   * @method get_svg
   * @param [attr] {Object} - указывает видимость слоёв и элементов, используется для формирования эскиза части изделия
   */
  get_svg(attr) {
    this.deselectAll();

    const svg = this.exportSVG();
    const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

    svg.setAttribute("x", bounds.x);
    svg.setAttribute("y", bounds.y);
    svg.setAttribute("width", bounds.width);
    svg.setAttribute("height", bounds.height);
    svg.querySelector("g").removeAttribute("transform");
    //svg.querySelector("g").setAttribute("transform", "scale(1)");

    return svg.outerHTML;
  }

  /**
   * ### Перезаполняет изделие данными типового блока или снапшота
   * Вызывается, обычно, из формы выбора типового блока, но может быть вызван явно в скриптах тестирования или групповых обработках
   *
   * @method load_stamp
   * @param obx {String|CatObj|Object} - идентификатор или объект-основание (характеристика продукции либо снапшот)
   * @param is_snapshot {Boolean}
   */
  load_stamp(obx, is_snapshot) {

    const do_load = (obx) => {

      const {ox} = this;

      // сохраняем ссылку на типовой блок
      if(!is_snapshot){
        this._dp.base_block = obx;
      }

      // если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
      this.clear();

      // переприсваиваем номенклатуру, цвет и размеры
      ox._mixin(obx, ["owner","sys","clr","x","y","s","s"]);

      // очищаем табчасти, перезаполняем контуры и координаты
      ox.constructions.load(obx.constructions);
      ox.coordinates.load(obx.coordinates);
      ox.params.load(obx.params);
      ox.cnn_elmnts.load(obx.cnn_elmnts);
      ox.inserts.load(obx.inserts);

      ox.specification.clear();
      ox.glass_specification.clear();
      ox.glasses.clear();

      this.load(ox);

    }

    this._attr._loading = true;

    if(is_snapshot){
      this._attr._snapshot = true;
      do_load(obx);
    }
    else{
      $p.cat.characteristics.get(obx, true, true).then(do_load);
    }
  }

  /**
   * ### Вписывает канвас в указанные размеры
   * Используется при создании проекта и при изменении размеров области редактирования
   *
   * @method resize_canvas
   * @param w {Number} - ширина, в которую будет вписан канвас
   * @param h {Number} - высота, в которую будет вписан канвас
   */
  resize_canvas(w, h){
    const {viewSize} = this.view;
    viewSize.width = w;
    viewSize.height = h;
  }

  /**
   * Возвращает массив РАМНЫХ контуров текущего изделия
   * @property contours
   * @type Array
   */
  get contours() {
    return this.layers.filter((l) => l instanceof Contour);
  }

  /**
   * ### Площадь изделия
   * TODO: переделать с учетом пустот, наклонов и криволинейностей
   *
   * @property area
   * @type Number
   * @final
   */
  get area() {
    return (this.bounds.width * this.bounds.height / 1000000).round(3);
  }

  /**
   * ### Цвет текущего изделия
   *
   * @property clr
   * @type _cat.clrs
   */
  get clr() {
    return this.ox.clr;
  }
  set clr(v) {
    this.ox.clr = v;
  }

  /**
   * ### Служебный слой размерных линий
   *
   * @property l_dimensions
   * @type DimensionLayer
   * @final
   */
  get l_dimensions() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_dimensions){
      _attr.l_dimensions = new DimensionLayer();
    }
    if(!_attr.l_dimensions.isInserted()){
      this.addLayer(_attr.l_dimensions);
    }
    if(activeLayer){
      this._activeLayer = activeLayer;
    }

    return _attr.l_dimensions;
  }

  /**
   * ### Служебный слой соединительных профилей
   *
   * @property l_connective
   * @type ConnectiveLayer
   * @final
   */
  get l_connective() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_connective){
      _attr.l_connective = new ConnectiveLayer();
    }
    if(!_attr.l_connective.isInserted()){
      this.addLayer(_attr.l_connective);
    }
    if(activeLayer){
      this._activeLayer = activeLayer;
    }

    return _attr.l_connective;
  }

  /**
   * ### Создаёт и перерисовавает габаритные линии изделия
   * Отвечает только за габариты изделия.<br />
   * Авторазмерные линии контуров и пользовательские размерные линии, контуры рисуют самостоятельно
   *
   * @method draw_sizes
   */
  draw_sizes() {

    const {bounds, l_dimensions} = this;

    if(bounds){

      if(!l_dimensions.bottom)
        l_dimensions.bottom = new DimensionLine({
          pos: "bottom",
          parent: l_dimensions,
          offset: -120
        });
      else
        l_dimensions.bottom.offset = -120;

      if(!l_dimensions.right)
        l_dimensions.right = new DimensionLine({
          pos: "right",
          parent: l_dimensions,
          offset: -120
        });
      else
        l_dimensions.right.offset = -120;


      // если среди размеров, сформированных контурами есть габарит - второй раз не выводим

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == "right" && Math.abs(dl.size - bounds.height) < consts.sticking_l))){
        l_dimensions.right.visible = false;
      }
      else{
        l_dimensions.right.redraw();
      }

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == "bottom" && Math.abs(dl.size - bounds.width) < consts.sticking_l))){
        l_dimensions.bottom.visible = false;
      }
      else{
        l_dimensions.bottom.redraw();
      }
    }
    else{
      if(l_dimensions.bottom)
        l_dimensions.bottom.visible = false;
      if(l_dimensions.right)
        l_dimensions.right.visible = false;
    }
  }

  /**
   * Перерисовавает визуализацию контуров изделия
   */
  draw_visualization() {
    for(let contour of this.contours){
      contour.draw_visualization()
    }
    this.view.update();
  }

  /**
   * ### Вставка по умолчанию
   * Возвращает вставку по умолчанию с учетом свойств системы и положения элемента
   *
   * @method default_inset
   * @param [attr] {Object}
   * @param [attr.pos] {_enm.positions} - положение элемента
   * @param [attr.elm_type] {_enm.elm_types} - тип элемента
   * @returns {Array.<ProfileItem>}
   */
  default_inset(attr) {

    let rows;

    if(!attr.pos){
      rows = this._dp.sys.inserts(attr.elm_type, true);
      // если доступна текущая, возвращаем её
      if(attr.inset && rows.some((row) => attr.inset == row)){
        return attr.inset;
      }
      return rows[0];
    }

    rows = this._dp.sys.inserts(attr.elm_type, "rows");

    // если без вариантов, возвращаем без вариантов
    if(rows.length == 1){
      return rows[0].nom;
    }

    const pos_array = Array.isArray(attr.pos);
    function check_pos(pos) {
      if(pos_array){
        return attr.pos.some((v) => v == pos);
      }
      return attr.pos == pos;
    }

    // если подходит текущая, возвращаем текущую
    if(attr.inset && rows.some((row) => attr.inset == row.nom && (check_pos(row.pos) || row.pos == $p.enm.positions.Любое))){
      return attr.inset;
    }

    let inset;
    // ищем по умолчанию + pos
    rows.some((row) => {
      if(check_pos(row.pos) && row.by_default)
        return inset = row.nom;
    });
    // ищем по pos без умолчания
    if(!inset){
      rows.some((row) => {
        if(check_pos(row.pos))
          return inset = row.nom;
      });
    }
    // ищем по умолчанию + любое
    if(!inset){
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое && row.by_default)
          return inset = row.nom;
      });
    }
    // ищем любое без умолчаний
    if(!inset){
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое)
          return inset = row.nom;
      });
    }

    return inset;
  }

  /**
   * ### Контроль вставки
   * Проверяет, годится ли текущая вставка для данного типа элемента и положения
   */
  check_inset(attr) {
    const inset = attr.inset ? attr.inset : attr.elm.inset;
    const elm_type = attr.elm ? attr.elm.elm_type : attr.elm_type;
    const nom = inset.nom();
    const rows = [];

    // если номенклатура пустая, выходим без проверки
    if(!nom || nom.empty()){
      return inset;
    }

    // получаем список вставок с той же номенклатурой, что и наша
    this._dp.sys.elmnts.each(function(row){
      if((elm_type ? row.elm_type == elm_type : true) && row.nom.nom() == nom)
        rows.push(row);
    });

    // TODO: отфильтровать по положению attr.pos

    // если в списке есть наша, возвращаем её, иначе - первую из списка
    for(var i=0; i<rows.length; i++){
      if(rows[i].nom == inset)
        return inset;
    }

    if(rows.length)
      return rows[0].nom;
  }

  /**
   * Находит точку на примыкающем профиле и проверяет расстояние до неё от текущей точки
   * !! Изменяет res - CnnPoint
   * @param element {Profile} - профиль, расстояние до которого проверяем
   * @param profile {Profile|null} - текущий профиль - используется, чтобы не искать соединения с самим собой
   * TODO: возможно, имеет смысл разрешить змее кусать себя за хвост
   * @param res {CnnPoint} - описание соединения на конце текущего профиля
   * @param point {paper.Point} - точка, окрестность которой анализируем
   * @param check_only {Boolean|String} - указывает, выполнять только проверку или привязывать точку к узлам или профилю или к узлам и профилю
   * @returns {Boolean|undefined}
   */
  check_distance(element, profile, res, point, check_only) {
    const _scheme = this;

    let distance, gp, cnns, addls,
      bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
      bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only,
      node_distance;

    // Проверяет дистанцию в окрестности начала или конца соседнего элемента
    function check_node_distance(node) {

      if((distance = element[node].getDistance(point)) < (_scheme._dp.sys.allow_open_cnn ? parseFloat(consts.sticking_l) : consts.sticking)){

        if(typeof res.distance == "number" && res.distance < distance)
          return 1;

        //if(profile && (!res.cnn || $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)){
        if(profile && !res.cnn){

          // а есть ли подходящее?
          cnns = $p.cat.cnns.nom_cnn(element, profile, $p.enm.cnn_types.acn.a);
          if(!cnns.length){
            if(!element.is_collinear(profile)){
              cnns = $p.cat.cnns.nom_cnn(profile, element, $p.enm.cnn_types.acn.t);
            }
            if(!cnns.length){
              return 1;
            }
          }

          // если в точке сходятся 2 профиля текущего контура - ок

          // если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

        }
        else if(res.cnn && $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1){
          return 1;
        }

        res.point = bind_node ? element[node] : point;
        res.distance = distance;
        res.profile = element;
        if(cnns && cnns.length && $p.enm.cnn_types.acn.t.indexOf(cnns[0].cnn_type) != -1){
          res.profile_point = '';
          res.cnn_types = $p.enm.cnn_types.acn.t;
          if(!res.cnn){
            res.cnn = cnns[0];
          }
        }
        else{
          res.profile_point = node;
          res.cnn_types = $p.enm.cnn_types.acn.a;
        }

        return 2;
      }

    }

    if(element === profile){
      if(profile.is_linear())
        return;
      else{
        // проверяем другой узел, затем - Т

      }
      return;

    }
    else if(node_distance = check_node_distance("b")){
      // Если мы находимся в окрестности начала соседнего элемента
      if(node_distance == 2)
        return false;
      else
        return;

    }else if(node_distance = check_node_distance("e")){
      // Если мы находимся в окрестности конца соседнего элемента
      if(node_distance == 2)
        return false;
      else
        return;

    }

    // это соединение с пустотой или T
    res.profile_point = '';

    // // если возможна привязка к добору, используем её
    // element.addls.forEach(function (addl) {
    // 	gp = addl.generatrix.getNearestPoint(point);
    // 	distance = gp.getDistance(point);
    //
    // 	if(distance < res.distance){
    // 		res.point = addl.rays.outer.getNearestPoint(point);
    // 		res.distance = distance;
    // 		res.point = gp;
    // 		res.profile = addl;
    // 		res.cnn_types = $p.enm.cnn_types.acn.t;
    // 	}
    // });
    // if(res.distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){
    // 	return false;
    // }

    // если к доборам не привязались - проверяем профиль
    gp = element.generatrix.getNearestPoint(point);
    distance = gp.getDistance(point);

    if(distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){

      if(distance < res.distance || bind_generatrix){
        if(element.d0 != 0 && element.rays.outer){
          // для вложенных створок и смещенных рам учтём смещение
          res.point = element.rays.outer.getNearestPoint(point);
          res.distance = 0;
        }
        else{
          res.point = gp;
          res.distance = distance;
        }
        res.profile = element;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }
      if(bind_generatrix){
        return false;
      }
    }
  }

  /**
   * ### Цвет по умолчанию
   * Возвращает цвет по умолчанию с учетом свойств системы и элемента
   *
   * @property default_clr
   * @final
   */
  default_clr(attr) {
    return this.ox.clr;
  }

  /**
   * ### Фурнитура по умолчанию
   * Возвращает фурнитуру текущего изделия по умолчанию с учетом свойств системы и контура
   *
   * @property default_furn
   * @final
   */
  get default_furn() {
    // ищем ранее выбранную фурнитуру для системы
    var sys = this._dp.sys,
      res;
    while (true){
      if(res = $p.job_prm.builder.base_furn[sys.ref])
        break;
      if(sys.empty())
        break;
      sys = sys.parent;
    }
    if(!res){
      res = $p.job_prm.builder.base_furn.null;
    }
    if(!res){
      $p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ""}}, (row) => {
        res = row;
        return false;
      });
    }
    return res;
  }

  /**
   * ### Выделенные профили
   * Возвращает массив выделенных профилей. Выделенным считаем профиль, у которого выделены `b` и `e` или выделен сам профиль при невыделенных узлах
   *
   * @method selected_profiles
   * @param [all] {Boolean} - если true, возвращает все выделенные профили. Иначе, только те, которе можно двигать
   * @returns {Array.<ProfileItem>}
   */
  selected_profiles(all) {
    const res = [];
    const count = this.selectedItems.length;

    this.selectedItems.forEach((item) => {

      const p = item.parent;

      if(p instanceof ProfileItem){
        if(all || !item.layer.parent || !p.nearest || !p.nearest()){

          if(res.indexOf(p) != -1){
            return;
          }

          if(count < 2 || !(p._attr.generatrix.firstSegment.selected ^ p._attr.generatrix.lastSegment.selected)){
            res.push(p);
          }

        }
      }
    });

    return res;
  }

  /**
   * ### Выделенные заполнения
   *
   * @method selected_glasses
   * @returns {Array.<Filling>}
   */
  selected_glasses() {
    const res = [];

    this.selectedItems.forEach((item) => {

      if(item instanceof Filling && res.indexOf(item) == -1){
        res.push(item);
      }
      else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1){
        res.push(item.parent);
      }
    });

    return res;
  }

  /**
   * ### Выделенный элемент
   * Возвращает первый из найденных выделенных элементов
   *
   * @property selected_elm
   * @returns {BuilderElement}
   */
  get selected_elm() {
    let res;
    this.selectedItems.some((item) => {
      if(item instanceof BuilderElement){
        return res = item;

      }else if(item.parent instanceof BuilderElement){
        return res = item.parent;
      }
    });
    return res;
  }

  /**
   * Ищет точки в выделенных элементах. Если не находит, то во всём проекте
   * @param point {paper.Point}
   * @returns {*}
   */
  hitPoints(point, tolerance, selected_first) {
    let item, hit;

    // отдаём предпочтение сегментам выделенных путей
    if(selected_first){
      this.selectedItems.some((item) => hit = item.hitTest(point, { segments: true, tolerance: tolerance || 8 }));
      // если нет в выделенных, ищем во всех
      if(!hit){
        hit = this.hitTest(point, { segments: true, tolerance: tolerance || 6 });
      }
    }
    else{
      let dist = Infinity;
      this.activeLayer.profiles.forEach((p) => {
        const corn = p.corns(point);
        if(corn.dist < dist){
          dist = corn.dist;
          if(corn.dist < consts.sticking){
            hit = {
              item: p.generatrix,
              point: corn.point
            }
          }
        }
      })
    }


    // if(!tolerance && hit && hit.item.layer && hit.item.layer.parent){
    //   item = hit.item;
    //   // если соединение T - портить hit не надо, иначе - ищем во внешнем контуре
    //   if((item.parent.b && item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
    //     (item.parent.rays.b.is_t || item.parent.rays.b.is_i))
    //     || (item.parent.e && item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
    //     (item.parent.rays.e.is_t || item.parent.rays.e.is_i))){
    //     return hit;
    //   }
    //
    //   item.layer.parent.profiles.some((item) => hit = item.hitTest(point, { segments: true, tolerance: tolerance || 6 }));
    //   //item.selected = false;
    // }
    return hit;
  }

  /**
   * Корневой слой для текущего слоя
   */
  rootLayer(layer) {
    if(!layer){
      layer = this.activeLayer
    }
    while (layer.parent){
      layer = layer.parent
    }
    return layer
  }

  /**
   * Снимает выделение со всех узлов всех путей
   * В отличии от deselectAll() сами пути могут оставаться выделенными
   * учитываются узлы всех путей, в том числе и не выделенных
   */
  deselect_all_points(with_items) {
    this.getItems({class: paper.Path}).forEach(function (item) {
      item.segments.forEach(function (s) {
        if (s.selected)
          s.selected = false;
      });
      if(with_items && item.selected)
        item.selected = false;
    });
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter() {
    let res = [],
      contours = this.contours,
      tmp;

    // если в изделии один рамный контур - просто возвращаем его периметр
    if(contours.length == 1){
      return contours[0].perimeter;
    }

    // находим самый нижний правый контур

    // бежим по всем контурам, находим примыкания, исключаем их из результата

    return res;
  }

}
