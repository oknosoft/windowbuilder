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
		_notifier.notify(obj);
	};

	var _scheme = this,
		_view = this.view,
		_bounds,
		_notifier = Object.getNotifier(this._noti),
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

	function resize_canvas(w, h){
		_view.viewSize.width = (w > 1200 ? 1200 : w);
		_view.viewSize.height = (h - 80);
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
	 * Хранит информацию о соединениях элементов и предоставляет методв для поиска-манипуляции
	 * @property connections
	 * @type Connections
	 */
	this.connections = new function Connections() {
		var _cache = [];

	};

	/**
	 * Редактор чертежа изделия - набор инструментов
	 * @property editor
	 * @type {Editor}
	 */
	(this.editor = new Editor(this)).tools.select_node.activate();

	/**
	 * ХарактеристикаОбъект текущего изделия
	 * @property ox
	 * @type _cat.characteristics
	 */
	this.ox = null;

	/**
	 * СистемаОбъект текущего изделия
	 * @property osys
	 * @type _cat.production_params
	 */
	this.osys = null;

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
		_view.zoom = Math.min(_view.viewSize.height / (bounds.height + 200), _view.viewSize.width / (bounds.width + 200));
		_view.center = bounds.center.add([300, 0]);
	};

	/**
	 * Читает изделие по ссылке или объекту продукции
	 * @method load
	 * @param id {Guid|CatObj}
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

		this.clear();

		if(id && $p.is_guid(id.ref))
			load_object(id);

		else{

			/**
			 для целей отледки, заполняем __ox__ простыми данными
			 */
			$p.cat.characteristics._cachable = true;
			$p.cat.characteristics.get( "8756eecf-f577-402c-86ce-74608d062a32", load_object);

		}
	};

	/**
	 * Регистрирует факты изменения элемнтов
	 */
	this.register_change = function () {
		_changes.push(Date.now());
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
				_view.update();
			}
		}

		setTimeout(function() {
			requestAnimationFrame(redraw);
			process_redraw();
		}, 40);

		//requestAnimationFrame(redraw);
		//setTimeout(process_redraw, 20);

	}
	redraw();

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
}
Scheme._extend(paper.Project);