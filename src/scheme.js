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
		_bounds,
		_changes = [],
		update_timer = false;

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

	this._dp._define("extra_fields", {
		get: function(){
			return _scheme.ox.params;
		}
	});


	/**
	 * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
	 * @property bounds
	 * @type Rectangle
	 */
	this._define("bounds", {
		get : function(){

			if(!_bounds)
				_bounds = new paper.Rectangle({
					point: [0, 0],
					size: [this.ox.x, this.ox.y],
					insert: false
				});
			return _bounds;
		},
		enumerable : false,
		configurable : false});

	/**
	 * Менеджер соединений изделия
	 * Хранит информацию о соединениях элементов и предоставляет методы для поиска-манипуляции
	 * @property connections
	 * @type Connections
	 */
	this.connections = new function Connections() {

		this._define("cnns", {
			get : function(){
				return _scheme.ox.cnn_elmnts;
			},
			enumerable : false,
			configurable : false
		});

	};

	/**
	 * ХарактеристикаОбъект текущего изделия
	 * @property ox
	 * @type _cat.characteristics
	 */
	this._define("ox", {
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
	 * СистемаОбъект текущего изделия
	 * @property sys
	 * @type _cat.production_params
	 */
	this._define("sys", {
		get: function () {
			return _scheme._dp.sys;
		},
		set: function (v) {

			if(_scheme._dp.sys == v)
				return;

			_scheme._dp.sys = v;

			//TODO: установить номенклатуру и (???) цвет по умолчанию в продукции

		},
		enumerable: false
	});

	/**
	 * Цвет текущего изделия
	 * @property clr
	 * @type _cat.production_params
	 */
	this._define("clr", {
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
		if(hit && hit.item.layer.parent){
			item = hit.item;
			// если соединение T - портить hit не надо, иначе - ищем во внешнем контуре
			if(
				(item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
					(item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.b.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1))
					|| (item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
					(item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.ТОбразное) != -1 || item.parent.rays.e.cnn_types.indexOf($p.enm.cnn_types.НезамкнутыйКонтур) != -1)))
				return hit;

			items = item.layer.parent.profiles();
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
				bounds = l.bounds;
			else
				bounds = bounds.unite(l.bounds);
		});
		if(bounds){
			_scheme.view.zoom = Math.min(_scheme.view.viewSize.height / (bounds.height+200), _scheme.view.viewSize.width / (bounds.width+200));
			shift = (_scheme.view.viewSize.width - bounds.width * _scheme.view.zoom) / 2;
			if(shift < 200)
				shift = 0;
			_scheme.view.center = bounds.center.add([shift, 0]);
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

				// вложенные створки пока отключаем
				load_contour(contour);

			});
		}

		function load_object(o){

			_scheme.ox = o;
			o = null;

			// создаём семейство конструкций
			load_contour(null);

			setTimeout(_scheme.zoom_fit, 100);

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
		_changes.push(Date.now());
	};

	/**
	 * Регистрирует необходимость обновить изображение
 	 */
	this.register_update = function () {
		if(!update_timer){
			update_timer = true;
			setTimeout(function () {
				_scheme.view.update();
				update_timer = false;
			}, 50);
		}
	};

	/**
	 * Снимает выделение со всех узлов всех путей
	 * В отличии от deselectAll() сами пути могут оставаться выделенными
	 * учитываются узлы всех путей, в том числе и не выделенных
	 */
	this.deselect_all_points = function() {
		this.layers.forEach(function (l) {
			if (l instanceof Contour) {
				var selected = l.getItems({class: paper.Path});
				for (var i = 0; i < selected.length; i++) {
					var item = selected[i];
					item.segments.forEach(function (s) {
						if (s.selected)
							s.selected = false;
					});
				}
			}
		});
	};

	/**
	 * Находи точку на примыкающем профиле и проверяет расстояние до неё от текущей точки
	 * @param element {Profile} - профиль, расстояние до которого проверяем
	 * @param profile {Profile|null} - текущий профиль
	 * @param res {CnnPoint}
	 * @param point {paper.Point}
	 * @param check_only {boolean}
	 * @returns {boolean}
	 */
	this.check_distance = function(element, profile, res, point, check_only){

		var distance, gp,
			bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
			bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only;

		if(element === profile){


		}else if((distance = element.b.getDistance(point)) < consts.sticking){
			res.point = bind_node ? element.b : point;
			res.distance = distance;
			res.profile = element;
			res.profile_point = 'b';
			res.cnn_types = acn.a;
			return false;

		}else if((distance = element.e.getDistance(point)) < consts.sticking){
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
	};

	/**
	 * Перерисовывает все контуры изделия. Не занимается биндингом.
	 * Предполагается, что взаимное перемещение профилей уже обработано
	 */
	function redraw () {

		function process_redraw(){
			if(_changes.length){
				console.log(_changes.length);
				_changes.length = 0;
				_scheme.layers.forEach(function(l){
					if(l instanceof Contour){
						l.redraw();
					}
				});
				_scheme.view.update();
			}
		}

		setTimeout(function() {
			requestAnimationFrame(redraw);
			process_redraw();
		}, 50);

		//requestAnimationFrame(redraw);
		//setTimeout(process_redraw, 20);

		//process_redraw();

	}


	redraw();
}
Scheme._extend(paper.Project);

Scheme.prototype._define({

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
					if(!path.layer.parent || (path.parent._row.elm_type == $p.enm.elm_types.Импост))
						path.parent.move_points(delta, all_points);
				}else
					path.position = path.position.add(delta);
			}
		}
	},

	/**
	 * Сохраняет координаты и пути элементов в табличных частях характеристики
	 * @method save_coordinates
	 * @for Scheme
	 */
	save_coordinates: {
		value: function () {
			this.getItems({class: Contour, parent: undefined}).forEach(function (contour) {
					contour.save_coordinates();
				}
			);
		}
	},

	/**
	 * Рассчитывает спецификацию изделия
	 * @method calculate_spec
	 * @for Scheme
	 */
	calculate_spec: {
		value: function () {

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
				if(!base_block.production.owner.empty())
					ox.owner = base_block.production.owner;
				else if(!base_block.sys.nom.empty())
					ox.owner = base_block.sys.nom;

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
				setTimeout(_scheme.zoom_fit, 100);

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
	}
});