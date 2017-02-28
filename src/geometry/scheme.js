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
function Scheme(_canvas){

	// создаём объект проекта paperjs
	Scheme.superclass.constructor.call(this, _canvas);

	const _scheme = paper.project = this,
		_data = _scheme.data = {
			_bounds: null,
			_calc_order_row: null,
			_update_timer: 0
		},
		_changes = [],

		// наблюдатель за изменениями свойств изделия
		_dp_observer = function (changes) {

			if(_data._loading || _data._snapshot)
				return;

			const scheme_changed_names = ["clr","sys"];
      const row_changed_names = ["quantity","discount_percent","discount_percent_internal"];
			let evented

			changes.forEach(function(change){

				if(scheme_changed_names.indexOf(change.name) != -1){

					if(change.name == "clr"){
						_scheme.ox.clr = change.object.clr;
						_scheme.getItems({class: ProfileItem}).forEach(function (p) {
							if(!(p instanceof Onlay))
								p.clr = change.object.clr;
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
						_scheme.contours.forEach(function (l) {
							l.on_sys_changed();
						});


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

				}else if(row_changed_names.indexOf(change.name) != -1){

					_data._calc_order_row[change.name] = change.object[change.name];

					_scheme.register_change(true);

				}

			});
		},

		// наблюдатель за изменениями параметров створки
		_papam_observer = function (changes) {

			if(_data._loading || _data._snapshot)
				return;

			changes.some(function(change){
				if(change.tabular == "params"){
					_scheme.register_change();
					return true;
				}
			});
		};



	// Определяем свойства и методы изделия
	this.__define({

		/**
		 * За этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
		 */
		_noti: {
			value: {}
		},

		/**
		 * Формирует оповещение для тех, кто следит за this._noti
		 * @param obj
		 */
		notify: {
			value: 	function (obj) {
				Object.getNotifier(this._noti).notify(obj);
			}
		},

		/**
		 * Объект обработки с табличными частями
		 */
		_dp: {
			value: $p.dp.buyers_order.create()
		},

		/**
		 * ХарактеристикаОбъект текущего изделия
		 * @property ox
		 * @type _cat.characteristics
		 */
		ox: {
			get: function () {
				return this._dp.characteristic;
			},
			set: function (v) {

			  const {_dp} = this;
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
        _data._calc_order_row = ox.calc_order_row;

				// устанавливаем в _dp свойства строки заказа
				if(_data._calc_order_row){
					"quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note".split(",").forEach(function (fld) {
						_dp[fld] = _data._calc_order_row[fld];
					});
				}else{
					// TODO: установить режим только просмотр, если не найдена строка заказа
				}


				// устанавливаем в _dp систему профилей
				if(ox.empty())
					_dp.sys = "";

				else if(ox.owner.empty()){

					// для пустой номенклатуры, ставим предыдущую выбранную систему
					_dp.sys = $p.wsql.get_user_param("editor_last_sys");
					setted = !_dp.sys.empty();

				}else if(_dp.sys.empty()){

					// ищем первую подходящую систему
					$p.cat.production_params.find_rows({is_folder: false}, function(o){

						if(setted)
							return false;

						o.production.find_rows({nom: ox.owner}, function () {
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
				Object.getNotifier(_scheme._noti).notify({
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
		},

		/**
		 * Строка табчасти продукция текущего заказа, соответствующая редактируемому изделию
		 */
		_calc_order_row: {
			get: function () {
				if(!_data._calc_order_row && !this.ox.empty()){
					_data._calc_order_row = this.ox.calc_order_row;
				}
				return _data._calc_order_row;
			}
		},

		/**
		 * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
		 * @property bounds
		 * @type Rectangle
		 */
		bounds: {
			get : function(){

				if(!_data._bounds){
					_scheme.contours.forEach(function(l){
						if(!_data._bounds)
							_data._bounds = l.bounds;
						else
							_data._bounds = _data._bounds.unite(l.bounds);
					});
				}

				return _data._bounds;
			}
		},

		/**
		 * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
		 */
		dimension_bounds: {

			get: function(){
				var bounds = this.bounds;
				this.getItems({class: DimensionLine}).forEach(function (dl) {

					if(dl instanceof DimensionLineCustom || dl.data.impost || dl.data.contour)
						bounds = bounds.unite(dl.bounds);

				});
				return bounds;
			}
		}
	});


	/**
	 * Виртуальная табличная часть параметров изделия
	 */
	this._dp.__define({

		extra_fields: {
				get: function(){
					return _scheme.ox.params;
				}
			}
	});

	// начинаем следить за _dp, чтобы обработать изменения цвета и параметров
	Object.observe(this._dp, _dp_observer, ["update"]);


	/**
	 * Менеджер соединений изделия
	 * Хранит информацию о соединениях элементов и предоставляет методы для поиска-манипуляции
	 * @property connections
	 * @type Connections
	 */
	this.connections = new function Connections() {

		this.__define({

			cnns: {
				get : function(){
					return _scheme.ox.cnn_elmnts;
				}
			},

      elm_cnn: {
			  value: function (elm1, elm2) {
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
      }

		});

	};

	/**
	 * информирует о наличии изменений
	 */
	this.has_changes = function () {
		return _changes.length > 0;
	};

	/**
	 * Регистрирует факты изменения элемнтов
	 */
	this.register_change = function (with_update) {
		if(!_data._loading){
			_data._bounds = null;
			this.ox._data._modified = true;
			$p.eve.callEvent("scheme_changed", [this]);
		}
		_changes.push(Date.now());

		if(with_update)
			this.register_update();
	};

	/**
	 * Регистрирует необходимость обновить изображение
 	 */
	this.register_update = function () {

		if(_data._update_timer)
			clearTimeout(_data._update_timer);

		_data._update_timer = setTimeout(function () {
			_scheme.view.update();
			_data._update_timer = 0;
		}, 100);
	};

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
   * @for Scheme
   * @param id {String|CatObj} - идентификатор или объект продукции
   * @async
   */
  this.load = function(id){

    /**
     * Рекурсивно создаёт контуры изделия
     * @param [parent] {Contour}
     */
    function load_contour(parent) {
      // создаём семейство конструкций
      var out_cns = parent ? parent.cnstr : 0;
      _scheme.ox.constructions.find_rows({parent: out_cns}, function(row){

        var contour = new Contour( {parent: parent, row: row});

        // вложенные створки
        load_contour(contour);

      });
    }

    /**
     * Загружает размерные линии
     * Этот код нельзя выполнить внутри load_contour, т.к. линия может ссылаться на элементы разных контуров
     */
    function load_dimension_lines() {

      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, function(row){

        new DimensionLineCustom( {
          parent: _scheme.getItem({cnstr: row.cnstr}).l_dimensions,
          row: row
        });

      });
    }

    function load_object(o){

      _scheme.ox = o;

      // включаем перерисовку
      _data._opened = true;
      requestAnimationFrame(redraw);

      _data._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });
      o = null;

      // создаём семейство конструкций
      load_contour(null);

      setTimeout(function () {

        _data._bounds = null;

        // згружаем пользовательские размерные линии
        load_dimension_lines();

        _data._bounds = null;
        _scheme.zoom_fit();

        // виртуальное событие, чтобы UndoRedo сделал начальный снапшот
        $p.eve.callEvent("scheme_changed", [_scheme]);

        // регистрируем изменение, чтобы отрисовались размерные линии
        _scheme.register_change(true);

        // виртуальное событие, чтобы активировать слой в дереве слоёв
        if(_scheme.contours.length){
          $p.eve.callEvent("layer_activated", [_scheme.contours[0], true]);
        }

        delete _data._loading;
        delete _data._snapshot;

        // виртуальное событие, чтобы нарисовать визуализацию или открыть шаблоны
        setTimeout(function () {
          if(_scheme.ox.coordinates.count()){
            if(_scheme.ox.specification.count()){
              $p.eve.callEvent("coordinates_calculated", [_scheme, {onload: true}]);
            }else{
              // если нет спецификации при заполненных координатах, скорее всего, прочитали типовой блок - запускаем пересчет
              _scheme.register_change(true);
            }
          }else{
            paper.load_stamp();
          }
        }, 100);


      }, 20);

    }

    _data._loading = true;
    if(id != _scheme.ox){
      _scheme.ox = null;
    }
    _scheme.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new())
      load_object(id);

    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)){
      $p.cat.characteristics.get(id, true, true)
        .then(function (ox) {
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(function () {
              load_object(ox);
            })
        });
    }
  };

	/**
	 * Деструктор
	 */
	this.unload = function () {
		_data._loading = true;
		this.clear();
		this.remove();
		Object.unobserve(this._dp, _dp_observer);
		Object.unobserve(this._dp.characteristic, _papam_observer);
		this.data._calc_order_row = null;
	};

	/**
	 * Перерисовывает все контуры изделия. Не занимается биндингом.
	 * Предполагается, что взаимное перемещение профилей уже обработано
	 */
	function redraw () {

		function process_redraw(){

			var llength = 0;

			// вызывается после перерисовки очередного контура
			function on_contour_redrawed(){
				if(!_changes.length){
					llength--;

					if(!llength){

						// если перерисованы все контуры, перерисовываем их размерные линии
						_data._bounds = null;
						_scheme.contours.forEach((l) => {
							l.draw_sizes();
						});

						// перерисовываем габаритные размерные линии изделия
						_scheme.draw_sizes();

            // перерисовываем соединительные профили
            _scheme.l_connective.redraw();

						// обновляем изображение на эуране
						_scheme.view.update();

					}
				}
			}

			// if(_data._saving || _data._loading)
			// 	return;

			if(_changes.length){
				//console.log(_changes.length);
				_changes.length = 0;

				if(_scheme.contours.length){
					_scheme.contours.forEach((l) => {
						llength++;
						l.redraw(on_contour_redrawed);
					});
				}else{
					_scheme.draw_sizes();
				}
			}
		}

		if(_data._opened){
      requestAnimationFrame(redraw);
    }

		process_redraw();

	}

	// следим за событием _coordinates_calculated_ и обновляем визуализацию
	$p.eve.attachEvent("coordinates_calculated", (scheme, attr) => {
		if(_scheme != scheme){
      return;
    }
		_scheme.contours.forEach((l) => {
			l.draw_visualization();
		});
		_scheme.view.update();
	});

}
Scheme._extend(paper.Project);

Scheme.prototype.__define({

	/**
	 * Двигает выделенные точки путей либо все точки выделенных элементов
	 * @method move_points
	 * @for Scheme
	 * @param delta {paper.Point}
	 * @param [all_points] {Boolean}
	 */
	move_points: {
		value: function (delta, all_points) {

      const other = [];
			const layers = [];
      const profiles = [];

			this.selectedItems.forEach((item) => {

				if(item instanceof paper.Path && item.parent instanceof ProfileItem){

				  if(profiles.indexOf(item.parent) != -1){
				    return;
          }

          profiles.push(item.parent);

				  if(item.parent._hatching){
            item.parent._hatching.remove();
            item.parent._hatching = null;
          }

          if(item.layer instanceof ConnectiveLayer){
            // двигаем и накапливаем связанные
            other.push.apply(other, item.parent.move_points(delta, all_points));
          }
          else if(!item.layer.parent || !item.parent.nearest || !item.parent.nearest()){

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
            other.push.apply(other, item.parent.move_points(delta, all_points));
						//other = other.concat(item.parent.move_points(delta, all_points));

						if(layers.indexOf(item.layer) == -1){
							layers.push(item.layer);
							item.layer.clear_dimentions();
						}

					}

				}
				else if(item instanceof Filling){
					//item.position = item.position.add(delta);
					while (item.children.length > 1){
						if(!(item.children[1] instanceof Onlay)){
              item.children[1].remove();
            }
					}
				}
			});
			// TODO: возможно, здесь надо подвигать примыкающие контуры
		}
	},

	/**
	 * Сохраняет координаты и пути элементов в табличных частях характеристики
	 * @method save_coordinates
	 * @for Scheme
	 */
	save_coordinates: {
		value: function (attr) {

			if(!this.bounds)
				return;

			var ox = this.ox;

			// переводим характеристику в тихий режим, чтобы она не создавала лишнего шума при изменениях
			ox._silent();

			this.data._saving = true;

			// устанавливаем размеры в характеристике
			ox.x = this.bounds.width.round(1);
			ox.y = this.bounds.height.round(1);
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
			//	this.data._bounds = null;
			//};

			// вызываем метод save_coordinates в дочерних слоях
			this.contours.forEach((contour) => contour.save_coordinates());

      // вызываем метод save_coordinates в слое соединителей
      this.l_connective.save_coordinates();

			$p.eve.callEvent("save_coordinates", [this, attr]);

		}
	},

	/**
	 * ### Габариты эскиза со всеми видимыми дополнениями
	 * В свойстве `strokeBounds` учтены все видимые дополнения - размерные линии, визуализация и т.д.
	 *
	 * @property strokeBounds
	 * @for Scheme
	 */
	strokeBounds: {

		get: function () {

			var bounds = new paper.Rectangle();
			this.contours.forEach(function(l){
				bounds = bounds.unite(l.strokeBounds);
			});

			return bounds;
		}
	},

	/**
	 * ### Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
	 * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
	 *
	 * @method zoom_fit
	 * @for Scheme
	 */
	zoom_fit: {
		value: function (bounds) {

			if(!bounds)
				bounds = this.strokeBounds;

			var height = (bounds.height < 1000 ? 1000 : bounds.height) + 320,
				width = (bounds.width < 1000 ? 1000 : bounds.width) + 320,
				shift;

			if(bounds){
				this.view.zoom = Math.min((this.view.viewSize.height - 20) / height, (this.view.viewSize.width - 20) / width);
				shift = (this.view.viewSize.width - bounds.width * this.view.zoom) / 2;
				if(shift < 200)
					shift = 0;
				this.view.center = bounds.center.add([shift, 40]);
			}
		}
	},

	/**
	 * ### Bозвращает строку svg эскиза изделия
	 * Вызывается при записи изделия. Полученный эскиз сохраняется во вложении к характеристике
	 *
	 * @method get_svg
	 * @for Scheme
	 * @param [attr] {Object} - указывает видимость слоёв и элементов, используется для формирования эскиза части изделия
	 */
	get_svg: {

		value: function (attr) {

      this.deselectAll();

			const svg = this.exportSVG({excludeData: true});
			const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

			svg.setAttribute("x", bounds.x);
			svg.setAttribute("y", bounds.y);
			svg.setAttribute("width", bounds.width);
			svg.setAttribute("height", bounds.height);
			svg.querySelector("g").removeAttribute("transform");
      //svg.querySelector("g").setAttribute("transform", "scale(1)");

			return svg.outerHTML;
		}
	},

	/**
	 * ### Перезаполняет изделие данными типового блока или снапшота
	 * Вызывается, обычно, из формы выбора типового блока, но может быть вызван явно в скриптах тестирования или групповых обработках
	 *
	 * @method load_stamp
	 * @for Scheme
	 * @param obx {String|CatObj|Object} - идентификатор или объект-основание (характеристика продукции либо снапшот)
	 * @param is_snapshot {Boolean}
	 */
	load_stamp: {
		value: function(obx, is_snapshot){

			function do_load(obx){

				var ox = this.ox;

				// сохраняем ссылку на типовой блок
				if(!is_snapshot)
					this._dp.base_block = obx;

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

			this.data._loading = true;

			if(is_snapshot){
				this.data._snapshot = true;
				do_load.call(this, obx);

			}else
				$p.cat.characteristics.get(obx, true, true)
					.then(do_load.bind(this));

		}
	},

	/**
	 * ### Вписывает канвас в указанные размеры
	 * Используется при создании проекта и при изменении размеров области редактирования
	 *
	 * @method resize_canvas
	 * @for Scheme
	 * @param w {Number} - ширина, в которую будет вписан канвас
	 * @param h {Number} - высота, в которую будет вписан канвас
	 */
	resize_canvas: {
		value: function(w, h){
			this.view.viewSize.width = w;
			this.view.viewSize.height = h;
		}
	},

	/**
	 * Возвращает массив РАМНЫХ контуров текущего изделия
	 * @property contours
	 * @for Scheme
	 * @type Array
	 */
	contours: {
		get: function () {
			return this.layers.filter((l) => l instanceof Contour);
		}
	},

	/**
	 * ### Площадь изделия
	 * TODO: переделать с учетом пустот, наклонов и криволинейностей
	 *
	 * @property area
	 * @for Scheme
	 * @type Number
	 * @final
	 */
	area: {
		get: function () {
			return (this.bounds.width * this.bounds.height / 1000000).round(3);
		}
	},

	/**
	 * ### Цвет текущего изделия
	 *
	 * @property clr
	 * @for Scheme
	 * @type _cat.clrs
	 */
	clr: {
		get: function () {
			return this._dp.characteristic.clr;
		},
		set: function (v) {
			this._dp.characteristic.clr = v;
		}
	},

	/**
	 * ### Служебный слой размерных линий
	 *
	 * @property l_dimensions
	 * @for Scheme
	 * @type DimensionLayer
	 * @final
	 */
	l_dimensions: {
		get: function () {

      const {activeLayer, data} = this;

      if(!data.l_dimensions){
				data.l_dimensions = new DimensionLayer();
      }
      if(!data.l_dimensions.isInserted()){
        this.addLayer(data.l_dimensions);
      }
      if(activeLayer){
        this._activeLayer = activeLayer;
      }

			return data.l_dimensions;
		}
	},

  /**
   * ### Служебный слой соединительных профилей
   *
   * @property l_connective
   * @for Scheme
   * @type ConnectiveLayer
   * @final
   */
  l_connective: {
    get: function () {

      const {activeLayer, data} = this;

      if(!data.l_connective){
        data.l_connective = new ConnectiveLayer();
      }
      if(!data.l_connective.isInserted()){
        this.addLayer(data.l_connective);
      }
      if(activeLayer){
        this._activeLayer = activeLayer;
      }

      return data.l_connective;
    }
  },

	/**
	 * ### Создаёт и перерисовавает габаритные линии изделия
	 * Отвечает только за габариты изделия.<br />
	 * Авторазмерные линии контуров и пользовательские размерные линии, контуры рисуют самостоятельно
	 *
	 * @method draw_sizes
	 * @for Scheme
	 */
	draw_sizes: {
		value: function () {

			var bounds = this.bounds;

			if(bounds){

				if(!this.l_dimensions.bottom)
					this.l_dimensions.bottom = new DimensionLine({
						pos: "bottom",
						parent: this.l_dimensions,
						offset: -120
					});
				else
					this.l_dimensions.bottom.offset = -120;

				if(!this.l_dimensions.right)
					this.l_dimensions.right = new DimensionLine({
						pos: "right",
						parent: this.l_dimensions,
						offset: -120
					});
				else
					this.l_dimensions.right.offset = -120;



				// если среди размеров, сформированных контурами есть габарит - второй раз не выводим

				if(this.contours.some(function(l){
						return l.l_dimensions.children.some(function (dl) {
							if(dl.pos == "right" && Math.abs(dl.size - bounds.height) < consts.sticking_l ){
								return true;
							}
						});
					})){
					this.l_dimensions.right.visible = false;
				}else
					this.l_dimensions.right.redraw();


				if(this.contours.some(function(l){
						return l.l_dimensions.children.some(function (dl) {
							if(dl.pos == "bottom" && Math.abs(dl.size - bounds.width) < consts.sticking_l ){
								return true;
							}
						});
					})){
					this.l_dimensions.bottom.visible = false;
				}else
					this.l_dimensions.bottom.redraw();

			}else{
				if(this.l_dimensions.bottom)
					this.l_dimensions.bottom.visible = false;
				if(this.l_dimensions.right)
					this.l_dimensions.right.visible = false;
			}
		}
	},

	/**
	 * ### Вставка по умолчанию
	 * Возвращает вставку по умолчанию с учетом свойств системы и положения элемента
	 *
	 * @method default_inset
	 * @for Scheme
	 * @param [attr] {Object}
	 * @param [attr.pos] {_enm.positions} - положение элемента
	 * @param [attr.elm_type] {_enm.elm_types} - тип элемента
	 * @returns {Array.<ProfileItem>}
	 */
	default_inset: {
		value: function (attr) {

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
	},

	/**
	 * ### Контроль вставки
	 * Проверяет, годится ли текущая вставка для данного типа элемента и положения
	 */
	check_inset: {
		value: function (attr) {

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
	},

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
  check_distance: {
	  value: function(element, profile, res, point, check_only){

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

          if(profile && (!res.cnn || $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)){

            // а есть ли подходящее?
            cnns = $p.cat.cnns.nom_cnn(element, profile, $p.enm.cnn_types.acn.a);
            if(!cnns.length)
              return 1;

            // если в точке сходятся 2 профиля текущего контура - ок

            // если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

          }else if(res.cnn && $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)
            return 1;

          res.point = bind_node ? element[node] : point;
          res.distance = distance;
          res.profile = element;
          res.profile_point = node;
          res.cnn_types = $p.enm.cnn_types.acn.a;

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

      }else if(node_distance = check_node_distance("b")){
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
            // для вложенных створок учтём смещение
            res.point = element.rays.outer.getNearestPoint(point);
            res.distance = 0;
          }else{
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
  },

	/**
	 * ### Цвет по умолчанию
	 * Возвращает цвет по умолчанию с учетом свойств системы и элемента
	 *
	 * @property default_clr
	 * @for Scheme
	 * @final
	 */
	default_clr: {
		value: function (attr) {
			return this.ox.clr;
		}
	},

	/**
	 * ### Фурнитура по умолчанию
	 * Возвращает фурнитуру текущего изделия по умолчанию с учетом свойств системы и контура
	 *
	 * @property default_furn
	 * @for Scheme
	 * @final
	 */
	default_furn: {
		get: function () {
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
				$p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ""}}, function (row) {
					res = row;
					return false;
				});
			}
			return res;
		}
	},

	/**
	 * ### Выделенные профили
	 * Возвращает массив выделенных профилей. Выделенным считаем профиль, у которого выделены `b` и `e` или выделен сам профиль при невыделенных узлах
	 *
	 * @method selected_profiles
	 * @param [all] {Boolean} - если true, возвращает все выделенные профили. Иначе, только те, которе можно двигать
	 * @returns {Array.<ProfileItem>}
	 */
	selected_profiles: {
		value: function (all) {

			const res = [];
			const count = this.selectedItems.length;

			this.selectedItems.forEach((item) => {

        const p = item.parent;

				if(p instanceof ProfileItem){
					if(all || !item.layer.parent || !p.nearest || !p.nearest()){

						if(res.indexOf(p) != -1){
              return;
            }

						if(count < 2 || !(p.data.generatrix.firstSegment.selected ^ p.data.generatrix.lastSegment.selected)){
              res.push(p);
            }

					}
				}
			});

			return res;
		}
	},

  /**
   * ### Выделенные заполнения
   *
   * @method selected_glasses
   * @returns {Array.<Filling>}
   */
  selected_glasses: {
    value: function () {

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
  },

  /**
   * ### Выделенный элемент
   * Возвращает первый из найденных выделенных элементов
   *
   * @property selected_elm
   * @for Scheme
   * @returns {BuilderElement}
   */
  selected_elm: {
    get: function () {

      var res;

      this.selectedItems.some(function (item) {

        if(item instanceof BuilderElement){
          return res = item;

        }else if(item.parent instanceof BuilderElement){
          return res = item.parent;
        }
      });

      return res;
    }
  },

  /**
   * Ищет точки в выделенных элементах. Если не находит, то во всём проекте
   * @param point {paper.Point}
   * @returns {*}
   */
  hitPoints: {
    value: function (point, tolerance) {

      var item, hit;

      // отдаём предпочтение сегментам выделенных путей
      this.selectedItems.some(function (item) {
        hit = item.hitTest(point, { segments: true, tolerance: tolerance || 8 });
        if(hit)
          return true;
      });

      // если нет в выделенных, ищем во всех
      if(!hit)
        hit = this.hitTest(point, { segments: true, tolerance: tolerance || 6 });

      if(!tolerance && hit && hit.item.layer && hit.item.layer.parent){
        item = hit.item;
        // если соединение T - портить hit не надо, иначе - ищем во внешнем контуре
        if(
          (item.parent.b && item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
          (item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1))
          || (item.parent.e && item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
          (item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1)))
          return hit;

        item.layer.parent.profiles.some(function (item) {
          hit = item.hitTest(point, { segments: true, tolerance: tolerance || 6 });
          if(hit)
            return true;
        });
        //item.selected = false;
      }
      return hit;
    }
  },

  /**
   * Корневой слой для текущего слоя
   */
  rootLayer: {
    value: function (layer) {

      if(!layer){
        layer = this.activeLayer
      }

      while (layer.parent){
        layer = layer.parent
      }

      return layer
    }
  },

  /**
   * Снимает выделение со всех узлов всех путей
   * В отличии от deselectAll() сами пути могут оставаться выделенными
   * учитываются узлы всех путей, в том числе и не выделенных
   */
  deselect_all_points: {
    value: function(with_items) {
      this.getItems({class: paper.Path}).forEach(function (item) {
        item.segments.forEach(function (s) {
          if (s.selected)
            s.selected = false;
        });
        if(with_items && item.selected)
          item.selected = false;
      });
    }
  },

  /**
   * Массив с рёбрами периметра
   */
  perimeter: {
    get: function () {

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


});
