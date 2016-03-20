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
	else{
		_row = _contour.project.ox.constructions.add({ parent: this.parent ? this.parent.cnstr : 0 });
		_row.cnstr = _contour.project.ox.constructions.aggregate([], ["cnstr"], "MAX") + 1;
	}


	this.__define({

		_row: {
			get : function(){
				return _row;
			},
			enumerable : false
		},

		cnstr: {
			get : function(){
				return _row.cnstr;
			},
			set : function(v){
				_row.cnstr = v;
			},
			enumerable : false
		},

		// служебная группа текстовых комментариев
		l_text: {
			get: function () {
				if(!_layers.text)
					_layers.text = new paper.Group({ parent: this });
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
		l_dimensions: {
			get: function () {
				if(!_layers.dimensions)
					_layers.dimensions = new paper.Group({ parent: this });
				return _layers.dimensions;
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

			if(Array.isArray(attr)){

				var need_bind = attr.length,
					outer_nodes = this.outer_nodes,
					available_bind = outer_nodes.length,
					elm, curr, b3,
					noti = {type: consts.move_points, profiles: [], points: []};

				// первый проход: по двум узлам либо примыканию к образующей
				if(need_bind){
					for(var i in attr){
						curr = attr[i];             // curr.profile - сегмент внешнего профиля
						for(var j in outer_nodes){
							elm = outer_nodes[j];   // elm - сегмент профиля текущего контура
							if(elm.data.binded)
								continue;
							if(curr.profile.is_nearest(elm)){
								elm.data.binded = true;
								curr.binded = true;
								need_bind--;
								available_bind--;
								if(!curr.b.is_nearest(elm.b)){
									elm.rays.clear(true);
									elm.b = curr.b;
									if(noti.profiles.indexOf(elm) == -1){
										noti.profiles.push(elm);
										noti.points.push(elm.b);
									}
								}

								if(!curr.e.is_nearest(elm.e)){
									elm.rays.clear(true);
									elm.e = curr.e;
									if(noti.profiles.indexOf(elm) == -1){
										noti.profiles.push(elm);
										noti.points.push(elm.e);
									}
								}

								break;
							}
						}
					}
				}

				// второй проход: по одному узлу
				if(need_bind){
					for(var i in attr){
						curr = attr[i];
						if(curr.binded)
							continue;
						for(var j in outer_nodes){
							elm = outer_nodes[j];
							if(elm.data.binded)
								continue;
							if(curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)){
								elm.data.binded = true;
								curr.binded = true;
								need_bind--;
								available_bind--;
								elm.rays.clear(true);
								elm.b = curr.b;
								elm.e = curr.e;
								if(noti.profiles.indexOf(elm) == -1){
									noti.profiles.push(elm);
									noti.points.push(elm.b);
									noti.points.push(elm.e);
								}
								break;
							}
						}
					}
				}

				// третий проход - из оставшихся
				if(need_bind && available_bind){
					for(var i in attr){
						curr = attr[i];
						if(curr.binded)
							continue;
						for(var j in outer_nodes){
							elm = outer_nodes[j];
							if(elm.data.binded)
								continue;
							elm.data.binded = true;
							curr.binded = true;
							need_bind--;
							available_bind--;
							// TODO заменить на клонирование образующей
							elm.rays.clear(true);
							elm.b = curr.b;
							elm.e = curr.e;
							if(noti.profiles.indexOf(elm) == -1){
								noti.profiles.push(elm);
								noti.points.push(elm.b);
								noti.points.push(elm.e);
							}
							break;
						}
					}
				}

				// четвертый проход - добавляем
				if(need_bind){
					for(var i in attr){
						curr = attr[i];
						if(curr.binded)
							continue;
						elm = new Profile({
							generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
							proto: outer_nodes.length ? outer_nodes[0] : {
								parent: this,
								inset: _contour.project.default_inset({elm_type: $p.enm.elm_types.Створка}),
								clr: _contour.project.default_clr()
							}
						});
						curr.profile = elm;
						if(curr.outer)
							delete curr.outer;
						curr.binded = true;

						elm.data.binded = true;
						elm.data.simulated = true;

						noti.profiles.push(elm);
						noti.points.push(elm.b);
						noti.points.push(elm.e);

						need_bind--;
					}
				}

				// удаляем лишнее
				if(available_bind){
					outer_nodes.forEach(function (elm) {
						if(!elm.data.binded){
							elm.rays.clear(true);
							elm.remove();
							available_bind--;
						}
					});
				}

				// информируем систему об изменениях
				if(noti.points.length)
					this.notify(noti);

			}

		},
		enumerable : true
	});


	/**
	 * Удаляет контур из иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
	 * @method remove
	 */
	this.remove = function () {

		//удаляем детей
		while(this.children.length)
			this.children[0].remove();

		var ox = this.project.ox,
			_del_rows = ox.coordinates.find_rows({cnstr: this.cnstr});
		_del_rows.forEach(function (row) {
			ox.coordinates.del(row._row);
		});
		_del_rows = null;

		// удаляем себя
		if(ox === _row._owner._owner)
			_row._owner.del(_row);
		_row = null;

		// стандартные действия по удалению элемента paperjs
		Contour.superclass.remove.call(this);
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
	 * Врезаем оповещение при активации слоя
	 */
	activate: {
		value: function() {
			this.project._activeLayer = this;
			$p.eve.callEvent("layer_activated", [this]);
			this.project.register_update();
		},
		enumerable : false
	},

	/**
	 * Возвращает массив профилей текущего контура
	 * @property profiles
	 * @for Contour
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
	 * Возвращает массив заполнений + створок текущего контура
	 * @property glasses
	 * @for Contour
	 * @param [hide] {Boolean} - если истина, устанавливает для заполнений visible=false
	 * @param [glass_only] {Boolean} - если истина, возвращает только заполнения
	 * @returns {Array}
	 */
	glasses: {
		value: function (hide, glass_only) {
			var res = [];
			this.children.forEach(function(elm) {
				if ((!glass_only && elm instanceof Contour) || elm instanceof Filling){
					res.push(elm);
					if(hide)
						elm.visible = false;
				}
			});
			return res;
		},
		enumerable : false
	},

	bounds: {
		get: function () {
			var profiles = this.profiles, res;
			if(!profiles.length)
				res = new paper.Rectangle()
			else{
				res = profiles[0].bounds;
				for(var i = 1; i < profiles.length; i++)
					res = res.unite(profiles[i].bounds);
			}
			return res;
		},
		enumerable : false
	},

	/**
	 * Перерисовывает элементы контура
	 * @method redraw
	 * @for Contour
	 */
	redraw: {
		value: function(on_contour_redrawed){

			if(!this.visible)
				return on_contour_redrawed ? on_contour_redrawed() : undefined;

			var _contour = this,
				profiles = this.profiles,
				llength = 0;

			function on_child_contour_redrawed(){
				llength--;
				if(!llength)
					on_contour_redrawed();
			}

			// сначала перерисовываем все профили контура
			profiles.forEach(function(element) {
				element.redraw();
			});

			// создаём и перерисовываем заполнения
			_contour.glass_recalc();

			// перерисовываем вложенные контуры
			_contour.children.forEach(function(child_contour) {
				if (child_contour instanceof Contour){
					llength++;
					//setTimeout(function () {
					//	if(!_contour.project.has_changes())
					//		child_contour.redraw(on_child_contour_redrawed);
					//});
					child_contour.redraw(on_child_contour_redrawed);
				}
			});

			// перерисовываем размерные линии
			var _bounds = this.bounds;
			this.l_dimensions.children.forEach(function(elm) {
					elm.redraw(_bounds);
			});

			// информируем мир о новых размерах нашего контура
			$p.eve.callEvent("contour_redrawed", [this, _bounds]);

			// если нет вложенных контуров, информируем проект о завершении перерисовки контура
			if(!llength)
				on_contour_redrawed();

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

			// удаляем скрытые заполнения
			this.glasses(false, true).forEach(function (glass) {
				if(!glass.visible)
					glass.remove();
			});

			// запись в таблице координат, каждый элемент пересчитывает самостоятельно
			this.children.forEach(function (elm) {
				if(elm.save_coordinates)
					elm.save_coordinates();
			});

		},
		enumerable : false
	},

	/**
	 * Возвращает ребро текущего контура по узлам
	 * @param n1 {paper.Point} - первый узел
	 * @param n2 {paper.Point} - второй узел
	 * @param [point] {paper.Point} - дополнительная проверочная точка
	 * @returns {Profile}
	 */
	profile_by_nodes: {
		value: function (n1, n2, point) {
			var profiles = this.profiles, g;
			for(var i = 0; i < profiles.length; i++){
				g = profiles[i].generatrix;
				if(g.getNearestPoint(n1).is_nearest(n1) && g.getNearestPoint(n2).is_nearest(n2)){
					if(!point || g.getNearestPoint(point).is_nearest(point))
						return p;
				}
			}
		},
		enumerable : false
	},

	/**
	 * Возвращает массив внешних примыкающих профилей текущего контура. Актуально для створок, т.к. они всегда замкнуты
	 * @property outer_nodes
	 * @for Contour
	 * @type {Array}
	 */
	outer_nodes: {
		get: function(){
			return this.outer_profiles.map(function (v) {
				return v.elm;
			});
		},
		enumerable : false
	},

	/**
	 * Возвращает массив внешних примыкающих профилей текущего контура
	 */
	outer_profiles: {
		get: function(){
			// сначала получим все профили
			var profiles = this.profiles,
				to_remove = [], res = [], elm, findedb, findede;

			// прочищаем, выкидывая такие, начало или конец которых соединениы не в узле
			for(var i in profiles){
				elm = profiles[i];
				if(elm.data.simulated)
					continue;
				findedb = false;
				findede = false;
				for(var j in profiles){
					if(profiles[j] == elm)
						continue;
					if(!findedb && elm.b.is_nearest(profiles[j].e))
						findedb = true;
					if(!findede && elm.e.is_nearest(profiles[j].b))
						findede = true;
				}
				if(!findedb || !findede)
					to_remove.push(elm);
			}
			for(var i in profiles){
				elm = profiles[i];
				if(to_remove.indexOf(elm) != -1)
					continue;
				elm.data.binded = false;
				res.push({
					elm: elm,
					profile: elm.nearest(),
					b: elm.b,
					e: elm.e
				});
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
	 * Возвращает массив отрезков, которые потенциально могут образовывать заполнения
	 * (соединения с пустотой отбрасываются)
	 * @property glass_segments
	 * @for Contour
	 * @type {Array}
	 */
	glass_segments: {
		get: function(){
			var profiles = this.profiles,
				is_flap = !!this.parent,
				findedb, findede, nodes = [];

			// для всех профилей контура
			profiles.forEach(function (p) {

				// ищем примыкания T к текущему профилю
				var ip = p.joined_imposts(),
					gen = p.generatrix, pbg, peg,
					pb = p.cnn_point("b"),
					pe = p.cnn_point("e");

				// для створочных импостов используем не координаты их b и e, а ближайшие точки примыкающих образующих
				if(is_flap && pb.is_t)
					pbg = pb.profile.generatrix.getNearestPoint(p.b);
				else
					pbg = p.b.clone();

				if(is_flap && pe.is_t)
					peg = pe.profile.generatrix.getNearestPoint(p.e);
				else
					peg = p.e.clone();

				// если есть примыкания T, добавляем сегменты, исключая соединения с пустотой
				if(ip.inner.length){
					ip.inner.sort(function (a, b) {
						var da = gen.getOffsetOf(a.point) , db = gen.getOffsetOf(b.point);
						if (da < db)
							return -1;
						else if (da > db)
							return 1;
						return 0;
					});
					if(pb.profile)
						nodes.push({b: pbg, e: ip.inner[0].point.clone(), profile: p});
					for(var i = 1; i < ip.inner.length; i++)
						nodes.push({b: ip.inner[i-1].point.clone(), e: ip.inner[i].point.clone(), profile: p});
					if(pe.profile)
						nodes.push({b: ip.inner[ip.inner.length-1].point.clone(), e: peg, profile: p});
				}
				if(ip.outer.length){
					ip.outer.sort(function (a, b) {
						var da = gen.getOffsetOf(a.point) , db = gen.getOffsetOf(b.point);
						if (da < db)
							return -1;
						else if (da > db)
							return 1;
						return 0;
					});
					if(pb.profile)
						nodes.push({b: ip.outer[0].point.clone(), e: pbg, profile: p, outer: true});
					for(var i = 1; i < ip.outer.length; i++)
						nodes.push({b: ip.outer[i].point.clone(), e: ip.outer[i-1].point.clone(), profile: p, outer: true});
					if(pe.profile)
						nodes.push({b: peg, e: ip.outer[ip.outer.length-1].point.clone(), profile: p, outer: true});
				}
				if(!ip.inner.length){
					// добавляем, если нет соединений с пустотой
					if(pb.profile && pe.profile)
						nodes.push({b: pbg, e: peg, profile: p});
				}
				if(!ip.outer.length && (pb.is_t || pe.is_t)){
					// для импостов добавляем сегмент в обратном направлении
					if(pb.profile && pe.profile)
						nodes.push({b: peg, e: pbg, profile: p, outer: true});
				}
			});

			return nodes;
		},
		enumerable : false
	},

	/**
	 * Возвращает массив массивов сегментов - база для построения пути заполнений
	 * @property glass_contours
	 * @for Contour
	 * @type {Array}
	 */
	glass_contours: {
		get: function(){
			var segments = this.glass_segments,
				curr, acurr, res = [];

			// возвращает массив сегментов, которые могут следовать за текущим
			function find_next(curr){
				if(!curr.anext){
					curr.anext = [];
					segments.forEach(function (segm) {
						if(segm == curr || segm.profile == curr.profile)
							return;
						if(curr.e.is_nearest(segm.b))
							curr.anext.push(segm);
					});
				}
				return curr.anext;
			}

			// рекурсивно получает следующий сегмент, пока не уткнётся в текущий
			function go_go(segm){
				var anext = find_next(segm);
				for(var i in anext){
					if(anext[i] == curr)
						return anext;
					else if(acurr.every(function (el) {	return el != anext[i]; })){
						acurr.push(anext[i]);
						return go_go(anext[i]);
					}
				}
			}

			while(segments.length){
				if(curr == segments[0])
					break;
				curr = segments[0];
				acurr = [curr];
				if(go_go(curr) && acurr.length > 1){
					res.push(acurr);
					acurr.forEach(function (el) {
						var ind = segments.indexOf(el);
						if(ind != -1)
							segments.splice(ind, 1);
					});
				}
			};

			return res;

		},
		enumerable : false
	},

	/**
	 * Получает замкнутые контуры, ищет подходящие створки или заполнения, при необходимости создаёт новые
	 * @method glass_recalc
	 * @for Contour
	 */
	glass_recalc: {
		value: function () {
			var _contour = this,
				contours = _contour.glass_contours,
				nodes = _contour.nodes,
				glasses = _contour.glasses(true);

			/**
			 * Привязывает к пути найденной замкнутой области заполнение или вложенный контур текущего контура
			 * @param glass_contour {Array}
			 */
			function bind_glass(glass_contour){
				var rating = 0, glass, сrating, сglass, glass_nodes, glass_path_center;

				for(var g in glasses){

					glass = glasses[g];
					if(glass.visible)
						continue;

					// вычисляем рейтинг
					сrating = 0;
					glass_nodes = glass.outer_profiles;
					// если есть привязанные профили, используем их. иначе - координаты узлов
					if(glass_nodes.length){
						for(var j in glass_contour){
							for(var i in glass_nodes){
								if(glass_contour[j].profile == glass_nodes[i].profile &&
									glass_contour[j].b.is_nearest(glass_nodes[i].b) &&
									glass_contour[j].e.is_nearest(glass_nodes[i].e)){

									сrating++;
									break;
								}
							}
							if(сrating > 2)
								break;
						}
					}else{
						glass_nodes = glass.nodes;
						for(var j in glass_contour){
							for(var i in glass_nodes){
								if(glass_contour[j].b.is_nearest(glass_nodes[i])){
									сrating++;
									break;
								}
							}
							if(сrating > 2)
								break;
						}
					}

					if(сrating > rating || !сglass){
						rating = сrating;
						сglass = glass;
					}
					if(сrating == rating && сglass != glass){
						if(!glass_path_center){
							glass_path_center = glass_contour[0].b;
							for(var i=1; i<glass_contour.length; i++)
								glass_path_center = glass_path_center.add(glass_contour[i].b);
							glass_path_center = glass_path_center.divide(glass_contour.length);
						}
						if(glass_path_center.getDistance(glass.bounds.center, true) < glass_path_center.getDistance(сglass.bounds.center, true))
							сglass = glass;
					}
				}

				// TODO реализовать настоящее ранжирование
				if(сglass || (сglass = _contour.getItem({class: Filling, visible: false}))) {
					сglass.path = glass_contour;
					сglass.visible = true;
					if (сglass instanceof Filling) {
						сglass.sendToBack();
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
					сglass = new Filling({proto: glass, parent: _contour, path: glass_contour});
					сglass.sendToBack();
					сglass.path.visible = true;
				}
			}

			/**
			 * Бежим по найденным контурам заполнений и выполняем привязку
			 */
			contours.forEach(bind_glass);

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
				nodes = this.nodes;

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
	},

	// виртуальные метаданные для автоформ
	_metadata: {
		get : function(){
			var t = this,
				_xfields = t.project.ox._metadata.tabular_sections.constructions.fields, //_dgfields = this.project._dp._metadata.fields
				furn = _xfields.furn._clone();
			furn.choice_links = [{
				name: ["selection",	"ref"],
				path: [
					function(o, f){
						if($p.is_data_obj(o)){
							var ok = false;
							t.project._dp.sys.furn.find_rows({furn: o}, function (row) {
								ok = true;
								return false;
							});
							return ok;
						}else{
							var refs = "";
							t.project._dp.sys.furn.each(function (row) {
								if(refs)
									refs += ", ";
								refs += "'" + row.furn.ref + "'";
							});
							return "_t_.ref in (" + refs + ")";
						}
					}]}
			];

			return {
				fields: {
					furn: furn,
					clr_furn: _xfields.clr_furn,
					direction: _xfields.direction,
					h_ruch: _xfields.h_ruch,
					mskt: _xfields.mskt,
					clr_mskt: _xfields.clr_mskt
				},
				tabular_sections: {
					params: t.project.ox._metadata.tabular_sections.params
				}
			};
		},
		enumerable : false
	},

	/**
	 * виртуальный датаменеджер для автоформ
	 */
	_manager: {
		get: function () {
			return this.project._dp._manager;
		},
		enumerable : false
	},

	/**
	 * виртуальная табличная часть параметров фурнитуры
	 */
	params: {
		get: function () {
			return this.project.ox.params;
		},
		enumerable : false
	},

	/**
	 * указатель на фурнитуру
	 */
	furn: {
		get: function () {
			return this._row.furn;
		},
		set: function (v) {
			this._row.furn = v;
		},
		enumerable : false
	},

	/**
	 * Цвет фурнитуры
	 */
	clr_furn: {
		get: function () {
			return this._row.clr_furn;
		},
		set: function (v) {
			this._row.clr_furn = v;
		},
		enumerable : false
	},

	/**
	 * Направление открывания
	 */
	direction: {
		get: function () {
			return this._row.direction;
		},
		set: function (v) {
			this._row.direction = v;
		},
		enumerable : false
	},

	/**
	 * Высота ручки
	 */
	h_ruch: {
		get: function () {
			return this._row.h_ruch;
		},
		set: function (v) {
			this._row.h_ruch = v;
		},
		enumerable : false
	},

	/**
	 * Вставка москитки
	 */
	mskt: {
		get: function () {
			return this._row.mskt;
		},
		set: function (v) {
			this._row.mskt = v;
		},
		enumerable : false
	},

	/**
	 * Цвет москитки
	 */
	clr_mskt: {
		get: function () {
			return this._row.clr_mskt;
		},
		set: function (v) {
			this._row.clr_mskt = v;
		},
		enumerable : false
	},

	/**
	 * Возвращает профиль по стороне
	 * @param side {_enm.positions|String}
	 */
	profile_by_side: {
		value: function (side) {
			var profiles = this.profiles;
		},
		enumerable : false
	},

	profile_by_furn_side: {
		value: function (side) {
			var profiles = this.profiles;
		},
		enumerable : false
	}
});