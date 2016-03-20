/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  scheme
 */

/**
 * ### Изделие
 * Расширение Paper.Project. Стандартные слои (layers) - это контуры изделия<br />
 * размерные линии, фурнитуру и визуализацию располагаем в отдельных слоях
 * @class Scheme
 * @constructor
 * @extends paper.Project
 * @param _canvas {HTMLCanvasElement} - канвас, в котором будет размещено изделие
 */
function Scheme(_canvas){

	// создаём объект проекта paperjs
	Scheme.superclass.constructor.call(this, _canvas);

	var _scheme = paper.project = this,
		_data = _scheme.data = {
			_bounds: null,
			_calc_order_row: null,
			_update_timer: 0
		},
		_changes = [],
		_dp_observer = function (changes) {
			changes.forEach(function(change){
				if(change.type == "update"){

				}
			});
		};

	/**
	 * За этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
	 */
	this._noti = {};

	/**
	 * Формирует оповещение для тех, кто следит за this._noti
	 * @param obj
	 */
	this.notify = function (obj) {
		Object.getNotifier(_scheme._noti).notify(obj);
	};

	this._dp = $p.dp.buyers_order.create();

	/**
	 * Виртуальная табличная часть
	 */
	this._dp.__define("extra_fields", {
		get: function(){
			return _scheme.ox.params;
		}
	});

	// начинаем следить за _dp, чтобы обработать изменения цвета и параметров
	Object.observe(this._dp, _dp_observer, ["update"]);


	/**
	 * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
	 * @property bounds
	 * @type Rectangle
	 */
	this.__define("bounds", {
		get : function(){

			if(!_data._bounds){
				_scheme.layers.forEach(function(l){
					if(!_data._bounds)
						_data._bounds = l.bounds;
					else
						_data._bounds = _data._bounds.unite(l.bounds);
				});
			}

			return _data._bounds;
		},
		enumerable : false});

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
			}
		});

	};

	/**
	 * ХарактеристикаОбъект текущего изделия
	 * @property ox
	 * @type _cat.characteristics
	 */
	this.__define("ox", {
		get: function () {
			return _scheme._dp.characteristic;
		},
		set: function (v) {

			_scheme._dp.characteristic = v;
			_scheme._dp.clr = _scheme._dp.characteristic.clr;

			// оповещаем о новых слоях
			Object.getNotifier(_scheme._noti).notify({
				type: 'rows',
				tabular: "constructions"
			});

			var setted;
			$p.cat.production_params.find_rows({nom: _scheme._dp.characteristic.owner}, function(o){
				_scheme._dp.sys = o;
				setted = true;
				Object.getNotifier(_scheme._dp).notify({
					type: 'row',
					tabular: "extra_fields"
				});
				return false;
			});
			if(!setted)
				_scheme._dp.sys = "";
		},
		enumerable: false
	});

	/**
	 *
	 */
	this.__define("_calc_order_row", {
		get: function () {
			if(!_calc_order_row && !this.ox.empty()){
				_calc_order_row = this.ox.calc_order_row;
			}
			return _calc_order_row;
		},
		enumerable: false
	});

	/**
	 * Цвет текущего изделия
	 * @property clr
	 * @type _cat.production_params
	 */
	this.__define("clr", {
		get: function () {
			return _scheme._dp.characteristic.clr;
		},
		set: function (v) {
			_scheme._dp.characteristic.clr = v;
		},
		enumerable: false
	});

	/**
	 * Ищет точки в выделенных элементах. Если не находит, то во всём проекте
	 * @param point
	 * @returns {*}
	 */
	this.hitPoints = function (point) {
		var item, items = _scheme.selectedItems, hit;
		for(var i in items){
			item = items[i];
			hit = item.hitTest(point, { segments: true, tolerance: 6 });
			if(hit)
				break;
		}
		if(!hit)
			hit = _scheme.hitTest(point, { segments: true, tolerance: 4 });
		if(hit && hit.item.layer && hit.item.layer.parent){
			item = hit.item;
			// если соединение T - портить hit не надо, иначе - ищем во внешнем контуре
			if(
				(item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
					(item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1))
					|| (item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
					(item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1)))
				return hit;

			items = item.layer.parent.profiles;
			for(var i in items){
				hit = items[i].hitTest(point, { segments: true, tolerance: 6 });
				if(hit)
					break;
			}
			//item.selected = false;
		}
		return hit;
	};

	/**
	 * Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
	 */
	this.zoom_fit = function(){
		var bounds, shift;
		_scheme.layers.forEach(function(l){
			if(!bounds)
				bounds = l.strokeBounds;
			else
				bounds = bounds.unite(l.strokeBounds);
		});
		if(bounds){
			_scheme.view.zoom = Math.min((_scheme.view.viewSize.height - 20) / (bounds.height+320), (_scheme.view.viewSize.width - 20) / (bounds.width+320));
			shift = (_scheme.view.viewSize.width - bounds.width * _scheme.view.zoom) / 2;
			if(shift < 200)
				shift = 0;
			_scheme.view.center = bounds.center.add([shift, 40]);
		}
	};

	/**
	 * Читает изделие по ссылке или объекту продукции
	 * @method load
	 * @param id {String|CatObj} - идентификатор или объект продукции
	 */
	this.load = function(id){

		/**
		 * Рекурсивно создаёт контуры изделия
		 * @param [parent] {Contour}
		 */
		function load_contour(parent){
			// создаём семейство конструкций
			var out_cns = parent ? parent.cnstr : 0;
			_scheme.ox.constructions.find_rows({parent: out_cns}, function(row){

				var contour = new Contour( {parent: parent, row: row});

				// вложенные створки
				load_contour(contour);

			});
		}

		function load_object(o){

			_scheme.ox = o;

			_data._bounds = new paper.Rectangle({
				point: [0, 0],
				size: [o.x, o.y]
			});
			_data._calc_order_row = o = null;

			// создаём семейство конструкций
			_data._loading = true;
			load_contour(null);

			// авторазмерные линии
			// находим крайние контуры
			var left, right, top, bottom;
			_scheme.layers.forEach(function(l){

				if(!left || l.bounds.left < left.bounds.left)
					left = l;

				if(!right || l.bounds.right > right.bounds.right)
					right = l;

				if(!top || l.bounds.top < top.bounds.top)
					top = l;

				if(!bottom || l.bounds.bottom > bottom.bounds.bottom)
					bottom = l;

			});
			// формируем авторазмеры
			if(_scheme.layers.length == 1){
				new DimensionLine({
					pos: "bottom",
					parent: bottom.l_dimensions
				});
				new DimensionLine({
					pos: "right",
					parent: right.l_dimensions
				});
			}else if(_scheme.layers.length == 2){
				if(left != right){
					// подобие балкона
					new DimensionLine({
						pos: "top",
						parent: left.l_dimensions
					});
					new DimensionLine({
						pos: "top",
						parent: right.l_dimensions
					});
					new DimensionLine({
						pos: "left",
						parent: left.l_dimensions
					});
					new DimensionLine({
						pos: "right",
						parent: right.l_dimensions
					});
				}else{
					// один над другим
					new DimensionLine({
						pos: "top",
						parent: top.l_dimensions
					});
					new DimensionLine({
						pos: "left",
						parent: top.l_dimensions
					});
					new DimensionLine({
						pos: "left",
						parent: bottom.l_dimensions
					});
					//new DimensionLine({
					//	pos: "right",
					//	parent: right.l_dimensions
					//});
				}
			}

			setTimeout(function () {
				delete _data._loading;
				_data._bounds = null;
				_scheme.zoom_fit();
			}, 100);

		}

		_scheme.ox = null;
		_scheme.clear();

		if($p.is_data_obj(id))
			load_object(id);

		else if($p.is_guid(id))
			$p.cat.characteristics.get(id, true, true)
				.then(load_object);
	};

	/**
	 * Регистрирует факты изменения элемнтов
	 */
	this.register_change = function () {
		if(!_data._loading){
			_data._bounds = null;
		}
		_changes.push(Date.now());
	};

	/**
	 * информирует о наличии изменений
	 */
	this.has_changes = function () {
		return _changes.length > 0;
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
	 * Снимает выделение со всех узлов всех путей
	 * В отличии от deselectAll() сами пути могут оставаться выделенными
	 * учитываются узлы всех путей, в том числе и не выделенных
	 */
	this.deselect_all_points = function(with_items) {
		this.getItems({class: paper.Path}).forEach(function (item) {
			item.segments.forEach(function (s) {
				if (s.selected)
					s.selected = false;
			});
			if(with_items && item.selected)
				item.selected = false;
		});
	};

	/**
	 * Находит точку на примыкающем профиле и проверяет расстояние до неё от текущей точки
	 * @param element {Profile} - профиль, расстояние до которого проверяем
	 * @param profile {Profile|null} - текущий профиль
	 * @param res {CnnPoint}
	 * @param point {paper.Point}
	 * @param check_only {Boolean|String}
	 * @returns {boolean}
	 */
	this.check_distance = function(element, profile, res, point, check_only){

		var distance, gp, cnns,
			bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
			bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only;

		if(element === profile){


		}else if((distance = element.b.getDistance(point)) < consts.sticking){

			if(!res.cnn){

				// а есть ли подходящее?
				if(!element.is_collinear(profile)){
					cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
					if(!cnns.length)
						return;
				}

				// если в точке сходятся 2 профиля текущего контура - ок

				// если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

			}else if(acn.a.indexOf(res.cnn.cnn_type) == -1)
				return;

			res.point = bind_node ? element.b : point;
			res.distance = distance;
			res.profile = element;
			res.profile_point = 'b';
			res.cnn_types = acn.a;
			return false;

		}else if((distance = element.e.getDistance(point)) < consts.sticking){

			if(!res.cnn){

				// а есть ли подходящее?
				if(!element.is_collinear(profile)){
					cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
					if(!cnns.length)
						return;
				}

				// если в точке сходятся 2 профиля текущего контура - ок

				// если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

			}else if(acn.a.indexOf(res.cnn.cnn_type) == -1)
				return;

			res.point = bind_node ? element.e : point;
			res.distance = distance;
			res.profile = element;
			res.profile_point = 'e';
			res.cnn_types = acn.a;
			return false;

		}else{
			gp = element.generatrix.getNearestPoint(point);
			if(gp && (distance = gp.getDistance(point)) < consts.sticking){
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
					res.cnn_types = acn.t;
				}
				if(bind_generatrix)
					return false;
			}
		}
	};

	/**
	 * Деструктор
	 */
	this.unload = function () {
		this.clear();
		this.remove();
		Object.unobserve(this._dp, _dp_observer);
		_calc_order_row = null;
	};

	/**
	 * Перерисовывает все контуры изделия. Не занимается биндингом.
	 * Предполагается, что взаимное перемещение профилей уже обработано
	 */
	function redraw () {

		function process_redraw(){

			var llength = 0;

			function on_contour_redrawed(){
				if(!_changes.length){
					llength--;
					if(!llength)
						_scheme.view.update();
				}
			}

			if(_changes.length){
				//console.log(_changes.length);
				_changes.length = 0;

				_scheme.layers.forEach(function(l){
					if(l instanceof Contour){
						llength++;
						l.redraw(on_contour_redrawed);
					}
				});

			}
		}

		// искусственная задержка. зачем?
		//setTimeout(function() {
		//	requestAnimationFrame(redraw);
		//	process_redraw();
		//}, 20);

		requestAnimationFrame(redraw);
		process_redraw();

	}

	redraw();
}
Scheme._extend(paper.Project);

Scheme.prototype.__define({

	/**
	 * Двигает выделенные точки путей либо все точки выделенных элементов
	 * @method move_points
	 * @for Scheme
	 */
	move_points: {
		value: function (delta, all_points) {

			var selected = this.selectedItems;
			for (var i = 0; i < selected.length; i++) {
				var path = selected[i];
				if(path.parent instanceof Profile){
					if(!path.layer.parent || !path.parent.nearest())
						path.parent.move_points(delta, all_points);

				}else if(path instanceof Filling){
					//path.position = path.position.add(delta);
					while (path.children.length > 1)
						path.children[1].remove();
				}
			}
		}
	},

	/**
	 * Сохраняет координаты и пути элементов в табличных частях характеристики
	 * @method save_coordinates
	 * @for Scheme
	 */
	save_coordinates: {
		value: function (attr) {

			var ox = this.ox;
			ox.cnn_elmnts.clear();
			ox.glasses.clear();
			ox.x = this.bounds.width.round(1);
			ox.y = this.bounds.height.round(1);
			ox.s = this.area;

			// смещаем слои, чтобы расположить изделие в начале координат
			//var bpoint = this.bounds.point;
			//if(bpoint.length > consts.sticking0){
			//	this.getItems({class: Contour}).forEach(function (contour) {
			//		contour.position = contour.position.subtract(bpoint);
			//	});
			//	this.data._bounds = null;
			//};

			this.layers.forEach(function (contour) {
				contour.save_coordinates();
			});
			$p.eve.callEvent("save_coordinates", [this, attr]);
		}
	},

	/**
	 * Перезаполняет изделие данными типового блока
	 * @method load_stamp
	 * @for Scheme
	 * @param id {String|CatObj} - идентификатор или объект - основание (типовой блок или характеристика продукции)
	 */
	load_stamp: {
		value: function(id){

			var _scheme = this._scheme || this;

			function do_load(base_block){

				var ox = _scheme.ox;

				// если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
				_scheme.clear();

				// переприсваиваем систему через номенклатуру характеристики
				base_block.production.load().then(function(obx){

					if(!obx.owner.empty())
						ox.owner = obx.owner;

					// очищаем табчасти, перезаполняем контуры и координаты
					ox.specification.clear();
					ox.glasses.clear();
					ox.glass_specification.clear();
					ox.mosquito.clear();

					ox.constructions.load(base_block.constructions);
					ox.coordinates.load(base_block.coordinates);
					ox.params.load(base_block.params);
					ox.cnn_elmnts.load(base_block.cnn_elmnts);

					_scheme.load(ox);

				});

			}

			if($p.is_data_obj(id))
				do_load(id);

			else if($p.is_guid(id))
				$p.cat.base_blocks.get(id, true, true)
					.then(do_load);

		}
	},

	/**
	 * Вписывает канвас в указанные размеры
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
	 * Возвращает массив контуров текущего изделия
	 */
	contours: {
		get: function () {
			return this.getItems({class: Contour});
		},
		enumerable: false
	},

	/**
	 * Площадь изделия. TODO: переделать с учетом пустот, наклонов и криволинейностей
	 */
	area: {
		get: function () {
			return (this.bounds.width * this.bounds.height / 1000000).round(3);
		},
		enumerable: false
	},

	default_inset: {
		value: function (attr) {
			return this._dp.sys.inserts(attr.elm_type)[0];
		},
		enumerable: false
	},

	default_clr: {
		value: function (attr) {
			return this.ox.clr;
		},
		enumerable: false
	}


});