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
		_row,
		_notifier = Object.getNotifier(this._noti),
		_layers = {};

	Contour.superclass.constructor.call(this);
	
	if(attr.parent)
		this.parent = attr.parent;

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
			}
		},

		cnstr: {
			get : function(){
				return _row.cnstr;
			},
			set : function(v){
				_row.cnstr = v;
			}
		},

		// служебная группа текстовых комментариев
		l_text: {
			get: function () {
				if(!_layers.text)
					_layers.text = new paper.Group({ parent: this });
				return _layers.text;
			}
		},

		// служебная группа визуализации допов,  петель и ручек
		l_visualization: {
			get: function () {
				if(!_layers.visualization)
					_layers.visualization = new paper.Group({ parent: this, guide: true });
				return _layers.visualization;
			}
		},

		// служебная группа размерных линий
		l_dimensions: {
			get: function () {
				if(!_layers.dimensions)
					_layers.dimensions = new paper.Group({ parent: this });
				return _layers.dimensions;
			}
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
					elm, curr,
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

				// пересчитываем вставки створок
				this.profiles.forEach(function (profile) {
					profile.inset = profile.project.default_inset({elm_type: profile.elm_type, pos: profile.pos});
				});


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
		}
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
		}
	},

	/**
	 * Возвращает массив импостов текущего + вложенных контура
	 * @property imposts
	 * @for Contour
	 * @returns {Array.<Profile>}
	 */
	imposts: {
		get: function(){
			var res = [];
			this.getItems({class: Profile}).forEach(function(elm) {
				if (elm.rays.b.is_t || elm.rays.e.is_t || elm.rays.b.is_i || elm.rays.e.is_i){
					res.push(elm);
				}
			});
			return res;
		}
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
		}
	},

	/**
	 * Габариты по внешним краям профилей контура
	 */
	bounds: {
		get: function () {

			if(!this.data._bounds){

				var profiles = this.profiles, res;
				if(!profiles.length)
					this.data._bounds = new paper.Rectangle();
				else{
					this.data._bounds = profiles[0].bounds;
					for(var i = 1; i < profiles.length; i++)
						this.data._bounds = this.data._bounds.unite(profiles[i].bounds);
				}
			}

			return this.data._bounds;
			
		}
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
				if(!llength && on_contour_redrawed)
					on_contour_redrawed();
			}

			// сбрасываем кеш габаритов
			this.data._bounds = null;
			
			// чистим визуализацию
			if(!this.project.data._saving && this.l_visualization._by_spec)
				this.l_visualization._by_spec.removeChildren();

			// сначала перерисовываем все профили контура
			profiles.forEach(function(element) {
				element.redraw();
			});

			// создаём и перерисовываем заполнения
			_contour.glass_recalc();

			// рисуем направление открывания и ручку
			_contour.draw_opening();

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

			// информируем мир о новых размерах нашего контура
			$p.eve.callEvent("contour_redrawed", [this, this.data._bounds]);

			// если нет вложенных контуров, информируем проект о завершении перерисовки контура
			if(!llength && on_contour_redrawed)
				on_contour_redrawed();

		}
	},

	/**
	 * Вычисляемые поля в таблицах конструкций и координат
	 * @method save_coordinates
	 * @for Contour
	 */
	save_coordinates: {
		value: function () {

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

			// ответственность за строку в таблице конструкций лежит на контуре
			this._row.x = this.bounds ? this.bounds.width : 0;
			this._row.y = this.bounds? this.bounds.height : 0;
			this._row.is_rectangular = this.is_rectangular;
			if(this.parent){
				this._row.w = this.w;
				this._row.h = this.h;
			}else{
				this._row.w = 0;
				this._row.h = 0;
			}
		}
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
		}
	},

	/**
	 * Возвращает массив внешних профилей текущего контура. Актуально для створок, т.к. они всегда замкнуты
	 * @property outer_nodes
	 * @for Contour
	 * @type {Array}
	 */
	outer_nodes: {
		get: function(){
			return this.outer_profiles.map(function (v) {
				return v.elm;
			});
		}
	},

	/**
	 * Возвращает массив внешних и примыкающих профилей текущего контура
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
		}
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
		}
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
				nodes = [];

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
					if(!pb.is_i)
						nodes.push({b: pbg, e: ip.inner[0].point.clone(), profile: p});
					for(var i = 1; i < ip.inner.length; i++)
						nodes.push({b: ip.inner[i-1].point.clone(), e: ip.inner[i].point.clone(), profile: p});
					if(!pe.is_i)
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
					if(!pb.is_i)
						nodes.push({b: ip.outer[0].point.clone(), e: pbg, profile: p, outer: true});
					for(var i = 1; i < ip.outer.length; i++)
						nodes.push({b: ip.outer[i].point.clone(), e: ip.outer[i-1].point.clone(), profile: p, outer: true});
					if(!pe.is_i)
						nodes.push({b: peg, e: ip.outer[ip.outer.length-1].point.clone(), profile: p, outer: true});
				}
				if(!ip.inner.length){
					// добавляем, если нет соединений с пустотой
					if(!pb.is_i && !pe.is_i)
						nodes.push({b: pbg, e: peg, profile: p});
				}
				if(!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)){
					// для импостов добавляем сегмент в обратном направлении
					if(!pb.is_i && !pe.is_i)
						nodes.push({b: peg, e: pbg, profile: p, outer: true});
				}
			});

			return nodes;
		}
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
						// если конец нашего совпадает с началом следующего...
						// и если существует соединение нашего со следующим
						if(curr.e.is_nearest(segm.b) && curr.profile.has_cnn(segm.profile, segm.b)){

							if(curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
								curr.anext.push(segm);
						}

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
				curr = segments[0];
				acurr = [curr];
				if(go_go(curr) && acurr.length > 1){
					res.push(acurr);
				}
				// удаляем из segments уже задействованные или не пригодившиеся сегменты
				acurr.forEach(function (el) {
					var ind = segments.indexOf(el);
					if(ind != -1)
						segments.splice(ind, 1);
				});
			}

			return res;

		}
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
				glasses = _contour.glasses(true);

			/**
			 * Привязывает к пути найденной замкнутой области заполнение или вложенный контур текущего контура
			 * @param glass_contour {Array}
			 */
			function bind_glass(glass_contour){
				var rating = 0, glass, crating, cglass, glass_nodes, glass_path_center;

				for(var g in glasses){

					glass = glasses[g];
					if(glass.visible)
						continue;

					// вычисляем рейтинг
					crating = 0;
					glass_nodes = glass.outer_profiles;
					// если есть привязанные профили, используем их. иначе - координаты узлов
					if(glass_nodes.length){
						for(var j in glass_contour){
							for(var i in glass_nodes){
								if(glass_contour[j].profile == glass_nodes[i].profile &&
									glass_contour[j].b.is_nearest(glass_nodes[i].b) &&
									glass_contour[j].e.is_nearest(glass_nodes[i].e)){

									crating++;
									break;
								}
							}
							if(crating > 2)
								break;
						}
					}else{
						glass_nodes = glass.nodes;
						for(var j in glass_contour){
							for(var i in glass_nodes){
								if(glass_contour[j].b.is_nearest(glass_nodes[i])){
									crating++;
									break;
								}
							}
							if(crating > 2)
								break;
						}
					}

					if(crating > rating || !cglass){
						rating = crating;
						cglass = glass;
					}
					if(crating == rating && cglass != glass){
						if(!glass_path_center){
							glass_path_center = glass_contour[0].b;
							for(var i=1; i<glass_contour.length; i++)
								glass_path_center = glass_path_center.add(glass_contour[i].b);
							glass_path_center = glass_path_center.divide(glass_contour.length);
						}
						if(glass_path_center.getDistance(glass.bounds.center, true) < glass_path_center.getDistance(cglass.bounds.center, true))
							cglass = glass;
					}
				}

				// TODO реализовать настоящее ранжирование
				if(cglass || (cglass = _contour.getItem({class: Filling, visible: false}))) {
					cglass.path = glass_contour;
					cglass.visible = true;
					if (cglass instanceof Filling) {
						cglass.sendToBack();
						cglass.path.visible = true;
					}
				}else{
					// добавляем заполнение
					// 1. ищем в изделии любое заполнение
					// 2. если не находим, используем умолчание системы
					if(glass = _contour.getItem({class: Filling})){

					}else if(glass = _contour.project.getItem({class: Filling})){

					}else{

					}
					cglass = new Filling({proto: glass, parent: _contour, path: glass_contour});
					cglass.sendToBack();
					cglass.path.visible = true;
				}
			}

			/**
			 * Бежим по найденным контурам заполнений и выполняем привязку
			 */
			contours.forEach(bind_glass);

		}
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
		}
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
		}
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
		}
	},

	/**
	 * виртуальный датаменеджер для автоформ
	 */
	_manager: {
		get: function () {
			return this.project._dp._manager;
		}
	},

	/**
	 * виртуальная табличная часть параметров фурнитуры
	 */
	params: {
		get: function () {
			return this.project.ox.params;
		}
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
			
			// при необходимости устанавливаем направление открывания
			if(this.direction.empty()){
				this.project._dp.sys.furn_params.find_rows({
					param: $p.job_prm.properties.direction
				}, function (row) {
					this.direction = row.value;
					return false;
				}.bind(this._row));
			}
			
			// при необходимости устанавливаем цвет
			// если есть контуры с цветной фурнитурой, используем. иначе - цвет из фурнитуры
			if(this.clr_furn.empty()){
				this.project.ox.constructions.find_rows({clr_furn: {not: $p.cat.clrs.get()}}, function (row) {
					this.clr_furn = row.clr_furn;
					return false;
				}.bind(this._row));
			}
			if(this.clr_furn.empty()){
				this._row.furn.colors.each(function (row) {
					this.clr_furn = row.clr;
					return false;
				}.bind(this._row));
			}

			// перезаполняем параметры фурнитуры
			this._row.furn.refill_prm(this);

			this.project.register_change(true);

			$p.eve.callEvent("furn_changed", [this]);
			
		}
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
			this.project.register_change();
		}
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
			this.project.register_change(true);
		}
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
			this.project.register_change();
		}
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
			this.project.register_change();
		}
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
			this.project.register_change();
		}
	},

	/**
	 * Возвращает структуру профилей по сторонам
	 */
	profiles_by_side: {
		value: function (side) {
			// получаем таблицу расстояний профилей от рёбер габаритов
			var profiles = this.profiles,
				bounds = this.bounds,
				res = {}, ares = [];

			function by_side(name) {
				ares.sort(function (a, b) {
					return a[name] - b[name];
				});
				res[name] = ares[0].profile;
			}

			if(profiles.length){

				profiles.forEach(function (profile) {
					ares.push({
						profile: profile,
						left: Math.abs(profile.b.x + profile.e.x - bounds.left * 2),
						top: Math.abs(profile.b.y + profile.e.y - bounds.top * 2),
						bottom: Math.abs(profile.b.y + profile.e.y - bounds.bottom * 2),
						right: Math.abs(profile.b.x + profile.e.x - bounds.right * 2)
					});
				});

				if(side){
					by_side(side);
					return res[side];
				}

				["left","top","bottom","right"].forEach(by_side);
			}

			return res;

		}
	},

	/**
	 * Возвращает профиль по номеру стороны фурнитуры, учитывает направление открывания, по умолчанию - левое
	 * - первая первая сторона всегда нижняя
	 * - далее, по часовой стрелке 2 - левая, 3 - верхняя и т.д.
	 * - если направление правое, обход против часовой
	 * @param side {Number}
	 * @param cache {Object}
	 */
	profile_by_furn_side: {
		value: function (side, cache) {

			if(!cache)
				cache = {
					profiles: this.outer_nodes,
					bottom: this.profiles_by_side("bottom")
				};

			var profile = cache.bottom,
				profile_node = this.direction == $p.enm.open_directions.Правое ? "b" : "e",
				other_node = this.direction == $p.enm.open_directions.Правое ? "e" : "b",
				next = function () {

					side--;
					if(side <= 0)
						return profile;

					cache.profiles.some(function (curr) {
						if(curr[other_node].is_nearest(profile[profile_node])){
							profile = curr;
							return true;
						}
					});

					return next();

				};

			return next();


		}
	},

	/**
	 * Признак прямоугольности
	 */
	is_rectangular: {
		get : function(){
			return (this.side_count != 4) || !this.profiles.some(function (profile) {
				return !profile.is_linear();
			});
		}
	},

	/**
	 * Количество сторон контура
	 */
	side_count: {
		get : function(){
			return this.profiles.length;
		}
	},

	/**
	 * Ширина контура по фальцу
	 */
	w: {
		get : function(){
			if(this.side_count != 4)
				return 0;
			
			var profiles = this.profiles_by_side();
			return this.bounds ? this.bounds.width - profiles.left.nom.sizefurn - profiles.right.nom.sizefurn : 0;
		}
	},

	/**
	 * Высота контура по фальцу
	 */
	h: {
		get : function(){
			if(this.side_count != 4)
				return 0;
			
			var profiles = this.profiles_by_side();
			return this.bounds ? this.bounds.height - profiles.top.nom.sizefurn - profiles.bottom.nom.sizefurn : 0;
		}
	},

	/**
	 * Положение контура в изделии или створки в контуре
	 */
	pos: {
		get: function () {

		}
	},

	/**
	 * Тест положения контура в изделии
	 */
	is_pos: {
		value: function (pos) {

			// если в изделии один контур или если контур является створкой, он занимает одновременно все положения
			if(this.project.contours.count == 1 || this.parent)
				return true;

			// если контур реально верхний или правый и т.д. - возвращаем результат сразу
			var res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

			if(!res){
				if(pos == "top"){
					var rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
				}else if(pos == "left"){
					var rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
				}else if(pos == "right"){
					var rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
				}else if(pos == "bottom"){
					var rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
				}

				res = !this.project.contours.some(function (l) {
					return l != this && rect.intersects(l.bounds);
				}.bind(this));
			}

			return res;

		}
	},

	/**
	 * Рисует направление открывания
	 */
	draw_opening: {
		value: function () {
			
			if(!this.parent || !$p.enm.open_types.is_opening(this.furn.open_type)){
				if(this.l_visualization._opening && this.l_visualization._opening.visible)
					this.l_visualization._opening.visible = false;
				return;
			}

			// рисует линии открывания на поворотной, поворотнооткидной и фрамужной фурнитуре
			function rotary_folding() {
				_contour.furn.open_tunes.forEach(function (row) {

					if(row.rotation_axis){
						var axis = _contour.profile_by_furn_side(row.side, cache),
							other = _contour.profile_by_furn_side(
								row.side + 2 <= this._owner.side_count ? row.side + 2 : row.side - 2, cache);

						_contour.l_visualization._opening.moveTo(axis.corns(3));
						_contour.l_visualization._opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
						_contour.l_visualization._opening.lineTo(axis.corns(4));

					}
				});
			}

			function sliding() {

			}


			// создаём кеш элементов по номеру фурнитуры
			var _contour = this,
				cache = {
					profiles: this.outer_nodes,
					bottom: this.profiles_by_side("bottom")
				};

			// подготавливаем слой для рисования
			if(!_contour.l_visualization._opening)
				_contour.l_visualization._opening = new paper.CompoundPath({
					parent: _contour.l_visualization,
					strokeColor: 'black'
				});
			else
				_contour.l_visualization._opening.removeChildren();

			//_contour.l_visualization.visible = true;

			// рисуем раправление открывания
			if(this.furn.is_sliding)
				sliding();

			else
				rotary_folding();

		}
	},

	/**
	 * Рисует дополнительную визуализацию. Данные берёт из спецификации
	 */
	draw_visualization: {
		value: function () {


			var profiles = this.profiles,
				l_vis = this.l_visualization;

			if(l_vis._by_spec)
				l_vis._by_spec.removeChildren();
			else
				l_vis._by_spec = new paper.Group({ parent: l_vis });

			// получаем строки спецификации с визуализацией
			this.project.ox.specification.find_rows({dop: -1}, function (row) {

				profiles.some(function (elm) {
					if(row.elm == elm.elm){
						
						// есть визуализация для текущего профиля
						row.nom.visualization.draw(elm, l_vis, row.len * 1000);
						
						return true;
					}
				});
			});

			// перерисовываем вложенные контуры
			this.children.forEach(function(l) {
				if(l instanceof Contour)
					l.draw_visualization();
			});

		}
	},

	/**
	 * формирует авторазмерные линии
	 */
	draw_sizes: {

		value: function () {
			
			// сначала, строим размерные линии импостов

			// получаем импосты контура, делим их на вертикальные и горизонтальные
			var ihor = [], ivert = [], i;
			
			this.imposts.forEach(function (elm) {
				if(elm.orientation == $p.enm.orientations.hor)
					ihor.push(elm);
				else if(elm.orientation == $p.enm.orientations.vert)
					ivert.push(elm);
			});

			if(ihor.length || ivert.length){

				var by_side = this.profiles_by_side(),

					imposts_dimensions = function(arr, collection, i, pos, xy, sideb, sidee) {

						var offset = (pos == "right" || pos == "bottom") ? -130 : 90;

						if(i == 0 && !collection[i]){
							collection[i] = new DimensionLine({
								pos: pos,
								elm1: sideb,
								p1: sideb.b[xy] > sideb.e[xy] ? "b" : "e",
								elm2: arr[i],
								p2: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
								parent: this.l_dimensions,
								offset: offset
							});
						}

						if(i >= 0 && i < arr.length-1 && !collection[i+1]){

							collection[i+1] = new DimensionLine({
								pos: pos,
								elm1: arr[i],
								p1: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
								elm2: arr[i+1],
								p2: arr[i+1].b[xy] > arr[i+1].e[xy] ? "b" : "e",
								parent: this.l_dimensions,
								offset: offset
							});

						}

						if(i == arr.length-1 && !collection[arr.length]){

							collection[arr.length] = new DimensionLine({
								pos: pos,
								elm1: arr[i],
								p1: arr[i].b[xy] > arr[i].e[xy] ? "b" : "e",
								elm2: sidee,
								p2: sidee.b[xy] > sidee.e[xy] ? "b" : "e",
								parent: this.l_dimensions,
								offset: offset
							});

						}

					}.bind(this),

					purge = function (arr, asizes, xy) {

						var adel = [];
						arr.forEach(function (elm) {

							if(asizes.indexOf(elm.b[xy].round(0)) != -1 && asizes.indexOf(elm.e[xy].round(0)) != -1)
								adel.push(elm);

							else if(asizes.indexOf(elm.b[xy].round(0)) == -1)
								asizes.push(elm.b[xy].round(0));

							else if(asizes.indexOf(elm.e[xy].round(0)) == -1)
								asizes.push(elm.e[xy].round(0));

						});

						adel.forEach(function (elm) {
							arr.splice(arr.indexOf(elm), 1);
						});
						adel.length = 0;

						return arr;
					};

				// сортируем ihor по убыванию y
				var asizes = [this.bounds.top.round(0), this.bounds.bottom.round(0)];
				purge(ihor, asizes, "y").sort(function (a, b) {
					return b.b.y + b.e.y - a.b.y - a.e.y;
				});
				// сортируем ivert по возрастанию x
				asizes = [this.bounds.left.round(0), this.bounds.right.round(0)];
				purge(ivert, asizes, "x").sort(function (a, b) {
					return a.b.x + a.e.x - b.b.x - b.e.x;
				});


				// для ihor добавляем по вертикали
				if(!this.l_dimensions.ihor)
					this.l_dimensions.ihor = {};
				for(i = 0; i< ihor.length; i++){

					if(this.is_pos("right"))
						imposts_dimensions(ihor, this.l_dimensions.ihor, i, "right", "x", by_side.bottom, by_side.top);

					else if(this.is_pos("left"))
						imposts_dimensions(ihor, this.l_dimensions.ihor, i, "left", "x", by_side.bottom, by_side.top);

				}

				// для ivert добавляем по горизонтали
				if(!this.l_dimensions.ivert)
					this.l_dimensions.ivert = {};
				for(i = 0; i< ivert.length; i++){

					if(this.is_pos("bottom"))
						imposts_dimensions(ivert, this.l_dimensions.ivert, i, "bottom", "y", by_side.left, by_side.right);

					else if(this.is_pos("top"))
						imposts_dimensions(ivert, this.l_dimensions.ivert, i, "top", "y", by_side.left, by_side.right);

				}
			}


			// далее - размерные линии контура
			if (this.project.contours.length > 1) {

				if(this.is_pos("left") && !this.is_pos("right") && this.project.bounds.height != this.bounds.height){
					if(!this.l_dimensions.left){
						this.l_dimensions.left = new DimensionLine({
							pos: "left",
							parent: this.l_dimensions,
							offset: ihor.length ? 220 : 90
						});
					}else
						this.l_dimensions.left.offset = ihor.length ? 220 : 90;

				}else{
					if(this.l_dimensions.left){
						this.l_dimensions.left.remove();
						this.l_dimensions.left = null;
					}
				}

				if(this.is_pos("right") && this.project.bounds.height != this.bounds.height){
					if(!this.l_dimensions.right){
						this.l_dimensions.right = new DimensionLine({
							pos: "right",
							parent: this.l_dimensions,
							offset: ihor.length ? -260 : -130
						});
					}else
						this.l_dimensions.right.offset = ihor.length ? -260 : -130;

				}else{
					if(this.l_dimensions.right){
						this.l_dimensions.right.remove();
						this.l_dimensions.right = null;
					}
				}

				if(this.is_pos("top") && !this.is_pos("bottom") && this.project.bounds.width != this.bounds.width){
					if(!this.l_dimensions.top){
						this.l_dimensions.top = new DimensionLine({
							pos: "top",
							parent: this.l_dimensions,
							offset: ivert.length ? 220 : 90
						});
					}else
						this.l_dimensions.top.offset = ivert.length ? 220 : 90;
				}else{
					if(this.l_dimensions.top){
						this.l_dimensions.top.remove();
						this.l_dimensions.top = null;
					}
				}

				if(this.is_pos("bottom") && this.project.bounds.width != this.bounds.width){
					if(!this.l_dimensions.bottom){
						this.l_dimensions.bottom = new DimensionLine({
							pos: "bottom",
							parent: this.l_dimensions,
							offset: ivert.length ? -260 : -130
						});
					}else
						this.l_dimensions.bottom.offset = ivert.length ? -260 : -130;

				}else{
					if(this.l_dimensions.bottom){
						this.l_dimensions.bottom.remove();
						this.l_dimensions.bottom = null;
					}
				}

				
			}

			// сначала гасим, а затем перерисовываем размерные линии
			// for(i = this.l_dimensions.children.length -1; i >=0; i--){
			// 	this.l_dimensions.children[i].visible = false;
			// }
			for(i = this.l_dimensions.children.length -1; i >=0; i--){
				this.l_dimensions.children[i].redraw();
			}
		}
	},

	clear_dimentions: {
	
		value: function () {
			for(var key in this.l_dimensions.ihor){
				this.l_dimensions.ihor[key].remove();
				delete this.l_dimensions.ihor[key];
			}
			for(var key in this.l_dimensions.ivert){
				this.l_dimensions.ivert[key].remove();
				delete this.l_dimensions.ivert[key];
			}
			if(this.l_dimensions.bottom){
				this.l_dimensions.bottom.remove();
				this.l_dimensions.bottom = null;
			}
			if(this.l_dimensions.top){
				this.l_dimensions.top.remove();
				this.l_dimensions.top = null;
			}
			if(this.l_dimensions.right){
				this.l_dimensions.right.remove();
				this.l_dimensions.right = null;
			}
			if(this.l_dimensions.left){
				this.l_dimensions.left.remove();
				this.l_dimensions.left = null;
			}
		}
	},

	/**
	 * Обработчик события при удалении элемента
	 */
	on_remove_elm: {
		
		value: function (elm) {

			// при удалении любого профиля, удаляем размрные линии импостов
			if(this.parent)
				this.parent.on_remove_elm(elm);

			else if (elm instanceof Profile && !this.project.data._loading)
				this.clear_dimentions();
			
		}
	},

	/**
	 * Обработчик события при вставке элемента
	 */
	on_insert_elm: {

		value: function (elm) {

			// при вставке любого профиля, удаляем размрные линии импостов
			if(this.parent)
				this.parent.on_remove_elm(elm);

			else if (elm instanceof Profile && !this.project.data._loading)
				this.clear_dimentions();

		}
	},

	/**
	 * Обработчик при изменении системы
	 */
	on_sys_changed: {
		value: function () {
			
			this.profiles.forEach(function (profile) {
				profile.inset = profile.project.default_inset({elm_type: profile.elm_type, pos: profile.pos});
			});

			this.glasses().forEach(function(elm) {
				if (elm instanceof Contour)
					elm.on_sys_changed();
				else{
					// заполнения проверяем по толщине
					if(elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
						elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
					// проверяем-изменяем соединения заполнений с профилями
					elm.profiles.forEach(function (curr) {
						if(!curr.cnn || !curr.cnn.check_nom2(curr.profile))
							curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, acn.ii);
					});
				}
			});
		}
	}
});

/**
 * Экспортируем конструктор Contour, чтобы фильтровать инстанции этого типа
 * @property Contour
 * @for $p
 * @type {function}
 */
$p.Contour = Contour;