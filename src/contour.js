/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
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
		_notifier = Object.getNotifier(this._noti);

	Contour.superclass.constructor.call(this);
	if(_parent)
		this.parent = _parent;

	// строка в таблице конструкций
	if(attr.row)
		_row = attr.row;
	else
		_row = this.project.ox.constructions.add();

	this._define('cns_no', {
		get : function(){
			return _row.cns_no;
		},
		set : function(v){
			_row.cns_no = v;
		},
		enumerable : false,
		configurable : false
	});

	this._define('glassno', {
		get : function(){
			return _row.glassno;
		},
		set : function(v){
			_row.glassno = v;
		},
		enumerable : false,
		configurable : false
	});

	if(this.cns_no)
		this.project.ox.coordinates.find_rows({cns_no: this.cns_no}, function(row){

			// добавляем профили
			if($p.enm.elm_types.profiles.indexOf(row.elm_type) != -1)
				new Profile({row: row,	parent: _contour});

			// добавляем заполнения
			else if($p.enm.elm_types.glasses.indexOf(row.elm_type) != -1)
				new Filling({row: row,	parent: _contour});

			// добавляем раскладки

		});


	/**
	 * путь контура - при чтении похож на bounds
	 * для вложенных контуров определяет положение, форму и количество сегментов створок
	 * @property path
	 * @type paper.Path
	 */
	this._define('path', {
		get : function(){
			return this.bounds;
		},
		set : function(attr){
			if(attr instanceof paper.Path){

				var need_bind = attr.data.curve_nodes.length;
				if(need_bind > 6)
					return;

				var outer_nodes = _contour.outer_nodes(), elm, curve_nodes,
					available_bind = outer_nodes.length;

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
		enumerable : true,
		configurable : false
	});


	/**
	 * Удаляет контур из иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
	 * @method remove
	 */
	this.remove = function () {
		this.children.forEach(function (elm) {
			elm.remove();
		});
		_row._owner.del(_row);
		_row = null;
		Contour.superclass.remove.call(this);
	};


	/**
	 * Возвращает массив узлов текущего контура
	 * @param [path] {paper.Path} - если указано, массив ограничивается узлами, примыкающими к пути
	 * @param [nodes] {Array} - если указано, позволяет не вычислять исходный массив узлов контура, а использовать переданный
	 * @param [bind] {Boolean} - если указано, сохраняет пары узлов в path.data.curve_nodes
	 * @returns {Array}
	 */
	this.nodes = function(path, nodes, bind){
		var i, curve, findedb, findede;

		if(!path){
			if(!nodes)
				nodes = [];
			_contour.children.forEach(function (p) {
				if(p instanceof Profile){
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
				}
			});

		} else{

			var curve_nodes = [], path_nodes = [],
				d, d1, d2, node1, node2, ipoint = path.interiorPoint.negate();

			if(!nodes)
				nodes = _contour.nodes();

			if(bind){
				path.data.curve_nodes = curve_nodes;
				path.data.path_nodes = path_nodes;
			}


			// имеем путь и контур.
			for(i in path.curves){
				curve = path.curves[i];
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
					// уточняем порядок нод

					if(node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
						curve_nodes.push({node1: node2, node2: node1});
					else
						curve_nodes.push({node1: node1, node2: node2});
				}

			}
			nodes = path_nodes;
		}

		return nodes;
	};

	/**
	 * Возвращаем массив внешних узлов текущего контура. Ососбо актуально для створок, т.к. они всегда замкнуты
	 */
	this.outer_nodes = function(){
		// сначала получим все профили
		var res_profiles = _contour.profiles(),
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
	}

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
	 * Возвращает массив профилей текущего контура
	 * @returns {Array}
	 */
	this.profiles = function(){
		var res = [];
		_contour.children.forEach(function(elm) {
			if (elm instanceof Profile){
				res.push(elm);
			}
		});
		return res;
	}

	/**
	 * Возвращает ребро текущего контура по узлам
	 * @param n1 {paper.Point}
	 * @param n2 {paper.Point}
	 * @param [point]
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

		// обновляем свойства
		if(paper.tool.update)
			paper.tool.update();

	};

	/**
	 * Проверяет корректность ранее созданных заполнений + создаёт новые заполнения
	 * для каждой замкнутой области текущего контура
	 * @method find_glasses
	 * @param profiles {Array}
	 * @return {Object}
	 */
	this.find_glasses = function(profiles){

		var nodes = _contour.nodes(),
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
					glass_nodes = glass.nodes();
				else
					glass_nodes = _contour.nodes(glass.path, nodes);

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
		_contour.rotate(0.004);
		for(var i in profiles){
			path = profiles[i].path.clone(false);
			path.scale(1.004);

			if(!original_bounds)
				original_bounds = path;
			else
				original_bounds = original_bounds.unite(path);
		}
		_contour.rotate(-0.004);


		// TODO вместо середины образующей задействовать точки внутри пути
		if(original_bounds instanceof paper.CompoundPath){
			original_bounds.children.forEach(function(p){
				for(var i in profiles){
					children = profiles[i];
					if(children.generatrix.is_linear())
						interior = children.path.interiorPoint;
					else{
						if(children.generatrix.curves.length == 1)
							interior = children.generatrix.firstCurve.getPointAt(0.5, true);
						else if (children.generatrix.curves.length == 2)
							interior = children.generatrix.firstCurve.point2;
						else
							interior = children.generatrix.curves[1].point2;
					}
					//interior = children.lastCurve.getPointAt(0.5, true).add(children.firstCurve.getPointAt(0.1, true)).divide(2);
					//interior = children.path.interiorPoint.add(children.generatrix.getPointAt(0.5, true)).divide(2);
					if(p.contains(interior)){
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

		/*
		 имеем массив полигонов в original_bounds.children и текущие заполнения
		 попытаемся привязать заполнения к полигонам
		 */
		for(var g in original_bounds.children){
			var glass_path = original_bounds.children[g];
			_contour.nodes(glass_path, nodes, true);
			bind_glass(glass_path);
		}

	};

}
Contour._extend(paper.Layer);