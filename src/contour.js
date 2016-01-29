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