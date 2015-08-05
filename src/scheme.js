/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
 * @module  scheme
 */

/**
 * Изделие - расширение Paper.Project
 * стандартные слои (layers) это контуры изделия
 * размерные линии, фурнитуру и визуализацию располагаем в отдельных слоях
 * @class Scheme
 * @constructor
 * @extends paper.Project
 * @param eid {String} - id элемента, в котором будет размещео изделие
 * @param [pwnd] {dhtmlXWindowsCell|dhtmlXLayoutCell} - id элемента, в котором будет размещео изделие
 */
function Scheme(eid, pwnd){

	this.toString = function(){ return $p.msg.bld_constructor; };

	this._pwnd = pwnd;
	this._wrapper = document.getElementById(eid);
	this._canvas = document.createElement('canvas');
	this._wrapper.appendChild(this._canvas);

	this._dxw = new dhtmlXWindows();
	this._dxw.setSkin(dhtmlx.skin);
	this._dxw.attachViewportTo(eid);

	Scheme.superclass.constructor.call(this, this._canvas);
	if(!paper.project)
		paper.project = this;


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

	var _scheme = this,
		_view = this.view,
		_bounds, _ox, _osys,
		_changes = [];

	/**
	 * Если передали указаткель на родителя, подписываемся на события изменения размеров
	 */
	if(pwnd instanceof  dhtmlXWindowsCell){

		function pwnd_resize_finish(){
			var dimension = pwnd.getDimension();
			resize_canvas(dimension[0], dimension[1]);
		}

		pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

		pwnd_resize_finish();

	}else if(pwnd instanceof  dhtmlXLayoutCell){

		pwnd.layout.attachEvent("onResizeFinish", function(){
			resize_canvas(pwnd.getWidth(), pwnd.getHeight());
		});

		pwnd.layout.attachEvent("onPanelResizeFinish", function(names){
			resize_canvas(pwnd.getWidth(), pwnd.getHeight());
		});

		resize_canvas(pwnd.getWidth(), pwnd.getHeight());
	}

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
		set : function(newValue){

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
			return _ox;
		},
		set: function (v) {
			_ox = v;
		},
		enumerable: false
	});

	/**
	 * СистемаОбъект текущего изделия
	 * @property osys
	 * @type _cat.production_params
	 */
	this._define("osys", {
		get: function () {
			return _osys;
		},
		set: function (v) {

			if(_osys == v)
				return;

			if(!$p.is_data_obj(v))
				v = $p.cat.production_params.get(v, false, true);

			Object.getNotifier(this).notify({
				type: 'update',
				name: 'osys',
				oldValue: _osys
			});

			_osys = v;

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
			return _ox ? _ox.clr : $p.cat.clrs.predefined("white");
		},
		set: function (v) {
			_ox.clr = v;
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
			items = hit.item.layer.parent.profiles();
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
		var bounds;
		_scheme.layers.forEach(function(l){
			if(!bounds)
				bounds = l.bounds;
			else
				bounds = bounds.unite(l.bounds);
		});
		if(bounds){
			_view.zoom = Math.min(_view.viewSize.height / (bounds.height + 200), _view.viewSize.width / (bounds.width + 200));
			_view.center = bounds.center.add([300, 0]);
		}
	};

	/**
	 * Читает изделие по ссылке или объекту продукции
	 * @method load
	 * @param id {String|CatObj} - идентификатор или объект продукции
	 */
	this.load = function(id){

		acn = $p.enm.cnn_types.acn;

		/**
		 * Рекурсивно создаёт контуры изделия
		 * @param [parent] {Contour}
		 */
		function load_contour(parent){
			// создаём семейство конструкций
			var out_cns = parent ? parent.cns_no : 0;
			_scheme.ox.constructions.find_rows({out_cns: out_cns}, function(row){

				var contour = new Contour( {parent: parent, row: row});

				// вложенные створки пока отключаем
				load_contour(contour);

			});
		}

		function load_object(o){

			_scheme.ox = o;
			o = null;

			$p.cat.production_params.find_rows({nom: _scheme.ox.owner}, function(o){
				_scheme.osys = o;
				o = null;

				_scheme.dg_layers.cb_sys.setComboValue(_scheme.osys.ref);
				_scheme.dg_layers.cb_clr.setComboValue(_scheme.ox.clr.ref);

				return false;
			});

			// создаём семейство конструкций
			load_contour(null);

			_scheme.zoom_fit();

			_scheme.dg_layers.attache();
		}

		_scheme.clear();

		if($p.is_data_obj(id))
			load_object(id);
		else if($p.is_guid(id))
			$p.cat.characteristics.get(id, true, true)
				.then(load_object);
	};

	/**
	 * Перезаполняет изделие данными типового блока
	 * @param id {String|CatObj} - идентификатор или объект - основание (типовой блок или характеристика продукции)
	 */
	this.load_stamp = function(id){

		function do_load(bb){

			// если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
			_scheme.clear();

			// переприсваиваем систему через номенклатуру характеристики
			_scheme.ox.owner = bb.production.owner;

			// очищаем табчасти, перезаполняем контуры и координаты
			_scheme.ox.specification.clear();
			_scheme.ox.glasses.clear();
			_scheme.ox.glass_specification.clear();
			_scheme.ox.mosquito.clear();

			_scheme.ox.constructions.load(bb.constructions);
			_scheme.ox.coordinates.load(bb.coordinates);
			_scheme.ox.params.load(bb.params);
			_scheme.ox.cnn_elmnts.load(bb.cnn_elmnts);
			_scheme.ox.visualization.load(bb.visualization);

			_scheme.load(_scheme.ox);
			setTimeout(_scheme.zoom_fit, 100);

		}

		if($p.is_data_obj(id))
			do_load(id);
		else if($p.is_guid(id))
			$p.cat.base_blocks.get(id, true, true)
				.then(do_load);

	};

	/**
	 * Регистрирует факты изменения элемнтов
	 */
	this.register_change = function () {
		_changes.push(Date.now());
	};

	/**
	 * Выделяет начало или конец профиля
	 * @param profile
	 * @param node
	 */
	this.select_node = function(profile, node){
		this.deselect_all_points();
		profile.data.path.selected = false;
		if(node == "b")
			profile.generatrix.firstSegment.selected = true;
		else
			profile.generatrix.lastSegment.selected = true;
		profile.view.update();
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
					res.point = gp;
					res.distance = distance;
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
		this.editor.unload();
		this._dxw.unload();
		this.clear();
		this.remove();
	};

	function resize_canvas(w, h){
		_view.viewSize.width = (w > 1200 ? 1200 : w);
		_view.viewSize.height = (h - 80);
	}

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
				_view.update();
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

	/**
	 * Редактор чертежа изделия - набор инструментов
	 * @property editor
	 * @type {Editor}
	 */
	this.editor = new Editor(this);
	this.editor.tools.select_node.activate();

	redraw();
}
Scheme._extend(paper.Project);