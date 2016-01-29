;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Windowbuilder = factory();
  }
}(this, function() {
/**
 * Расширения объектов paper.js
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  paper_ex
 */

/**
 * Расширение класса Path
 */
paper.Path.prototype.__define({

	/**
	 * Вычисляет направленный угол в точке пути
	 * @param point
	 * @return {number}
	 */
	getDirectedAngle: {
		value: function (point) {
			var np = this.getNearestPoint(point),
				offset = this.getOffsetOf(np);
			return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
		},
		enumerable: false
	},

	/**
	 * Выясняет, является ли путь прямым
	 * @return {Boolean}
	 */
	is_linear: {
		value: function () {
			// если в пути единственная кривая и она прямая - путь прямой
			if(this.curves.length == 1 && this.firstCurve.isLinear())
				return true;
			// если в пути есть искривления, путь кривой
			else if(this.hasHandles())
				return false;
			else{
				// если у всех кривых пути одинаковые направленные углы - путь прямой
				var curves = this.curves,
					da = curves[0].point1.getDirectedAngle(curves[0].point2), dc;
				for(var i = 1; i < curves.lenght; i++){
					dc = curves[i].point1.getDirectedAngle(curves[i].point2);
					if(Math.abs(dc - da) > 0.01)
						return false;
				}
			}
			return true;
		},
		enumerable: false
	},

	/**
	 * возвращает фрагмент пути между точками
	 * @param point1 {paper.Point}
	 * @param point2 {paper.Point}
	 * @return {paper.Path}
	 */
	get_subpath: {
		value: function (point1, point2) {
			var path = this.clone(), tmp,
				loc1 = path.getLocationOf(point1),
				loc2 = path.getLocationOf(point2);
			if(!loc1)
				loc1 = path.getNearestLocation(point1);
			if(!loc2)
				loc2 = path.getNearestLocation(point2);
			if(loc1.offset > loc2.offset){
				tmp = path.split(loc1.index, loc1.parameter);
				if(tmp)
					tmp.remove();
				loc2 = path.getLocationOf(point2);
				if(!loc2)
					loc2 = path.getNearestLocation(point2);
				tmp = path.split(loc2.index, loc2.parameter);
				if(path)
					path.remove();
				if(tmp)
					tmp.reverse();
			}else{
				tmp = path.split(loc2.index, loc2.parameter);
				if(tmp)
					tmp.remove();
				loc1 = path.getLocationOf(point1);
				if(!loc1)
					loc1 = path.getNearestLocation(point1);
				if(loc1.index || loc1.parameter){
					tmp = path.split(loc1.index, loc1.parameter);
					if(path)
						path.remove();
				}else
					tmp = path;
			}
			return tmp;
		},
		enumerable: false
	},

	/**
	 * возвращает путь, равноотстоящий от текущего пути
	 * @param delta {number}
	 * @return {paper.Path}
	 */
	equidistant: {
		value: function (delta) {
			var res = new paper.Path({insert: false});
			// если исходный путь прямой, эквидистанту строим по начальной и конечной точкам
			if(this.is_linear()){
				this.outer.add(point_b.add(normal_b.multiply(d1)));
				this.inner.add(point_b.add(normal_b.multiply(d2)));
				this.outer.add(point_e.add(normal_b.multiply(d1)));
				this.inner.add(point_e.add(normal_b.multiply(d2)));
			}else{

			}
			return res;
		},
		enumerable: false
	},

	elongation: {
		value: function (delta1, delta2) {

		},
		enumerable: false
	}

});


paper.Point.prototype.__define({

	/**
	 * Выясняет, расположена ли точка в окрестности точки
	 * @param point {paper.Point}
	 * @param [sticking] {Boolean}
	 * @returns {Boolean}
	 */
	is_nearest: {
		value: function (point, sticking) {
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 10);
		},
		enumerable: false
	}

});

/**
 * Расширение класса Tool
 */
paper.Tool.prototype.__define({

	/**
	 * Отключает и выгружает из памяти окно свойств инструмента
	 * @param tool
	 */
	detache_wnd: {
		value: function(){
			if(this.wnd && this.wnd.wnd_options){
				this.wnd.wnd_options(this.options.wnd);
				$p.wsql.save_options("editor", this.options);
				this.wnd.close();
			}
			this.wnd = null;
			this.profile = null;
		},
		enumerable: false
	},

	/**
	 * Подключает окно редактор свойств текущего элемента, выбранного инструментом
	 */
	attache_wnd: {
		value: function(profile, _editor){

			this.profile = profile;

			if(!this.wnd || !this._grid){
				$p.wsql.restore_options("editor", this.options);
				this.wnd = $p.iface.dat_blank(_editor._dxw, this.options.wnd);
				this.wnd.buttons = this.wnd.bottom_toolbar({
					wrapper: this.wnd.cell, width: '100%', height: '28px', bottom: '0px', left: '0px', name: 'aling_bottom',
					buttons: [
						{name: 'left', img: 'align_left.png', title: $p.msg.align_node_left, float: 'left'},
						{name: 'bottom', img: 'align_bottom.png', title: $p.msg.align_node_bottom, float: 'left'},
						{name: 'top', img: 'align_top.png', title: $p.msg.align_node_top, float: 'left'},
						{name: 'right', img: 'align_right.png', title: $p.msg.align_node_right, float: 'left'},
						{name: 'delete', img: 'trash.gif', title: 'Удалить элемент', clear: 'right', float: 'right'}
					],
					image_path: "dist/imgs/",
					onclick: function (name) {
						return _editor.profile_align(name);
					}
				});

				this._grid = this.wnd.attachHeadFields({
					obj: profile,
					oxml: {
						" ": ["inset", "clr"],
						"Начало": ["x1", "y1"],
						"Конец": ["x2", "y2"]

					}
				});
				this._grid.attachEvent("onRowSelect", function(id,ind){
					if(id == "x1" || id == "y1")
						profile.select_node("b");
					else if(id == "x2" || id == "y2")
						profile.select_node("e");
				});
			}else{
				this._grid.attach({obj: profile})
			}
		},
		enumerable: false
	}

});





/**
 * настройки отладчика рисовалки paperjs
 */

"use strict";

/**
 * Алиасы глобальных свойств
 */
var acn,

/**
 * Константы и параметры
 */
	consts = new function Settings(){

	/**
	 * Прилипание. На этом расстоянии узел пытается прилепиться к другому узлу или элементу
	 * @property sticking
	 * @type {number}
	 */
	this.sticking = 90;
	this.sticking2 = this.sticking * this.sticking;
	this.font_size = 60;

	this.lgray = new paper.Color(0.96, 0.98, 0.94, 0.96);

	// минимальная длина сегмента заполнения
	this.filling_min_length = 4;

	this.tune_paper = function (settings) {
		/**
		 * Размер визуализации узла пути
		 * @property handleSize
		 * @type {number}
		 */
		settings.handleSize = 8;
	};



	this.move_points = 'move_points';
	this.move_handle = 'move_handle';

};
/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  element
 */


/**
 * Базовый класс элементов построителя. его свойства и методы присущи всем элементам построителя,
 * но не характерны для классов Path и Group фреймворка paper.js
 * @class BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента
 *  @param attr.b {paper.Point} - координата узла начала элемента - не путать с координатами вершин пути элемента
 *  @param attr.e {paper.Point} - координата узла конца элемента - не путать с координатами вершин пути элемента
 *  @param attr.contour {Contour} - контур, которому принадлежит элемент
 *  @param attr.type_el {_enm.elm_types}  может измениться при конструировании. например, импост -> рама
 *  @param [attr.inset] {_cat.inserts} -  вставка элемента. если не указано, будет вычислена по типу элемента
 *  @param [attr.path] (r && arc_ccw && more_180)
 * @constructor
 * @extends paper.Group
 * @uses BuilderElementProperties
 * @uses NomenclatureProperties
 */
function BuilderElement(attr){

	var _row;

	BuilderElement.superclass.constructor.call(this);

	if(attr.row)
		_row = attr.row;
	else
		_row = attr.row = this.project.ox.coordinates.add();

	this.__define({
		_row: {
			get: function () {
				return _row;
			},
			enumerable: false
		}
	});

	if(attr.proto){

		this.inset = attr.proto.inset;
		this.clr = attr.proto.clr;

		if(attr.parent)
			this.parent = attr.parent;
		else if(attr.proto.parent)
			this.parent = attr.proto.parent;

		if(attr.proto instanceof Profile)
			this.insertBelow(attr.proto);

	}else if(attr.parent)
		this.parent = attr.parent;

	if(!_row.cnstr)
		_row.cnstr = this.parent.cnstr;

	if(!_row.elm)
		_row.elm = this.id;

	if(_row.elm_type.empty() && !this.inset.empty())
		_row.elm_type = this.inset.nom.elm_type;

	this.project.register_change();

	/**
	 * Удаляет элемент из контура и иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
	 * @method remove
	 */
	this.remove = function () {
		if(this.project.ox === _row._owner._owner)
			_row._owner.del(_row);
		_row = null;
		BuilderElement.superclass.remove.call(this);
		this.project.register_change();
	};

}

// BuilderElement наследует свойства класса Group
BuilderElement._extend(paper.Group);

// Привязываем свойства номенклатуры, вставки и цвета
BuilderElement.prototype.__define({

	// виртуальные метаданные для автоформ
	_metadata: {
		get : function(){
			var t = this,
				_xfields = t.project.ox._metadata.tabular_sections.coordinates.fields, //_dgfields = this.project._dp._metadata.fields
				inset = _xfields.inset._clone();
			inset.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o, f){
						if($p.is_data_obj(o)){
							var ok = false;
							t.project.sys.elmnts.find_rows({elm_type: t.nom.elm_type, nom: o}, function (row) {
								ok = true;
								return false;
							});
							return ok;
						}else{
							var refs = "";
							t.project.sys.elmnts.find_rows({elm_type: t.nom.elm_type}, function (row) {
								if(refs)
									refs += ", ";
								refs += "'" + row.nom.ref + "'";
							});
							return "_t_.ref in (" + refs + ")";
						}
				}]}
			];

			return {
				fields: {
					inset: inset,
					clr: _xfields.clr,
					x1: _xfields.x1,
					x2: _xfields.x2,
					y1: _xfields.y1,
					y2: _xfields.y2
				}
			};
		},
		enumerable : false
	},

	// виртуальный датаменеджер для автоформ
	_manager: {
		get: function () {
			return this.project._dp._manager;
		},
		enumerable : false
	},

	// номенклатура - свойство только для чтения, т.к. вычисляется во вставке
	nom:{
		get : function(){
			return this.inset.nom;
		},
		enumerable : false
	},

	// вставка
	inset: {
		get : function(){
			return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
		},
		set : function(v){
			this._row.inset = v;
		},
		enumerable : false
	},

	// цвет элемента
	clr: {
		get : function(){
			return this._row.clr;
		},
		set : function(v){
			this._row.clr = v;
		},
		enumerable : false
	},

	// ширина
	width: {
		get : function(){
			return this.nom.width || 80;
		},
		enumerable : false
	},

	// толщина (для заполнений и, возможно, профилей в 3D)
	thickness: {
		get : function(){
			return this.nom.thickness || 0;
		},
		enumerable : false
	},

	// опорный размер (0 для рам и створок, 1/2 ширины для импостов)
	sizeb: {
		get : function(){
			return this.nom.sizeb || 0;
		},
		enumerable : false
	},

	// размер до фурнитурного паза
	sizefurn: {
		get : function(){
			return this.nom.sizefurn || 20;
		},
		enumerable : false
	}

});

// Привязываем свойства геометрии
BuilderElement.prototype.__define({

	/**
	 * ### Элемент - владелец
	 * имеет смысл для раскладок и рёбер заполнения
	 * @property owner
	 * @type BuilderElement
	 */
	owner: {
		get : function(){ return this.data.owner; },
		set : function(newValue){ this.data.owner = newValue; },
		enumerable : false
	},

	/**
	 * ### Образующая
	 * прочитать - установить путь образующей. здесь может быть линия, простая дуга или безье
	 * по ней будут пересчитаны pathData и прочие свойства
	 * @property generatrix
	 * @type paper.Path
	 */
	generatrix: {
		get : function(){ return this.data.generatrix; },
		set : function(attr){

			this.data.generatrix.removeSegments();

			if(this.hasOwnProperty('rays'))
				this.rays.clear();

			if(Array.isArray(attr))
				this.data.generatrix.addSegments(attr);

			else if(attr.proto &&  attr.p1 &&  attr.p2){

				// сначала, выясняем направление пути
				var tpath = attr.proto;
				if(tpath.getDirectedAngle(attr.ipoint) < 0)
					tpath.reverse();

				// далее, уточняем порядок p1, p2
				var d1 = tpath.getOffsetOf(attr.p1),
					d2 = tpath.getOffsetOf(attr.p2), d3;
				if(d1 > d2){
					d3 = d2;
					d2 = d1;
					d1 = d3;
				}
				if(d1 > 0){
					tpath = tpath.split(d1);
					d2 = tpath.getOffsetOf(attr.p2);
				}
				if(d2 < tpath.length)
					tpath.split(d2);

				this.data.generatrix.remove();
				this.data.generatrix = tpath;
				this.data.generatrix.parent = this;

				if(this.parent.parent)
					this.data.generatrix.guide = true;
			}
		},
		enumerable : true
	},

	/**
	 * путь элемента - состоит из кривых, соединяющих вершины элемента
	 * для профиля, вершин всегда 4, для заполнений может быть <> 4
	 * @property path
	 * @type paper.Path
	 */
	path: {
		get : function(){ return this.data.path; },
		set : function(attr){
			if(attr instanceof paper.Path){
				this.data.path.removeSegments();
				this.data.path.addSegments(attr.segments);
				if(!this.data.path.closed)
					this.data.path.closePath(true);
			}
		},
		enumerable : true
	}

});


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

	this._dp.__define("extra_fields", {
		get: function(){
			return _scheme.ox.params;
		}
	});


	/**
	 * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
	 * @property bounds
	 * @type Rectangle
	 */
	this.__define("bounds", {
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
	 * СистемаОбъект текущего изделия
	 * @property sys
	 * @type _cat.production_params
	 */
	this.__define("sys", {
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

			this.ox.cnn_elmnts.clear();
			this.ox.glasses.clear();

			this.getItems({class: Contour, parent: undefined}).forEach(function (contour) {
					contour.save_coordinates();
				}
			);
			$p.eve.callEvent("save_coordinates", [this._dp]);
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
/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  contour
 */

/**
 * Контур изделия - расширение Paper.Layer
 * новые элементы попадают в активный слой-контур и не могут его покинуть
 * @class Contour
 * @constructor
 * @extends paper.Layer
 */
function Contour(attr){

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
		_contour.project.register_change();
	};

	var _contour = this,
		_parent = attr.parent,
		_row,
		_glasses = [],
		_notifier = Object.getNotifier(this._noti),
		_layers = {};

	Contour.superclass.constructor.call(this);
	if(_parent)
		this.parent = _parent;

	// строка в таблице конструкций
	if(attr.row)
		_row = attr.row;
	else
		_row = _contour.project.ox.constructions.add();

	this.__define('cnstr', {
		get : function(){
			return _row.cnstr;
		},
		set : function(v){
			_row.cnstr = v;
		},
		enumerable : false
	});

	this.__define('glassno', {
		get : function(){
			return _row.glassno;
		},
		set : function(v){
			_row.glassno = v;
		},
		enumerable : false
	});

	/**
	 * путь контура - при чтении похож на bounds
	 * для вложенных контуров определяет положение, форму и количество сегментов створок
	 * @property path
	 * @type paper.Path
	 */
	this.__define('path', {
		get : function(){
			return this.bounds;
		},
		set : function(attr){
			if(attr instanceof paper.Path){

				var need_bind = attr.data.curve_nodes.length;
				if(need_bind > 6)
					return;

				var outer_nodes = _contour.outer_nodes,
					available_bind = outer_nodes.length,
					elm, curve_nodes;

				// первый проход: по двум узлам
				for(var i in attr.data.curve_nodes){
					curve_nodes = attr.data.curve_nodes[i];
					for(var j in outer_nodes){
						elm = outer_nodes[j];
						if(elm.data.binded)
							continue;
						if(curve_nodes.node1.is_nearest(elm.b, true) && curve_nodes.node2.is_nearest(elm.e, true)){
							elm.data.binded = true;
							curve_nodes.binded = true;
							need_bind--;
							available_bind--;
							if(!curve_nodes.node1.is_nearest(elm.b))
								elm.b = curve_nodes.node1;
							if(!curve_nodes.node2.is_nearest(elm.e))
								elm.e = curve_nodes.node2;
							break;
						}
					}
				}

				// второй проход: по одному узлу
				if(need_bind){
					for(var i in attr.data.curve_nodes){
						curve_nodes = attr.data.curve_nodes[i];
						if(curve_nodes.binded)
							continue;
						for(var j in outer_nodes){
							elm = outer_nodes[j];
							if(elm.data.binded)
								continue;
							if(curve_nodes.node1.is_nearest(elm.b, true) || curve_nodes.node2.is_nearest(elm.e, true)){
								elm.data.binded = true;
								curve_nodes.binded = true;
								need_bind--;
								available_bind--;
								elm.rays.clear(true);
								elm.b = curve_nodes.node1;
								elm.e = curve_nodes.node2;
								break;
							}
						}
					}
				}

				// третий проход - из оставшихся
				if(need_bind && available_bind){
					for(var i in attr.data.curve_nodes){
						curve_nodes = attr.data.curve_nodes[i];
						if(curve_nodes.binded)
							continue;
						for(var j in outer_nodes){
							elm = outer_nodes[j];
							if(elm.data.binded)
								continue;
							elm.data.binded = true;
							curve_nodes.binded = true;
							need_bind--;
							available_bind--;
							// TODO заменить на клонирование образующей
							elm.rays.clear(true);
							elm.b = curve_nodes.node1;
							elm.e = curve_nodes.node2;
							break;
						}
					}
				}

				// четвертый проход - добавляем
				if(need_bind && outer_nodes.length){
					for(var i in attr.data.curve_nodes){
						curve_nodes = attr.data.curve_nodes[i];
						if(curve_nodes.binded)
							continue;
						elm = new Profile({generatrix: new paper.Path([curve_nodes.node1, curve_nodes.node2]), proto: outer_nodes[0]});
						elm.data.binded = true;
						elm.data.simulated = true;
						curve_nodes.binded = true;
						need_bind--;
					}
				}

				// удаляем лишнее
				if(available_bind){
					for(var j in outer_nodes){
						elm = outer_nodes[j];
						if(elm.data.binded)
							continue;
						elm.rays.clear(true);
						elm.remove();
						available_bind--;
					}
				}

			}
		},
		enumerable : true
	});

	this.__define({

		// служебная группа текстовых комментариев
		l_text: {
			get: function () {
				if(!_layers.text)
					_layers.text = new paper.Group({
						parent: _contour
					});
				return _layers.text;
			},
			enumerable: false
		},

		// служебная группа визуализации допов
		l_visualization: {
			get: function () {

			},
			enumerable: false
		},

		// служебная группа размерных линий
		l_sizes: {
			get: function () {

			},
			enumerable: false
		},

		// служебная группа петель и ручек
		l_furn: {
			get: function () {

			},
			enumerable: false
		},

		// служебная группа номеров элементов
		l_elm_no: {
			get: function () {

			},
			enumerable: false
		}

	});

	/**
	 * Удаляет контур из иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
	 * @method remove
	 */
	this.remove = function () {
		_contour.children.forEach(function (elm) {
			elm.remove();
		});
		if(_contour.project.ox === _row._owner._owner)
			_row._owner.del(_row);
		_row = null;
		Contour.superclass.remove.call(this);
	};


	/**
	 * Возвращает массив заполнений + створок текущего контура
	 * @param [hide] {Boolean} - если истина, устанавливает для заполнений visible=false
	 * @returns {Array}
	 */
	this.glasses = function (hide) {
		var res = [];
		_contour.children.forEach(function(elm) {
			if (elm instanceof Contour || elm instanceof Filling){
				res.push(elm);
				if(hide)
					elm.visible = false;
			}
		});
		return res;
	};

	/**
	 * Возвращает ребро текущего контура по узлам
	 * @param n1 {paper.Point} - первый узел
	 * @param n2 {paper.Point} - второй узел
	 * @param [point] {paper.Point} - дополнительная проверочная точка
	 * @returns {Profile}
	 */
	this.profile_by_nodes = function (n1, n2, point) {
		var p, g;
		for(var i in this._children){
			p = this._children[i];
			if(p instanceof Profile){
				g = p.generatrix;
				if(g.getNearestPoint(n1).is_nearest(n1) && g.getNearestPoint(n2).is_nearest(n2)){
					if(!point || g.getNearestPoint(point).is_nearest(point))
						return p;
				}
			}
		}
	};

	/**
	 * Перерисовывает элементы контура
	 * @method redraw
	 */
	this.redraw = function(){

		if(!_contour.visible)
			return;

		// сначала перерисовываем все профили контура
		var profiles = [];
		_contour.children.forEach(function(element) {
			if (element instanceof Profile)
				profiles.push(element.redraw());
		});

		// создаём и перерисовываем заполнения
		_contour.find_glasses(profiles);

		// перерисовываем вложенные контуры
		_contour.children.forEach(function(element) {
			if (element instanceof Contour){
				try{
					element.redraw();
				}catch(e){

				}
			}
		});

	};

	/**
	 * Проверяет корректность ранее созданных заполнений + создаёт новые заполнения
	 * для каждой замкнутой области текущего контура
	 * @method find_glasses
	 * @param profiles {Array}
	 * @return {Object}
	 */
	this.find_glasses = function(profiles){

		var nodes = _contour.nodes,
			glasses = _contour.glasses(true);

		if(!profiles.length)
			return profiles;

		/**
		 * Привязывает к пути найденной замкнутой области узлы текущего контура, сохраняя их в data.nodes
		 * @param glass_path {paper.Path}
		 */
		function bind_nodes(glass_path){
			var gnodes = (glass_path.data.nodes = []), finded,
				flap = _glasses[_gl_index], glass_index = 0, ipoint = glass_path.interiorPoint,
				i, j, curve, fp, d, d1, d2, node1, node2, ng;

			// имеем путь и контур.
			for(i in glass_path.curves){
				curve = glass_path.curves[i];
				d1 = 10e12; d2 = 10e12;
				nodes.forEach(function (n) {
					if((d = n.getDistance(curve.point1, true)) < d1){
						d1 = d;
						node1 = n;
					}
					if((d = n.getDistance(curve.point2, true)) < d2){
						d2 = d;
						node2 = n;
					}
				});

				// заполнение может иметь больше курв, чем профиль
				if(node1 == node2)
					continue;
				finded = false;
				for(var n in gnodes){
					if((gnodes[n].node1 == node1 && gnodes[n].node2 == node2) ||
						(gnodes[n].node2 == node1 && gnodes[n].node1 == node2)){
						finded = true;
						break;
					}
				}
				if(!finded)
					gnodes.push({node1: node1, node2: node2});

				continue;

				// имеем узлы внешнего контура - получаем внешнюю палку
				ng = _contour.profile_by_nodes(node1, node2);
				if(ng)
					ng = ng.generatrix.clone(false);
				else
					continue;

				glass_index++;

				// ищем внутреннюю палку. сначала по интексу, потом по узлам
				for(j in flap.children){
					if(!((fp = flap.children[j]) instanceof Profile))
						continue;
					if(fp.glass_index == glass_index)
						break;
				}
				if(!fp || fp.glass_index != glass_index){
					for(j in flap.children){
						if(!((fp = flap.children[j]) instanceof Profile))
							continue;
						if((node1.is_nearest(fp.b) && node2.is_nearest(fp.e)) ||
							(node1.is_nearest(fp.e) && node2.is_nearest(fp.b))){
							fp.glass_index = glass_index;
							break;
						}
					}
				}
				// найден сегмент створки. устанавливаем путь
				fp.generatrix = {proto: ng, p1: node1, p2: node2, ipoint: ipoint};

			}

			//glass.remove();
		}

		/**
		 * Привязывает к пути найденной замкнутой области заполнение или вложенный контур текущего контура
		 * @param glass_path {paper.Path}
		 */
		function bind_glass(glass_path){
			var rating = 0, glass, сrating, сglass, glass_nodes, glass_path_center;

			for(var g in glasses){

				if((glass = glasses[g]).visible){
					continue;
				}

				if(glass instanceof Contour)
					glass_nodes = glass.nodes;
				else
					glass_nodes = _contour.glass_nodes(glass.path, nodes);

				// вычисляем рейтинг
				сrating = 0;
				for(var j in glass_path.data.path_nodes){
					for(var i in glass_nodes){
						if(glass_path.data.path_nodes[j].is_nearest(glass_nodes[i])){
							сrating++;
							break;
						}
					}
					if(сrating > 2)
						break;

				}
				if(сrating > rating || !сglass){
					rating = сrating;
					сglass = glass;
				}
				if(сrating == rating && сglass != glass){
					if(!glass_path_center)
						glass_path_center = glass_path.bounds.center;
					if(glass_path_center.getDistance(glass.bounds.center, true) < glass_path_center.getDistance(сglass.bounds.center, true))
						сglass = glass;
				}
			}
			// TODO реализовать настоящее ранжирование
			if(сglass || (сglass = _contour.getItem({class: Filling, visible: false}))) {
				сglass.path = glass_path;
				сglass.visible = true;
				if (сglass instanceof Filling) {
					сglass.path.sendToBack();
					сglass.path.visible = true;
				}
			}else{
				// добавляем заполнение
				// 1. ищем в изделии любое заполнение
				// 2. если не находим, используем умолчание системы
				if(glass = _contour.getItem({class: Filling})){

				}else if(glass = _contour.project.getItem({class: Filling})){

				}else{

				}
				сglass = new Filling({proto: glass, parent: _contour, path: glass_path});
				сglass.path.sendToBack();
				сglass.path.visible = true;
			}
		}

		var res = [], to_remove = [], profile, path, original_bounds,  _gl_index = 0,
			interior, children;


		// TODO ждём устранения ограничений от авторов paper.js
		//_contour.rotate(0.004);
		profiles.forEach(function (profile) {
			path = profile.path.clone(false);
			if(profile.generatrix.is_linear())
				path.scale(1.004);
			else{
				path.scale(1.004, profile.generatrix.getPointAt(profile.generatrix.length/2));
			}

			if(!original_bounds)
				original_bounds = path;
			else
				original_bounds = original_bounds.unite(path);
		});
		//_contour.rotate(-0.004);

		// TODO вместо середины образующей задействовать точки внутри пути
		if(original_bounds instanceof paper.CompoundPath){
			original_bounds.children.forEach(function(p){
				if(p.length < 240)
					to_remove.push(p);
				else
					for(var i in profiles){
						if(p.contains(profiles[i].interiorPoint())){
							to_remove.push(p);
							break;
						}
					}
			});
			to_remove.forEach(function(p){
				p.remove();
			});

		}else
			return _glasses;

		/**
		 * имеем массив полигонов в original_bounds.children и текущие заполнения
		 * попытаемся привязать заполнения к полигонам
		 */
		for(var g in original_bounds.children){
			var glass_path = original_bounds.children[g];
			_contour.glass_nodes(glass_path, nodes, true);
			bind_glass(glass_path);
		}

	};

	// добавляем элементы контура
	if(this.cnstr){

		// профили
		this.project.ox.coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, function(row){
			new Profile({row: row,	parent: _contour});
		});

		// заполнения
		this.project.ox.coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, function(row){
			new Filling({row: row,	parent: _contour});
		});

		// все остальные элементы
		this.project.ox.coordinates.find_rows({cnstr: this.cnstr}, function(row){

			// раскладки
			if(row.elm_type == $p.enm.elm_types.Раскладка){


			}else if(row.elm_type == $p.enm.elm_types.Текст){
				new FreeText({
					row: row,
					parent: _contour.l_text,
					content: 'The contents of the point text'
				});
			}

		});
	}


}
Contour._extend(paper.Layer);

Contour.prototype.__define({

	/**
	 * Возвращает массив профилей текущего контура
	 * @property profiles
	 * @returns {Array.<Profile>}
	 */
	profiles: {
		get: function(){
			var res = [];
			this.children.forEach(function(elm) {
				if (elm instanceof Profile){
					res.push(elm);
				}
			});
			return res;
		},
		enumerable : false
	},

	/**
	 * Вычисляемые поля в таблицах конструкций и координат
	 * @method save_coordinates
	 * @for Contour
	 */
	save_coordinates: {
		value: function () {

			// ответственность за строку в таблице конструкций лежит на контуре

			// запись в таблице координат, каждый элемент пересчитывает самостоятельно
			this.children.forEach(function (elm) {
				if(elm.save_coordinates)
					elm.save_coordinates();
			});

		},
		enumerable : false
	},

	/**
	 * Возвращает массив внешних узлов текущего контура. Ососбо актуально для створок, т.к. они всегда замкнут
	 * @property outer_nodes
	 * @for Contour
	 * @type {Array}
	 */
	outer_nodes: {
		get: function(){
			// сначала получим все профили
			var res_profiles = this.profiles(),
				to_remove = [], res = [], elm, findedb, findede;

			// прочищаем, выкидывая такие, начало или конец которых соединениы не в узле
			for(var i in res_profiles){
				elm = res_profiles[i];
				if(elm.data.simulated)
					continue;
				findedb = false;
				findede = false;
				for(var j in res_profiles){
					if(res_profiles[j] == elm)
						continue;
					if(!findedb && elm.b.is_nearest(res_profiles[j].e))
						findedb = true;
					if(!findede && elm.e.is_nearest(res_profiles[j].b))
						findede = true;
				}
				if(!findedb || !findede)
					to_remove.push(elm);
			}
			for(var i in res_profiles){
				elm = res_profiles[i];
				if(to_remove.indexOf(elm) != -1)
					continue;
				elm.data.binded = false;
				res.push(elm);
			}
			return res;
		},
		enumerable : false
	},

	/**
	 * Возвращает массив узлов текущего контура
	 * @property nodes
	 * @for Contour
	 * @type {Array}
	 */
	nodes: {
		get: function(){
			var findedb, findede, nodes = [];

			this.profiles.forEach(function (p) {
				findedb = false;
				findede = false;
				nodes.forEach(function (n) {
					if(p.b.is_nearest(n))
						findedb = true;
					if(p.e.is_nearest(n))
						findede = true;
				});
				if(!findedb)
					nodes.push(p.b.clone());
				if(!findede)
					nodes.push(p.e.clone());
			});

			return nodes;
		},
		enumerable : false
	},

	/**
	 * Возвращает массив узлов, которые потенциально могут образовывать заполнения
	 * (соединения с пустотой отбрасываются)
	 * @property gnodes
	 * @for Contour
	 * @type {Array}
	 */
	gnodes: {
		get: function(){
			var findedb, findede, nodes = [], res = [];

			this.profiles.forEach(function (p) {
				findedb = false;
				findede = false;
				// добавляем, если соединение угловое или т-образное
				nodes.forEach(function (n) {
					if(p.b.is_nearest(n.point)){
						findedb = true;
						n.profiles.push(p);
					}
					if(p.e.is_nearest(n.point)){
						findede = true;
						n.profiles.push(p);
					}
				});
				if(!findedb)
					nodes.push({point: p.b.clone(), profiles: [p]});
				if(!findede)
					nodes.push({point: p.e.clone(), profiles: [p]});
			});

			nodes.forEach(function (n) {
				if(n.profiles.length > 1)
					res.push(n);
			});
			nodes = null;
			return res;
		},
		enumerable : false
	},

	/**
	 * Ищет и привязывает узлы профилей к пути заполнения
	 * @method glass_nodes
	 * @for Contour
	 * @param path {paper.Path} - массив ограничивается узлами, примыкающими к пути
	 * @param [nodes] {Array} - если указано, позволяет не вычислять исходный массив узлов контура, а использовать переданный
	 * @param [bind] {Boolean} - если указано, сохраняет пары узлов в path.data.curve_nodes
	 * @returns {Array}
	 */
	glass_nodes: {
		value: function (path, nodes, bind) {

			var curve_nodes = [], path_nodes = [],
				ipoint = path.interiorPoint.negate(),
				i, curve, findedb, findede,
				d, d1, d2, node1, node2;

			if(!nodes)
				nodes = _contour.nodes;

			if(bind){
				path.data.curve_nodes = curve_nodes;
				path.data.path_nodes = path_nodes;
			}

			// имеем путь и контур.
			for(i in path.curves){
				curve = path.curves[i];

				// в node1 и node2 получаем ближайший узел контура к узлам текущего сегмента
				d1 = 10e12; d2 = 10e12;
				nodes.forEach(function (n) {
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
				for(var n in curve_nodes){
					if(curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2){
						findedb = true;
						break;
					}
				}
				if(!findedb){
					findedb = this.profile_by_nodes(node1, node2);
					var loc1 = findedb.generatrix.getNearestLocation(node1),
						loc2 = findedb.generatrix.getNearestLocation(node2);
					// уточняем порядок нод
					if(node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
						curve_nodes.push({node1: node2, node2: node1, profile: findedb, out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index});
					else
						curve_nodes.push({node1: node1, node2: node2, profile: findedb, out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index});
				}
			}

			this.sort_nodes(curve_nodes);

			return path_nodes;
		},
		enumerable : false
	},

	/**
	 * Упорядочивает узлы, чтобы по ним можно было построить путь заполнения
	 * @method sort_nodes
	 * @for Contour
	 * @param [nodes] {Array}
	 */
	sort_nodes: {
		value: function (nodes) {
			if(!nodes.length)
				return nodes;
			var prev = nodes[0], res = [prev], curr, couner = nodes.length + 1;
			while (res.length < nodes.length && couner){
				couner--;
				for(var i = 0; i < nodes.length; i++){
					curr = nodes[i];
					if(res.indexOf(curr) != -1)
						continue;
					if(prev.node2 == curr.node1){
						res.push(curr);
						prev = curr;
						break;
					}
				}
			}
			if(couner){
				nodes.length = 0;
				for(var i = 0; i < res.length; i++)
					nodes.push(res[i]);
				res.length = 0;
			}
		},
		enumerable : false
	}
});
/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  profile
 */

/**
 * Инкапсулирует поведение сегмента профиля (створка, рама, импост, раскладка)<br />
 * У профиля есть координаты конца и начала, есть путь образующей - прямая или кривая линия
 * @class Profile
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends BuilderElement
 */
function Profile(attr){

	var _profile = this,

		// точки пересечения профиля с соседями с внутренней стороны
		_corns = [],

		// кеш лучей в узлах профиля
		_rays = new ProfileRays();

	Profile.superclass.constructor.call(this, attr);

	// initialize
	(function(){

		var h = _profile.project.bounds.height,
			_row = _profile._row;

		if(attr.r)
			_row.r = attr.r;

		if(attr.generatrix) {
			this.data.generatrix = attr.generatrix;

		} else {

			if(_row.path_data) {
				this.data.generatrix = new paper.Path(_row.path_data);

			}else{
				this.data.generatrix = new paper.Path([_row.x1, h - _row.y1]);
				if(_row.r){
					this.data.generatrix.arcTo(
						$p.m.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
							_row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
				}else{
					this.data.generatrix.lineTo([_row.x2, h - _row.y2]);
				}
			}
		}

		h = null;
		_row = null;

		this.data.generatrix.strokeColor = 'gray';

		this.data.path = new paper.Path();
		this.data.path.strokeColor = 'black';
		this.data.path.strokeWidth = 1;
		this.data.path.strokeScaling = false;
		this.data.path.fillColor = new paper.Color(0.96, 0.98, 0.94, 0.96);

		this.addChild(this.data.path);
		this.addChild(this.data.generatrix);

		/**
		 * Подключает наблюдателя за событиями контура с именем _consts.move_points_
		 */
		if(this.parent){
			Object.observe(this.parent._noti, function (an) {
				var moved = an[an.length-1];
				if(moved.profiles.indexOf(_profile) == -1){

					// если среди профилей есть такой, к которму примыкает текущий, пробуем привязку
					var bcnn = _profile.cnn_point("b"),
						ecnn = _profile.cnn_point("e"),
						mpoint;

					moved.profiles.forEach(function (p) {
						if(bcnn.cnn && bcnn.profile == p){
							if(acn.a.indexOf(bcnn.cnn.cnn_type)!=-1 ){
								if(!_profile.b.is_nearest(p.e))
									_profile.b = p.e;
							}
							else if(acn.t.indexOf(bcnn.cnn.cnn_type)!=-1 ){
								mpoint = p.generatrix.getNearestPoint(_profile.b);
								if(!mpoint.is_nearest(_profile.b))
									_profile.b = mpoint;
							}
						}
						if(ecnn.cnn && ecnn.profile == p){
							if(acn.a.indexOf(ecnn.cnn.cnn_type)!=-1 ){
								if(!_profile.e.is_nearest(p.b))
									_profile.e = p.b;
							}
							else if(acn.t.indexOf(ecnn.cnn.cnn_type)!=-1 ){
								mpoint = p.generatrix.getNearestPoint(_profile.e);
								if(!mpoint.is_nearest(_profile.e))
									_profile.e = mpoint;
							}
						}
					});

					moved.profiles.push(_profile);
				}

			}, [consts.move_points]);
		}

	}).call(this);

	/**
	 * Примыкающий внешний элемент - имеет смысл для створок и, возможно, рёбер заполнения
	 * @property nearest
	 * @type Profile
	 */
	var _nearest;
	this.nearest = function(){
		var ngeneratrix, nb, ne, children,
			b = _profile.b, e = _profile.e;

		function check_nearest(){
			if(_nearest){
				ngeneratrix = _nearest.generatrix;
				if( ngeneratrix.getNearestPoint(b).is_nearest(b) && ngeneratrix.getNearestPoint(e).is_nearest(e))
					return true;
			}
			_nearest = null;
		}

		if(_profile.parent && _profile.parent.parent){
			if(!check_nearest()){
				children = _profile.parent.parent.children;
				for(var p in children){
					_nearest = children[p];
					if(_nearest instanceof Profile && check_nearest())
						return _nearest;
					else
						_nearest = null;
				}
			}
		}else
			_nearest = null;

		return _nearest;
	};


	/**
	 * Расстояние от узла до опорной линии
	 * для створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
	 * не имеет смысла для заполнения, но нужно для рёбер заполнений
	 * @property d0
	 * @type Number
	 */
	this.__define('d0', {
		get : function(){
			var res = 0, nearest = _profile.nearest();
			while(nearest){
				res -= nearest.d2 + 20;
				nearest = nearest.nearest();
			}
			return res;
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Расстояние от узла до внешнего ребра элемента
	 * для рамы, обычно = 0, для импоста 1/2 ширины
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d1
	 * @type Number
	 */
	this.__define('d1', {
		get : function(){ return -(_profile.d0 - _profile.sizeb); },
		enumerable : true,
		configurable : false
	});

	/**
	 * Расстояние от узла до внутреннего ребра элемента
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d2
	 * @type Number
	 */
	this.__define('d2', {
		get : function(){ return this.d1 - this.width; },
		enumerable : true,
		configurable : false
	});

	/**
	 * Координаты начала элемента
	 * @property b
	 * @type Point
	 */
	this.__define('b', {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.firstSegment.point;
		},
		set : function(v){
			_rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.firstSegment.point = v;
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Координаты конца элемента
	 * @property e
	 * @type Point
	 */
	this.__define('e', {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.lastSegment.point;
		},
		set : function(v){
			_rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.lastSegment.point = v;
		},
		enumerable : true,
		configurable : false
	});


	this.__define({

		/**
		 * Опорные точки и лучи
		 * @property rays
		 * @type {Object}
		 */
		rays: {
			get : function(){
				if(!_rays.inner || !_rays.outer)
					_rays.recalc(_profile);
					return _rays;
			},
			enumerable : false,
			configurable : false
		},

		/**
		 * Радиус сегмента профиля
		 * @property r
		 * @type {Number}
		 */
		r: {
			get : function(){
				return this._row.r;
			},
			set: function(v){
				_rays.clear();
				this._row.r = v;
			},
			enumerable : true,
			configurable : false
		},

		/**
		 * Направление дуги сегмента профиля против часовой стрелки
		 * @property arc_ccw
		 * @type {Boolean}
		 */
		arc_ccw: {
			get : function(){

			},
			set: function(v){
				_rays.clear();
			},
			enumerable : true,
			configurable : false
		}

	});

	/**
	 * Координата начала профиля
	 * @property x1
	 * @type {Number}
	 */
	this.__define("x1", {
		get : function(){ return Math.round(this.b.x*10)/10; },
		set: function(v){
			_profile.select_node("b");
			_profile.move_points(new paper.Point(v - this.b.x, 0));	},
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата начала профиля
	 * @property y1
	 * @type {Number}
	 */
	this.__define("y1", {
		get : function(){
			return Math.round((_profile.project.bounds.height-this.b.y)*10)/10; },
		set: function(v){
			v = _profile.project.bounds.height-v;
			_profile.select_node("b");
			_profile.move_points(new paper.Point(0, v - this.b.y)); },
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата конца профиля
	 * @property x2
	 * @type {Number}
	 */
	this.__define("x2", {
		get : function(){ return Math.round(this.e.x*10)/10; },
		set: function(v){
			_profile.select_node("e");
			_profile.move_points(new paper.Point(v - this.e.x, 0)); },
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата конца профиля
	 * @property y2
	 * @type {Number}
	 */
	this.__define("y2", {
		get : function(){
			return Math.round((_profile.project.bounds.height-this.e.y)*10)/10; },
		set: function(v){
			v = _profile.project.bounds.height-v;
			_profile.select_node("e");
			_profile.move_points(new paper.Point(0, v - this.e.y));},
		enumerable : false,
		configurable : false
	});

	/**
	 * Координаты вершин (cornx1...corny4)
	 * @method corns
	 * @param corn {String|Number} - имя или номер вершины
	 * @return {Point|Number} - координата или точка
	 */
	this.corns = function(corn){
		if(typeof corn == "number")
			return _corns[corn];
		else{
			var index = corn.substr(corn.length-1, 1),
				axis = corn.substr(corn.length-2, 1);
			return _corns[index][axis];
		}
	};

	/**
	 * Находит точку примыкания концов профиля к соседними элементами контура
	 * @method cnn_point
	 * @param node {String} - имя узла профиля: "b" или "e"
	 * @return {CnnPoint} - объект {point, profile, cnn_types}
	 */
	this.cnn_point = function(node, point){

		var res = this.rays[node],
			c_d = _profile.project.check_distance;

		if(!point)
			point = this[node];


		// Если привязка не нарушена, возвращаем предыдущее значение
		if(res.profile && res.profile.children.length){
			if(res.profile_point == "b" || res.profile_point == "e")
				return res;
			else if(c_d(res.profile, _profile, res, point, true) === false)
				return res;
		}

		delete res.profile_point;
		res.profile = null;
		res.cnn = null;
		res.distance = 10e9;
		res.cnn_types = acn.i;

		// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
		if(this.parent){
			for(var i in this.parent.children){
				var element = this.parent.children[i];
				if (element instanceof Profile){
					if(c_d(element, _profile, res, point, false) === false)
						return res;
				}
			}
		}

		return res;
	};


	/**
	 * Обрабатывает смещение выделенных сегментов образующей профиля
	 * @param delta {paper.Point} - куда и насколько смещать
	 * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
	 * @param [start_point] {paper.Point} - откуда началось движение
	 */
	this.move_points = function(delta, all_points, start_point){
		var segments = _profile.generatrix.segments,
			changed = false, cnn_point, free_point, j,
			noti = {type: consts.move_points, profiles: [this], points: []}, noti_points, notifier;

		for (j = 0; j < segments.length; j++) {
			if (segments[j].selected || all_points){

				noti_points = {old: segments[j].point.clone(), delta: delta};

				// собственно, сдвиг узлов
				free_point = segments[j].point.add(delta);
				if(segments[j].point == _profile.b)
					cnn_point = this.cnn_point("b", free_point);
				else if(segments[j].point == _profile.e)
					cnn_point = this.cnn_point("e", free_point);

				if(cnn_point && cnn_point.cnn_types == acn.t &&
					(segments[j].point == _profile.b || segments[j].point == _profile.e)){
					segments[j].point = cnn_point.point;
				}
				else{
					segments[j].point = free_point;
				}

				// накапливаем точки в нотификаторе
				noti_points.new = segments[j].point;
				if(start_point)
					noti_points.start = start_point;
				noti.points.push(noti_points);

				changed = true;
			}
		}

		if(changed){

			_rays.clear();

			// информируем систему об изменениях
			_profile.parent.notify(noti);

			notifier = Object.getNotifier(this);
			notifier.notify({ type: 'update', name: "x1" });
			notifier.notify({ type: 'update', name: "y1" });
			notifier.notify({ type: 'update', name: "x2" });
			notifier.notify({ type: 'update', name: "y2" });

		}
	};

	/**
	 * Рассчитывает точки пути на пересечении текущего и указанного профилей
	 * @method path_points
	 * @param cnn_point {CnnPoint}
	 */
	this.path_points = function(cnn_point, profile_point){

		if(!_profile.generatrix.curves.length)
			return cnn_point;

		var prays, rays = this.rays, normal;

		// ищет точку пересечения открытых путей
		// если указан индекс, заполняет точку в массиве _corns. иначе - возвращает расстояние от узла до пересечения
		function intersect_point(path1, path2, index){
			var intersections = path1.getIntersections(path2),
				delta = 10e9, tdelta, point, tpoint;

			if(intersections.length == 1)
				if(index)
					_corns[index] = intersections[0].point;
				else
					return intersections[0].point.getDistance(cnn_point.point, true);

			else if(intersections.length > 1){
				intersections.forEach(function(o){
					tdelta = o.point.getDistance(cnn_point.point, true);
					if(tdelta < delta){
						delta = tdelta;
						point = o.point;
					}
				});
				if(index)
					_corns[index] = point;
				else
					return delta;
			}
		}

		//TODO учесть импосты, у которых образующая совпадает с ребром
		function detect_side(){
			var isinner = intersect_point(prays.inner, _profile.generatrix),
				isouter = intersect_point(prays.outer, _profile.generatrix);
			if(isinner && !isouter)
				return 1;
			else if(!isinner && isouter)
				return -1;
			else
				return 1;
		}

		// если пересечение в узлах, используем лучи профиля
		if(cnn_point.profile){
			prays = cnn_point.profile.rays;
		}

		if(cnn_point.cnn && cnn_point.cnn_types == $p.enm.cnn_types.acn.t){

			// для Т-соединений сначала определяем, изнутри или снаружи находится наш профиль
			if(!cnn_point.profile.path.segments.length)
				cnn_point.profile.redraw();

			if(profile_point == "b"){
				// в зависимости от стороны соединения
				if(detect_side() < 0){
					intersect_point(prays.outer, rays.outer, 1);
					intersect_point(prays.outer, rays.inner, 4);

				}else{
					intersect_point(prays.inner, rays.outer, 1);
					intersect_point(prays.inner, rays.inner, 4);

				}

			}else if(profile_point == "e"){
				// в зависимости от стороны соединения
				if(detect_side() < 0){
					intersect_point(prays.outer, rays.outer, 2);
					intersect_point(prays.outer, rays.inner, 3);

				}else{
					intersect_point(prays.inner, rays.outer, 2);
					intersect_point(prays.inner, rays.inner, 3);

				}
			}

		}else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.i){
			// соединение с пустотой
			if(profile_point == "b"){
				normal = this.generatrix.firstCurve.getNormalAt(0, true);
				_corns[1] = this.b.add(normal.normalize(this.d1));
				_corns[4] = this.b.add(normal.normalize(this.d2));

			}else if(profile_point == "e"){
				normal = this.generatrix.lastCurve.getNormalAt(1, true);
				_corns[2] = this.e.add(normal.normalize(this.d1));
				_corns[3] = this.e.add(normal.normalize(this.d2));
			}

		}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
			// угловое диагональное
			if(profile_point == "b"){
				intersect_point(prays.outer, rays.outer, 1);
				intersect_point(prays.inner, rays.inner, 4);

			}else if(profile_point == "e"){
				intersect_point(prays.outer, rays.outer, 2);
				intersect_point(prays.inner, rays.inner, 3);
			}

		}

		// если точка не рассчиталась - рассчитываем по умолчанию - как с пустотой
		if(profile_point == "b"){
			if(!_corns[1])
				_corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
			if(!_corns[4])
				_corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));

		}else if(profile_point == "e"){
			if(!_corns[2])
				_corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
			if(!_corns[3])
				_corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
		}
		return cnn_point;
	};

}
Profile._extend(BuilderElement);

Profile.prototype.__define({

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {
			if(this.data.generatrix){
				var h = this.project.bounds.height,
					_row = this._row,

					cnns = this.project.connections.cnns,
					b = this.rays.b,
					e = this.rays.e,
					row_b = cnns.add({
						elm1: _row.elm,
						node1: "b",
						cnn: b.cnn.ref,
						aperture_len: this.corns(1).getDistance(this.corns(4))
					}),
					row_e = cnns.add({
						elm1: _row.elm,
						node1: "e",
						cnn: e.cnn.ref,
						aperture_len: this.corns(2).getDistance(this.corns(3))
					}),


					gen = this.generatrix,
					sub_gen,
					ppoints = {};

				_row.x1 = Math.round(this.b.x * 1000) / 1000;
				_row.y1 = Math.round((h - this.b.y) * 1000) / 1000;
				_row.x2 = Math.round(this.e.x * 1000) / 1000;
				_row.y2 = Math.round((h - this.e.y) * 1000) / 1000;
				_row.path_data = gen.pathData;

				//TODO: Пересчитать длину с учетом

				// находим проекции четырёх вершин на образующую
				for(var i = 1; i<=4; i++)
					ppoints[i] = gen.getNearestPoint(this.corns(i));

				// находим точки, расположенные ближе к концам образующей
				ppoints.b = ppoints[1].getDistance(gen.firstSegment.point, true) < ppoints[4].getDistance(gen.firstSegment.point, true) ? ppoints[1] : ppoints[4];
				ppoints.e = ppoints[2].getDistance(gen.lastSegment.point, true) < ppoints[3].getDistance(gen.lastSegment.point, true) ? ppoints[2] : ppoints[3];

				// получаем фрагмент образующей
				sub_gen = gen.get_subpath(ppoints.b, ppoints.e);

				// добавляем припуски соединений
				_row.len = sub_gen.length +
					(b.cnn && !b.cnn.empty() ? b.cnn.sz : 0) +
					(e.cnn && !e.cnn.empty() ? e.cnn.sz : 0);
				sub_gen.remove();

				// сохраняем информацию о соединениях
				if(b.profile){
					row_b.elm2 = b.profile._row.elm;
					if(b.profile.e.is_nearest(b.point))
						row_b.node2 = "e";
					else if(b.profile.b.is_nearest(b.point))
						row_b.node2 = "b";
					else
						row_b.node2 = "t";
				}
				if(e.profile){
					row_e.elm2 = e.profile._row.elm;
					if(e.profile.b.is_nearest(e.point))
						row_e.node2 = "b";
					else if(e.profile.e.is_nearest(e.point))
						row_e.node2 = "b";
					else
						row_e.node2 = "t";
				}

				// получаем углы между элементами и к горизонту
				_row.angle_hor = Math.round((new paper.Point(_row.x2 -_row.x1, _row.y2 - _row.y1)).angle * 10) / 10;
				if(_row.angle_hor < 0)
					_row.angle_hor = _row.angle_hor + 360;

				_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - sub_gen.getTangentAt(0).angle) * 10) / 10;
				if(_row.alp1 < 0)
					_row.alp1 = _row.alp1 + 360;

				_row.alp2 = Math.round((sub_gen.getTangentAt(sub_gen.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
				if(_row.alp2 < 0)
					_row.alp2 = _row.alp2 + 360;

				//TODO: Рассчитать тип элемента рама-импост-створка
			}
		},
		enumerable : false
	},

	/**
	 * Дополняет cnn_point свойствами соединения
	 * @param cnn_point {CnnPoint}
	 */
	postcalc_cnn: {
		value: function(cnn_point){

			// если установленное ранее соединение проходит по типу, нового не ищем
			if(cnn_point.cnn && (cnn_point.cnn_types.indexOf(cnn_point.cnn.cnn_type)!=-1))
				return cnn_point;

			// список доступных соединений сразу ограничиваем типом соединения
			var cnns = [];
			$p.cat.cnns.nom_cnn(this.nom, cnn_point.profile ? cnn_point.profile.nom : null).forEach(function(o){
				if(cnn_point.cnn_types.indexOf(o.cnn_type)!=-1)
					cnns.push(o);
			});

			// для примера подставляем первое попавшееся соединение
			if(cnns.length)
				cnn_point.cnn = cnns[0];

			return cnn_point;
		},
		enumerable : false
	},

	/**
	 * Формирует путь сегмента профиля на основании пути образующей
	 * @method redraw
	 */
	redraw: {
		value: function () {

			// получаем узлы
			var bcnn = this.cnn_point("b"),
				ecnn = this.cnn_point("e"),
				path = this.data.path,
				gpath = this.generatrix,
				glength = gpath.length,
				rays = this.rays,
				offset1, offset2, tpath, step;


			// получаем соединения концов профиля и точки пересечения с соседями
			this.path_points(this.postcalc_cnn(bcnn), "b");
			this.path_points(this.postcalc_cnn(ecnn), "e");


			// очищаем существующий путь
			path.removeSegments();

			// TODO отказаться повторного пересчета и заействовать клоны rays-ов
			path.add(this.corns(1));

			if(gpath.is_linear()){
				path.add(this.corns(2), this.corns(3));

			}else{

				tpath = new paper.Path({insert: false});
				offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
				offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
				step = (offset2 - offset1) / 50;
				for(var i = offset1 + step; i<offset2; i+=step)
					tpath.add(rays.outer.getPointAt(i));
				tpath.simplify(0.8);
				path.join(tpath);
				path.add(this.corns(2));

				path.add(this.corns(3));

				tpath = new paper.Path({insert: false});
				offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
				offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
				step = (offset2 - offset1) / 50;
				for(var i = offset1 + step; i<offset2; i+=step)
					tpath.add(rays.inner.getPointAt(i));
				tpath.simplify(0.8);
				path.join(tpath);

			}


			path.add(this.corns(4));
			path.closePath();
			path.reduce();

			return this;
		},
		enumerable : false
	},

	interiorPoint: {
		value: function () {
			var gen = this.generatrix, igen;
			if(gen.curves.length == 1)
				igen = gen.firstCurve.getPointAt(0.5, true);
			else if (gen.curves.length == 2)
				igen = gen.firstCurve.point2;
			else
				igen = gen.curves[1].point2;
			return this.rays.inner.getNearestPoint(igen).add(this.rays.outer.getNearestPoint(igen)).divide(2)
		},
		enumerable : false
	},

	/**
	 * Выделяет начало или конец профиля
	 * @param profile
	 * @param node
	 */
	select_node: {
		value:  function(node){
			var gen = this.generatrix;
			this.project.deselect_all_points();
			this.data.path.selected = false;
			if(node == "b")
				gen.firstSegment.selected = true;
			else
				gen.lastSegment.selected = true;
			this.view.update();
		},
		enumerable : false
	}

});

/**
 * Объект, описывающий геометрию соединения
 * @class CnnPoint
 * @constructor
 */
function CnnPoint(){

	/**
	 * Расстояние до ближайшего профиля
	 * @type {number}
	 */
	this.distance = 10e9;

	/**
	 * Массив допустимых типов соединений
	 * По умолчанию - соединение с пустотой
	 * @type {Array}
	 */
	this.cnn_types = acn.i;

	/**
	 * Профиль, с которым пересекается наш элемент
	 * @property profile
	 * @type {Profile}
	 */
	this.profile = null;

	/**
	 * Текущее соединение - объект справочника соединения
	 * @type {_cat.cnns}
	 */
	this.cnn = null;
}

function ProfileRays(){

	this.b = new CnnPoint();
	this.e = new CnnPoint();

	this.clear = function(with_cnn){
		if(this.inner)
			delete this.inner;
		if(this.outer)
			delete this.outer;
		if(with_cnn){
			this.b.profile = null;
			this.e.profile = null;
			this.b.cnn = null;
			this.e.cnn = null;
		}
	};

	this.recalc = function(_profile){

		var path = _profile.generatrix,
			len = path.length;

		this.outer = new paper.Path({ insert: false });
		this.inner = new paper.Path({ insert: false });

		if(len == 0){
			return;
		}

		var d1 = _profile.d1, d2 = _profile.d2,
			ds = 3 * _profile.width, step = len * 0.02,
			point_b, tangent_b, normal_b,
			point_e, tangent_e, normal_e;


		// первая точка эквидистанты. аппроксимируется касательной на участке (from < начала пути)
		point_b = path.firstSegment.point;
		tangent_b = path.getTangentAt(0).normalize();
		normal_b = path.getNormalAt(0).normalize();

		// последняя точка эквидистанты. аппроксимируется прямой , если to > конца пути
		point_e = path.lastSegment.point;

		// для прямого пути, чуть наклоняем нормаль
		if(path.is_linear()){

			tangent_e = tangent_b.clone();

			tangent_b.angle += 0.0001;
			tangent_e.angle -= 0.0001;

			this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
			this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_e.multiply(-ds)));
			//this.outer.add(point_b.add(normal_b.multiply(d1)));
			//this.inner.add(point_b.add(normal_b.multiply(d2)));
			//this.outer.add(point_e.add(normal_b.multiply(d1)));
			//this.inner.add(point_e.add(normal_b.multiply(d2)));
			this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_e.multiply(ds)));
			this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));

		}else{

			this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
			this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));
			this.outer.add(point_b.add(normal_b.multiply(d1)));
			this.inner.add(point_b.add(normal_b.multiply(d2)));

			for(var i = step; i<=len; i+=step) {
				point_b = path.getPointAt(i);
				if(!point_b)
					continue;
				normal_b = path.getNormalAt(i);
				this.outer.add(point_b.add(normal_b.normalize(d1)));
				this.inner.add(point_b.add(normal_b.normalize(d2)));
			}

			normal_e = path.getNormalAt(len).normalize();
			this.outer.add(point_e.add(normal_e.multiply(d1)));
			this.inner.add(point_e.add(normal_e.multiply(d2)));

			tangent_e = path.getTangentAt(len).normalize();
			this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
			this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

			this.outer.simplify(0.8);
			this.inner.simplify(0.8);
		}

		this.inner.reverse();
	}

}

/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  filling
 */


/**
 * Инкапсулирует поведение элемента заполнения.<br />
 * У заполнения есть коллекция рёбер, образующая путь контура.<br />
 * Путь всегда замкнутый, образует простой многоугольник без внутренних пересечений, рёбра могут быть гнутыми.
 * @class Filling
 * @param arg {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Filling(attr){

	Filling.superclass.constructor.call(this, attr);

	var _row = attr.row,
		_filling = this;

	// initialize
	(function(){

		var h = _filling.project.bounds.height;

		//this.guide = true

		if(_row.path_data)
			this.data.path = new paper.Path(_row.path_data);

		else if(attr.path){

			this.data.path = new paper.Path();
			this.path = attr.path;

		}else
			this.data.path = new paper.Path([
				[_row.x1, h - _row.y1],
				[_row.x1, h - _row.y2],
				[_row.x2, h - _row.y2],
				[_row.x2, h - _row.y1]
			]);
		this.data.path.closePath(true);
		this.data.path.guide = true;
		this.data.path.strokeWidth = 0;
		this.data.path.fillColor = {
			stops: ['#def', '#d0ddff', '#eff'],
			origin: this.data.path.bounds.bottomLeft,
			destination: this.data.path.bounds.topRight
		};
		this.data.path.visible = false;

		this.addChild(this.data.path);
		//this.addChild(this.data.generatrix);


	}).call(this);

	/**
	 * Рёбра заполнения
	 * @property ribs
	 * @type {paper.Group}
	 */
	//this.ribs = new paper.Group();

}
Filling._extend(BuilderElement);

Filling.prototype.__define({

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {

			this.purge_path();

			var h = this.project.bounds.height,
				_row = this._row,
				glass = this.project.ox.glasses.add({
					elm: _row.elm
				});

			_row.path_data = this.path.pathData;
		}
	},

	/**
	 * путь элемента - состоит из кривых, соединяющих вершины элемента
	 * @property path
	 * @type paper.Path
	 */
	path: {
		get : function(){ return this.data.path; },
		set : function(glass_path){
			if(glass_path instanceof paper.Path){
				this.data.path.removeSegments();

				// Если в передаваемом пути есть привязка к профилям контура - используем
				if(glass_path.data.curve_nodes){

					this.data.path.addSegments(glass_path.segments);
				}else{
					this.data.path.addSegments(glass_path.segments);
				}

				if(!this.data.path.closed)
					this.data.path.closePath(true);
			}
		},
		enumerable : true
	},

	purge_path: {
		value: function () {

			var curves = this.path.curves,
				prev, curr, dangle, i;

			// убираем малые искривления
			for(i = 0; i < curves.length; i++){
				prev = curves[i];
				curr = prev.getCurvatureAt(0.5, true);
				if(prev.hasHandles() && curr < 1e-6 && curr > -1e-6)
					prev.clearHandles();
			}

			// убираем лишние сегменты
			prev = curves[0];
			i = 1;
			while (i < curves.length){

				if(prev.length < consts.filling_min_length)
					this.path.removeSegment(i);
				else{
					curr = curves[i];
					if(!curr.hasHandles() && !prev.hasHandles()){
						dangle = Math.abs(curr.getTangentAt(0).angle - prev.getTangentAt(0).angle);
						if(dangle < 0.01 || Math.abs(dangle - 180) < 0.01)
							this.path.removeSegment(i);
						else{
							prev = curr;
							i++;
						}
					}else{
						prev = curr;
						i++;
					}
				}
			}

			// выравниваем горизонт
			if(curves.length == 4 && !this.path.hasHandles()){
				for(i = 0; i < curves.length; i++){
					prev = curves[i];
					if(!prev.hasHandles()){
						dangle = curr.getTangentAt(0).angle;
						// todo: выравниваем горизонт
					}
				}
			}
		}
	}

});
/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  sectional
 */

/**
 * Вид в разрезе. например, водоотливы
 * @param arg {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Sectional(arg){
	Sectional.superclass.constructor.call(this, arg);
}
Sectional._extend(BuilderElement);
/**
 *
 * Created 21.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  freetext
 */

/**
 * Произвольный текст на эскизе
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @param attr.parent {BuilderElement} - элемент, к которому привязывается комментарий
 * @constructor
 * @extends paper.PointText
 */
function FreeText(attr){

	var _row, t = this;

	if(!attr.fontSize)
		attr.fontSize = consts.font_size;

	if(attr.row)
		_row = attr.row;
	else
		_row = attr.row = attr.parent.project.ox.coordinates.add();

	if(attr.point){
		var tpoint;
		if(attr.point instanceof paper.Point)
			tpoint = attr.point;
		else
			tpoint = new paper.Point(attr.point);
		_row.x1 = tpoint.x;
		_row.y1 = tpoint.y;
	}else
		attr.point = [_row.x1, _row.y1];

	// разберёмся с родителем
	if(!(attr.parent.parent instanceof Contour)){
		while(!(attr.parent instanceof Contour))
			attr.parent = attr.parent.parent;
		attr.parent = attr.parent.l_text;
	}else
		attr.parent = attr.parent.parent.l_text;

	FreeText.superclass.constructor.call(t, attr);

	t.bringToFront();

	t.__define({
		_row: {
			get: function () {
				return _row;
			},
			enumerable: false
		}
	});


	/**
	 * Удаляет элемент из контура и иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
	 * @method remove
	 */
	t.remove = function () {
		_row._owner.del(_row);
		_row = null;
		FreeText.superclass.remove.call(t);
	};

}
FreeText._extend(paper.PointText);

FreeText.prototype.__define({

	// виртуальные метаданные для автоформ
	_metadata: {
		get: function () {
			return $p.dp.builder_text.metadata();
		},
		enumerable: false
	},

	// виртуальный датаменеджер для автоформ
	_manager: {
		get: function () {
			return $p.dp.builder_text;
		},
		enumerable: false
	},

	// транслирует цвет из справочника в строку и обратно
	clr: {
		get: function () {
			return this._row ? this._row.clr : $p.cat.clrs.get();
		},
		set: function (v) {
			this._row.clr = v;
			if(this._row.clr.clr_str.length == 6)
				this.fillColor = "#" + this._row.clr.clr_str;
			this.project.register_update();
		},
		enumerable: false
	},

	// семейство шрифта
	font_family: {
		get: function () {
			return this.fontFamily || "";
		},
		set: function (v) {
			this.fontFamily = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// размер шрифта
	font_size: {
		get: function () {
			return this.fontSize || consts.font_size;
		},
		set: function (v) {
			this.fontSize = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// жирность шрифта
	bold: {
		get: function () {
			return this.fontWeight != 'normal';
		},
		set: function (v) {
			this.fontWeight = v ? 'bold' : 'normal';
		},
		enumerable: false
	},

	// координата x
	x: {
		get: function () {
			return Math.round(this._row.x1);
		},
		set: function (v) {
			this._row.x1 = v;
			this.point.x = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// координата y
	y: {
		get: function () {
			return Math.round(this._row.y1);
		},
		set: function (v) {
			this._row.y1 = v;
			this.point.y = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// текст элемента
	text: {
		get: function () {
			return this.content;
		},
		set: function (v) {
			if(v){
				this.content = v;
				this.project.register_update();
			}
			else{
				Object.getNotifier(this).notify({
					type: 'unload'
				});
				setTimeout(this.remove, 50);
			}

		},
		enumerable: false
	},

	// угол к горизонту
	angle: {
		get: function () {
			return Math.round(this.rotation);
		},
		set: function (v) {
			this._row.angle_hor = v;
			this.rotation = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// выравнивание текста
	align: {
		get: function () {
			return $p.enm.text_aligns.get(this.justification);
		},
		set: function (v) {
			this.justification = $p.is_data_obj(v) ? v.ref : v;
			this.project.register_update();
		},
		enumerable: false
	},

	// обновляет координаты
	refresh_pos: {
		value: function () {
			this.x = this.point.x;
			this.y = this.point.y;
			Object.getNotifier(this).notify({
				type: 'update',
				name: "x"
			});
			Object.getNotifier(this).notify({
				type: 'update',
				name: "y"
			});
		}
	}

});

/**
 * Манипуляции с арками (дуги правильных окружностей)
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_arc
 */

function ToolArc(){

	var _editor = paper,
		tool = this;

	ToolArc.superclass.constructor.call(this);

	tool.options = {name: 'arc'};
	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;
	tool.duplicates = null;

	function do_arc(element, point){
		var end = element.lastSegment.point.clone();
		element.removeSegments(1);

		try{
			element.arcTo(point, end);
		}catch (e){	}

		if(!element.curves.length)
			element.lineTo(end);

		element.parent.rays.clear();
		element.selected = true;

		element.parent.parent.notify({type: consts.move_points, profiles: [element.parent], points: []});
	}

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		var hitSize = 4;
		tool.hitItem = null;

		if (event.point)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			_editor.canvas_cursor('cursor-arc');
		} else {
			_editor.canvas_cursor('cursor-arc-arrow');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arc-arrow');
		},
		deactivate: function() {
			_editor.hide_selection_bounds();
		},
		mousedown: function(event) {

			var b, e, r, contour;

			this.mode = null;
			this.changed = false;

			if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {

				this.mode = tool.hitItem.item.parent.generatrix;

				if (event.modifiers.control || event.modifiers.option){
					// при зажатом ctrl или alt строим правильную дугу

					b = this.mode.firstSegment.point;
					e = this.mode.lastSegment.point;
					r = (b.getDistance(e) / 2) + 0.001;
					contour = this.mode.parent.parent;

					do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);


				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					contour = this.mode.parent.parent;

					this.mode.removeSegments(1);
					this.mode.firstSegment.handleIn = null;
					this.mode.firstSegment.handleOut = null;
					this.mode.lineTo(e);
					this.mode.parent.rays.clear();
					this.mode.selected = true;

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);

				} else {
					_editor.project.deselectAll();
					this.mode.selected = true;
					_editor.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = _editor.capture_selection_state();

				}

				//attache_dg(tool.hitItem.item.parent, tool.wnd);

			}else{
				//tool.detache_wnd();
				_editor.project.deselectAll();
			}
		},
		mouseup: function(event) {
			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
				//_editor.project.redraw();
			}

			_editor.canvas_cursor('cursor-arc-arrow');

		},
		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				do_arc(this.mode, event.point);

				//this.mode.parent.parent.redraw();


			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolArc._extend(paper.Tool);


/**
 * Вставка раскладок и импостов
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_lay_impost
 */

function ToolLayImpost(){

	var _editor = paper,
		tool = this;

	ToolLayImpost.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'lay_impost',
		nom: $p.cat.nom.get(),
		clr: $p.cat.clrs.get(),
		wnd: {
			caption: "Импосты и раскладки",
			height: 280
		}
	};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return this.hitTest(event);
	};
	tool.hitTest = function(event) {
		// var hitSize = 4.0; // / view.zoom;
		var hitSize = 2;

		// Hit test items.
		tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && !(tool.hitItem.item.parent instanceof Profile) && (tool.hitItem.type == 'fill')) {
			_editor.canvas_cursor('cursor-lay-impost');
		} else {
			_editor.canvas_cursor('cursor-arrow-lay');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-lay');
		},
		deactivate: function() {
			_editor.hide_selection_bounds();
		},
		mousedown: function(event) {

			var b, e, r, contour;

			this.mode = null;
			this.changed = false;

			if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
				&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {

				this.mode = tool.hitItem.item.parent.generatrix;

				if (event.modifiers.control || event.modifiers.option){
					// при зажатом ctrl или alt строим правильную дугу

					b = this.mode.firstSegment.point;
					e = this.mode.lastSegment.point;
					r = (b.getDistance(e) / 2) + 0.01;
					contour = this.mode.parent.parent;

					//do_arc(this.mode, $p.m.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);


				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					contour = this.mode.parent.parent;

					this.mode.removeSegments(1);
					this.mode.firstSegment.linear = true;
					this.mode.lineTo(e);
					this.mode.parent.rays.clear();
					this.mode.selected = true;

					//undo.snapshot("Move Shapes");
					this.mode = null;
					setTimeout(contour.redraw, 10);

				} else {
					_editor.project.deselectAll();
					this.mode.selected = true;
					_editor.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = _editor.capture_selection_state();

				}

				//attache_dg(tool.hitItem.item.parent, tool.wnd);

			}else{
				//tool.detache_wnd();
				_editor.project.deselectAll();
			}
		},
		mouseup: function(event) {
			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
			}

			_editor.canvas_cursor('cursor-arrow-lay');

		},
		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				//do_arc(this.mode, event.point);


			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolLayImpost._extend(paper.Tool);

/**
 * Панорама и масштабирование с колёсиком и без колёсика
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module tool_pan
 */

function ToolPan(){

	var _editor = paper,
		tool = this;

	ToolPan.superclass.constructor.call(this);

	tool.options = {name: 'pan'};
	tool.distanceThreshold = 8;
	tool.mouseStartPos = new paper.Point();
	tool.mode = 'pan';
	tool.zoomFactor = 1.1;
	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		var spacePressed = event && event.modifiers.space;
		if (mode != 'tool-zoompan' && !spacePressed)
			return false;
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		if (event.modifiers.control) {
			_editor.canvas_cursor('cursor-zoom-in');
		} else if (event.modifiers.option) {
			_editor.canvas_cursor('cursor-zoom-out');
		} else {
			_editor.canvas_cursor('cursor-hand');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-hand');
		},
		deactivate: function() {
		},
		mousedown: function(event) {
			this.mouseStartPos = event.point.subtract(_editor.view.center);
			this.mode = '';
			if (event.modifiers.control || event.modifiers.option) {
				this.mode = 'zoom';
			} else {
				_editor.canvas_cursor('cursor-hand-grab');
				this.mode = 'pan';
			}
		},
		mouseup: function(event) {
			if (this.mode == 'zoom') {
				var zoomCenter = event.point.subtract(_editor.view.center);
				var moveFactor = this.zoomFactor - 1.0;
				if (event.modifiers.control) {
					_editor.view.zoom *= this.zoomFactor;
					_editor.view.center = _editor.view.center.add(zoomCenter.multiply(moveFactor / this.zoomFactor));
				} else if (event.modifiers.option) {
					_editor.view.zoom /= this.zoomFactor;
					_editor.view.center = _editor.view.center.subtract(zoomCenter.multiply(moveFactor));
				}
			} else if (this.mode == 'zoom-rect') {
				var start = _editor.view.center.add(this.mouseStartPos);
				var end = event.point;
				_editor.view.center = start.add(end).multiply(0.5);
				var dx = _editor.view.bounds.width / Math.abs(end.x - start.x);
				var dy = _editor.view.bounds.height / Math.abs(end.y - start.y);
				_editor.view.zoom = Math.min(dx, dy) * _editor.view.zoom;
			}
			this.hitTest(event);
			this.mode = '';
		},
		mousedrag: function(event) {
			if (this.mode == 'zoom') {
				// If dragging mouse while in zoom mode, switch to zoom-rect instead.
				this.mode = 'zoom-rect';
			} else if (this.mode == 'zoom-rect') {
				// While dragging the zoom rectangle, paint the selected area.
				_editor.drag_rect(_editor.view.center.add(this.mouseStartPos), event.point);
			} else if (this.mode == 'pan') {
				// Handle panning by moving the view center.
				var pt = event.point.subtract(_editor.view.center);
				var delta = this.mouseStartPos.subtract(pt);
				_editor.view.scrollBy(delta);
				this.mouseStartPos = pt;
			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		},

		keydown: function(event) {
			this.hitTest(event);
		},

		keyup: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolPan._extend(paper.Tool);

/**
 * Добавление (рисование) профилей
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_pen
 */

function ToolPen(){

	var _editor = paper,
		tool = this;

	ToolPen.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.start_binded = false;

	tool.options = {
		name: 'pen',
		wnd: {
			caption: "Новый сегмент профиля",
			width: 320,
			height: 240,
			bind_generatrix: true,
			bind_node: false,
			inset: "",
			clr: ""
		}
	};

	// подключает окно редактора
	function tool_wnd(){

		// создаём экземпляр обработки
		tool.profile = $p.dp.builder_pen.create();

		// восстанавливаем сохранённые параметры
		$p.wsql.restore_options("editor", tool.options);
		tool.profile._mixin(tool.options.wnd, ["inset", "clr", "bind_generatrix", "bind_node"]);

		if(tool.profile.inset.empty()){
			var profiles = _editor.project.sys.inserts($p.enm.elm_types.rama_impost);
			if(profiles.length)
				tool.profile.inset = profiles[0];
		}

		if(tool.profile.clr.empty())
			tool.profile.clr = $p.cat.clrs.predefined("white");

		tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);
		tool.wnd.attachHeadFields({
			obj: tool.profile
		});

		var wnd_options = tool.wnd.wnd_options;
		tool.wnd.wnd_options = function (opt) {
			wnd_options.call(tool.wnd, opt);
			opt.inset = tool.profile.inset.ref;
			opt.clr = tool.profile.clr.ref;
			opt.bind_generatrix = tool.profile.bind_generatrix;
			opt.bind_node = tool.profile.bind_node;
		}

	}

	function decorate_layers(reset){
		var active = _editor.project.activeLayer;
		_editor.project.getItems({class: Contour}).forEach(function (l) {
			l.children.forEach(function(elm){
				if(!(elm instanceof Contour))
					elm.opacity = (l == active || reset) ? 1 : 0.5;
			});
		})
	}

	function observer(changes){
		changes.forEach(function(change){
			if(change.name == "_activeLayer")
				decorate_layers();
		});
	}

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		// var hitSize = 4.0; // / view.zoom;
		var hitSize = 4;
		tool.hitItem = null;

		// Hit test items.
		if (event.point)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			_editor.canvas_cursor('cursor-pen-adjust');
		} else {
			_editor.canvas_cursor('cursor-pen-freehand');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-pen-freehand');

			tool_wnd();

			Object.observe(_editor.project, observer);

			decorate_layers();

		},
		deactivate: function() {
			_editor.clear_selection_bounds();

			Object.unobserve(_editor.project, observer);

			decorate_layers(true);

			tool.detache_wnd();

		},
		mousedown: function(event) {

			_editor.project.deselectAll();
			this.mode = 'continue';
			this.start_binded = false;
			this.mouseStartPos = event.point.clone();

		},
		mouseup: function(event) {

			_editor.canvas_cursor('cursor-pen-freehand');

			if (this.mode && this.path) {
				new Profile({generatrix: this.path, proto: tool.profile});
				this.mode = null;
				this.path = null;
			}

		},
		mousedrag: function(event) {

			var delta = event.point.subtract(this.mouseStartPos),
				dragIn = false,
				dragOut = false,
				invert = false,
				handlePos;

			if (!this.mode || !this.path && delta.length < consts.sticking)
				return;

			if (!this.path){
				this.path = new paper.Path();
				this.path.strokeColor = 'black';
				this.currentSegment = this.path.add(this.mouseStartPos);
				this.originalHandleIn = this.currentSegment.handleIn.clone();
				this.originalHandleOut = this.currentSegment.handleOut.clone();
				this.currentSegment.selected = true;
			}


			if (this.mode == 'create') {
				dragOut = true;
				if (this.currentSegment.index > 0)
					dragIn = true;
			} else  if (this.mode == 'close') {
				dragIn = true;
				invert = true;
			} else  if (this.mode == 'continue') {
				dragOut = true;
			} else if (this.mode == 'adjust') {
				dragOut = true;
			} else  if (this.mode == 'join') {
				dragIn = true;
				invert = true;
			} else  if (this.mode == 'convert') {
				dragIn = true;
				dragOut = true;
			}

			if (dragIn || dragOut) {
				var i, res, element, bind = this.profile.bind_node ? "node_" : "";

				if(this.profile.bind_generatrix)
					bind += "generatrix";

				if (invert)
					delta = delta.negate();

				if (dragIn && dragOut) {
					handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);
					this.currentSegment.handleOut = handlePos;
					this.currentSegment.handleIn = handlePos.negate();
				} else if (dragOut) {
					// upzp

					if (event.modifiers.shift) {
						delta = _editor.snap_to_angle(delta, Math.PI*2/8);
					}

					if(this.path.segments.length > 1)
						this.path.lastSegment.point = this.mouseStartPos.add(delta);
					else
						this.path.add(this.mouseStartPos.add(delta));

					// попытаемся привязать концы пути к профилям контура
					if(!this.start_binded){
						res = {distance: 10e9};
						for(i in _editor.project.activeLayer.children){
							element = _editor.project.activeLayer.children[i];
							if (element instanceof Profile &&
								_editor.project.check_distance(element, null, res, this.path.firstSegment.point, bind) === false ){
								this.path.firstSegment.point = res.point;
								break;
							}
						}
						this.start_binded = true;
					}
					res = {distance: 10e9};
					for(i in _editor.project.activeLayer.children){
						element = _editor.project.activeLayer.children[i];
						if (element instanceof Profile &&
							_editor.project.check_distance(element, null, res, this.path.lastSegment.point, bind) === false ){
							this.path.lastSegment.point = res.point;
							break;
						}
					}



					//this.currentSegment.handleOut = handlePos;
					//this.currentSegment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);
					this.currentSegment.handleIn = handlePos;
					this.currentSegment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}
				this.path.selected = true;
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;


}
ToolPen._extend(paper.Tool);

/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	var selected,
		_editor = paper,
		tool = this;

	ToolRuler.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'ruler',
		wnd: {
			caption: "Размеры и сдвиг",
			height: 280
		}
	};

	function tool_wnd(){

		var folder, opened = false, profile = tool.options,
			div=document.createElement("table"), table, input;

		function onclick(e){

		}

		$p.wsql.restore_options("editor", tool.options);

		tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);

		div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
			'<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly ></td><td></td></tr>' +
			'<tr><td></td><td align="center"></td><td></td></tr>';
		div.style.width = "130px";
		div.style.margin ="auto";
		table = div.firstChild.childNodes;

		$p.iface.add_button(table[0].childNodes[1], null,
			{name: "top", img: "/imgs/custom_field/align_top.png", title: $p.msg.align_set_top}).onclick = onclick;
		$p.iface.add_button(table[1].childNodes[0], null,
			{name: "left", img: "/imgs/custom_field/align_left.png", title: $p.msg.align_set_left}).onclick = onclick;
		$p.iface.add_button(table[1].childNodes[2], null,
			{name: "right", img: "/imgs/custom_field/align_right.png", title: $p.msg.align_set_right}).onclick = onclick;
		$p.iface.add_button(table[2].childNodes[1], null,
			{name: "bottom", img: "/imgs/custom_field/align_bottom.png", title: $p.msg.align_set_bottom}).onclick = onclick;

		tool.wnd.attachObject(div);

		input = table[1].childNodes[1];
		input.grid = {
			editStop: function (v) {

			},
			getPosition: function (v) {
				var offsetLeft = v.offsetLeft, offsetTop = v.offsetTop;
				while ( v = v.offsetParent ){
					offsetLeft += v.offsetLeft;
					offsetTop  += v.offsetTop;
				}
				return [offsetLeft + 7, offsetTop + 9];
			}
		};

		input.firstChild.onfocus = function (e) {
			tool.__calck = new eXcell_calck(this);
			tool.__calck.edit();
		};

	}

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {

		var hitSize = 4;
		tool.hitItem = null;

		if (event.point)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill:true, stroke:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile) {
			_editor.canvas_cursor('cursor-arrow-ruler');
		} else {
			_editor.canvas_cursor('cursor-arrow-ruler-light');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-ruler-light');

			tool_wnd();
		},
		deactivate: function() {

			tool.detache_wnd();

		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof Profile,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;

				if (is_profile) {

					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						_editor.project.deselectAll();
						item.selected = true;
					}
				}

				// Если выделено 2 элемента, рассчитаем сдвиг
				if((selected = _editor.project.selectedItems).length == 2){

				}


			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				//if (!event.modifiers.shift)
				//tool.detache_wnd();

			}

		},
		mouseup: function(event) {


		},
		mousedrag: function(event) {

		},
		mousemove: function(event) {
			this.hitTest(event);
		}
	});

	return tool;

}
ToolRuler._extend(paper.Tool);

/**
 * Свойства и перемещение элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_select_elm
 */

/**
 * Свойства и перемещение элемента
 */
function ToolSelectElm(){

	var _editor = paper,
		tool = this;

	ToolSelectElm.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;
	tool.duplicates = null;
	tool.options = {
		name: 'select_elm',
		wnd: {
			caption: "Свойства элемента",
			height: 380
		}};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		// var hitSize = 4.0; // / view.zoom;
		var hitSize = 6;
		tool.hitItem = null;

		// Hit test items.
		if (event.point){
			tool.hitItem = _editor.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			if (!tool.hitItem)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, tolerance: hitSize });
		}

		if (tool.hitItem) {
			if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-black-shape');
				}
			}
		} else {
			_editor.canvas_cursor('cursor-arrow-black');
		}

		return true;
	};
	tool.on({
		activate: function() {

			_editor.tb_left.select(tool.options.name);

			_editor.canvas_cursor('cursor-arrow-black');
			_editor.clear_selection_bounds();

		},
		deactivate: function() {
			_editor.hide_selection_bounds();
			tool.detache_wnd();

		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof Profile,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;
				if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						_editor.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = 'move-shapes';
						_editor.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = _editor.capture_selection_state();
					}
				}
				if(is_profile)
					tool.attache_wnd(tool.hitItem.item.parent, _editor);

				_editor.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

			}
		},
		mouseup: function(event) {
			if (this.mode == 'move-shapes') {
				if (this.changed) {
					//_editor.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}
				this.duplicates = null;
			} else if (this.mode == 'box-select') {
				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					_editor.project.deselectAll();

				var selectedPaths = _editor.paths_intersecting_rect(box);
				for (var i = 0; i < selectedPaths.length; i++)
					selectedPaths[i].selected = !selectedPaths[i].selected;
			}

			_editor.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-black-shape');
				}
			}
		},
		mousedrag: function(event) {
			if (this.mode == 'move-shapes') {

				this.changed = true;

				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);

				_editor.restore_selection_state(this.originalContent);
				_editor.project.move_points(delta, true);
				_editor.clear_selection_bounds();

			} else if (this.mode == 'box-select') {
				_editor.drag_rect(this.mouseStartPos, event.point);
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, path, point, newpath;
			if (event.key == '+') {

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];

					if(path.parent instanceof Profile){

						point = path.getPointAt(path.length * 0.5);
						path.parent.rays.clear();
						newpath = path.split(path.length * 0.5);
						new Profile({generatrix: newpath, proto: path.parent});
					}
				}

				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					if(path.parent instanceof Profile){
						path = path.parent;
						path.removeChildren();
						path.remove();
					}else{
						path.remove();
					}
				}

				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

			} else if (event.key == 'left') {
				_editor.project.move_points(new paper.Point(-10, 0), true);

			} else if (event.key == 'right') {
				_editor.project.move_points(new paper.Point(10, 0), true);

			} else if (event.key == 'up') {
				_editor.project.move_points(new paper.Point(0, -10), true);

			} else if (event.key == 'down') {
				_editor.project.move_points(new paper.Point(0, 10), true);

			}
		}
	});

	return tool;
}
ToolSelectElm._extend(paper.Tool);
/**
 * Свойства и перемещение узлов элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module tool_select_node
 */

function ToolSelectNode(){

	var _editor = paper,
		tool = this;

	ToolSelectNode.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.originalHandleIn = null;
	tool.originalHandleOut = null;
	tool.changed = false;
	tool.minDistance = 10;

	tool.options = {
		name: 'select_node',
		wnd: {
			caption: "Свойства элемента",
			height: 380
		}};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		if (mode != 'tool-direct-select')
			return;
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		var hitSize = 4;
		var hit = null;
		tool.hitItem = null;

		if (event.point){

			// Hit test items.
			//stroke:true
			tool.hitItem = _editor.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			if (!tool.hitItem)
				tool.hitItem = _editor.project.hitTest(event.point, { fill:true, guides: false, tolerance: hitSize });

			// Hit test selected handles
			hit = _editor.project.hitTest(event.point, { selected: true, handles: true, tolerance: hitSize });
			if (hit)
				tool.hitItem = hit;

			// Hit test points
			hit = _editor.project.hitPoints(event.point);

			if (hit){
				if(hit.item.parent instanceof Profile){
					if(hit.item.parent.generatrix === hit.item)
						tool.hitItem = hit;
				}else
					tool.hitItem = hit;
			}

		}

		if (tool.hitItem) {
			if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-white-shape');
				}
			} else if (tool.hitItem.type == 'segment' || tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
				if (tool.hitItem.segment.selected) {
					_editor.canvas_cursor('cursor-arrow-small-point');
				} else {
					_editor.canvas_cursor('cursor-arrow-white-point');
				}
			}
		} else {
			_editor.canvas_cursor('cursor-arrow-white');
		}

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-arrow-white');
		},
		deactivate: function() {
			_editor.clear_selection_bounds();
			tool.detache_wnd();
		},
		mousedown: function(event) {
			this.mode = null;
			this.changed = false;

			if(event.event.which == 3){

			}

			if (tool.hitItem) {
				var is_profile = tool.hitItem.item.parent instanceof Profile,
					item = is_profile ? tool.hitItem.item.parent.generatrix : tool.hitItem.item;
				if (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke') {
					if (event.modifiers.shift) {
						item.selected = !item.selected;
					} else {
						_editor.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = 'move-shapes';
						_editor.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = _editor.capture_selection_state();
					}
				} else if (tool.hitItem.type == 'segment') {
					if (event.modifiers.shift) {
						tool.hitItem.segment.selected = !tool.hitItem.segment.selected;
					} else {
						if (!tool.hitItem.segment.selected){
							_editor.project.deselect_all_points();
							_editor.project.deselectAll();
						}
						tool.hitItem.segment.selected = true;
					}
					if (tool.hitItem.segment.selected) {
						this.mode = consts.move_points;
						this.mouseStartPos = event.point.clone();
						this.originalContent = _editor.capture_selection_state();
					}
				} else if (tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
					this.mode = consts.move_handle;
					this.mouseStartPos = event.point.clone();
					this.originalHandleIn = tool.hitItem.segment.handleIn.clone();
					this.originalHandleOut = tool.hitItem.segment.handleOut.clone();

					/*				if (tool.hitItem.type == 'handle-out') {
					 this.originalHandlePos = tool.hitItem.segment.handleOut.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleIn.length;
					 } else {
					 this.originalHandlePos = tool.hitItem.segment.handleIn.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleOut.length;
					 }*/
//				this.originalContent = capture_selection_state(); // For some reason this does not work!
				}

				if(is_profile)
					tool.attache_wnd(tool.hitItem.item.parent, _editor);

				_editor.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				if (!event.modifiers.shift)
					tool.detache_wnd();
			}
		},
		mouseup: function(event) {
			if (this.mode == 'move-shapes') {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}
			} else if (this.mode == consts.move_points) {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Points");
				}
			} else if (this.mode == consts.move_handle) {
				if (this.changed) {
					_editor.clear_selection_bounds();
					//undo.snapshot("Move Handle");
				}
			} else if (this.mode == 'box-select') {
				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					_editor.project.deselectAll();

				var selectedSegments = _editor.segments_in_rect(box);
				if (selectedSegments.length > 0) {
					for (var i = 0; i < selectedSegments.length; i++) {
						selectedSegments[i].selected = !selectedSegments[i].selected;
					}
				} else {
					var selectedPaths = _editor.paths_intersecting_rect(box);
					for (var i = 0; i < selectedPaths.length; i++)
						selectedPaths[i].selected = !selectedPaths[i].selected;
				}
			}

			_editor.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					_editor.canvas_cursor('cursor-arrow-small');
				} else {
					_editor.canvas_cursor('cursor-arrow-white-shape');
				}
			}
		},
		mousedrag: function(event) {
			this.changed = true;

			if (this.mode == 'move-shapes') {
				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);

				_editor.restore_selection_state(this.originalContent);
				_editor.project.move_points(delta, true);
				_editor.clear_selection_bounds();

			} else if (this.mode == consts.move_points) {
				_editor.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift) {
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);
				}
				_editor.restore_selection_state(this.originalContent);
				_editor.project.move_points(delta);
				_editor.purge_selection();


			} else if (this.mode == consts.move_handle) {

				var delta = event.point.subtract(this.mouseStartPos),
					noti = {
						type: consts.move_handle,
						profiles: [tool.hitItem.item.parent],
						points: []};

				if (tool.hitItem.type == 'handle-out') {
					var handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleOut = handlePos;
					tool.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					var handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = _editor.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleIn = handlePos;
					tool.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}

				noti.profiles[0].rays.clear();
				noti.profiles[0].parent.notify(noti);

				_editor.purge_selection();

			} else if (this.mode == 'box-select') {
				_editor.drag_rect(this.mouseStartPos, event.point);
			}
		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, j, path, segment, index, point, handle, do_select;
			if (event.key == '+') {

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					do_select = false;
					if(path.parent instanceof Profile){
						for (j = 0; j < path.segments.length; j++) {
							segment = path.segments[j];
							if (segment.selected){
								do_select = true;
								break;
							}
						}
						if(!do_select){
							j = 0;
							segment = path.segments[j];
							do_select = true;
						}
					}
					if(do_select){
						index = (j < (path.segments.length - 1) ? j + 1 : j);
						point = segment.curve.getPointAt(0.5, true);
						handle = segment.curve.getTangentAt(0.5, true).normalize(segment.curve.length / 4);
						path.insert(index, new paper.Segment(point, handle.negate(), handle));
					}
				}

				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

				// удаление сегмента или элемента
			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					path = selected[i];
					do_select = false;
					if(path.parent instanceof Profile){
						for (j = 0; j < path.segments.length; j++) {
							segment = path.segments[j];
							do_select = do_select || segment.selected;
							if (segment.selected && segment != path.firstSegment && segment != path.lastSegment ){
								path.removeSegment(j);

								// пересчитываем
								path.parent.x1 = path.parent.x1;
								break;
							}
						}
						// если не было обработки узлов - удаляем элемент
						if(!do_select){
							path = path.parent;
							path.removeChildren();
							path.remove();
						}
					}
				}
				// Prevent the key event from bubbling
				event.event.preventDefault();
				return false;

			} else if (event.key == 'left') {
				_editor.project.move_points(new paper.Point(-10, 0));

			} else if (event.key == 'right') {
				_editor.project.move_points(new paper.Point(10, 0));

			} else if (event.key == 'up') {
				_editor.project.move_points(new paper.Point(0, -10));

			} else if (event.key == 'down') {
				_editor.project.move_points(new paper.Point(0, 10));

			}
		}
	});

	return tool;

}
ToolSelectNode._extend(paper.Tool);
/**
 * Ввод и редактирование произвольного текста
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_text
 */

function ToolText(){

	var _editor = paper,
		tool = this;

	ToolText.superclass.constructor.call(this);

	tool.mouseStartPos = new paper.Point();
	tool.mode = null;
	tool.hitItem = null;
	tool.originalContent = null;
	tool.changed = false;

	tool.options = {
		name: 'text',
		wnd: {
			caption: "Произвольный текст",
			width: 290,
			height: 290
		}
	};

	tool.resetHot = function(type, event, mode) {
	};
	tool.testHot = function(type, event, mode) {
		/*	if (mode != 'tool-select')
		 return false;*/
		return tool.hitTest(event);
	};
	tool.hitTest = function(event) {
		var hitSize = 4;

		// хит над текстом обрабатываем особо
		tool.hitItem = _editor.project.hitTest(event.point, { class: paper.TextItem, bounds: true, fill: true, stroke: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = _editor.project.hitTest(event.point, { fill: true, stroke: false, tolerance: hitSize });

		if (tool.hitItem){
			if(tool.hitItem.item instanceof paper.PointText)
				_editor.canvas_cursor('cursor-text');     // указатель с черным Т
			else
				_editor.canvas_cursor('cursor-text-add'); // указатель с серым Т
		} else
			_editor.canvas_cursor('cursor-text-select');  // указатель с вопросом

		return true;
	};
	tool.on({
		activate: function() {
			_editor.tb_left.select(tool.options.name);
			_editor.canvas_cursor('cursor-text-select');
		},
		deactivate: function() {
			_editor.hide_selection_bounds();
			tool.detache_wnd();
		},
		mousedown: function(event) {
			this.text = null;
			this.changed = false;

			_editor.project.deselectAll();
			this.mouseStartPos = event.point.clone();

			if (tool.hitItem) {

				if(tool.hitItem.item instanceof paper.PointText){
					this.text = tool.hitItem.item;
					this.text.selected = true;

				}else {
					this.text = new FreeText({
						parent: tool.hitItem.item,
						point: this.mouseStartPos,
						content: '...',
						selected: true
					});
				}

				this.textStartPos = this.text.point;

				// включить диалог свойст текстового элемента
				if(!tool.wnd || !tool.wnd.elmnts){
					$p.wsql.restore_options("editor", tool.options);
					tool.wnd = $p.iface.dat_blank(_editor._dxw, tool.options.wnd);
					tool._grid = tool.wnd.attachHeadFields({
						obj: this.text
					});
				}else{
					tool._grid.attach({obj: this.text})
				}

			}else
				tool.detache_wnd();

		},
		mouseup: function(event) {

			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
			}

			_editor.canvas_cursor('cursor-arrow-lay');

		},
		mousedrag: function(event) {

			if (this.text) {
				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = _editor.snap_to_angle(delta, Math.PI*2/8);

				this.text.point = this.textStartPos.add(delta);
				this.text.refresh_pos();
			}

		},
		mousemove: function(event) {
			this.hitTest(event);
		},
		keydown: function(event) {
			var selected, i, text;
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = _editor.project.selectedItems;
				for (i = 0; i < selected.length; i++) {
					text = selected[i];
					if(text instanceof FreeText){
						text.text = "";
						setTimeout(function () {
							_editor.view.update();
						}, 100);
					}
				}

				event.preventDefault();
				return false;
			}
		}
	});

	return tool;


}
ToolText._extend(paper.Tool);

/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  editor
 */

/**
 * ### Графический редактор
 * @class Editor
 * @constructor
 * @extends paper.PaperScope
 * @param pwnd {dhtmlXLayoutCell} - ячейка dhtmlx, в которой будут размещены редактор и изделия
 */
function Editor(pwnd){

	acn = $p.enm.cnn_types.acn;

	var _editor = this,

		/**
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 * @type {Undo}
		 */
		undo = new function Undo(){

			this.clear = function () {

			}
		},

		selectionBounds = null,
		selectionBoundsShape = null,
		drawSelectionBounds = 0;

	Editor.superclass.constructor.call(_editor);
	_editor.activate();

	consts.tune_paper(_editor.settings);

	_editor._pwnd = pwnd;
	_editor._layout = pwnd.attachLayout({
		pattern: "2U",
		cells: [{
			id: "a",
			text: "Изделие",
			header: false
		}, {
			id: "b",
			text: "Инструменты",
			collapsed_text: "Инструменты",
			width: (pwnd.getWidth ? pwnd.getWidth() : pwnd.cell.offsetWidth) > 1200 ? 360 : 240
		}],
		offsets: { top: 0, right: 0, bottom: 0, left: 0}
	});         // разбивка на канвас и аккордион
	_editor._wrapper = document.createElement('div');                  // контейнер канваса
	_editor._layout.cells("a").attachObject(_editor._wrapper);
	_editor._dxw = _editor._layout.dhxWins;                             // указатель на dhtmlXWindows
	_editor._dxw.attachViewportTo(_editor._wrapper);

	_editor._wrapper.oncontextmenu = function (event) {
		event.preventDefault();
		return $p.cancel_bubble(event);
	};

	//_editor._dxw.attachViewportTo(eid);
	//_editor._dxw.setSkin(dhtmlx.skin);
	_editor._acc = this._layout.cells("b").attachAccordion({           // аккордион со свойствами
		icons_path: dhtmlx.image_path,
		multi_mode: true,
		dnd:        true
	});

	_editor.toString = function(){ return $p.msg.bld_constructor; };


	/**
	 * Панель выбора инструментов рисовалки
	 * @type OTooolBar
	 */
	_editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '24px', left: '3px', name: 'left', height: '310px',
		image_path: 'dist/imgs/',
		buttons: [
			{name: 'select_elm', img: 'icon-arrow-black.png', title: $p.injected_data['select_elm.html']},
			{name: 'select_node', img: 'icon-arrow-white.png', title: $p.injected_data['select_node.html']},
			{name: 'pan', img: 'icon-hand.png', title: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
			{name: 'zoom_fit', img: 'cursor-zoom.png', title: 'Вписать в окно'},
			{name: 'pen', img: 'cursor-pen-freehand.png', title: 'Добавить профиль'},
			{name: 'lay_impost', img: 'cursor-lay-impost.png', title: 'Вставить раскладку или импосты'},
			{name: 'arc', img: 'cursor-arc-r.png', title: 'Арка {Crtl}, {Alt}, {Пробел}'},
			{name: 'ruler', img: 'ruler_ui.png', title: 'Позиционирование и сдвиг'},
			{name: 'grid', img: 'grid.png', title: 'Таблица координат'},
			{name: 'line', img: 'line.png', title: 'Произвольная линия'},
			{name: 'text', img: 'text.png', title: 'Произвольный текст'}
		], onclick: function (name) {
			return _editor.select_tool(name);
		}
	});

	/**
	 * Верхняя панель инструментов
	 * @type {OTooolBar}
	 */
	_editor.tb_top = new $p.iface.OTooolBar({wrapper: _editor._wrapper, width: '250px', height: '28px', top: '3px', left: '50px', name: 'top',
		image_path: 'dist/imgs/',
		buttons: [
			{name: 'open', text: '<i class="fa fa-file-o fa-lg"></i>', title: 'Открыть изделие', float: 'left'},
			{name: 'save_close', text: '<i class="fa fa-floppy-o fa-lg"></i>', title: 'Рассчитать, записать и закрыть', float: 'left'},
			{name: 'calck', img: 'calculate.png', title: 'Рассчитать и записать данные', float: 'left'},
			{name: 'standard_form', img: 'standard_form.png', title: 'Добавить типовую форму', float: 'left',
				sub: {
					buttons: [
						{name: 'square', img: 'square.png', float: 'left'},
						{name: 'triangle1', img: 'triangle1.png', float: 'right'},
						{name: 'triangle2', img: 'triangle2.png', float: 'left'},
						{name: 'triangle3', img: 'triangle3.png', float: 'right'},
						{name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
						{name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
						{name: 'circle',    img: 'circle.png', float: 'left'},
						{name: 'arc1',      img: 'arc1.png', float: 'right'},
						{name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
						{name: 'trapeze2',  img: 'trapeze2.png', float: 'right'},
						{name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
						{name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
						{name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
						{name: 'trapeze6',  img: 'trapeze6.png', float: 'right'}]
				}
			},
			{name: 'stamp', img: 'stamp.png', title: 'Загрузить из типового блока', float: 'left'},
			{name: 'back', text: '<i class="fa fa-undo fa-lg"></i>', title: 'Шаг назад', float: 'left'},
			{name: 'rewind', text: '<i class="fa fa-repeat fa-lg"></i>', title: 'Шаг вперед', float: 'left'},
			{name: 'close', text: '<i class="fa fa-times fa-lg"></i>', title: 'Закрыть без сохранения', float: 'right'}


		], onclick: function (name) {
			switch(name) {
				case 'open':
					_editor.open();
					break;

				case 'save_close':
					if(_editor.project)
						_editor.project.save_coordinates(true);
					break;

				case 'close':
					if(_editor._pwnd._on_close)
						_editor._pwnd._on_close(_editor.project ? _editor.project.ox : null);
					break;

				case 'calck':
					if(_editor.project)
						_editor.project.save_coordinates(true);
					break;

				case 'stamp':
					_editor.load_stamp();
					break;

				case 'back':
					$p.msg.show_msg(name);
					break;

				case 'rewind':
					$p.msg.show_msg(name);
					break;

				case 'square':
					$p.msg.show_msg(name);
					break;

				case 'triangle1':
					$p.msg.show_msg(name);
					break;

				case 'triangle3':
					$p.msg.show_msg(name);
					break;

				case 'triangle3':
					$p.msg.show_msg(name);
					break;

				default:
					$p.msg.show_msg(name);
					break;
			}
		}});

	/**
	 * Правая панель инструментов
	 * @type {*|OTooolBar}
	 */
	_editor.tb_right = new $p.iface.OTooolBar({wrapper: _editor._wrapper, width: '200px', height: '28px', top: '3px', right: '3px', name: 'right',
		image_path: 'dist/imgs/',
		buttons: [
				{name: 'layers', img: 'layers.png', text: 'Слои', float: 'left', width: '90px',
					sub: {
						width: '190px',
						height: '90px',
						buttons: [
							{name: 'new_layer', img: 'new_layer.png', width: '182px', text: 'Добавить конструкцию'},
							{name: 'new_stv', img: 'triangle1.png', width: '182px', text: 'Добавить створку'},
							{name: 'drop_layer', img: 'trash.gif', width: '182px', text: 'Удалить слой'}
						]
					}
				},
				{name: 'elm', img: 'icon-arrow-black.png', text: 'Элементы', float: 'left', width: '90px',
					sub: {
						width: '230px',
						height: '160px',
						align: 'right',
						buttons: [
							{name: 'left', img: 'align_left.png', width: '222px', text: $p.msg.align_node_left},
							{name: 'bottom', img: 'align_bottom.png', width: '222px', text: $p.msg.align_node_bottom},
							{name: 'top', img: 'align_top.png', width: '222px', text: $p.msg.align_node_top},
							{name: 'right', img: 'align_right.png', width: '222px', text: $p.msg.align_node_right},
							{name: 'delete', img: 'trash.gif', width: '222px', text: 'Удалить элемент'}
						]
					}
				}
			], onclick: function (name) {
				if(name == 'new_layer')
					$p.msg.show_not_implemented();

				else if(name == 'drop_layer')
					_editor.tree_layers.drop_layer();

				else if(['left', 'bottom', 'top', 'right'].indexOf(name) != -1)
					_editor.profile_align(name);

				return false;
			}
		});

	/**
	 * слои в аккордионе
	 */
	_editor.tree_layers = function () {

		var wid = 'wnd_dat_' + dhx4.newId(),
			acc_cell, wnd, tree, lid;

		_editor._acc.addItem(
			wid,
			"Слои",
			true,
			"*");
		acc_cell = _editor._acc.cells(wid);

		function load_layer(layer){
			lid = (layer.parent ? "Створка №" : "Рама №") + layer.cnstr + " " + layer.bounds.width.toFixed() + "х" + layer.bounds.height.toFixed();

			tree.insertNewItem(
				layer.parent ? layer.parent.cnstr : 0,
				layer.cnstr,
				lid);


			layer.children.forEach(function (l) {
				if(l instanceof Contour)
					load_layer(l);

			});

		}

		function observer(changes){

			var synced;

			changes.forEach(function(change){
				if ("constructions" == change.tabular){

					synced = true;

					// добавляем слои изделия
					tree.deleteChildItems(0);
					_editor.project.layers.forEach(function (l) {
						if(l instanceof Contour){
							load_layer(l);
							tree.setSubChecked(l.cnstr, true);
						}

					});

					// служебный слой размеров
					tree.insertNewItem(0, "sizes", "Размерные линии");

					// служебный слой визуализации
					tree.insertNewItem(0, "visualization", "Визуализация доп. элементов");

					// служебный слой текстовых комментариев
					tree.insertNewItem(0, "text", "Комментарии");

				}
			});
		}

		tree = acc_cell.attachTree();
		tree.setImagePath(dhtmlx.image_path + 'dhxtree_web/');
		tree.setIconsPath(dhtmlx.image_path + 'dhxtree_web/');
		tree.enableCheckBoxes(true, true);
		tree.enableTreeImages(false);

		// Гасим-включаем слой по чекбоксу
		tree.attachEvent("onCheck", function(id, state){
			var l = _editor.project.getItem({cnstr: Number(id)}),
				sub = tree.getAllSubItems(id);

			if(l)
				l.visible = !!state;

			if(typeof sub == "string")
				tree.setCheck(sub, state);
			else
				sub.forEach(function (id) {
					tree.setCheck(id, state);
				});

		});

		// делаем выделенный слой активным
		tree.attachEvent("onSelect", function(id){
			var l = _editor.project.getItem({cnstr: Number(id)});
			if(l)
				l.activate();
		});

		//tree.enableDragAndDrop(true, false);
		//tree.setDragHandler(function(){ return false; });
		//tree.dragger.addDragLanding(tb_bottom.cell, {
		//	_drag : function(sourceHtmlObject, dhtmlObject, targetHtmlObject){
		//		tb_bottom.buttons["delete"].style.backgroundColor="";
		//		$p.msg.show_msg({type: "alert-warning",
		//			text: sourceHtmlObject.parentObject.id,
		//			title: $p.msg.main_title});
		//	},
		//	_dragIn : function(dst, src, x, y, ev){
		//		if(tb_bottom.buttons["delete"] == ev.target || tb_bottom.buttons["delete"] == ev.target.parentElement){
		//			tb_bottom.buttons["delete"].style.backgroundColor="#fffacd";
		//			return dst;
		//		}
		//	},
		//	_dragOut : function(htmlObject){
		//		tb_bottom.buttons["delete"].style.backgroundColor="";
		//		return this;
		//	}
		//});


		return {

			drop_layer: function () {
				var cnstr = tree.getSelectedItemId(), l;
				if(cnstr){
					l = _editor.project.getItem({cnstr: Number(cnstr)});
				}else if(l = _editor.project.activeLayer){
					cnstr = l.cnstr;
				}
				if(cnstr && l){
					tree.deleteItem(cnstr);
					l.remove();
					setTimeout(_editor.project.zoom_fit, 100);
				}
			},

			attache: function () {
				// начинаем следить за объектом
				Object.observe(_editor.project._noti, observer, ["rows"]);
			},

			unload: function () {
				Object.unobserve(_editor.project._noti, observer);
			}
		}
	}();

	/**
	 * свойства в аккордионе
	 */
	_editor.props = function () {
		var wid = 'wnd_dat_' + dhx4.newId(),
			acc_cell, wnd;

		_editor._acc.addItem(
			wid,
			"Изделие",
			true,
			"*");
		acc_cell = _editor._acc.cells(wid);

		return {

			attache: function () {
				acc_cell.attachHeadFields({
					obj: _editor.project._dp,
					oxml: {
						"Свойства": ["sys", "clr", "len", "height", "s"],
						"Строка заказа": ["quantity", "price_internal", "discount_percent_internal", "discount_percent", "price", "amount"]

					},
					ts: "extra_fields",
					ts_title: "Свойства",
					selection: {cnstr: 0, hide: {not: true}}
				});
			},

			unload: function () {
				acc_cell.unload();
			}
		}
	}();

	_editor.clear_selection_bounds = function() {
		if (selectionBoundsShape)
			selectionBoundsShape.remove();
		selectionBoundsShape = null;
		selectionBounds = null;
	};

	_editor.hide_selection_bounds = function() {
		if (drawSelectionBounds > 0)
			drawSelectionBounds--;
		if (drawSelectionBounds == 0) {
			if (selectionBoundsShape)
				selectionBoundsShape.visible = false;
		}
	};

	// Returns serialized contents of selected items.
	_editor.capture_selection_state = function() {
		var originalContent = [];
		var selected = _editor.project.selectedItems;
		for (var i = 0; i < selected.length; i++) {
			var item = selected[i];
			if (item.guide) continue;
			var orig = {
				id: item.id,
				json: item.exportJSON({ asString: false }),
				selectedSegments: []
			};
			originalContent.push(orig);
		}
		return originalContent;
	};

	// Restore the state of selected items.
	_editor.restore_selection_state = function(originalContent) {
		for (var i = 0; i < originalContent.length; i++) {
			var orig = originalContent[i];
			var item = this.project.getItem({id: orig.id});
			if (!item)
				continue;
			// HACK: paper does not retain item IDs after importJSON,
			// store the ID here, and restore after deserialization.
			var id = item.id;
			item.importJSON(orig.json);
			item._id = id;
		}
	};

	/**
	 * Returns all items intersecting the rect.
	 * Note: only the item outlines are tested
	 */
	_editor.paths_intersecting_rect = function(rect) {
		var paths = [];
		var boundingRect = new paper.Path.Rectangle(rect);

		function checkPathItem(item) {
			var children = item.children;
			if (item.equals(boundingRect))
				return;
			if (!rect.intersects(item.bounds))
				return;
			if (item instanceof paper.PathItem ) {

				if(item.parent instanceof Profile){
					if(item != item.parent.generatrix)
						return;

					if (rect.contains(item.bounds)) {
						paths.push(item);
						return;
					}
					var isects = boundingRect.getIntersections(item);
					if (isects.length > 0)
						paths.push(item);
				}

			} else {
				for (var j = children.length-1; j >= 0; j--)
					checkPathItem(children[j]);
			}
		}

		for (var i = 0, l = _editor.project.layers.length; i < l; i++) {
			var layer = _editor.project.layers[i];
			checkPathItem(layer);
		}

		boundingRect.remove();

		return paths;
	};

	/**
	 * Create pixel perfect dotted rectable for drag selections
	 * @param p1
	 * @param p2
	 * @return {exporters.CompoundPath}
	 */
	_editor.drag_rect = function(p1, p2) {
		var half = new paper.Point(0.5 / _editor.view.zoom, 0.5 / _editor.view.zoom);
		var start = p1.add(half);
		var end = p2.add(half);
		var rect = new paper.CompoundPath();
		rect.moveTo(start);
		rect.lineTo(new paper.Point(start.x, end.y));
		rect.lineTo(end);
		rect.moveTo(start);
		rect.lineTo(new paper.Point(end.x, start.y));
		rect.lineTo(end);
		rect.strokeColor = 'black';
		rect.strokeWidth = 1.0 / _editor.view.zoom;
		rect.dashOffset = 0.5 / _editor.view.zoom;
		rect.dashArray = [1.0 / _editor.view.zoom, 1.0 / _editor.view.zoom];
		rect.removeOn({
			drag: true,
			up: true
		});
		rect.guide = true;
		return rect;
	};



	/**
	 * Это не настоящий инструмент, а команда вписывания в окно
	 */
	new function ZoomFit() {

		var tool = new paper.Tool();
		tool.options = {name: 'zoom_fit'};
		tool.on({
			activate: function () {
				_editor.project.zoom_fit();

				var previous = _editor.tb_left.get_selected();

				if(previous)
					return _editor.select_tool(previous.replace("left_", ""));
			}
		});

		return tool;
	};

	/**
	 * Свойства и перемещение элемента
	 */
	new ToolSelectElm();

	/**
	 * Свойства и перемещение узлов элемента
	 */
	new ToolSelectNode();

	/**
	 * Панорама и масштабирование с колёсиком и без колёсика
	 */
	new ToolPan();

	/**
	 * Манипуляции с арками (дуги правильных окружностей)
	 */
	new ToolArc();

	/**
	 * Добавление (рисование) профилей
	 */
	new ToolPen();

	/**
	 * Вставка раскладок и импостов
	 */
	new ToolLayImpost();

	/**
	 * Инструмент произвольного текста
	 */
	new ToolText();

	/**
	 * Относительное позиционирование и сдвиг
	 */
	new ToolRuler();


	this.tools[2].activate();

}
Editor._extend(paper.PaperScope);

Editor.prototype.__define({

	/**
	 * Устанавливает икну курсора для всех канвасов редактора
	 * @method canvas_cursor
	 */
	canvas_cursor: {
		value: function (name) {
			for(var p in this.projects){
				var _scheme = this.projects[p];
				for(var i=0; i<_scheme.view.element.classList.length; i++){
					var class_name = _scheme.view.element.classList[i];
					if(class_name == name)
						return;
					else if((/\bcursor-\S+/g).test(class_name))
						_scheme.view.element.classList.remove(class_name);
				}
				_scheme.view.element.classList.add(name);
			}
		}
	},

	select_tool: {
		value: function (name) {
			for(var t in this.tools){
				if(this.tools[t].options.name == name)
					return this.tools[t].activate();
			}
		}
	},

	/**
	 * ### Открывает изделие для редактирования
	 * MDI пока не реализовано. Изделие загружается в текущий проект
	 * @method open
	 * @param [ox] {String|DataObj} - ссылка или объект продукции
	 */
	open: {
		value: function (ox) {
			var _editor = this;

			if(!_editor.project){

				var _canvas = document.createElement('canvas'); // собственно, канвас
				_editor._wrapper.appendChild(_canvas);

				var _scheme = new Scheme(_canvas);

				/**
				 * Подписываемся на события изменения размеров
				 */
				function pwnd_resize_finish(){
					_editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
				}

				_editor._layout.attachEvent("onResizeFinish", pwnd_resize_finish);

				_editor._layout.attachEvent("onPanelResizeFinish", pwnd_resize_finish);

				if(_editor._pwnd instanceof  dhtmlXWindowsCell)
					_editor._pwnd.attachEvent("onResizeFinish", pwnd_resize_finish);

				pwnd_resize_finish();


				/**
				 * Объект для реализации функций масштабирования
				 * @type {StableZoom}
				 */
				var pan_zoom = new function StableZoom(){

					function changeZoom(oldZoom, delta) {
						var factor;
						factor = 1.05;
						if (delta < 0) {
							return oldZoom * factor;
						}
						if (delta > 0) {
							return oldZoom / factor;
						}
						return oldZoom;
					}

					var panAndZoom = this;

					dhtmlxEvent(_canvas, "mousewheel", function(evt) {
						var mousePosition, newZoom, offset, viewPosition, _ref1;
						if (event.shiftKey) {
							_editor.view.center = panAndZoom.changeCenter(_editor.view.center, event.deltaX, event.deltaY, 1);
							return event.preventDefault();
						} else if (event.altKey) {
							mousePosition = new paper.Point(event.offsetX, event.offsetY);
							viewPosition = _editor.view.viewToProject(mousePosition);
							_ref1 = panAndZoom.changeZoom(_editor.view.zoom, event.deltaY, _editor.view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
							_editor.view.zoom = newZoom;
							_editor.view.center = _editor.view.center.add(offset);
							event.preventDefault();
							return _editor.view.draw();
						}
					});

					this.changeZoom = function(oldZoom, delta, c, p) {
						var a, beta, newZoom, pc;
						newZoom = changeZoom.call(this, oldZoom, delta);
						beta = oldZoom / newZoom;
						pc = p.subtract(c);
						a = p.subtract(pc.multiply(beta)).subtract(c);
						return [newZoom, a];
					};

					this.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
						var offset;
						offset = new paper.Point(deltaX, -deltaY);
						offset = offset.multiply(factor);
						return oldCenter.add(offset);
					};
				};

				_editor.tree_layers.attache();
				_editor.props.attache();
			}

			if(!ox){
				// последовательно выбираем заказ и изделие
				$p.cat.characteristics.form_selection({
					initial_value: $p.job_prm.demo.production,
					on_select: function (sval) {
						_editor.project.load(sval);
					}
				});
			}else
				_editor.project.load(ox);
		}
	},

	/**
	 * ### (Пере)заполняет изделие данными типового блока
	 * Вызывает диалог выбора типового блока и перезаполняет продукцию данными выбора
	 * @method load_stamp
	 * @param confirmed {Boolean} - подавляет показ диалога подтверждения перезаполнения
	 */
	load_stamp: {
		value: function(confirmed){

			if(this.project.ox.elm_str && !confirmed){
				dhtmlx.confirm({
					title: $p.msg.bld_from_blocks_title,
					text: $p.msg.bld_from_blocks,
					cancel: "Отмена",
					callback: function(btn) {
						if(btn)
							load_stamp(true);
					}
				});
				return;
			}

			$p.cat.base_blocks.form_selection({
				o: this.project.ox,
				wnd: this.project._pwnd,
				_scheme: this.project,
				on_select: this.project.load_stamp
			}, {
				initial_value: null, // TODO: возможно, надо запоминать типовой блок в изделии?
				parent: $p.wsql.get_user_param("base_blocks_folder") ? $p.wsql.get_user_param("base_blocks_folder") : null
			});
		}
	},

	/**
	 * Returns path points which are contained in the rect
	 * @param rect
	 * @returns {Array}
	 */
	segments_in_rect: {
		value: 	function(rect) {
			var segments = [];

			function checkPathItem(item) {
				if (item._locked || !item._visible || item._guide)
					return;
				var children = item.children;
				if (!rect.intersects(item.bounds))
					return;
				if (item instanceof paper.Path) {

					if(item.parent instanceof Profile){
						if(item != item.parent.generatrix)
							return;

						for (var i = 0; i < item.segments.length; i++) {
							if (rect.contains(item.segments[i].point))
								segments.push(item.segments[i]);
						}
					}

				} else {
					for (var j = children.length-1; j >= 0; j--)
						checkPathItem(children[j]);
				}
			}

			for (var i = this.project.layers.length - 1; i >= 0; i--) {
				checkPathItem(this.project.layers[i]);
			}

			return segments;
		}
	},

	purge_selection: {
		value: 	function(){
			var selected = this.project.selectedItems, deselect = [];
			for (var i = 0; i < selected.length; i++) {
				var path = selected[i];
				if(path.parent instanceof Profile && path != path.parent.generatrix)
					deselect.push(path);
			}
			while(selected = deselect.pop())
				selected.selected = false;
		}
	},

	profile_align: {
		value: 	function(name){
			var minmax = {min: {}, max: {}},
				profile = paper.tool.profile;

			if(!profile)
				return;

			minmax.min.x = Math.min(profile.x1, profile.x2);
			minmax.min.y = Math.min(profile.y1, profile.y2);
			minmax.max.x = Math.max(profile.x1, profile.x2);
			minmax.max.y = Math.max(profile.y1, profile.y2);
			minmax.max.dx = minmax.max.x - minmax.min.x;
			minmax.max.dy = minmax.max.y - minmax.min.y;

			if(name == 'left' && minmax.max.dx < minmax.max.dy){
				if(profile.x1 - minmax.min.x > 0)
					profile.x1 = minmax.min.x;
				if(profile.x2 - minmax.min.x > 0)
					profile.x2 = minmax.min.x;

			}else if(name == 'right' && minmax.max.dx < minmax.max.dy){
				if(profile.x1 - minmax.max.x < 0)
					profile.x1 = minmax.max.x;
				if(profile.x2 - minmax.max.x < 0)
					profile.x2 = minmax.max.x;

			}else if(name == 'top' && minmax.max.dx > minmax.max.dy){
				if(profile.y1 - minmax.max.y < 0)
					profile.y1 = minmax.max.y;
				if(profile.y2 - minmax.max.y < 0)
					profile.y2 = minmax.max.y;

			}else if(name == 'bottom' && minmax.max.dx > minmax.max.dy) {
				if (profile.y1 - minmax.min.y > 0)
					profile.y1 = minmax.min.y;
				if (profile.y2 - minmax.min.y > 0)
					profile.y2 = minmax.min.y;

			}else if(name == 'delete') {
				profile.removeChildren();
				profile.remove();

			}else
				$p.msg.show_msg({type: "alert-warning",
					text: $p.msg.align_invalid_direction,
					title: $p.msg.main_title});

			this.view.update();
			return false;
		}
	},

	snap_to_angle: {
		value: function(delta, snapAngle) {
			var angle = Math.atan2(delta.y, delta.x);
			angle = Math.round(angle/snapAngle) * snapAngle;
			var dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*delta.x + diry*delta.y;
			return new paper.Point(dirx*d, diry*d);
		}
	},

	/**
	 * Деструктор
	 */
	unload: {
		value: function () {

			if(this.tool && this.tool._callbacks.deactivate.length)
				this.tool._callbacks.deactivate[0].call(this.tool);

			for(var t in this.tools){
				if(this.tools[t].remove)
					this.tools[t].remove();
				this.tools[t] = null;
			}

			this.tb_left.unload();
			this.tb_top.unload();
			this.tb_right.unload();
			this.tree_layers.unload();
			this.props.unload();
		}
	}

});

/**
 * Экспортируем конструктор Editor, чтобы экземпляры построителя можно было создать снаружи
 * @property Editor
 * @for $p
 * @type {Editor}
 */
if(typeof $p !== "undefined")
	$p.Editor = Editor;


$p.injected_data._mixin({"tip_select_elm.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Свойства элемента</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент целиком<br />для изменения его свойств или перемещения</li>\r\n        <li>Добавить новый элемент делением текущего<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class=\"fa fa-question-circle fa-lg\"></i> Справка в wiki</a>\r\n</div>","tip_select_node.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Свойства узла</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\r\n        <li>Выделить отдельные узлы и лучи узлов<br />для изменения геометрии</li>\r\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\r\n</div>"});
return Editor;
}));
