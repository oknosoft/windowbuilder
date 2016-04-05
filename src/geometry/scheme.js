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

			if(_data._loading || _data._snapshot)
				return;

			var evented, scheme_changed_names = ["clr","sys"];

			changes.forEach(function(change){

				if(scheme_changed_names.indexOf(change.name) != -1){

					if(change.name == "clr"){
						_scheme.ox.clr = change.object.clr;
					}

					if(change.name == "sys" && !change.object.sys.empty()){
						_scheme.ox.owner = change.object.sys.nom;

						if(change.object.sys != $p.wsql.get_user_param("editor_last_sys"))
							$p.wsql.set_user_param("editor_last_sys", change.object.sys.ref);

						if(_scheme.ox.clr.empty()){
							_scheme._dp.clr = change.object.sys.default_clr;
							_scheme.ox.clr = change.object.sys.default_clr;
						}
					}

					if(!evented){
						// информируем мир об изменениях
						$p.eve.callEvent("scheme_changed", [_scheme]);
						evented = true;
					}

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

			// устанавливаем в _dp характеристику
			var _dp = _scheme._dp;
			_dp.characteristic = v;

			var ox = _dp.characteristic,
				setted;

			_dp.clr = ox.clr;
			_dp.len = ox.x;
			_dp.height = ox.y;
			_dp.s = ox.s;

			// устанавливаем строку заказа
			_scheme.data._calc_order_row = ox.calc_order_row;

			// устанавливаем в _dp свойства строки заказа
			if(_scheme.data._calc_order_row){
				"quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note".split(",").forEach(function (fld) {
					_dp[fld] = _scheme.data._calc_order_row[fld];
				});
			}else{
				// TODO: установить режим только просмотр, если не найдена строка заказа
			}


			// устанавливаем в _dp систему профилей
			if(ox.empty())
				_dp.sys = "";

			else if(ox.owner.empty()){

				_dp.sys = $p.wsql.get_user_param("editor_last_sys");
				ox.owner = _dp.sys.nom;
				setted = !_dp.sys.empty();

			}else{

				$p.cat.production_params.find_rows({nom: ox.owner}, function(o){
					_dp.sys = o;
					setted = true;
					return false;
				});
			}

			// пересчитываем параметры изделия при установке системы TODO: подумать, как не портить старые изделия, открытые для просмотра
			if(setted){
				_dp.sys.refill_prm(ox);

			}else if(!_dp.sys.empty())
				_dp.sys = "";

			// устанавливаем в _dp цвет по умолчанию
			if(_dp.clr.empty())
				_dp.clr = _dp.sys.default_clr;

			// оповещаем о новых слоях и свойствах изделия
			Object.getNotifier(_scheme._noti).notify({
				type: 'rows',
				tabular: 'constructions'
			});
			Object.getNotifier(_dp).notify({
				type: 'rows',
				tabular: 'extra_fields'
			});
			
			
		},
		enumerable: false
	});

	/**
	 *
	 */
	this.__define("_calc_order_row", {
		get: function () {
			if(!_data._calc_order_row && !this.ox.empty()){
				_data._calc_order_row = this.ox.calc_order_row;
			}
			return _data._calc_order_row;
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
		var item, hit;

		_scheme.selectedItems.some(function (item) {
			hit = item.hitTest(point, { segments: true, tolerance: 6 });
			if(hit)
				return true;
		});

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

			item.layer.parent.profiles.some(function (item) {
				hit = item.hitTest(point, { segments: true, tolerance: 6 });
				if(hit)
					return true;
			});
			//item.selected = false;
		}
		return hit;
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
			o = null;

			// создаём семейство конструкций
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
				_data._bounds = null;
				_scheme.zoom_fit();
				$p.eve.callEvent("scheme_changed", [_scheme]);
				delete _data._loading;
				delete _data._snapshot;
			}, 100);

		}

		_data._loading = true;
		if(id != _scheme.ox)
			_scheme.ox = null;
		_scheme.clear();

		if($p.is_data_obj(id) && id.calc_order && !id.calc_order.is_new())
			load_object(id);

		else if($p.is_guid(id) || $p.is_data_obj(id)){
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
	 * Регистрирует факты изменения элемнтов
	 */
	this.register_change = function () {
		if(!_data._loading){
			_data._bounds = null;
			this.ox._data._modified = true;
			$p.eve.callEvent("scheme_changed", [this]);
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
	 * !! Изменяет res - CnnPoint
	 * @param element {Profile} - профиль, расстояние до которого проверяем
	 * @param profile {Profile|null} - текущий профиль - используется, чтобы не искать соединения с самим собой 
	 * TODO: возможно, имеет смысл разрешить змее кусать себя за хвост
	 * @param res {CnnPoint} - описание соединения на конце текущего профиля
	 * @param point {paper.Point} - точка, окрестность которой анализируем
	 * @param check_only {Boolean|String} - указывает, выполнять только проверку или привязывать точку к узлам или профилю или к узлам и профилю
	 * @returns {boolean}
	 */
	this.check_distance = function(element, profile, res, point, check_only){

		var distance, gp, cnns,
			bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
			bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only;

		if(element === profile){


		}else if((distance = element.b.getDistance(point)) < (res.is_l ? consts.sticking_l : consts.sticking)){
			// Если мы находимся в окрестности начала соседнего элемента

			if(profile && (!res.cnn || acn.a.indexOf(res.cnn.cnn_type) == -1)){

				// а есть ли подходящее?
				cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
				if(!cnns.length)
					return;

				// если в точке сходятся 2 профиля текущего контура - ок

				// если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

			}else if(res.cnn && acn.a.indexOf(res.cnn.cnn_type) == -1)
				return;

			res.point = bind_node ? element.b : point;
			res.distance = distance;
			res.profile = element;
			res.profile_point = 'b';
			res.cnn_types = acn.a;
			return false;

		}else if((distance = element.e.getDistance(point)) < (res.is_l ? consts.sticking_l : consts.sticking)){

			// Если мы находимся в окрестности конца соседнего элемента
			if(profile && (!res.cnn || acn.a.indexOf(res.cnn.cnn_type) == -1)){

				// а есть ли подходящее?
				cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
				if(!cnns.length)
					return;

				// если в точке сходятся 2 профиля текущего контура - ок

				// если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

			}else if(res.cnn && acn.a.indexOf(res.cnn.cnn_type) == -1)
				return;

			res.point = bind_node ? element.e : point;
			res.distance = distance;
			res.profile = element;
			res.profile_point = 'e';
			res.cnn_types = acn.a;
			return false;

		}else{
			
			// это соединение с пустотой или T
			gp = element.generatrix.getNearestPoint(point);
			if(gp && (distance = gp.getDistance(point)) < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){
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
		this.data._calc_order_row = null;
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
			this.selectedItems.forEach(function (item) {
				if(item.parent instanceof Profile){
					if(!item.layer.parent || !item.parent.nearest())
						item.parent.move_points(delta, all_points);

				}else if(item instanceof Filling){
					//item.position = item.position.add(delta);
					while (item.children.length > 1)
						item.children[1].remove();
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

			// устанавливаем размеры в характеристике
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
	 * Габариты эскиза со всеми видимыми дополнениями - размерные линии, визуализация и т.д.
	 */
	strokeBounds: {

		get: function () {

			var bounds = new paper.Rectangle();
			this.layers.forEach(function(l){
				bounds = bounds.unite(l.strokeBounds);
			});

			return bounds;
		}
	},

	/**
	 * Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
	 */
	zoom_fit: {
		value: function () {

			var bounds = this.strokeBounds,
				height = (bounds.height < 1000 ? 1000 : bounds.height) + 320,
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
	 * возвращает строку svg эскиза изделия
	 * @method get_svg
	 * @for Scheme
	 * @param [attr] {Object} - указывает видимость слоёв
	 */
	get_svg: {

		value: function (attr) {

			var svg = this.exportSVG({excludeData: true}),
				bounds = this.strokeBounds;

			svg.setAttribute("x", bounds.x);
			svg.setAttribute("y", bounds.y);
			svg.setAttribute("width", bounds.width);
			svg.setAttribute("height", bounds.height);
			//svg.querySelector("g").setAttribute("transform", "scale(1)");
			svg.querySelector("g").removeAttribute("transform");

			return svg.outerHTML;
		}
	},

	/**
	 * Перезаполняет изделие данными типового блока или снапшота
	 * @method load_stamp
	 * @for Scheme
	 * @param obx {String|CatObj|Object} - идентификатор или объект-основание (характеристика продукции либо снапшот)
	 * @param is_snapshot {Boolean}
	 */
	load_stamp: {
		value: function(obx, is_snapshot){

			function do_load(obx){

				var ox = this.ox;

				// если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
				this.clear();

				// переприсваиваем номенклатуру, цвет и размеры
				ox._mixin(obx, ["owner","clr","x","y","s","s"]);
					
				// очищаем табчасти, перезаполняем контуры и координаты
				ox.constructions.load(obx.constructions);
				ox.coordinates.load(obx.coordinates);
				ox.params.load(obx.params);
				ox.cnn_elmnts.load(obx.cnn_elmnts);

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
			return this._dp.sys.inserts(attr.elm_type, attr.by_default)[0];
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