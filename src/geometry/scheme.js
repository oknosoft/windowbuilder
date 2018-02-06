/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
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

  constructor(_canvas, _editor, _silent) {

    // создаём объект проекта paperjs
    super(_canvas);

    const _scheme = _editor.project = this;

    const _attr = this._attr = {
      _silent,
      _bounds: null,
      _calc_order_row: null,
      _update_timer: 0
    };

    // массив с моментами времени изменений изделия
    const _changes = this._ch = [];

    // наблюдатель за изменениями свойств изделия
    this._dp_listener = (obj, fields) => {

      if(_attr._loading || _attr._snapshot || obj != this._dp) {
        return;
      }

      const scheme_changed_names = ['clr', 'sys'];
      const row_changed_names = ['quantity', 'discount_percent', 'discount_percent_internal'];

      if(fields.hasOwnProperty('clr') || fields.hasOwnProperty('sys')) {
        // информируем мир об изменениях
        _scheme.notify(_scheme, 'scheme_changed');
      }

      if(fields.hasOwnProperty('clr')) {
        _scheme.ox.clr = obj.clr;
        _scheme.getItems({class: ProfileItem}).forEach((p) => {
          if(!(p instanceof Onlay)) {
            p.clr = obj.clr;
          }
        });
      }

      if(fields.hasOwnProperty('sys') && !obj.sys.empty()) {

        obj.sys.refill_prm(_scheme.ox);

        // обновляем свойства изделия и створки
        _editor.eve.emit_async('rows', _scheme.ox, {extra_fields: true, params: true});

        // информируем контуры о смене системы, чтобы пересчитать материал профилей и заполнений
        for (const contour of _scheme.contours) {
          contour.on_sys_changed();
        }

        if(obj.sys != $p.wsql.get_user_param('editor_last_sys')) {
          $p.wsql.set_user_param('editor_last_sys', obj.sys.ref);
        }

        if(_scheme.ox.clr.empty()) {
          _scheme.ox.clr = obj.sys.default_clr;
        }

        _scheme.register_change(true);
      }

      for (const name of row_changed_names) {
        if(_attr._calc_order_row && fields.hasOwnProperty(name)) {
          _attr._calc_order_row[name] = obj[name];
          _scheme.register_change(true);
        }
      }

    };

    /**
     * Объект обработки с табличными частями
     */
    this._dp = $p.dp.buyers_order.create();

    // наблюдатель за изменениями параметров створки
    this._papam_listener = (obj, fields) => {
      if(_attr._loading || _attr._snapshot) {
        return;
      }
      const {characteristic} = this._dp;
      if(obj._owner === characteristic.params || (obj === characteristic && fields.hasOwnProperty('params'))) {
        _scheme.register_change();
      }
    };


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

    this.magnetism = new Magnetism(this);

    /**
     * Перерисовывает все контуры изделия. Не занимается биндингом.
     * Предполагается, что взаимное перемещение профилей уже обработано
     */
    this.redraw = () => {

      _attr._opened && typeof requestAnimationFrame == 'function' && requestAnimationFrame(_scheme.redraw);

      if(!_attr._opened || _attr._saving || !_changes.length) {
        return;
      }

      _changes.length = 0;

      if(_scheme.contours.length) {

        // перерисовываем соединительные профили
        _scheme.l_connective.redraw();

        // перерисовываем все контуры
        for (let contour of _scheme.contours) {
          contour.redraw();
          if(_changes.length && typeof requestAnimationFrame == 'function') {
            return;
          }
        }

        // если перерисованы все контуры, перерисовываем их размерные линии
        _attr._bounds = null;
        _scheme.contours.forEach((l) => {
          l.contours.forEach((l) => {
            l.save_coordinates(true);
            l.refresh_prm_links();
          });
          l.l_dimensions.redraw();
        });

        // перерисовываем габаритные размерные линии изделия
        _scheme.draw_sizes();

        // обновляем изображение на эуране
        _scheme.view.update();

      }
      else {
        _scheme.draw_sizes();
      }

    };

    // начинаем следить за _dp, чтобы обработать изменения цвета и параметров
    if(!_attr._silent) {
      this._dp._manager.on('update', this._dp_listener);
    }
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
    const {_dp, _attr, _papam_listener} = this;
    let setted;

    // пытаемся отключить обсервер от табчасти
    !_attr._silent && _dp.characteristic._manager.off('update', _papam_listener);
    !_attr._silent && _dp.characteristic._manager.off('rows', _papam_listener);

    // устанавливаем в _dp характеристику
    _dp.characteristic = v;

    const ox = _dp.characteristic;

    _dp.len = ox.x;
    _dp.height = ox.y;
    _dp.s = ox.s;

    // устанавливаем строку заказа
    _attr._calc_order_row = ox.calc_order_row;

    // устанавливаем в _dp свойства строки заказа
    if(_attr._calc_order_row) {
      'quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note'.split(',').forEach((fld) => _dp[fld] = _attr._calc_order_row[fld]);
    }
    else {
      // TODO: установить режим только просмотр, если не найдена строка заказа
    }


    // устанавливаем в _dp систему профилей
    if(ox.empty()) {
      _dp.sys = '';
    }
    // для пустой номенклатуры, ставим предыдущую выбранную систему
    else if(ox.owner.empty()) {
      _dp.sys = $p.wsql.get_user_param('editor_last_sys');
      setted = !_dp.sys.empty();
    }
    // иначе, ищем первую подходящую систему
    else if(_dp.sys.empty()) {
      $p.cat.production_params.find_rows({is_folder: false}, (o) => {
        if(setted) {
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
    if(setted) {
      _dp.sys.refill_prm(ox);
    }

    // устанавливаем в _dp цвет по умолчанию
    if(_dp.clr.empty()) {
      _dp.clr = _dp.sys.default_clr;
    }

    // оповещаем о новых слоях и свойствах изделия
    if(!_attr._silent) {
      this._scope.eve.emit_async('rows', ox, {constructions: true});
      _dp._manager.emit_async('rows', _dp, {extra_fields: true});

      // начинаем следить за ox, чтобы обработать изменения параметров фурнитуры
      _dp.characteristic._manager.on({
        update: _papam_listener,
        rows: _papam_listener,
      });
    }

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
   * @param from_service {Boolean} - вызов произведен из сервиса, визуализацию перерисовываем сразу и делаем дополнительный zoom_fit
   * @async
   */
  load(id, from_service) {
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
      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, (row) => {
        const layer = _scheme.getItem({cnstr: row.cnstr});
        layer && new DimensionLineCustom({
          parent: layer.l_dimensions,
          row: row
        });
      });
    }

    function load_object(o) {

      _scheme.ox = o;

      // включаем перерисовку
      _attr._opened = true;
      _attr._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });

      // первым делом создаём соединители и опорные линии
      o.coordinates.forEach((row) => {
        if(row.elm_type === $p.enm.elm_types.Соединитель) {
          new ProfileConnective({row});
        }
        else if(row.elm_type === $p.enm.elm_types.Линия) {
          new BaseLine({row});
        }
      })
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

          // заставляем UndoRedo сделать начальный снапшот, одновременно, обновляем заголовок
          if(!_attr._snapshot) {
            _scheme._scope._undo.clear();
            _scheme._scope._undo.save_snapshot(_scheme);
            _scheme._scope.set_text();
          }

          // регистрируем изменение, чтобы отрисовались размерные линии
          _scheme.register_change(true);

          // виртуальное событие, чтобы активировать слой в дереве слоёв
          if(_scheme.contours.length) {
            _scheme.notify(_scheme.contours[0], 'layer_activated', true);
          }

          delete _attr._loading;

          // при необходимости загружаем типовой блок
          ((_scheme.ox.base_block.empty() || !_scheme.ox.base_block.is_new()) ? Promise.resolve() : _scheme.ox.base_block.load())
            .then(() => {
              if(_scheme.ox.coordinates.count()) {
                if(_scheme.ox.specification.count() || from_service) {
                  if(from_service){
                    Promise.resolve().then(() => {
                      _scheme.draw_visualization();
                      _scheme.zoom_fit();
                      resolve();
                    })
                  }
                  else{
                    setTimeout(() => _scheme.draw_visualization(), 100);
                  }
                }
                else {
                  // если нет спецификации при заполненных координатах, скорее всего, прочитали типовой блок или снапшот - запускаем пересчет
                  $p.products_building.recalc(_scheme, {});
                }
              }
              else {
                if(from_service){
                  resolve();
                }
                else{
                  paper.load_stamp && paper.load_stamp();
                }
              }
              delete _attr._snapshot;

              (!from_service || !_scheme.ox.specification.count()) && resolve();
            });
        });
      });
    }

    _attr._loading = true;
    if(id != this.ox) {
      this.ox = null;
    }
    this.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new()) {
      return load_object(id);
    }
    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)) {
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

    let elm;
    if(attr.elm > 0) {
      elm = this.getItem({class: BuilderElement, elm: attr.elm});
      elm.draw_fragment && elm.draw_fragment();
    }
    else if(attr.elm < 0) {
      const cnstr = -attr.elm;
      contours.some((l) => {
        if(l.cnstr == cnstr) {
          l.hidden = false;
          l.hide_generatrix();
          l.l_dimensions.redraw(true);
          l.zoom_fit();
          return true;
        }
      });
    }
    this.view.update();
    return elm;
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
    if(_attr._update_timer) {
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

    if(!_attr._loading) {

      // сбрасываем габариты
      _attr._bounds = null;

      // сбрасываем d0 для всех профилей
      this.getItems({class: Profile}).forEach((p) => {
        delete p._attr.d0;
      });

      // регистрируем изменённость характеристики
      this.ox._data._modified = true;
      this.notify(this, 'scheme_changed');
    }
    _ch.push(Date.now());

    if(with_update) {
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
    if(!_attr._bounds) {
      this.contours.forEach((l) => {
        if(!_attr._bounds) {
          _attr._bounds = l.bounds;
        }
        else {
          _attr._bounds = _attr._bounds.unite(l.bounds);
        }
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
      if(dl instanceof DimensionLineCustom || dl._attr.impost || dl._attr.contour) {
        bounds = bounds.unite(dl.bounds);
      }
    });
    this.contours.forEach(({l_visualization}) => {
      const ib = l_visualization._by_insets.bounds;
      if(ib.height && ib.bottom > bounds.bottom) {
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
    if(!_attr._calc_order_row && !ox.empty()) {
      _attr._calc_order_row = ox.calc_order_row;
    }
    return _attr._calc_order_row;
  }

  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify(obj, type = 'update', fields) {
    if(obj.type) {
      type = obj.type;
    }
    this._scope.eve.emit_async(type, obj, fields);
  }

  /**
   * Чистит изображение
   */
  clear() {
    const {_attr} = this;
    const pnames = '_bounds,_update_timer,_loading,_snapshot';
    for (let fld in _attr) {
      if(!pnames.match(fld)) {
        delete _attr[fld];
      }
    }

    super.clear();
  }

  /**
   * Деструктор
   */
  unload() {
    const {_dp, _attr, _papam_listener, _dp_listener, _calc_order_row} = this;
    const pnames = '_loading,_saving';
    for (let fld in _attr) {
      if(pnames.match(fld)) {
        _attr[fld] = true;
      }
      else {
        delete _attr[fld];
      }
    }
    //this.clear(_attr);

    _dp._manager.off('update', _dp_listener);

    const ox = _dp.characteristic;
    ox._manager.off('update', _papam_listener);
    ox._manager.off('rows', _papam_listener);
    if(ox && ox._modified) {
      if(ox.is_new()) {
        if(_calc_order_row) {
          ox.calc_order.production.del(_calc_order_row);
        }
        ox.unload();
      }
      else {
        setTimeout(ox.load.bind(ox), 100);
      }
    }

    this.remove();
    for (let fld in _attr) {
      delete _attr[fld];
    }
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
    const profiles = new Set;

    const {auto_align, _dp} = this;

    for (const item of this.selectedItems) {
      const {parent, layer} = item;

      if(item instanceof paper.Path && parent instanceof GeneratrixElement && !profiles.has(parent)) {

        profiles.add(parent);

        if(parent._hatching) {
          parent._hatching.remove();
          parent._hatching = null;
        }

        if(layer instanceof ConnectiveLayer) {
          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));
        }
        else if(!parent.nearest || !parent.nearest()) {

          // автоуравнивание $p.enm.align_types.Геометрически
          if(auto_align && parent.elm_type == $p.enm.elm_types.Импост) {
            continue;
          }

          let check_selected;
          item.segments.forEach((segm) => {
            if(segm.selected && other.indexOf(segm) != -1) {
              check_selected = !(segm.selected = false);
            }
          });

          // если уже двигали и не осталось ни одного выделенного - выходим
          if(check_selected && !item.segments.some((segm) => segm.selected)) {
            continue;
          }

          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));

          if(layers.indexOf(layer) == -1) {
            layers.push(layer);
            layer.l_dimensions.clear();
          }
        }
      }
      else if(item instanceof Filling) {
        item.purge_path();
      }
    }

    // при необходимости двигаем импосты
    other.length && this.do_align(auto_align, profiles);

    _dp._manager.emit_async('update', {}, {x1: true, x2: true, y1: true, y2: true, a1: true, a2: true, cnn1: true, cnn2: true, info: true});

    // TODO: возможно, здесь надо подвигать примыкающие контуры
  }

  /**
   * Сохраняет координаты и пути элементов в табличных частях характеристики
   * @method save_coordinates
   */
  save_coordinates(attr) {

    const {_attr, bounds, ox} = this;

    if(!bounds) {
      return;
    }

    _attr._saving = true;
    ox._data._loading = true;

    // устанавливаем размеры в характеристике
    ox.x = bounds.width.round(1);
    ox.y = bounds.height.round(1);
    ox.s = this.area;

    // чистим табчасти, которые будут перезаполнены
    ox.cnn_elmnts.clear();
    ox.glasses.clear();

    // вызываем метод save_coordinates в дочерних слоях
    this.contours.forEach((contour) => contour.save_coordinates());

    // вызываем метод save_coordinates в слое соединителей
    this.l_connective.save_coordinates();

    $p.products_building.recalc(this, attr);

  }

  /**
   * ### Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
   * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
   *
   * @method zoom_fit
   */
  zoom_fit(bounds) {

    if(!bounds) {
      bounds = this.strokeBounds;
    }

    const height = (bounds.height < 1000 ? 1000 : bounds.height) + 320;
    const width = (bounds.width < 1000 ? 1000 : bounds.width) + 320;
    let shift;

    if(bounds) {
      const {view} = this;
      view.zoom = Math.min((view.viewSize.height - 40) / height, (view.viewSize.width - 40) / width);
      shift = (view.viewSize.width - bounds.width * view.zoom) / 2;
      if(shift < 180) {
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

    svg.setAttribute('x', bounds.x);
    svg.setAttribute('y', bounds.y);
    svg.setAttribute('width', bounds.width);
    svg.setAttribute('height', bounds.height);
    svg.querySelector('g').removeAttribute('transform');
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

      // если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
      this.clear();

      // переприсваиваем номенклатуру, цвет и размеры
      ox._mixin(is_snapshot ? obx :
        obx._obj, null, ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'base_block', 'note', 'partner'], true);

      // сохраняем ссылку на типовой блок
      if(!is_snapshot) {
        ox.base_block = obx.base_block.empty() ? obx : obx.base_block;
      }

      this.load(ox);
      ox._data._modified = true;

    };

    this._attr._loading = true;

    if(is_snapshot) {
      this._attr._snapshot = true;
      do_load(obx);
    }
    else {
      $p.cat.characteristics.get(obx, true, true).then(do_load);
    }
  }

  /**
   * ### Выясняет, надо ли автоуравнивать изделие при сдвиге точек
   * @return {boolean}
   */
  get auto_align() {
    const {calc_order, base_block} = this.ox;
    const {Шаблон} = $p.enm.obj_delivery_states;
    if(base_block.empty() || calc_order.obj_delivery_state == Шаблон || base_block.calc_order.obj_delivery_state != Шаблон) {
      return false;
    }
    const {auto_align} = $p.job_prm.properties;
    let align;
    if(auto_align) {
      base_block.params.find_rows({param: auto_align}, (row) => {
        align = row.value;
        return false;
      });
      return align && align != '_' && align;
    }
  }

  /**
   * ### Уравнивает геометрически или по заполнениям
   * @param auto_align
   */
  do_align(auto_align, profiles) {

    if(!auto_align || !profiles.size) {
      return;
    }

    // получаем слои, в которых двигались элементы
    const layers = new Set();
    for (const profile of profiles) {
      layers.add(profile.layer);
    }

    if(this._attr._align_timer) {
      clearTimeout(this._attr._align_timer);
    }

    this._attr._align_timer = setTimeout(() => {

      this._attr._align_timer = 0;

      // получаем массив заполнений изменённых контуров
      const glasses = [];
      for (const layer of layers) {
        for(const filling of layer.fillings){
          glasses.indexOf(filling) == -1 && glasses.push(filling);
        }
      }
      this._scope.do_glass_align('width', glasses);

      if(auto_align == $p.enm.align_types.ПоЗаполнениям) {

      }
    }, 100);

  }

  /**
   * ### Вписывает канвас в указанные размеры
   * Используется при создании проекта и при изменении размеров области редактирования
   *
   * @method resize_canvas
   * @param w {Number} - ширина, в которую будет вписан канвас
   * @param h {Number} - высота, в которую будет вписан канвас
   */
  resize_canvas(w, h) {
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

    if(!_attr.l_dimensions) {
      _attr.l_dimensions = new DimensionLayer();
    }
    if(!_attr.l_dimensions.isInserted()) {
      this.addLayer(_attr.l_dimensions);
    }
    if(activeLayer) {
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

    if(!_attr.l_connective) {
      _attr.l_connective = new ConnectiveLayer();
    }
    if(!_attr.l_connective.isInserted()) {
      this.addLayer(_attr.l_connective);
    }
    if(activeLayer) {
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

    if(bounds) {

      if(!l_dimensions.bottom) {
        l_dimensions.bottom = new DimensionLine({
          pos: 'bottom',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.bottom.offset = -120;
      }

      if(!l_dimensions.right) {
        l_dimensions.right = new DimensionLine({
          pos: 'right',
          parent: l_dimensions,
          offset: -120
        });
      }
      else {
        l_dimensions.right.offset = -120;
      }


      // если среди размеров, сформированных контурами есть габарит - второй раз не выводим

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'right' && Math.abs(dl.size - bounds.height) < consts.sticking_l))) {
        l_dimensions.right.visible = false;
      }
      else {
        l_dimensions.right.redraw();
      }

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == 'bottom' && Math.abs(dl.size - bounds.width) < consts.sticking_l))) {
        l_dimensions.bottom.visible = false;
      }
      else {
        l_dimensions.bottom.redraw();
      }
    }
    else {
      if(l_dimensions.bottom) {
        l_dimensions.bottom.visible = false;
      }
      if(l_dimensions.right) {
        l_dimensions.right.visible = false;
      }
    }
  }

  /**
   * Перерисовавает визуализацию контуров изделия
   */
  draw_visualization() {
    if(this.view){
      for (let contour of this.contours) {
        contour.draw_visualization();
      }
      this.view.update();
    }
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

    if(!attr.pos) {
      rows = this._dp.sys.inserts(attr.elm_type, true);
      // если доступна текущая, возвращаем её
      if(attr.inset && rows.some((row) => attr.inset == row)) {
        return attr.inset;
      }
      return rows[0];
    }

    rows = this._dp.sys.inserts(attr.elm_type, 'rows');

    // если без вариантов, возвращаем без вариантов
    if(rows.length == 1) {
      return rows[0].nom;
    }

    const pos_array = Array.isArray(attr.pos);

    function check_pos(pos) {
      if(pos_array) {
        return attr.pos.some((v) => v == pos);
      }
      return attr.pos == pos;
    }

    // если подходит текущая, возвращаем текущую
    if(attr.inset && rows.some((row) => attr.inset == row.nom && (check_pos(row.pos) || row.pos == $p.enm.positions.Любое))) {
      return attr.inset;
    }

    let inset;
    // ищем по умолчанию + pos
    rows.some((row) => {
      if(check_pos(row.pos) && row.by_default) {
        return inset = row.nom;
      }
    });
    // ищем по pos без умолчания
    if(!inset) {
      rows.some((row) => {
        if(check_pos(row.pos)) {
          return inset = row.nom;
        }
      });
    }
    // ищем по умолчанию + любое
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое && row.by_default) {
          return inset = row.nom;
        }
      });
    }
    // ищем любое без умолчаний
    if(!inset) {
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое) {
          return inset = row.nom;
        }
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
    const rows = [];

    // получаем список вставок с той же номенклатурой, что и наша
    let finded;
    this._dp.sys.elmnts.forEach((row) => {
      if((elm_type ? row.elm_type == elm_type : true)) {
        if(row.nom === inset) {
          finded = true;
          return false;
        }
        rows.push(row);
      }
    });

    // TODO: отфильтровать по положению attr.pos

    if(finded) {
      return inset;
    }
    if(rows.length) {
      return rows[0].nom;
    }

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
    //const {allow_open_cnn} = this._dp.sys;
    const {acn} = $p.enm.cnn_types;

    let distance, gp, cnns, addls,
      bind_node = typeof check_only == 'string' && check_only.indexOf('node') != -1,
      bind_generatrix = typeof check_only == 'string' ? check_only.indexOf('generatrix') != -1 : check_only,
      node_distance;

    // Проверяет дистанцию в окрестности начала или конца соседнего элемента
    function check_node_distance(node) {

      // allow_open_cnn ? parseFloat(consts.sticking_l) : consts.sticking)
      if((distance = element[node].getDistance(point)) < parseFloat(consts.sticking_l)) {

        if(typeof res.distance == 'number' && res.distance < distance) {
          res.profile = element;
          res.profile_point = node;
          return 1;
        }

        if(profile && !res.cnn) {

          // а есть ли подходящее?
          cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
          if(!cnns.length) {
            if(!element.is_collinear(profile)) {
              cnns = $p.cat.cnns.nom_cnn(profile, element, acn.t);
            }
            if(!cnns.length) {
              return 1;
            }
          }

          // если в точке сходятся 2 профиля текущего контура - ок

          // если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

        }
        else if(res.cnn && acn.a.indexOf(res.cnn.cnn_type) == -1) {
          return 1;
        }

        res.point = bind_node ? element[node] : point;
        res.distance = distance;
        res.profile = element;
        if(cnns && cnns.length && acn.t.indexOf(cnns[0].cnn_type) != -1) {
          res.profile_point = '';
          res.cnn_types = acn.t;
          if(!res.cnn) {
            res.cnn = cnns[0];
          }
        }
        else {
          res.profile_point = node;
          res.cnn_types = acn.a;
        }

        return 2;
      }

    }

    const b = res.profile_point === 'b' ? 'b' : 'e';
    const e = b === 'b' ? 'e' : 'b';

    if(element === profile) {
      if(profile.is_linear()) {
        return;
      }
      else {
        // проверяем другой узел, затем - Т

      }
      return;
    }
    // если мы находимся в окрестности начала соседнего элемента
    else if((node_distance = check_node_distance(b)) || (node_distance = check_node_distance(e))) {
      if(res.cnn_types !== acn.a && res.profile_point){
        res.cnn_types = acn.a;
        res.distance = distance;
      }
      return node_distance == 2 ? false : void(0);
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
    // 		res.cnn_types = acn.t;
    // 	}
    // });
    // if(res.distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){
    // 	return false;
    // }

    // если к доборам не привязались - проверяем профиль
    gp = element.generatrix.getNearestPoint(point);
    distance = gp.getDistance(point);

    if(distance < ((res.is_t || !res.is_l) ? consts.sticking : consts.sticking_l)) {

      if(distance < res.distance || bind_generatrix) {
        if(element.d0 != 0 && element.rays.outer) {
          // для вложенных створок и смещенных рам учтём смещение
          res.point = element.rays.outer.getNearestPoint(point);
          res.distance = 0;
        }
        else {
          res.point = gp;
          res.distance = distance;
        }
        res.profile = element;
        res.cnn_types = acn.t;
      }
      if(bind_generatrix) {
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
    while (true) {
      if(res = $p.job_prm.builder.base_furn[sys.ref]) {
        break;
      }
      if(sys.empty()) {
        break;
      }
      sys = sys.parent;
    }
    if(!res) {
      res = $p.job_prm.builder.base_furn.null;
    }
    if(!res) {
      $p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ''}}, (row) => {
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

      if(p instanceof ProfileItem) {
        if(all || !item.layer.parent || !p.nearest || !p.nearest()) {

          if(res.indexOf(p) != -1) {
            return;
          }

          if(count < 2 || !(p._attr.generatrix.firstSegment.selected ^ p._attr.generatrix.lastSegment.selected)) {
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

      if(item instanceof Filling && res.indexOf(item) == -1) {
        res.push(item);
      }
      else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1) {
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
      if(item instanceof BuilderElement) {
        return res = item;

      }
      else if(item.parent instanceof BuilderElement) {
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
    let dist = Infinity;

    function check_corns(elm) {
      const corn = elm.corns(point);
      if(corn.dist < dist) {
        dist = corn.dist;
        if(corn.dist < consts.sticking) {
          hit = {
            item: elm.generatrix,
            point: corn.point
          };
        }
      }
    }

    // отдаём предпочтение сегментам выделенных путей
    if(selected_first) {
      this.selectedItems.some((item) => hit = item.hitTest(point, {segments: true, tolerance: tolerance || 8}));
      // если нет в выделенных, ищем во всех
      if(!hit) {
        hit = this.hitTest(point, {segments: true, tolerance: tolerance || 6});
      }
    }
    else {
      for (let elm of this.activeLayer.profiles) {
        check_corns(elm);
        for (let addl of elm.addls) {
          check_corns(addl);
        }
      }
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
    if(!layer) {
      layer = this.activeLayer;
    }
    while (layer.parent) {
      layer = layer.parent;
    }
    return layer;
  }

  /**
   * Снимает выделение со всех узлов всех путей
   * В отличии от deselectAll() сами пути могут оставаться выделенными
   * учитываются узлы всех путей, в том числе и не выделенных
   */
  deselect_all_points(with_items) {
    this.getItems({class: paper.Path}).forEach((item) => {
      item.segments.forEach((segm) => {
        if(segm.selected) {
          segm.selected = false;
        }
      });
      if(with_items && item.selected) {
        item.selected = false;
      }
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
    if(contours.length == 1) {
      return contours[0].perimeter;
    }

    // находим самый нижний правый контур

    // бежим по всем контурам, находим примыкания, исключаем их из результата

    return res;
  }

  /**
   * Возвращает массив заполнений изделия
   */
  get glasses() {
    return this.getItems({class: Filling});
  }

}
