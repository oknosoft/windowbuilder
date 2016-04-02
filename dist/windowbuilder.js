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
 * Строковые константы интернационализации
 * Created 13.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module i18n.ru.js
 */

(function (msg){
	msg.align_node_right = "Уравнять вертикально вправо";
	msg.align_node_bottom = "Уравнять горизонтально вниз";
	msg.align_node_top = "Уравнять горизонтально вверх";
	msg.align_node_left = "Уравнять вертикально влево";
	msg.align_set_right = "Установить размер сдвигом правых элементов";
	msg.align_set_bottom = "Установить размер сдвигом нижних элементов";
	msg.align_set_top = "Установить размер сдвигом верхних элементов";
	msg.align_set_left = "Установить размер сдвигом левых элементов";
	msg.align_invalid_direction = "Неприменимо для элемента с данной ориентацией";

	msg.bld_constructor = "Конструктор объектов графического построителя";
	msg.bld_title = "Графический построитель";
	msg.bld_empty_param = "Не заполнен обязательный параметр <br />";
	msg.bld_not_product = "В текущей строке нет изделия построителя";
	msg.bld_not_draw = "Отсутствует эскиз или не указана система профилей";
	msg.bld_wnd_title = "Построитель изделия № ";
	msg.bld_from_blocks_title = "Выбор типового блока";
	msg.bld_from_blocks = "Текущее изделие будет заменено конфигурацией типового блока. Продолжить?";
	msg.bld_split_imp = "В параметрах продукции<br />'%1'<br />запрещены незамкнутые контуры<br />" +
		"Для включения деления импостом,<br />установите это свойство в 'Истина'";
	
})($p.msg);

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
				res = new paper.Rectangle();
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
			if(!llength && on_contour_redrawed)
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
			var profile_bounds = this.profile_bounds;
			this._row.x = profile_bounds.width;
			this._row.y = profile_bounds.height;
			this._row.is_rectangular = this.is_rectangular;
			if(this.parent){
				this._row.w = this.w;
				this._row.h = this.h;
			}else{
				this._row.w = 0;
				this._row.h = 0;
			}
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
	 * Габариты по внешним краям профиля
	 */
	profile_bounds: {
		get: function () {
			var bounds;

			this.profiles.forEach(function (profile) {
				if(!bounds)
					bounds = profile.path.bounds;
				else
					bounds = bounds.unite(profile.path.bounds);
			});
			return bounds;
		},
		enumerable : false
	},

	/**
	 * Возвращает структуру профилей по сторонам
	 */
	profiles_by_side: {
		get: function () {
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
				["left","top","bottom","right"].forEach(by_side);
			}

			return res;

		},
		enumerable : false
	},

	/**
	 * Возвращает профиль по номеру стороны фурнитуры
	 * @param side {Number}
	 */
	profile_by_furn_side: {
		value: function (side) {
			var profiles = this.profiles;
		},
		enumerable : false
	},

	/**
	 * Признак прямоугольности
	 */
	is_rectangular: {
		get : function(){
			return (this.side_count != 4) || !this.profiles.some(function (profile) {
				return !profile.is_linear();
			});
		},
		enumerable : false
	},

	/**
	 * Количество сторон контура
	 */
	side_count: {
		get : function(){
			return this.profiles.length;
		},
		enumerable : false
	},

	w: {
		get : function(){
			if(this.side_count != 4)
				return 0;
			var profiles = this.profiles_by_side,
				profile_bounds = this.profile_bounds;

			return profile_bounds.width - profiles.left.nom.sizefurn - profiles.right.nom.sizefurn;
		},
		enumerable : false
	},

	h: {
		get : function(){
			if(this.side_count != 4)
				return 0;
			var profiles = this.profiles_by_side,
				profile_bounds = this.profile_bounds;

			return profile_bounds.height - profiles.top.nom.sizefurn - profiles.bottom.nom.sizefurn;
		},
		enumerable : false
	}
});
/**
 *
 * Created 21.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  dimension_line
 */

/**
 * Произвольный текст на эскизе
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @constructor
 * @extends paper.Group
 */
function DimensionLine(attr){


	DimensionLine.superclass.constructor.call(this, attr);

	// strokeColor: consts.lgray

	var _row;

	this.data.pos = attr.pos;
	this.data.elm1 = attr.elm1;
	this.data.elm2 = attr.elm2 || this.data.elm1;
	this.data.p1 = attr.p1 || "b";
	this.data.p2 = attr.p2 || "e";

	this.__define({
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
	this.remove = function () {
		if(_row){
			_row._owner.del(_row);
			_row = null;
		}
		DimensionLine.superclass.remove.call(this);
	};

	this.on({
		mouseenter: this._mouseenter,
		mouseleave: this._mouseleave,
		click: this._click
	});

	$p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

}
DimensionLine._extend(paper.Group);

DimensionLine.prototype.__define({

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

	_nodes: {
		get: function () {

			if(!this.data._nodes)
				this.data._nodes = {

					callout1: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
					callout2: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
					scale: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
					text: new paper.PointText({
						parent: this,
						justification: 'center',
						fillColor: 'black',
						fontSize: 72})
				};
			return this.data._nodes;
		}
	},

	_mouseenter: {
		value: function (event) {
			paper.canvas_cursor('cursor-arrow-ruler');
		},
		enumerable: false
	},

	_mouseleave: {
		value: function (event) {
			//paper.canvas_cursor('cursor-arrow-white');
		},
		enumerable: false
	},

	_click: {
		value: function (event) {
			event.stop();
			this.wnd = new RulerWnd();
			this.wnd.size = this.size;
		},
		enumerable: false
	},

	_move_points: {
		value: function (event, xy) {

			var _bounds = this.parent.parent.bounds, delta;

			if(this.pos == "top" || this.pos == "bottom")
				if(event.name == "right")
					delta = new paper.Point(event.size - _bounds.width, 0);
				else
					delta = new paper.Point(_bounds.width - event.size, 0);
			else{
				if(event.name == "bottom")
					delta = new paper.Point(0, event.size - _bounds.height);
				else
					delta = new paper.Point(0, _bounds.height - event.size);
			}


			if(delta.length){
				paper.project.deselect_all_points();
				paper.project.getItems({class: Profile}).forEach(function (p) {
					if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0 && Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.segments.forEach(function (segm) {
							segm.selected = true;
						})
					}else if(Math.abs(p.b[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.firstSegment.selected = true;

					}else if(Math.abs(p.e[xy] - _bounds[event.name]) < consts.sticking0){
						p.generatrix.lastSegment.selected = true;

					}
				});
				paper.project.move_points(delta);
				setTimeout(function () {
					paper.project.deselect_all_points(true);
					paper.project.register_update();
					//paper.project.zoom_fit();
				}, 200);
			}
		},
		enumerable: false
	},

	_sizes_wnd: {
		value: function (event) {
			if(event.wnd == this.wnd){

				switch(event.name) {
					case 'close':
						this._nodes.text.selected = false;
						this.wnd = null;
						break;

					case 'left':
					case 'right':
						if(this.pos == "top" || this.pos == "bottom")
							this._move_points(event, "x");
						break;

					case 'top':
					case 'bottom':
						if(this.pos == "left" || this.pos == "right")
							this._move_points(event, "y");
						break;
				}
			}
		},
		enumerable: false
	},

	redraw: {
		value: function (_bounds) {

			var _nodes = this._nodes,
				b, e, tmp, normal, length, bs, es;

			if(!_bounds)
				_bounds = this.parent.parent.bounds;

			if(!this.pos){
				b = this.data.elm1[this.data.p1];
				e = this.data.elm2[this.data.p2];

			}else if(this.pos == "top"){
				b = _bounds.topLeft;
				e = _bounds.topRight;

			}else if(this.pos == "left"){
				b = _bounds.bottomLeft;
				e = _bounds.topLeft;

			}else if(this.pos == "bottom"){
				b = _bounds.bottomLeft;
				e = _bounds.bottomRight;

			}else if(this.pos == "right"){
				b = _bounds.bottomRight;
				e = _bounds.topRight;
			}

			tmp = new paper.Path({
				insert: false,
				segments: [b, e]
			});

			normal = tmp.getNormalAt(0).multiply(90);
			if(this.pos == "right" || this.pos == "bottom")
				normal = normal.multiply(1.4).negate();

			length = tmp.length;
			bs = b.add(normal.multiply(0.8));
			es = e.add(normal.multiply(0.8));

			if(_nodes.callout1.segments.length){
				_nodes.callout1.firstSegment.point = b;
				_nodes.callout1.lastSegment.point = b.add(normal);
			}else
				_nodes.callout1.addSegments([b, b.add(normal)]);

			if(_nodes.callout2.segments.length){
				_nodes.callout2.firstSegment.point = e;
				_nodes.callout2.lastSegment.point = e.add(normal);
			}else
				_nodes.callout2.addSegments([e, e.add(normal)]);

			if(_nodes.scale.segments.length){
				_nodes.scale.firstSegment.point = bs;
				_nodes.scale.lastSegment.point = es;
			}else
				_nodes.scale.addSegments([bs, es]);


			_nodes.text.content = length.toFixed(0);
			_nodes.text.rotation = e.subtract(b).angle;
			_nodes.text.point = bs.add(es).divide(2);


		},
		enumerable : false
	},

	// размер
	size: {
		get: function () {
			return parseFloat(this._nodes.text.content);
		},
		set: function (v) {
			this._nodes.text.content = parseFloat(v);
		},
		enumerable: false
	},

	// угол к горизонту в направлении размера
	angle: {
		get: function () {
			return 0;
		},
		set: function (v) {

		},
		enumerable: false
	},

	// расположение относительно контура $p.enm.pos
	pos: {
		get: function () {
			return this.data.pos || "";
		},
		set: function (v) {
			this.data.pos = v;
			this.redraw();
		},
		enumerable: false
	},

	// отступ от внешней границы изделия
	offset: {
		get: function () {
			return 100;
		},
		set: function (v) {

		},
		enumerable: false
	}

});

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

	BuilderElement.superclass.constructor.call(this);

	if(!attr.row)
		attr.row = this.project.ox.coordinates.add();

	this.__define({
		_row: {
			get: function () {
				return attr.row;
			},
			enumerable: false
		}
	});

	if(attr.proto){

		this.inset = attr.proto.inset;

		if(attr.parent)
			this.parent = attr.parent;
		else if(attr.proto.parent)
			this.parent = attr.proto.parent;

		if(attr.proto instanceof Profile)
			this.insertBelow(attr.proto);

		this.clr = attr.proto.clr;

	}else if(attr.parent)
		this.parent = attr.parent;

	if(!attr.row.cnstr)
		attr.row.cnstr = this.parent.cnstr;

	if(!attr.row.elm)
		attr.row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;

	if(attr.row.elm_type.empty() && !this.inset.empty())
		attr.row.elm_type = this.inset.nom().elm_type;

	this.project.register_change();

	/**
	 * Удаляет элемент из контура и иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_ и отключает наблюдателя
	 * @method remove
	 */
	this.remove = function () {

		this.detache_wnd();

		if(this.parent && this.parent._noti && this.observer)
			Object.unobserve(this.parent._noti, this.observer);

		if(this.project.ox === attr.row._owner._owner)
			attr.row._owner.del(attr.row);
		delete attr.row;

		BuilderElement.superclass.remove.call(this);
		this.project.register_change();
	};

}

// BuilderElement наследует свойства класса Group
BuilderElement._extend(paper.Group);

// Привязываем свойства номенклатуры, вставки и цвета
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
	},

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
						var selection = t instanceof Filling ?
						{elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}} :
						{elm_type: t.nom.elm_type};

						if($p.is_data_obj(o)){
							var ok = false;
							selection.nom = o;
							t.project._dp.sys.elmnts.find_rows(selection, function (row) {
								ok = true;
								return false;
							});
							return ok;
						}else{
							var refs = "";
							t.project._dp.sys.elmnts.find_rows(selection, function (row) {
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
					info: t.project.ox._metadata.fields.note,
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
			return this.inset.nom(this);
		},
		enumerable : false
	},

	// номер элемента - свойство только для чтения
	elm: {
		get : function(){
			return this._row.elm;
		},
		enumerable : false
	},

	// информация для редактора свойста
	info: {
		get : function(){
			return "№" + this.elm;
		},
		enumerable : true
	},

	// вставка
	inset: {
		get : function(){
			return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
		},
		set : function(v){
			this._row.inset = v;
			if(this.data && this.data._rays)
				this.data._rays.clear_segments();
			this.project.register_change();
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
			var clr = this._row.clr,
				view_out = false,
				clr_str = clr.clr_str;

			if(!view_out){
				if(!clr.clr_in.empty() && clr.clr_in.clr_str)
					clr_str = clr.clr_in.clr_str;
			}else{
				if(!clr.clr_out.empty() && clr.clr_out.clr_str)
					clr_str = clr.clr_out.clr_str;
			}

			// цвет элементу присваиваем только если он уже нарисован
			if(clr_str && this.path instanceof paper.Path){
				clr = clr_str.split(",");
				if(clr.length == 1){
					if(clr_str[0] != "#")
						clr_str = "#" + clr_str;
					clr = new paper.Color(clr_str);
					clr.alpha = 0.96;

				}else if(clr.length == 4){
					clr = new paper.Color(clr[0], clr[1], clr[2], clr[3]);

				}else if(clr.length == 3){
					clr = new paper.Color({
						stops: [clr[0], clr[1], clr[2]],
						origin: this.path.bounds.bottomLeft,
						destination: this.path.bounds.topRight
					});
				}
				this.path.fillColor = clr;
			}

			this.project.register_change();

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
			return this.inset.thickness;
		},
		enumerable : false
	},

	// опорный размер (0 для рам и створок, 1/2 ширины для импостов)
	sizeb: {
		get : function(){
			return this.inset.sizeb || 0;
		},
		enumerable : false
	},

	// размер до фурнитурного паза
	sizefurn: {
		get : function(){
			return this.nom.sizefurn || 20;
		},
		enumerable : false
	},

	/**
	 * Подключает окно редактор свойств текущего элемента, выбранного инструментом
	 */
	attache_wnd: {
		value: function(cell){

			if(!this.data._grid || !this.data._grid.cell){

				this.data._grid = cell.attachHeadFields({
					obj: this,
					oxml: this.oxml
				});
				this.data._grid.attachEvent("onRowSelect", function(id){
					if(id == "x1" || id == "y1")
						this._obj.select_node("b");
					else if(id == "x2" || id == "y2")
						this._obj.select_node("e");
				});

			}else{
				if(this.data._grid._obj != this)
					this.data._grid.attach({
						obj: this,
						oxml: this.oxml
					});
			}
		},
		enumerable: false
	},

	/**
	 * Отключает и выгружает из памяти окно свойств элемента
	 */
	detache_wnd: {
		value: function(){
			if(this.data._grid && this.data._grid.destructor){
				this.data._grid._owner_cell.detachObject(true);
				delete this.data._grid;
			}
		},
		enumerable: false
	}

});


Editor.BuilderElement = BuilderElement;


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
 * @param attr {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Filling(attr){

	Filling.superclass.constructor.call(this, attr);

	var _row = attr.row;

	// initialize
	(function(){

		var h = this.project.bounds.height + this.project.bounds.y;

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
		this.data.path.reduce();
		this.data.path.strokeWidth = 0;

		this.clr = _row.clr.empty() ? $p.cat.predefined_elmnts.predefined("Цвет_Основной") : _row.clr;
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

	profiles: {
		get : function(){
			return this.data._profiles || [];
		},
		enumerable : false
	},

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {

			var h = this.project.bounds.height + this.project.bounds.y,
				_row = this._row,
				bounds = this.bounds,
				cnns = this.project.connections.cnns,
				glass = this.project.ox.glasses.add({
					elm: _row.elm,
					nom: this.nom,
					width: bounds.width,
					height: bounds.height,
					s: this.s,
					is_rectangular: this.is_rectangular,
					thickness: this.thickness
				});

			_row.x1 = (bounds.bottomLeft.x - this.project.bounds.x).round(3);
			_row.y1 = (h - bounds.bottomLeft.y).round(3);
			_row.x2 = (bounds.topRight.x - this.project.bounds.x).round(3);
			_row.y2 = (h - bounds.topRight.y).round(3);
			_row.path_data = this.path.pathData;

			this.profiles.forEach(function (curr) {
				if(!curr.profile || !curr.profile._row || !curr.cnn){
					throw new ReferenceError("Не найдено ребро заполнения");
				}
				cnns.add({
					elm1: _row.elm,
					elm2: curr.profile._row.elm,
					node1: "",
					node2: "",
					cnn: curr.cnn.ref,
					aperture_len: curr.sub_path.length
				});
			}.bind(this));

		},
		enumerable : false
	},

	/**
	 * Создаёт створку в текущем заполнении
	 */
	create_leaf: {
		value: function () {

			// создаём пустой новый слой
			var contour = new Contour( {parent: this.parent});

			// задаём его путь - внутри будут созданы профили
			contour.path = this.profiles;

			// помещаем себя вовнутрь нового слоя
			this.parent = contour;
			this._row.cnstr = contour.cnstr;

			// оповещаем мир о новых слоях
			Object.getNotifier(this.project._noti).notify({
				type: 'rows',
				tabular: "constructions"
			});

		},
		enumerable : false
	},

	s: {
		get : function(){
			return this.bounds.width * this.bounds.height / 1000000;
		},
		enumerable : true
	},

	/**
	 * Признак прямоугольности
	 */
	is_rectangular: {
		get : function(){
			return this.profiles.length == 4 && !this.data.path.hasHandles();
		},
		enumerable : false
	},

	is_sandwich: {
		get : function(){
			return false;
		},
		enumerable : false
	},

	/**
	 * путь элемента - состоит из кривых, соединяющих вершины элемента
	 * @property path
	 * @type paper.Path
	 */
	path: {
		get : function(){ return this.data.path; },
		set : function(attr){

			var data = this.data;
			data.path.removeSegments();
			data._profiles = [];

			if(attr instanceof paper.Path){

				// Если в передаваемом пути есть привязка к профилям контура - используем
				if(attr.data.curve_nodes){

					data.path.addSegments(attr.segments);
				}else{
					data.path.addSegments(attr.segments);
				}


			}else if(Array.isArray(attr)){
				var length = attr.length, prev, curr, next, sub_path;
				// получам эквидистанты сегментов, смещенные на размер соединения
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile);
					sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

					//sub_path.data.reversed = curr.profile.generatrix.getDirectedAngle(next.e) < 0;
					//if(sub_path.data.reversed)
					//	curr.outer = !curr.outer;
					curr.sub_path = sub_path.equidistant(
						(sub_path.data.reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);
				}
				// получам пересечения
				for(var i=0; i<length; i++ ){
					prev = i==0 ? attr[length-1] : attr[i-1];
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					if(!curr.pb)
						curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
					if(!curr.pe)
						curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
					if(!curr.pb || !curr.pe){
						throw "Filling:path";
					}
					curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
				}
				// формируем путь
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					data.path.addSegments(curr.sub_path.segments);
					["anext","pb","pe"].forEach(function (prop) {
						delete curr[prop];
					});
					data._profiles.push(curr);
				}
			}

			if(data.path.segments.length && !data.path.closed)
				data.path.closePath(true);

			data.path.reduce();

			data = attr = null;
		},
		enumerable : false
	},

	// возвращает текущие (ранее установленные) узлы заполнения
	nodes: {
		get: function () {
			var res = [];
			if(this.profiles.length){
				this.profiles.forEach(function (curr) {
					res.push(curr.b);
				});
			}else{
				res = this.parent.glass_nodes(this.path);
			}
			return res;
		},
		enumerable : false
	},

	/**
	 * Возвращает массив внешних примыкающих профилей текущего заполнения
	 */
	outer_profiles: {
		get: function () {
			return this.profiles;
		},
		enumerable : false
	},

	/**
	 * Массив с рёбрами периметра
	 */
	perimeter: {
		get: function () {
			var res = [], tmp;
			this.profiles.forEach(function (curr) {
				res.push(tmp = {
					len: curr.sub_path.length,
					angle: curr.e.subtract(curr.b).angle
				});
				if(tmp.angle < 0)
					tmp.angle += 360;
			});
			return res;
		},
		enumerable : false
	},

	/**
	 * Координата x левой границы (только для чтения)
	 */
	x1: {
		get: function () {
			return (this.bounds.left - this.project.bounds.x).round(1);
		},
		set: function (v) {

		},
		enumerable : false
	},

	/**
	 * Координата x правой границы (только для чтения)
	 */
	x2: {
		get: function () {
			return (this.bounds.right - this.project.bounds.x).round(1);
		},
		set: function (v) {

		},
		enumerable : false
	},

	/**
	 * Координата y нижней границы (только для чтения)
	 */
	y1: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
		},
		set: function (v) {

		},
		enumerable : false
	},

	/**
	 * Координата y верхней (только для чтения)
	 */
	y2: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
		},
		set: function (v) {

		},
		enumerable : false
	},

	// информация для редактора свойста
	info: {
		get : function(){
			return "№" + this.elm + " w:" + this.bounds.width.toFixed(0) + " h:" + this.bounds.height.toFixed(0);
		},
		enumerable : true
	},

	select_node: {
		value: function (v) {
			var point, segm, delta = 10e9;
			if(v == "b"){
				point = this.bounds.bottomLeft;
			}else{
				point = this.bounds.topRight;
			}
			this.data.path.segments.forEach(function (curr) {
				curr.selected = false;
				if(point.getDistance(curr.point) < delta){
					delta = point.getDistance(curr.point);
					segm = curr;
				}
			});
			segm.selected = true;
			this.view.update();
		},
		enumerable : false
	},

	/**
	 * Описание полей диалога свойств элемента
	 */
	oxml: {
		get: function () {
			return {
				" ": [
					{id: "info", path: "o.info", synonym: "Элемент", type: "ro", txt: this.info},
					"inset",
					"clr"
				],
				"Начало": [
					{id: "x1", path: "o.x1", synonym: "X1", type: "ro", txt: this.x1},
					{id: "y1", path: "o.y1", synonym: "Y1", type: "ro", txt: this.y1}
				],
				"Конец": [
					{id: "x2", path: "o.x2", synonym: "X2", type: "ro", txt: this.x2},
					{id: "y2", path: "o.y2", synonym: "Y2", type: "ro", txt: this.y2}
				]
			}
		},
		enumerable: false
	}

});

Editor.Filling = Filling;
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
	 * Угол по отношению к соседнему пути _other_ в точке _point_
	 */
	angle_to: {
		value : function(other, point, interior){
			var p1 = this.getNearestPoint(point),
				p2 = other.getNearestPoint(point),
				t1 = this.getTangentAt(this.getOffsetOf(p1)),
				t2 = other.getTangentAt(other.getOffsetOf(p2)),
				res = t2.angle - t1.angle;
			if(res < 0)
				res += 360;
			if(interior && res > 180)
				res = 180 - (res - 180);
			return res;
		},
		enumerable : false
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
			var tmp;

			if(point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point)){
				tmp = this.clone(false);

			}else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
				tmp = this.clone(false);
				tmp.reverse();
				tmp.data.reversed = true;

			} else{

				var loc1 = this.getLocationOf(point1),
					loc2 = this.getLocationOf(point2);
				if(!loc1)
					loc1 = this.getNearestLocation(point1);
				if(!loc2)
					loc2 = this.getNearestLocation(point2);

				if(this.is_linear()){
					// для прямого формируем новый путь из двух точек
					tmp = new paper.Path({
						segments: [loc1.point, loc2.point],
						insert: false
					});

				}else{
					// для кривого строим по точкам, наподобие эквидистанты
					var step = (loc2.offset - loc1.offset) * 0.02,
						tmp = new paper.Path({
							segments: [point1],
							insert: false
						});

					if(step < 0){
						tmp.data.reversed = true;
						for(var i = loc1.offset; i>=loc2.offset; i+=step)
							tmp.add(this.getPointAt(i));
					}else if(step > 0){
						for(var i = loc1.offset; i<=loc2.offset; i+=step)
							tmp.add(this.getPointAt(i));
					}
					tmp.add(point2);
					tmp.simplify(0.8);
				}

				if(loc1.offset > loc2.offset)
					tmp.data.reversed = true;
			}

			return tmp;
		},
		enumerable: false
	},

	/**
	 * возвращает путь, равноотстоящий от текущего пути
	 * @param delta {number} - расстояние, на которое будет смещен новый путь
	 * @param elong {number} - удлинение нового пути с каждого конца
	 * @return {paper.Path}
	 */
	equidistant: {
		value: function (delta, elong) {

			var normal = this.getNormalAt(0),
				res = new paper.Path({
					segments: [this.firstSegment.point.add(normal.multiply(delta))],
					insert: false
				});

			if(this.is_linear()) {
				// добавляем последнюю точку
				res.add(this.lastSegment.point.add(normal.multiply(delta)));

			}else{

				// для кривого бежим по точкам
				var len = this.length, step = len * 0.02, point;

				for(var i = step; i<=len; i+=step) {
					point = this.getPointAt(i);
					if(!point)
						continue;
					normal = this.getNormalAt(i);
					res.add(point.add(normal.multiply(delta)));
				}

				// добавляем последнюю точку
				normal = this.getNormalAt(len);
				res.add(this.lastSegment.point.add(normal.multiply(delta)));

				res.simplify(0.8);
			};

			return res.elongation(elong);
		},
		enumerable: false
	},

	/**
	 * Удлиняет путь касательными в начальной и конечной точках
	 */
	elongation: {
		value: function (delta) {

			if(delta){
				var tangent = this.getTangentAt(0);
				if(this.is_linear()) {
					this.firstSegment.point = this.firstSegment.point.add(tangent.multiply(-delta));
					this.lastSegment.point = this.lastSegment.point.add(tangent.multiply(delta));
				}else{
					this.insert(0, this.firstSegment.point.add(tangent.multiply(-delta)));
					tangent = this.getTangentAt(this.length);
					this.add(this.lastSegment.point.add(tangent.multiply(delta)));
				}
			}

			return this;

		},
		enumerable: false
	},

	/**
	 * Находит координату пересечения путей в окрестности точки
	 * @method intersect_point
	 * @for Path
	 * @param path {paper.Path}
	 * @param point {paper.Point}
	 * @param elongate {Boolean} - если истина, пути будут продолжены до пересечения
	 * @return point {paper.Point}
	 */
	intersect_point: {
		value: function (path, point, elongate) {
			var intersections = this.getIntersections(path),
				delta = 10e9, tdelta, tpoint;

			if(intersections.length == 1)
				return intersections[0].point

			else if(intersections.length > 1){
				intersections.forEach(function(o){
					tdelta = o.point.getDistance(point, true);
					if(tdelta < delta){
						delta = tdelta;
						tpoint = o.point;
					}
				});
				return tpoint;

			}else if(elongate){
				// продлеваем пути до пересечения
				var p1 = this.getNearestPoint(point),
					p2 = path.getNearestPoint(point),
					p1last = this.firstSegment.point.getDistance(p1, true) > this.lastSegment.point.getDistance(p1, true),
					p2last = path.firstSegment.point.getDistance(p2, true) > path.lastSegment.point.getDistance(p2, true),
					tg;

				tg = (p1last ? this.getTangentAt(this.length) : this.getTangentAt(0).negate()).multiply(100);
				if(this.is_linear){
					if(p1last)
						this.lastSegment.point = this.lastSegment.point.add(tg);
					else
						this.firstSegment.point = this.firstSegment.point.add(tg);
				}

				tg = (p2last ? path.getTangentAt(path.length) : path.getTangentAt(0).negate()).multiply(100);
				if(path.is_linear){
					if(p2last)
						path.lastSegment.point = path.lastSegment.point.add(tg);
					else
						path.firstSegment.point = path.firstSegment.point.add(tg);
				}

				return this.intersect_point(path, point);

			}
		},
		enumerable: false
	}

});


paper.Point.prototype.__define({

	/**
	 * Выясняет, расположена ли точка в окрестности точки
	 * @param point {paper.Point}
	 * @param [sticking] {Boolean}
	 * @return {Boolean}
	 */
	is_nearest: {
		value: function (point, sticking) {
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 10);
		},
		enumerable: false
	},

	/**
	 * ПоложениеТочкиОтносительноПрямой
	 * @param x1 {Number}
	 * @param y1 {Number}
	 * @param x2 {Number}
	 * @param y2 {Number}
	 * @return {number}
	 */
	point_pos: {
		value: function(x1,y1, x2,y2){
			if (Math.abs(x1-x2) < 0.2){
				// вертикаль  >0 - справа, <0 - слева,=0 - на линии
				return (this.x-x1)*(y1-y2);
			}
			if (Math.abs(y1-y2) < 0.2){
				// горизонталь >0 - снизу, <0 - сверху,=0 - на линии
				return (this.y-y1)*(x2-x1);
			}
			// >0 - справа, <0 - слева,=0 - на линии
			return (this.y-y1)*(x2-x1)-(y2-y1)*(this.x-x1);
		},
		enumerable: false
	},

	/**
	 * Рассчитывает координаты точки, лежащей на окружности
	 * @param x1 {Number}
	 * @param y1 {Number}
	 * @param x2 {Number}
	 * @param y2 {Number}
	 * @param r {Number}
	 * @param arc_ccw {Boolean}
	 * @param more_180 {Boolean}
	 * @return {Point}
	 */
	arc_cntr: {
		value: function(x1,y1, x2,y2, r0, ccw){
			var a,b,p,r,q,yy1,xx1,yy2,xx2;
			if(ccw){
				var tmpx=x1, tmpy=y1;
				x1=x2; y1=y2; x2=tmpx; y2=tmpy;
			}
			if (x1!=x2){
				a=(x1*x1 - x2*x2 - y2*y2 + y1*y1)/(2*(x1-x2));
				b=((y2-y1)/(x1-x2));
				p=b*b+ 1;
				r=-2*((x1-a)*b+y1);
				q=(x1-a)*(x1-a) - r0*r0 + y1*y1;
				yy1=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				xx1=a+b*yy1;
				yy2=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				xx2=a+b*yy2;
			} else{
				a=(y1*y1 - y2*y2 - x2*x2 + x1*x1)/(2*(y1-y2));
				b=((x2-x1)/(y1-y2));
				p=b*b+ 1;
				r=-2*((y1-a)*b+x1);
				q=(y1-a)*(y1-a) - r0*r0 + x1*x1;
				xx1=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				yy1=a+b*xx1;
				xx2=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				yy2=a+b*xx2;
			}

			if (new paper.Point(xx1,yy1).point_pos(x1,y1, x2,y2)>0)
				return {x: xx1, y: yy1};
			else
				return {x: xx2, y: yy2}
		},
		enumerable: false
	},

	arc_point: {
		value: function(x1,y1, x2,y2, r, arc_ccw, more_180){
			var point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				var dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
				if(dr >= 0){
					centr = this.arc_cntr(x1,y1, x2,y2, r, arc_ccw);
					dx = centr.x - point.x;
					dy = point.y - centr.y;	// т.к. Y перевернут
					l = Math.sqrt(dx*dx + dy*dy);

					if(more_180)
						h = r+Math.sqrt(dr);
					else
						h = r-Math.sqrt(dr);

					point.x += dx*h/l;
					point.y += dy*h/l;
				}
			}
			return point;
		},
		enumerable: false
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
		_corns = [];

	Profile.superclass.constructor.call(this, attr);

	/**
	 * Наблюдает за изменениями контура и пересчитывает путь элемента при изменении соседних элементов
	 */
	this.observer = function(an){

		var bcnn, ecnn, moved;

		// собственно, привязка
		function do_bind(p){

			var mpoint, imposts, moved_fact;

			if(bcnn.cnn && bcnn.profile == p){
				// обрабатываем угол
				if(acn.a.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					if(!_profile.b.is_nearest(p.e)){
						if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(_profile.b.getDistance(p.e, true) < _profile.b.getDistance(p.b, true))
									_profile.b = p.e;
								else
									_profile.b = p.b;
								moved_fact = true;
							}
						} else{
							// отрываем привязанный ранее профиль
							bcnn.clear();
							_profile.data._rays.clear_segments();
						}
					}

				}
				// обрабатываем T
				else if(acn.t.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					// импосты в створках и все остальные импосты
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(_profile.b);
					if(!mpoint.is_nearest(_profile.b)){
						_profile.b = mpoint;
						moved_fact = true;
					}
				}

			}
			if(ecnn.cnn && ecnn.profile == p){
				// обрабатываем угол
				if(acn.a.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					if(!_profile.e.is_nearest(p.b)){
						if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(_profile.e.getDistance(p.b, true) < _profile.e.getDistance(p.e, true))
									_profile.e = p.b;
								else
									_profile.e = p.e;
								moved_fact = true;
							}
						} else{
							// отрываем привязанный ранее профиль
							ecnn.clear();
							_profile.data._rays.clear_segments();
						}
					}
				}
				// обрабатываем T
				else if(acn.t.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					// импосты в створках и все остальные импосты
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(_profile.e);
					if(!mpoint.is_nearest(_profile.e)){
						_profile.e = mpoint;
						moved_fact = true;
					}
				}

			}

			// если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
			if(moved && moved_fact){
				imposts = _profile.joined_imposts();
				imposts = imposts.inner.concat(imposts.outer);
				for(var i in imposts){
					if(moved.profiles.indexOf(imposts[i]) == -1){
						imposts[i].profile.observer(_profile);
					}
				}
			}

		}

		if(Array.isArray(an)){
			moved = an[an.length-1];

			if(moved.profiles.indexOf(_profile) == -1){

				bcnn = _profile.cnn_point("b");
				ecnn = _profile.cnn_point("e");

				// если среди профилей есть такой, к которму примыкает текущий, пробуем привязку
				moved.profiles.forEach(do_bind);

				moved.profiles.push(_profile);
			}

		}else if(an instanceof Profile){
			bcnn = _profile.cnn_point("b");
			ecnn = _profile.cnn_point("e");
			do_bind(an);
		}

	};

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
	 * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
	 * @return {CnnPoint} - объект {point, profile, cnn_types}
	 */
	this.cnn_point = function(node, point){

		var res = this.rays[node],
			c_d = this.project.check_distance,
			open_cnn = this.project._dp.sys.allow_open_cnn;

		if(!point)
			point = this[node];


		// Если привязка не нарушена, возвращаем предыдущее значение
		if(res.profile && res.profile.children.length){
			if(!res.is_t && (res.profile_point == "b" || res.profile_point == "e"))
				return res;

			else if(c_d(res.profile, _profile, res, point, true) === false)
				return res;
		}

		res.clear();

		// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
		if(this.parent){
			var profiles = this.parent.profiles, ares = [], angl;
			for(var i in profiles){
				if(c_d(profiles[i], _profile, res, point, false) === false){

					// для простых систем разрывы профиля не анализируем
					if(!open_cnn)
						return res;

					ares.push({
						profile_point: res.profile_point,
						profile: res.profile,
						cnn_types: res.cnn_types,
						point: res.point});
				}
			}
			if(ares.length == 1){
				res._mixin(ares[0]);


			}else if(ares.length >= 2){

				// если в точке сходятся 3 и более профиля...
				// и среди соединений нет углового диагонального, вероятно, мы находимся в разрыве - выбираем соединение с пустотой
				// if(ares.some(function (curr) {
				// 		if(curr.profile && curr.profile_point)
				// 			;
				// 	})){
				// }
				res.clear();
				res.is_cut = true;
			}
			ares = null;
		}

		return res;
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
			if(isinner != undefined && isouter == undefined)
				return 1;
			else if(isinner == undefined && isouter != undefined)
				return -1;
			else
				return 1;
		}

		// если пересечение в узлах, используем лучи профиля
		if(cnn_point.profile){
			prays = cnn_point.profile.rays;
		}

		if(cnn_point.is_t){

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

		}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.av){
			// угловое к вертикальной
			if(this.orientation == $p.enm.orientations.Вертикальная){
				if(profile_point == "b"){
					intersect_point(prays.outer, rays.outer, 1);
					intersect_point(prays.outer, rays.inner, 4);

				}else if(profile_point == "e"){
					intersect_point(prays.outer, rays.outer, 2);
					intersect_point(prays.outer, rays.inner, 3);
				}
			}else if(this.orientation == $p.enm.orientations.Горизонтальная){
				if(profile_point == "b"){
					intersect_point(prays.inner, rays.outer, 1);
					intersect_point(prays.inner, rays.inner, 4);

				}else if(profile_point == "e"){
					intersect_point(prays.inner, rays.outer, 2);
					intersect_point(prays.inner, rays.inner, 3);
				}
			}else{
				cnn_point.err = "orientation";
			}

		}else if(cnn_point.cnn.cnn_type == $p.enm.cnn_types.tcn.ah){
			// угловое к горизонтальной
			if(this.orientation == $p.enm.orientations.Вертикальная){
				if(profile_point == "b"){
					intersect_point(prays.inner, rays.outer, 1);
					intersect_point(prays.inner, rays.inner, 4);

				}else if(profile_point == "e"){
					intersect_point(prays.inner, rays.outer, 2);
					intersect_point(prays.inner, rays.inner, 3);
				}
			}else if(this.orientation == $p.enm.orientations.Горизонтальная){
				if(profile_point == "b"){
					intersect_point(prays.outer, rays.outer, 1);
					intersect_point(prays.outer, rays.inner, 4);

				}else if(profile_point == "e"){
					intersect_point(prays.outer, rays.outer, 2);
					intersect_point(prays.outer, rays.inner, 3);
				}
			}else{
				cnn_point.err = "orientation";
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

	//
	this.initialize(attr);

}
Profile._extend(BuilderElement);

Profile.prototype.__define({

	/**
	 * Вызывается из конструктора - создаёт пути и лучи
	 */
	initialize: {
		value : function(attr){

			var h = this.project.bounds.height + this.project.bounds.y,
				_row = this._row;

			if(attr.r)
				_row.r = attr.r;

			if(attr.generatrix) {
				this.data.generatrix = attr.generatrix;
				if(this.data.generatrix.data.reversed)
					delete this.data.generatrix.data.reversed;

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

			// кеш лучей в узлах профиля
			this.data._rays = new ProfileRays(this);

			this.data.generatrix.strokeColor = 'grey';

			this.data.path = new paper.Path();
			this.data.path.strokeColor = 'black';
			this.data.path.strokeWidth = 1;
			this.data.path.strokeScaling = false;

			this.clr = _row.clr.empty() ? $p.cat.predefined_elmnts.predefined("Цвет_Основной") : _row.clr;
			//this.data.path.fillColor = new paper.Color(0.96, 0.98, 0.94, 0.96);

			this.addChild(this.data.path);
			this.addChild(this.data.generatrix);

			/**
			 * Подключаем наблюдателя за событиями контура с именем _consts.move_points_
			 */
			if(this.parent)
				Object.observe(this.parent._noti, this.observer, [consts.move_points]);

		},
		enumerable : false
	},

	/**
	 * Примыкающий внешний элемент - имеет смысл для сегментов створок
	 * @property nearest
	 * @type Profile
	 */
	nearest: {
		value : function(){
			var _profile = this,
				b = _profile.b,
				e = _profile.e,
				ngeneratrix, children;

			function check_nearest(){
				if(_profile.data._nearest){
					ngeneratrix = _profile.data._nearest.generatrix;
					if( ngeneratrix.getNearestPoint(b).is_nearest(b) && ngeneratrix.getNearestPoint(e).is_nearest(e)){
						_profile.data._nearest_cnn = $p.cat.cnns.elm_cnn(_profile, _profile.data._nearest, acn.ii, _profile.data._nearest_cnn);
						return true;
					}
				}
				_profile.data._nearest = null;
				_profile.data._nearest_cnn = null;
			}

			if(_profile.parent && _profile.parent.parent){
				if(!check_nearest()){
					children = _profile.parent.parent.children;
					for(var p in children){
						if((_profile.data._nearest = children[p]) instanceof Profile && check_nearest())
							return _profile.data._nearest;
						else
							_profile.data._nearest = null;
					}
				}
			}else
				_profile.data._nearest = null;

			return _profile.data._nearest;
		},
		enumerable : false
	},

	/**
	 * Координаты начала элемента
	 * @property b
	 * @type Point
	 */
	b: {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.firstSegment.point;
		},
		set : function(v){
			this.data._rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.firstSegment.point = v;
		},
		enumerable : false
	},

	/**
	 * Координаты конца элемента
	 * @property e
	 * @type Point
	 */
	e: {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.lastSegment.point;
		},
		set : function(v){
			this.data._rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.lastSegment.point = v;
		},
		enumerable : false
	},

	bc: {
		get : function(){
			return this.corns(1);
		},
		enumerable : false
	},

	ec: {
		get : function(){
			return this.corns(2);
		},
		enumerable : false
	},

	/**
	 * Координата x начала профиля
	 * @property x1
	 * @type {Number}
	 */
	x1: {
		get : function(){ return (this.b.x - this.project.bounds.x).round(1); },
		set: function(v){
			this.select_node("b");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.b.x, 0));	},
		enumerable : false
	},

	/**
	 * Координата y начала профиля
	 * @property y1
	 * @type {Number}
	 */
	y1: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.b.y).round(1); },
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("b");
			this.move_points(new paper.Point(0, v - this.b.y)); },
		enumerable : false
	},

	/**
	 * Координата x конца профиля
	 * @property x2
	 * @type {Number}
	 */
	x2: {
		get : function(){ return (this.e.x - this.project.bounds.x).round(1); },
		set: function(v){
			this.select_node("e");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.e.x, 0)); },
		enumerable : false
	},

	/**
	 * Координата y конца профиля
	 * @property y2
	 * @type {Number}
	 */
	y2: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.e.y).round(1); },
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("e");
			this.move_points(new paper.Point(0, v - this.e.y));},
		enumerable : false
	},

	// информация для редактора свойста
	info: {
		get : function(){
			return "№" + this.elm + " α:" + this.angle_hor.toFixed(0) + "° l:" + this.length.toFixed(0);
		},
		enumerable : true
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
			this.data._rays.clear();
			this._row.r = v;
		},
		enumerable : true
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
			this.data._rays.clear();
		},
		enumerable : true
	},

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {

			if(!this.data.generatrix)
				return;

			var _row = this._row,

				cnns = this.project.connections.cnns,
				b = this.rays.b,
				e = this.rays.e,
				row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4))
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3))
				}),

				gen = this.generatrix;

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = gen.pathData;
			_row.nom = this.nom;


			// добавляем припуски соединений
			_row.len = this.length;

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

			// для створочных профилей добавляем соединения с внешними элементами
			if(row_b = this.nearest()){
				cnns.add({
					elm1: _row.elm,
					elm2: row_b.elm,
					cnn: this.data._nearest_cnn,
					aperture_len: _row.len
				});
			}

			// получаем углы между элементами и к горизонту
			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - gen.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0)
				_row.alp1 = _row.alp1 + 360;

			_row.alp2 = Math.round((gen.getTangentAt(gen.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0)
				_row.alp2 = _row.alp2 + 360;

			// устанавливаем тип элемента
			_row.elm_type = this.elm_type;

			// TODO: Рассчитать положение и ориентацию
			// вероятно, импост, всегда занимает положение "центр"

		},
		enumerable : false
	},

	/**
	 * Дополняет cnn_point свойствами соединения
	 * @param cnn_point {CnnPoint}
	 */
	postcalc_cnn: {
		value: function(cnn_point){

			cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

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

	/**
	 * Возвращает точку, расположенную гарантированно внутри профиля
	 */
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
	},

	/**
	 * Расстояние от узла до опорной линии
	 * для створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
	 * не имеет смысла для заполнения, но нужно для рёбер заполнений
	 * @property d0
	 * @type Number
	 */
	d0: {
		get : function(){
			var res = 0, curr = this, nearest;

			while(nearest = curr.nearest()){
				res -= nearest.d2 + (curr.data._nearest_cnn ? curr.data._nearest_cnn.sz : 20);
				curr = nearest;
			}
			return res;
		},
		enumerable : true
	},

	/**
	 * Расстояние от узла до внешнего ребра элемента
	 * для рамы, обычно = 0, для импоста 1/2 ширины
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d1
	 * @type Number
	 */
	d1: {
		get : function(){ return -(this.d0 - this.sizeb); },
		enumerable : true
	},

	/**
	 * Расстояние от узла до внутреннего ребра элемента
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d2
	 * @type Number
	 */
	d2: {
		get : function(){ return this.d1 - this.width; },
		enumerable : true
	},

	/**
	 * Угол к горизонту
	 */
	angle_hor: {
		get : function(){
			var res = Math.round((new paper.Point(this.e.x - this.b.x, this.b.y - this.e.y)).angle * 10) / 10;
			return res < 0 ? res + 360 : res;
		},
		enumerable : false
	},

	/**
	 * Длина профиля с учетом соединений
	 */
	length: {

		get: function () {
			var gen = this.generatrix,
				sub_gen,
				ppoints = {},
				b = this.rays.b,
				e = this.rays.e,
				res;

			// находим проекции четырёх вершин на образующую
			for(var i = 1; i<=4; i++)
				ppoints[i] = gen.getNearestPoint(this.corns(i));

			// находим точки, расположенные ближе к концам образующей
			ppoints.b = ppoints[1].getDistance(gen.firstSegment.point, true) < ppoints[4].getDistance(gen.firstSegment.point, true) ? ppoints[1] : ppoints[4];
			ppoints.e = ppoints[2].getDistance(gen.lastSegment.point, true) < ppoints[3].getDistance(gen.lastSegment.point, true) ? ppoints[2] : ppoints[3];

			// получаем фрагмент образующей
			sub_gen = gen.get_subpath(ppoints.b, ppoints.e);

			res = sub_gen.length +
				(b.cnn && !b.cnn.empty() ? b.cnn.sz : 0) +
				(e.cnn && !e.cnn.empty() ? e.cnn.sz : 0);
			sub_gen.remove();

			return res;
		},
		enumerable: false
	},

	/**
	 * Ориентация профиля
	 */
	orientation: {
		get : function(){
			var angle_hor = this.angle_hor;
			if(angle_hor > 180)
				angle_hor -= 180;
			if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
				(angle_hor > 180-consts.orientation_delta && angle_hor < 180+consts.orientation_delta))
				return $p.enm.orientations.Горизонтальная;
			if((angle_hor > 90-consts.orientation_delta && angle_hor < 90+consts.orientation_delta) ||
				(angle_hor > 270-consts.orientation_delta && angle_hor < 270+consts.orientation_delta))
				return $p.enm.orientations.Вертикальная;
			return $p.enm.orientations.Наклонная;
		},
		enumerable : false
	},

	/**
	 * Признак прямолинейности
	 */
	is_linear: {
		value : function(){
			return this.generatrix.is_linear();
		},
		enumerable : false
	},

	/**
	 * Выясняет, примыкает ли указанный профиль к текущему
	 */
	is_nearest: {
		value : function(p){
			return (this.b.is_nearest(p.b, true) && this.e.is_nearest(p.e, true)) ||
				(this.generatrix.getNearestPoint(p.b).is_nearest(p.b) && this.generatrix.getNearestPoint(p.e).is_nearest(p.e));
		},
		enumerable : false
	},

	/**
	 * Выясняет, параллельны ли профили в пределах `consts.orientation_delta`
	 */
	is_collinear: {
		value : function(profile) {
			var angl = profile.e.subtract(profile.b).getDirectedAngle(this.e.subtract(this.b));
			if (angl < 0)
				angl += 180;
			return Math.abs(angl) < consts.orientation_delta;
		},
		enumerable : false
	},

	/**
	 * Возвращает массив примыкающих ипостов
	 */
	joined_imposts: {

		value : function(check_only){

			var t = this,
				gen = t.generatrix,
				profiles = t.parent.profiles,
				tinner = [], touter = [], curr, pb, pe, ip;

			for(var i = 0; i<profiles.length; i++){

				curr = profiles[i];
				if(curr == t)
					continue;

				pb = curr.cnn_point("b");
				if(pb.profile == t && pb.cnn && pb.cnn.cnn_type == $p.enm.cnn_types.ТОбразное){

					if(check_only)
						return check_only;

					// выясним, с какой стороны примыкающий профиль
					ip = curr.corns(1);
					if(t.rays.inner.getNearestPoint(ip).getDistance(ip, true) < t.rays.outer.getNearestPoint(ip).getDistance(ip, true))
						tinner.push({point: gen.getNearestPoint(pb.point), profile: curr});
					else
						touter.push({point: gen.getNearestPoint(pb.point), profile: curr});
				}
				pe = curr.cnn_point("e");
				if(pe.profile == t && pe.cnn && pe.cnn.cnn_type == $p.enm.cnn_types.ТОбразное){

					if(check_only)
						return check_only;

					ip = curr.corns(2);
					if(t.rays.inner.getNearestPoint(ip).getDistance(ip, true) < t.rays.outer.getNearestPoint(ip).getDistance(ip, true))
						tinner.push({point: gen.getNearestPoint(pe.point), profile: curr});
					else
						touter.push({point: gen.getNearestPoint(pe.point), profile: curr});
				}

			}

			if(check_only)
				return false;
			else
				return {inner: tinner, outer: touter};
		},
		enumerable : false
	},

	/**
	 * Возвращает тип элемента (рама, створка, импост)
	 */
	elm_type: {
		get : function(){

			// если начало или конец элемента соединены с соседями по Т, значит это импост
			var cnn_point = this.cnn_point("b");
			if(cnn_point.profile != this && cnn_point.is_t)
				return $p.enm.elm_types.Импост;

			cnn_point = this.cnn_point("e");
			if(cnn_point.profile != this && cnn_point.is_t)
				return $p.enm.elm_types.Импост;

			// Если вложенный контур, значит это створка
			if(this.parent.parent instanceof Contour)
				return $p.enm.elm_types.Створка;

			return $p.enm.elm_types.Рама;

		},
		enumerable : false
	},

	/**
	 * Опорные точки и лучи
	 * @property rays
	 * @type {Object}
	 */
	rays: {
		get : function(){
			if(!this.data._rays.inner.segments.length || !this.data._rays.outer.segments.length)
				this.data._rays.recalc();
			return this.data._rays;
		},
		enumerable : false,
		configurable : false
	},

	/**
	 * Обрабатывает смещение выделенных сегментов образующей профиля
	 * @param delta {paper.Point} - куда и насколько смещать
	 * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
	 * @param [start_point] {paper.Point} - откуда началось движение
	 */
	move_points: {
		value:  function(delta, all_points, start_point){
			var segments = this.generatrix.segments,
				changed, cnn_point, free_point, j,
				noti = {type: consts.move_points, profiles: [this], points: []}, noti_points, notifier;

			// если не выделено ни одного сегмента, двигаем все сегменты
			if(!all_points){
				for (j = 0; j < segments.length; j++) {
					if (segments[j].selected){
						changed = true;
						break;
					}
				}
				all_points = !changed;
			}

			changed = false;
			for (j = 0; j < segments.length; j++) {
				if (segments[j].selected || all_points){

					noti_points = {old: segments[j].point.clone(), delta: delta};

					// собственно, сдвиг узлов
					free_point = segments[j].point.add(delta);
					if(segments[j].point == this.b)
						cnn_point = this.cnn_point("b", free_point);

					else if(segments[j].point == this.e)
						cnn_point = this.cnn_point("e", free_point);

					if(cnn_point && cnn_point.cnn_types == acn.t &&
						(segments[j].point == this.b || segments[j].point == this.e)){
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

				this.data._rays.clear();

				// информируем систему об изменениях
				this.parent.notify(noti);

				notifier = Object.getNotifier(this);
				notifier.notify({ type: 'update', name: "x1" });
				notifier.notify({ type: 'update', name: "y1" });
				notifier.notify({ type: 'update', name: "x2" });
				notifier.notify({ type: 'update', name: "y2" });

			}
		},
		enumerable : false
	},

	/**
	 * Описание полей диалога свойств элемента
	 */
	oxml: {
		get: function () {
			return {
				" ": [
					{id: "info", path: "o.info", synonym: "Элемент", type: "ro", txt: this.info},
					"inset",
					"clr"
				],
				"Начало": ["x1", "y1"],
				"Конец": ["x2", "y2"]
			}
		},
		enumerable: false
	},

	/**
	 * Выясняет, имеет ли текущий профиль соединение с указанным
	 */
	has_cnn: {
		value: function (profile, point) {

			if(
				(this.b.is_nearest(point, true) && this.cnn_point("b").profile == profile) ||
				(this.e.is_nearest(point, true) && this.cnn_point("e").profile == profile) ||
				(profile.b.is_nearest(point, true) && profile.cnn_point("b").profile == this) ||
				(profile.e.is_nearest(point, true) && profile.cnn_point("e").profile == this)
			)
				return true;

			else
				return false;

		}
	}

});

Editor.Profile = Profile;

/**
 * Объект, описывающий геометрию соединения
 * @class CnnPoint
 * @constructor
 */
function CnnPoint(parent){

	var _err = [];

	/**
	 * Профиль, которому принадлежит точка соединения
	 * @type {Profile}
	 */
	this.parent = parent;
	parent = null;

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


	this.point = null;

	this.profile_point = "";


	/**
	 * Массив ошибок соединения
	 * @type {Array}
	 */
	this.__define({
		err: {
			get: function () {
				return _err;
			},
			set: function (v) {
				if(!v)
					_err.length = 0;
				else if(_err.indexOf(v) == -1)
					_err.push(v);
			},
			enumerable: false
		}
	});
}
CnnPoint.prototype.__define({

	/**
	 * Проверяет, является ли соединение в точке Т-образным.
	 * L для примыкающих рассматривается, как Т
	 */
	is_t: {
		get: function () {

			// если это угол, то точно не T
			if(!this.cnn || this.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное)
				return false;

			// если это Ʇ, или † то без вариантов T
			if(this.cnn.cnn_type == $p.enm.cnn_types.ТОбразное)
				return true;

			// если это Ꞁ или └─, то может быть T в разрыв - проверяем
			if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.Вертикальная)
				return true;

			if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.Горизонтальная)
				return true;

			return false;
		},
		enumerable: false
	},

	/**
	 * Проверяет, является ли соединение в точке L-образным
	 * Соединения Т всегда L-образные
	 */
	is_l: {
		get: function () {
			return this.is_t ||
				(this.cnn && (this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной || 
					this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной));
		},
		enumerable: false
	},

	is_i: {
		get: function () {
			return !this.profile && !this.is_cut;
		}
	},

	clear: {
		value: function () {
			if(this.profile_point)
				delete this.profile_point;
			if(this.is_cut)
				delete this.is_cut;
			this.profile = null;
			this.cnn = null;
			this.err = null;
			this.distance = 10e9;
			this.cnn_types = acn.i;
		},
		enumerable: false
	}
});

function ProfileRays(parent){

	this.parent = parent;
	parent = null;

	this.b = new CnnPoint(this.parent);
	this.e = new CnnPoint(this.parent);
	this.inner = new paper.Path({ insert: false });
	this.outer = new paper.Path({ insert: false });

}
ProfileRays.prototype.__define({

	clear_segments: {
		value: function () {
			if(this.inner.segments.length)
				this.inner.removeSegments();
			if(this.outer.segments.length)
				this.outer.removeSegments();
		}
	},

	clear: {
		value: function(with_cnn){
			this.clear_segments();
			if(with_cnn){
				this.b.clear();
				this.e.clear();
			}
		}
	},

	recalc: {
		value: function(){

			var path = this.parent.generatrix,
				len = path.length;

			this.clear_segments();

			if(!len)
				return;

			var d1 = this.parent.d1, d2 = this.parent.d2,
				ds = 3 * this.parent.width, step = len * 0.02,
				point_b, tangent_b, normal_b,
				point_e, tangent_e, normal_e;


			// первая точка эквидистанты. аппроксимируется касательной на участке (from < начала пути)
			point_b = path.firstSegment.point;
			tangent_b = path.getTangentAt(0);
			normal_b = path.getNormalAt(0);

			// добавляем первые точки путей
			this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
			this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));
			point_e = path.lastSegment.point;

			// для прямого пути, чуть наклоняем нормаль
			if(path.is_linear()){

				this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
				this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));

			}else{

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

				normal_e = path.getNormalAt(len);
				this.outer.add(point_e.add(normal_e.multiply(d1)));
				this.inner.add(point_e.add(normal_e.multiply(d2)));

				tangent_e = path.getTangentAt(len);
				this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
				this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

				this.outer.simplify(0.8);
				this.inner.simplify(0.8);
			}

			this.inner.reverse();
		}
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
						_scheme.ox.clr = change.object[change.name];
					}

					if(change.name == "sys"){
						_scheme.ox.owner = change.object[change.name];
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
			var ox = _dp.characteristic;
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
			else{
				var setted;
				$p.cat.production_params.find_rows({nom: ox.owner}, function(o){
					_dp.sys = o;
					setted = true;
					return false;
				});
				// пересчитываем параметры изделия при установке системы TODO: подумать, как не портить старые изделия, открытые для просмотра
				if(setted){
					_dp.sys.refill_prm(ox);
				}else
					_dp.sys = "";
			}

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


		}else if((distance = element.b.getDistance(point)) < (res.is_t ? consts.sticking_l : consts.sticking)){
			// Если мы находимся в окрестности начала соседнего элемента

			if(!res.cnn){

				// а есть ли подходящее?
				cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
				if(!cnns.length)
					return;

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

		}else if((distance = element.e.getDistance(point)) < (res.is_t ? consts.sticking_l : consts.sticking)){

			// Если мы находимся в окрестности конца соседнего элемента
			if(!res.cnn){

				// а есть ли подходящее?
				cnns = $p.cat.cnns.nom_cnn(element, profile, acn.a);
				if(!cnns.length)
					return;

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
			
			// это соединение с пустотой или T
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

			var bounds = this.strokeBounds, shift;

			if(bounds){
				this.view.zoom = Math.min((this.view.viewSize.height - 20) / (bounds.height+320), (this.view.viewSize.width - 20) / (bounds.width+320));
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
	this.sticking_l = 7;
	this.sticking0 = this.sticking / 2;
	this.sticking2 = this.sticking * this.sticking;
	this.font_size = 60;

	this.lgray = new paper.Color(0.96, 0.98, 0.94, 0.96);


	// в пределах этого угла, считаем элемент вертикальным или горизонтальным
	this.orientation_delta = 7;

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
	this.move_shapes = 'move-shapes';



};
/**
 * Манипуляции с арками (дуги правильных окружностей)
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_arc
 */

function ToolArc(){

	var tool = this;

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
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:true, selected: true, tolerance: hitSize });
		if(!tool.hitItem)
			tool.hitItem = paper.project.hitTest(event.point, { fill:true, tolerance: hitSize });

		if (tool.hitItem && tool.hitItem.item.parent instanceof Profile
			&& (tool.hitItem.type == 'fill' || tool.hitItem.type == 'stroke')) {
			paper.canvas_cursor('cursor-arc');
		} else {
			paper.canvas_cursor('cursor-arc-arrow');
		}

		return true;
	};
	tool.on({
		
		activate: function() {
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arc-arrow');
		},
		
		deactivate: function() {
			paper.hide_selection_bounds();
		},
		
		mousedown: function(event) {

			var b, e, r;

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

					do_arc(this.mode, event.point.arc_point(b.x, b.y, e.x, e.y, r, event.modifiers.option, false));

					//undo.snapshot("Move Shapes");
					r = this.mode;
					this.mode = null;
					

				}else if(event.modifiers.space){
					// при зажатом space удаляем кривизну

					e = this.mode.lastSegment.point;
					r = this.mode;
					this.mode = null;

					r.removeSegments(1);
					r.firstSegment.handleIn = null;
					r.firstSegment.handleOut = null;
					r.lineTo(e);
					r.parent.rays.clear();
					r.selected = true;
					//undo.snapshot("Move Shapes");

				} else {
					paper.project.deselectAll();

					r = this.mode;
					r.selected = true;
					paper.project.deselect_all_points();
					this.mouseStartPos = event.point.clone();
					this.originalContent = paper.capture_selection_state();

				}

				setTimeout(function () {
					r.layer.redraw();
					r.parent.attache_wnd(paper._acc.elm.cells("a"));
					$p.eve.callEvent("layer_activated", [r.layer]);
				}, 10);

			}else{
				//tool.detache_wnd();
				paper.project.deselectAll();
			}
		},
		
		mouseup: function(event) {

			var item = this.hitItem ? this.hitItem.item : null;

			if(item instanceof Filling && item.visible){
				item.attache_wnd(paper._acc.elm.cells("a"));
				item.selected = true;

				if(item.selected && item.layer)
					$p.eve.callEvent("layer_activated", [item.layer]);
			}

			if (this.mode && this.changed) {
				//undo.snapshot("Move Shapes");
				//paper.project.redraw();
			}

			paper.canvas_cursor('cursor-arc-arrow');

		},
		
		mousedrag: function(event) {
			if (this.mode) {

				this.changed = true;

				paper.canvas_cursor('cursor-arrow-small');

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
 * Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 * Created 12.03.2016<br />
 * @author Evgeniy Malyarov
 * @module element
 */

function ToolElement() {
	ToolElement.superclass.constructor.call(this);
}
ToolElement._extend(paper.Tool);

ToolElement.prototype.__define({

	/**
	 * Отключает и выгружает из памяти окно свойств инструмента
	 * @param tool
	 */
	detache_wnd: {
		value: function(){
			if(this.wnd){
				if(this._grid && this._grid.destructor){
					this.wnd.detachObject();
					delete this._grid;
				}
				if(this.wnd.wnd_options){
					this.wnd.wnd_options(this.options.wnd);
					$p.wsql.save_options("editor", this.options);
					this.wnd.close();
				}
				delete this.wnd;
			}
			this.profile = null;
		},
		enumerable: false
	}

});

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

		// Hit test items.
		tool.hitItem = _editor.project.hitTest(event.point, { fill: true, class: Filling });

		if (tool.hitItem){
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
					setTimeout(contour.redraw.bind(contour), 10);


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
					setTimeout(contour.redraw.bind(contour), 10);

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

		var rama_impost = _editor.project._dp.sys.inserts();

		// создаём экземпляр обработки
		tool.profile = $p.dp.builder_pen.create();

		// восстанавливаем сохранённые параметры
		$p.wsql.restore_options("editor", tool.options);
		tool.profile._mixin(tool.options.wnd, ["inset", "clr", "bind_generatrix", "bind_node"]);

		if(tool.profile.inset.empty() || rama_impost.indexOf(tool.profile.inset) == -1){
			if(rama_impost.length)
				tool.profile.inset = rama_impost[0];
			else
				tool.profile.inset = $p.blank.guid;
		}

		if(tool.profile.clr.empty())
			tool.profile.clr = $p.cat.predefined_elmnts.predefined("Цвет_Основной");

		tool.profile._metadata.fields.inset.choice_links = [{
			name: ["selection",	"ref"],
			path: [
				function(o, f){
					if($p.is_data_obj(o)){
						return rama_impost.indexOf(o) != -1;

					}else{
						var refs = "";
						rama_impost.forEach(function (o) {
							if(refs)
								refs += ", ";
							refs += "'" + o.ref + "'";
						});
						return "_t_.ref in (" + refs + ")";
					}
				}]
		}];

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

			delete tool.profile._metadata.fields.inset.choice_links;

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

				// Рисуем профиль
				new Profile({generatrix: this.path, proto: tool.profile});
				this.mode = null;
				this.path = null;

			}else if (this.hitItem && this.hitItem.item) {

				var item = this.hitItem.item;
				this.mode = null;
				this.path = null;

				// TODO: Выделяем элемент, если он подходящего типа
				if(item.parent instanceof Profile && item.parent.isInserted()){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					item.parent.generatrix.selected = true;

				}else if(item instanceof Filling && item.visible){
					item.attache_wnd(paper._acc.elm.cells("a"));
					item.selected = true;
				}

				if(item.selected && item.layer)
					$p.eve.callEvent("layer_activated", [item.layer]);

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
		},

		keydown: function(event) {

			// удаление сегмента или элемента
			if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				paper.project.selectedItems.forEach(function (path) {
					if(path.parent instanceof Profile){
						path = path.parent;
						path.removeChildren();
						path.remove();
					}
				});

				this.mode = null;
				this.path = null;

				event.stop();
				return false;
			}
		}
	});

	return tool;


}
ToolPen._extend(ToolElement);

/**
 * Относительное позиционирование и сдвиг
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  tool_ruler
 */

function ToolRuler(){

	ToolRuler.superclass.constructor.call(this);

	this.hitItem = null;

	this.options = {
		name: 'ruler',
		wnd: {
			caption: "Размеры и сдвиг",
			height: 200
		}
	};

	this.selected = {
		a: [],
		b: []
	};

	//tool.resetHot = function(type, event, mode) {
	//};
	//tool.testHot = function(type, event, mode) {
	//	/*	if (mode != 'tool-select')
	//	 return false;*/
	//	return tool.hitTest(event);
	//};
	this.hitTest = function(event) {

		var hitSize = 4;
		this.hitItem = null;

		if (event.point)
			this.hitItem = paper.project.hitTest(event.point, { fill:true, stroke:false, tolerance: hitSize });

		if (this.hitItem && this.hitItem.item.parent instanceof Profile) {
			paper.canvas_cursor('cursor-arrow-ruler');

		} else {
			paper.canvas_cursor('cursor-arrow-ruler-light');
			this.hitItem = null;
		}

		return true;
	};
	this.on({
		activate: function() {
			this.selected.a.length = 0;
			this.selected.b.length = 0;
			paper.tb_left.select(this.options.name);
			paper.canvas_cursor('cursor-arrow-ruler-light');
			paper.project.deselectAll();
			this.wnd = new RulerWnd(this.options);
			this.wnd.size = 0;
		},
		deactivate: function() {

			this.detache_wnd();

		},
		mousedown: function(event) {

			if (this.hitItem) {
				var item = this.hitItem.item.parent;

				if (paper.Key.isDown('1') || paper.Key.isDown('a')) {

					item.path.selected = true;

					if(this.selected.a.indexOf(item) == -1)
						this.selected.a.push(item);

					if(this.selected.b.indexOf(item) != -1)
						this.selected.b.splice(this.selected.b.indexOf(item), 1);

				} else if (paper.Key.isDown('2') || paper.Key.isDown('b') ||
					event.modifiers.shift || (this.selected.a.length && !this.selected.b.length)) {

					item.path.selected = true;

					if(this.selected.b.indexOf(item) == -1)
						this.selected.b.push(item);

					if(this.selected.a.indexOf(item) != -1)
						this.selected.a.splice(this.selected.a.indexOf(item), 1);

				}else {
					paper.project.deselectAll();
					item.path.selected = true;
					this.selected.a.length = 0;
					this.selected.b.length = 0;
					this.selected.a.push(item);
				}

				// Если выделено 2 элемента, рассчитаем сдвиг
				if(this.selected.a.length && this.selected.b.length){
					if(this.selected.a[0].orientation == this.selected.b[0].orientation){
						if(this.selected.a[0].orientation == $p.enm.orientations.Вертикальная){
							this.wnd.size = Math.abs(this.selected.a[0].b.x - this.selected.b[0].b.x);

						}else if(this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная){
							this.wnd.size = Math.abs(this.selected.a[0].b.y - this.selected.b[0].b.y);

						}else{
							// для наклонной ориентации используем interiorpoint

						}
					}

				}else if(this.wnd.size != 0)
					this.wnd.size = 0;


			}else {
				paper.project.deselectAll();
				this.selected.a.length = 0;
				this.selected.b.length = 0;
				if(this.wnd.size != 0)
					this.wnd.size = 0;
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

	$p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

}
ToolRuler._extend(ToolElement);

ToolRuler.prototype.__define({

	_move_points: {
		value: function (event, xy) {

			// сортируем группы выделенных элеметов по правл-лево или верх-низ
			// left_top == true, если элементы в массиве _a_ выше или левее элементов в массиве _b_
			var pos1 = this.selected.a.reduce(function(sum, curr) {
					return sum + curr.b[xy] + curr.e[xy];
				}, 0) / (this.selected.a.length * 2),
				pos2 = this.selected.b.reduce(function(sum, curr) {
					return sum + curr.b[xy] + curr.e[xy];
				}, 0) / (this.selected.b.length * 2),
				delta = Math.abs(pos2 - pos1),
				to_move;

			if(xy == "x")
				if(event.name == "right")
					delta = new paper.Point(event.size - delta, 0);
				else
					delta = new paper.Point(delta - event.size, 0);
			else{
				if(event.name == "bottom")
					delta = new paper.Point(0, event.size - delta);
				else
					delta = new paper.Point(0, delta - event.size);
			}

			if(delta.length){

				paper.project.deselectAll();

				if(event.name == "right" || event.name == "bottom")
					to_move = pos1 < pos2 ? this.selected.b : this.selected.a;
				else
					to_move = pos1 < pos2 ? this.selected.a : this.selected.b;

				to_move.forEach(function (p) {
					p.generatrix.segments.forEach(function (segm) {
						segm.selected = true;
					})
				});

				paper.project.move_points(delta);
				setTimeout(function () {
					paper.project.deselectAll();
					this.selected.a.forEach(function (p) {
						p.path.selected = true;
					});
					this.selected.b.forEach(function (p) {
						p.path.selected = true;
					});
					paper.project.register_update();
				}
					.bind(this), 200);
			}

		},
		enumerable: false
	},

	_sizes_wnd: {
		value: function (event) {

			if(event.wnd == this.wnd){

				if(!this.selected.a.length || !this.selected.b.length)
					return;

				switch(event.name) {

					case 'left':
					case 'right':
						if(this.selected.a[0].orientation == $p.enm.orientations.Вертикальная)
							this._move_points(event, "x");
						break;

					case 'top':
					case 'bottom':
						if(this.selected.a[0].orientation == $p.enm.orientations.Горизонтальная)
							this._move_points(event, "y");
						break;
				}
			}
		},
		enumerable: false
	}

});

function RulerWnd(options){

	if(!options)
		options = {
			name: 'sizes',
			wnd: {
				caption: "Размеры и сдвиг",
				height: 200,
				allow_close: true,
				modal: true,
				on_close: function () {

					if(wnd.elmnts.calck && wnd.elmnts.calck.removeSelf)
						wnd.elmnts.calck.removeSelf();

					$p.eve.detachEvent(wnd_keydown);
						
					$p.eve.callEvent("sizes_wnd", [{
						wnd: wnd,
						name: "close",
						size: wnd.size
					}]);

					wnd = null;
					
					return true;
				}
			}
		};
	$p.wsql.restore_options("editor", options);

	var wnd = $p.iface.dat_blank(paper._dxw, options.wnd),
		
		wnd_keydown = $p.eve.attachEvent("keydown", function (ev) {

			if(wnd){
				switch(ev.keyCode) {
					case 27:        // закрытие по {ESC}
						wnd.close();
						break;
					case 37:        // left
						on_button_click({
							currentTarget: {name: "left"}
						});
						break;
					case 38:        // up
						on_button_click({
							currentTarget: {name: "top"}
						});
						break;
					case 39:        // right
						on_button_click({
							currentTarget: {name: "right"}
						});
						break;
					case 40:        // down
						on_button_click({
							currentTarget: {name: "bottom"}
						});
						break;
				}
				return $p.cancel_bubble(ev);
			}
			
		}),
		div=document.createElement("table"),
		table, input;

	function on_button_click(e){
		$p.eve.callEvent("sizes_wnd", [{
			wnd: wnd,
			name: e.currentTarget.name,
			size: wnd.size
		}]);
	}

	div.innerHTML='<tr><td ></td><td align="center"></td><td></td></tr>' +
		'<tr><td></td><td><input type="text" style="width: 70px;  text-align: center;" readonly ></td><td></td></tr>' +
		'<tr><td></td><td align="center"></td><td></td></tr>';
	div.style.width = "130px";
	div.style.margin ="auto";
	table = div.firstChild.childNodes;

	$p.iface.add_button(table[0].childNodes[1], null,
		{name: "top", img: "dist/imgs/align_top.png", tooltip: $p.msg.align_set_top}).onclick = on_button_click;
	$p.iface.add_button(table[1].childNodes[0], null,
		{name: "left", img: "dist/imgs/align_left.png", tooltip: $p.msg.align_set_left}).onclick = on_button_click;
	$p.iface.add_button(table[1].childNodes[2], null,
		{name: "right", img: "dist/imgs/align_right.png", tooltip: $p.msg.align_set_right}).onclick = on_button_click;
	$p.iface.add_button(table[2].childNodes[1], null,
		{name: "bottom", img: "dist/imgs/align_bottom.png", tooltip: $p.msg.align_set_bottom}).onclick = on_button_click;

	wnd.attachObject(div);

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
		wnd.elmnts.calck = new eXcell_calck(this);
		wnd.elmnts.calck.edit();
	};

	wnd.__define({
		size: {
			get: function () {
				return parseFloat(input.firstChild.value);
			},
			set: function (v) {
				input.firstChild.value = parseFloat(v).round(1);
			},
			enumerable: false
		}
	});

	setTimeout(function () {
		input.firstChild.focus();
	}, 100);

	

	return wnd;
}
/**
 * Свойства и перемещение узлов элемента
 * Created 25.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module tool_select_node
 */

function ToolSelectNode(){

	var tool = this;

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

			// отдаём предпочтение выделенным ранее элементам
			tool.hitItem = paper.project.hitTest(event.point, { selected: true, fill:true, tolerance: hitSize });
			// во вторую очередь - тем элементам, которые не скрыты
			if (!tool.hitItem)
				tool.hitItem = paper.project.hitTest(event.point, { fill:true, guides: false, visible: true, tolerance: hitSize });

			// Hit test selected handles
			hit = paper.project.hitTest(event.point, { selected: true, handles: true, tolerance: hitSize });
			if (hit)
				tool.hitItem = hit;

			// Hit test points
			hit = paper.project.hitPoints(event.point);

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
				if (tool.hitItem.item instanceof paper.PointText){

				}else if (tool.hitItem.item.selected) {
					paper.canvas_cursor('cursor-arrow-small');

				} else {
					paper.canvas_cursor('cursor-arrow-white-shape');

				}
			} else if (tool.hitItem.type == 'segment' || tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
				if (tool.hitItem.segment.selected) {
					paper.canvas_cursor('cursor-arrow-small-point');
				} else {
					paper.canvas_cursor('cursor-arrow-white-point');
				}
			}
		} else {
			paper.canvas_cursor('cursor-arrow-white');
		}

		return true;
	};
	tool.on({

		activate: function() {
			paper.tb_left.select(tool.options.name);
			paper.canvas_cursor('cursor-arrow-white');
		},

		deactivate: function() {
			paper.clear_selection_bounds();
			if(tool.profile){
				tool.profile.detache_wnd();
				delete tool.profile;
			}
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
						paper.project.deselectAll();
						item.selected = true;
					}
					if (item.selected) {
						this.mode = consts.move_shapes;
						paper.project.deselect_all_points();
						this.mouseStartPos = event.point.clone();
						this.originalContent = paper.capture_selection_state();

						if(item.layer)
							$p.eve.callEvent("layer_activated", [item.layer]);
					}

				} else if (tool.hitItem.type == 'segment') {
					if (event.modifiers.shift) {
						tool.hitItem.segment.selected = !tool.hitItem.segment.selected;
					} else {
						if (!tool.hitItem.segment.selected){
							paper.project.deselect_all_points();
							paper.project.deselectAll();
						}
						tool.hitItem.segment.selected = true;
					}
					if (tool.hitItem.segment.selected) {
						this.mode = consts.move_points;
						this.mouseStartPos = event.point.clone();
						this.originalContent = paper.capture_selection_state();
					}
				} else if (tool.hitItem.type == 'handle-in' || tool.hitItem.type == 'handle-out') {
					this.mode = consts.move_handle;
					this.mouseStartPos = event.point.clone();
					this.originalHandleIn = tool.hitItem.segment.handleIn.clone();
					this.originalHandleOut = tool.hitItem.segment.handleOut.clone();

					/* if (tool.hitItem.type == 'handle-out') {
					 this.originalHandlePos = tool.hitItem.segment.handleOut.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleIn.length;
					 } else {
					 this.originalHandlePos = tool.hitItem.segment.handleIn.clone();
					 this.originalOppHandleLength = tool.hitItem.segment.handleOut.length;
					 }
					 this.originalContent = capture_selection_state(); // For some reason this does not work!
					 */
				}

				if(is_profile){
					item.parent.attache_wnd(paper._acc.elm.cells("a"));
					this.profile = item.parent;

				}else if(item instanceof Filling){
					item.attache_wnd(paper._acc.elm.cells("a"));
					this.profile = item;
				}

				paper.clear_selection_bounds();

			} else {
				// Clicked on and empty area, engage box select.
				this.mouseStartPos = event.point.clone();
				this.mode = 'box-select';

				if(!event.modifiers.shift && this.profile){
					this.profile.detache_wnd();
					delete this.profile;
				}

			}
		},

		mouseup: function(event) {

			if (this.mode == consts.move_shapes) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Shapes");
				}

			} else if (this.mode == consts.move_points) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Points");
				}

			} else if (this.mode == consts.move_handle) {
				if (this.changed) {
					paper.clear_selection_bounds();
					//undo.snapshot("Move Handle");
				}
			} else if (this.mode == 'box-select') {

				var box = new paper.Rectangle(this.mouseStartPos, event.point);

				if (!event.modifiers.shift)
					paper.project.deselectAll();

				// при зажатом ctrl или alt добавляем элемент иначе - узел
				if (event.modifiers.control || event.modifiers.option) {

					var selectedPaths = paper.paths_intersecting_rect(box);
					for (var i = 0; i < selectedPaths.length; i++)
						selectedPaths[i].selected = !selectedPaths[i].selected;

				}else {

					var selectedSegments = paper.segments_in_rect(box);
					if (selectedSegments.length > 0) {
						for (var i = 0; i < selectedSegments.length; i++) {
							selectedSegments[i].selected = !selectedSegments[i].selected;
						}
					} else {
						var selectedPaths = paper.paths_intersecting_rect(box);
						for (var i = 0; i < selectedPaths.length; i++)
							selectedPaths[i].selected = !selectedPaths[i].selected;
					}
				}
			}

			paper.clear_selection_bounds();

			if (tool.hitItem) {
				if (tool.hitItem.item.selected) {
					paper.canvas_cursor('cursor-arrow-small');
				} else {
					paper.canvas_cursor('cursor-arrow-white-shape');
				}
			}
		},

		mousedrag: function(event) {
			this.changed = true;

			if (this.mode == consts.move_shapes) {
				paper.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift)
					delta = paper.snap_to_angle(delta, Math.PI*2/8);

				paper.restore_selection_state(this.originalContent);
				paper.project.move_points(delta, true);
				paper.clear_selection_bounds();

			} else if (this.mode == consts.move_points) {
				paper.canvas_cursor('cursor-arrow-small');

				var delta = event.point.subtract(this.mouseStartPos);
				if (event.modifiers.shift) {
					delta = paper.snap_to_angle(delta, Math.PI*2/8);
				}
				paper.restore_selection_state(this.originalContent);
				paper.project.move_points(delta);
				paper.purge_selection();


			} else if (this.mode == consts.move_handle) {

				var delta = event.point.subtract(this.mouseStartPos),
					noti = {
						type: consts.move_handle,
						profiles: [tool.hitItem.item.parent],
						points: []};

				if (tool.hitItem.type == 'handle-out') {
					var handlePos = this.originalHandleOut.add(delta);
					if (event.modifiers.shift)
						handlePos = paper.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleOut = handlePos;
					tool.hitItem.segment.handleIn = handlePos.normalize(-this.originalHandleIn.length);
				} else {
					var handlePos = this.originalHandleIn.add(delta);
					if (event.modifiers.shift)
						handlePos = paper.snap_to_angle(handlePos, Math.PI*2/8);

					tool.hitItem.segment.handleIn = handlePos;
					tool.hitItem.segment.handleOut = handlePos.normalize(-this.originalHandleOut.length);
				}

				noti.profiles[0].rays.clear();
				noti.profiles[0].parent.notify(noti);

				paper.purge_selection();

			} else if (this.mode == 'box-select') {
				paper.drag_rect(this.mouseStartPos, event.point);
			}
		},

		mousemove: function(event) {
			this.hitTest(event);
		},

		keydown: function(event) {
			var selected, i, j, path, segment, index, point, handle, do_select;

			if (event.key == '+' || event.key == 'insert') {

				selected = paper.project.selectedItems;

				// при зажатом ctrl или alt добавляем элемент иначе - узел
				if (event.modifiers.space) {

					for (i = 0; i < selected.length; i++) {
						path = selected[i];

						if(path.parent instanceof Profile){

							var cnn_point = path.parent.cnn_point("e");
							if(cnn_point && cnn_point.profile)
								cnn_point.profile.rays.clear(true);
							path.parent.rays.clear(true);

							point = path.getPointAt(path.length * 0.5);
							var newpath = path.split(path.length * 0.5);
							path.lastSegment.point = path.lastSegment.point.add(paper.Point.random());
							newpath.firstSegment.point = path.lastSegment.point;
							new Profile({generatrix: newpath, proto: path.parent});
						}
					}

				}else{

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
				}

				// Prevent the key event from bubbling
				event.stop();
				return false;

				// удаление сегмента или элемента
			} else if (event.key == '-' || event.key == 'delete' || event.key == 'backspace') {

				if(event.event && event.event.target && ["textarea", "input"].indexOf(event.event.target.tagName.toLowerCase())!=-1)
					return;

				selected = paper.project.selectedItems;
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
				event.stop();
				return false;

			} else if (event.key == 'left') {
				paper.project.move_points(new paper.Point(-10, 0));

			} else if (event.key == 'right') {
				paper.project.move_points(new paper.Point(10, 0));

			} else if (event.key == 'up') {
				paper.project.move_points(new paper.Point(0, -10));

			} else if (event.key == 'down') {
				paper.project.move_points(new paper.Point(0, 10));

			}
		}
	});

	return tool;

}
ToolSelectNode._extend(ToolElement);
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
ToolText._extend(ToolElement);

/**
 * Элементы управления в аккордеоне редактора
 * Created 16.02.2016
 * @author Evgeniy Malyarov
 * @module editor
 * @submodule editor_accordion
 */

function EditorAccordion(_editor, cell_acc) {

	cell_acc.attachHTMLString($p.injected_data['tip_editor_right.html']);

	var _cell = cell_acc.cell,
		cont = _cell.querySelector(".editor_accordion"),

		/**
		 * панель инструментов элемента
		 */
		tb_elm = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_elm]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'aling_bottom',
			buttons: [
				{name: 'left', img: 'align_left.png', tooltip: $p.msg.align_node_left, float: 'left'},
				{name: 'bottom', img: 'align_bottom.png', tooltip: $p.msg.align_node_bottom, float: 'left'},
				{name: 'top', img: 'align_top.png', tooltip: $p.msg.align_node_top, float: 'left'},
				{name: 'right', img: 'align_right.png', tooltip: $p.msg.align_node_right, float: 'left'},
				{name: 'delete', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить элемент', float: 'right', paddingRight: '20px'}
			],
			image_path: "dist/imgs/",
			onclick: function (name) {
				return _editor.profile_align(name);
			}
		}),

		/**
		 * панель инструментов свойств изделия
		 */
		tb_right = new $p.iface.OTooolBar({
			wrapper: cont.querySelector("[name=header_layers]"),
			width: '100%',
			height: '28px',
			bottom: '2px',
			left: '4px',
			class_name: "",
			name: 'right',
			image_path: 'dist/imgs/',
			buttons: [
				{name: 'standard_form', text: '<i class="fa fa-file-o fa-fw"></i>', tooltip: 'Добавить рамный контур', float: 'left'
					//,sub: {
					//	buttons: [
					//		{name: 'square', img: 'square.png', float: 'left'},
					//		{name: 'triangle1', img: 'triangle1.png', float: 'right'},
					//		{name: 'triangle2', img: 'triangle2.png', float: 'left'},
					//		{name: 'triangle3', img: 'triangle3.png', float: 'right'},
					//		{name: 'semicircle1', img: 'semicircle1.png', float: 'left'},
					//		{name: 'semicircle2', img: 'semicircle2.png', float: 'right'},
					//		{name: 'circle',    img: 'circle.png', float: 'left'},
					//		{name: 'arc1',      img: 'arc1.png', float: 'right'},
					//		{name: 'trapeze1',  img: 'trapeze1.png', float: 'left'},
					//		{name: 'trapeze2',  img: 'trapeze2.png', float: 'right'},
					//		{name: 'trapeze3',  img: 'trapeze3.png', float: 'left'},
					//		{name: 'trapeze4',  img: 'trapeze4.png', float: 'right'},
					//		{name: 'trapeze5',  img: 'trapeze5.png', float: 'left'},
					//		{name: 'trapeze6',  img: 'trapeze6.png', float: 'right'}]
					//}
				},
				{name: 'new_stv', text: '<i class="fa fa-file-code-o fa-fw"></i>', tooltip: 'Добавить створку', float: 'left'},
				{name: 'drop_layer', text: '<i class="fa fa-trash-o fa-fw"></i>', tooltip: 'Удалить слой', float: 'right', paddingRight: '20px'}

				//{name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть редактор', float: 'right', paddingRight: '20px'}

			], onclick: function (name) {

				switch(name) {

					case 'new_stv':
						var fillings = _editor.project.getItems({class: Filling, selected: true});
						if(fillings.length)
							fillings[0].create_leaf();
						break;

					case 'drop_layer':
						tree_layers.drop_layer();
						break;

					default:
						$p.msg.show_msg(name);
						break;
				}

				return false;
			}
		}),

		/**
		 * слои в аккордионе
		 */
		tree_layers = new function SchemeLayers() {

			var tree = new dhtmlXTreeObject({
				parent: cont.querySelector("[name=content_layers]"),
				checkbox: true
			});


			function layer_text(layer, bounds){
				if(!bounds)
					bounds = layer.bounds;
				return (layer.parent ? "Створка №" : "Рама №") + layer.cnstr + " " + bounds.width.toFixed() + "х" + bounds.height.toFixed();
			}

			function load_layer(layer){

				tree.insertNewItem(
					layer.parent ? layer.parent.cnstr : 0,
					layer.cnstr,
					layer_text(layer));


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


			tree.enableTreeImages(false);


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


			this.drop_layer = function () {
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
			};

			// начинаем следить за объектом
			this.attache = function () {
				Object.observe(_editor.project._noti, observer, ["rows"]);
			};

			this.unload = function () {
				Object.unobserve(_editor.project._noti, observer);
			};

			// гасим-включаем слой по чекбоксу
			tree.attachEvent("onCheck", function(id, state){
				var l,
					pid = tree.getParentId(id),
					sub = tree.getAllSubItems(id);

				if(pid && state && !tree.isItemChecked(pid)){
					if(l = _editor.project.getItem({cnstr: Number(pid)}))
						l.visible = true;
					tree.setCheck(pid, 1);
				}

				if(l = _editor.project.getItem({cnstr: Number(id)}))
					l.visible = !!state;

				if(typeof sub == "string")
					sub = sub.split(",");
				sub.forEach(function (id) {
					tree.setCheck(id, state);
					if(l = _editor.project.getItem({cnstr: Number(id)}))
						l.visible = !!state;
				});

				if(pid && state && !tree.isItemChecked(pid))
					tree.setCheck(pid, 1);

				_editor.project.register_update();

			});

			// делаем выделенный слой активным
			tree.attachEvent("onSelect", function(id){
				var l = _editor.project.getItem({cnstr: Number(id)});
				if(l)
					l.activate();
			});

			$p.eve.attachEvent("layer_activated", function (l) {
				if(l && l.cnstr && l.cnstr != tree.getSelectedItemId())
					tree.selectItem(l.cnstr);
			});

			// начинаем следить за изменениями размеров при перерисовке контуров
			$p.eve.attachEvent("contour_redrawed", function (contour, bounds) {
				tree.setItemText(contour.cnstr, layer_text(contour, bounds));
			});

		},

		/**
		 * свойства изделия в аккордионе
		 */
		props = new (function SchemeProps(layout) {

			var _obj,
				_grid,
				_reflect_id;

			function reflect_changes() {
				_obj.len = _editor.project.bounds.width.round(0);
				_obj.height = _editor.project.bounds.height.round(0);
				_obj.s = _editor.project.area;
			}

			this.__define({

				attache: {
					value: function (obj) {

						_obj = obj;
						obj = null;

						if(_grid && _grid.destructor)
							_grid.destructor();

						_grid = layout.cells("a").attachHeadFields({
							obj: _obj,
							oxml: {
								"Свойства": ["sys","clr",
									{id: "len", path: "o.len", synonym: "Ширина, мм", type: "ro"},
									{id: "height", path: "o.height", synonym: "Высота, мм", type: "ro"},
									{id: "s", path: "o.s", synonym: "Площадь, м²", type: "ro"}
								],
								"Строка заказа": ["quantity",
									{id: "price_internal", path: "o.price_internal", synonym: "Цена внутр.", type: "ro"},
									{id: "discount_percent_internal", path: "o.discount_percent_internal", synonym: "Скидка внутр. %", type: "ro"},
									{id: "price", path: "o.price", synonym: "Цена", type: "ro"},
									"discount_percent",
									{id: "amount", path: "o.amount", synonym: "Сумма", type: "ro"},
									"note"]

							},
							ts: "extra_fields",
							ts_title: "Свойства",
							selection: {cnstr: 0, hide: {not: true}}
						});
					}
				},

				unload: {
					value: function () {
						layout.unload();
						_obj = null;
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				}

			});

			// начинаем следить за изменениями размеров при перерисовке контуров
			$p.eve.attachEvent("contour_redrawed", function () {
				if(_obj){
					if(_reflect_id)
						clearTimeout(_reflect_id);
					_reflect_id = setTimeout(reflect_changes, 100);
				}
			});


		})(new dhtmlXLayoutObject({
			parent:     cont.querySelector("[name=content_props]"),
			pattern:    "1C",
			offsets: {
				top:    0,
				right:  0,
				bottom: 0,
				left:   0
			},
			cells: [
				{
					id:             "a",
					header:         false,
					height:         330
				}
			]
		})),

		/**
		 * свойства створки в аккордионе
		 */
		stv = new (function StvProps(layout) {

			var _grid,
				_eve_layer_activated;

			this.__define({

				attache: {
					value: function (obj) {

						if(!obj || !obj.cnstr || (_grid && _grid._obj === obj))
							return;

						var attr = {
							obj: obj,
							oxml: {
								"Фурнитура": ["furn", "clr_furn", "direction", "h_ruch"],
								"Москитка": ["mskt", "clr_mskt"],
								"Параметры": []
							},
							ts: "params",
							ts_title: "Параметры",
							selection: {cnstr: obj.cnstr || -1, hide: {not: true}}
						};

						if(!_grid)
							_grid = layout.cells("a").attachHeadFields(attr);
						else
							_grid.attach(attr);

						setTimeout(function () {
							layout.base.style.height = (Math.max(_grid.rowsBuffer.length, 10) + 1) * 21 + "px";
							layout.setSizes();
							_grid.objBox.style.width = "100%";
						}, 200);
					}
				},

				unload: {
					value: function () {
						layout.unload();
						$p.eve.detachEvent(_eve_layer_activated);
					}
				},

				layout: {
					get: function () {
						return layout;
					}
				}

			});

			_eve_layer_activated = $p.eve.attachEvent("layer_activated", this.attache);

		})(new dhtmlXLayoutObject({
			parent:     cont.querySelector("[name=content_stv]"),
			pattern:    "1C",
			offsets: {
				top:    0,
				right:  0,
				bottom: 0,
				left:   0
			},
			cells: [
				{
					id:             "a",
					header:         false,
					height:         200
				}
			]
		}));

	this.unload = function () {
		tb_elm.unload();
		tb_right.unload();
		tree_layers.unload();
		props.unload();
		stv.unload();
	};

	this.attache = function (obj) {
		tree_layers.attache();
		props.attache(obj);
	};

	this.resize_canvas = function () {
		var scroller = $(cont, '.scroller').baron();
		scroller.update();
		this.elm.setSizes();
		props.layout.setSizes();
		stv.layout.setSizes();
	};


	this.elm = new dhtmlXLayoutObject({
		parent:     cont.querySelector("[name=content_elm]"),
		pattern:    "1C",
		offsets: {
			top:    0,
			right:  0,
			bottom: 0,
			left:   0
		},
		cells: [
			{
				id:             "a",
				header:         false,
				height:         200
			}
		]
	});

	this.header_stv = cont.querySelector("[name=header_stv]");
	this.header_props = cont.querySelector("[name=header_props]");

	baron({
		cssGuru: true,
		root: cont,
		scroller: '.scroller',
		bar: '.scroller__bar',
		barOnCls: 'baron'
	}).fix({
		elements: '.header__title',
		outside: 'header__title_state_fixed',
		before: 'header__title_position_top',
		after: 'header__title_position_bottom',
		clickable: true
	});

}

/**
 * Работа с буфером обмена
 * @author Evgeniy Malyarov
 * @module clipboard
 */

/**
 * Объект для прослушивания и обработки событий буфера обмена
 * @param _editor
 * @constructor
 */
function Clipbrd(_editor) {

	var fakecb = {
		clipboardData: {
			types: ['text/plain'],
			json: '{a: 0}',
			getData: function () {
				return this.json;
			}
		}
	};

	function onpaste(e) {
		var _scheme = _editor.project;

		if(!e)
			e = fakecb;

		if(!_scheme.ox.empty()){

			if(e.clipboardData.types.indexOf('text/plain') == -1)
				return;

			try{
				var data = JSON.parse(e.clipboardData.getData('text/plain'));
				e.preventDefault();
			}catch(e){
				return;
			}

		}
	}

	function oncopy(e) {
		var _scheme = _editor.project;
		if(!_scheme.ox.empty()){
			e.clipboardData.setData('text/plain', fakecb.clipboardData.json);
			//e.clipboardData.setData('text/html', '<b>Hello, world!</b>');
			e.preventDefault();
		}
	}

	this.copy = function () {
		document.execCommand('copy');
	};

	this.paste = function () {
		onpaste();
	};

	document.addEventListener('copy', oncopy);

	document.addEventListener('paste', onpaste);
}
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
function Editor(pwnd, attr){

	acn = $p.enm.cnn_types.acn;

	var _editor = this,

		/**
		 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
		 * @type {Undo}
		 */
		undo = new UndoRedo(this),

		/**
		 * Объект для прослушивания и обработки событий буфера обмена
		 * @type {Clipbrd}
		 */
		clipbrd = new Clipbrd(this),

		/**
		 * Объект для управления редактором с клавиатуры
		 * @type {Keybrd}
		 */
		keybrd = new Keybrd(this),

		selectionBounds = null,
		selectionBoundsShape = null,
		drawSelectionBounds = 0;

	Editor.superclass.constructor.call(_editor);
	_editor.activate();

	consts.tune_paper(_editor.settings);

	_editor.__define({

		// ячейка родительского окна
		_pwnd: {
			get: function () {
				return pwnd;
			}
		},

		// разбивка на канвас и аккордион
		_layout: {
			value: pwnd.attachLayout({
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
				offsets: { top: 28, right: 0, bottom: 0, left: 0}
			})
		},

		// контейнер канваса
		_wrapper: {
			value: document.createElement('div')
		},

		// указатель на локальный dhtmlXWindows
		_dxw: {
			get: function () {
				return this._layout.dhxWins;
			}
		},

		toString: {
			value: function(){ return $p.msg.bld_constructor; }
		}
	});


	_editor._layout.cells("a").attachObject(_editor._wrapper);
	_editor._dxw.attachViewportTo(_editor._wrapper);

	_editor._wrapper.oncontextmenu = function (event) {
		event.preventDefault();
		return $p.cancel_bubble(event);
	};


	// аккордион со свойствами
	_editor._acc = new EditorAccordion(_editor, _editor._layout.cells("b")) ;

	/**
	 * Панель выбора инструментов рисовалки
	 * @type OTooolBar
	 */
	_editor.tb_left = new $p.iface.OTooolBar({wrapper: _editor._wrapper, top: '16px', left: '3px', name: 'left', height: '300px',
		image_path: 'dist/imgs/',
		buttons: [
			{name: 'select_node', img: 'icon-arrow-white.png', title: $p.injected_data['tip_select_node.html']},
			{name: 'pan', img: 'icon-hand.png', tooltip: 'Панорама и масштаб {Crtl}, {Alt}, {Alt + колёсико мыши}'},
			{name: 'zoom_fit', img: 'cursor-zoom.png', tooltip: 'Вписать в окно'},
			{name: 'pen', img: 'cursor-pen-freehand.png', tooltip: 'Добавить профиль'},
			{name: 'lay_impost', img: 'cursor-lay-impost.png', tooltip: 'Вставить раскладку или импосты'},
			{name: 'arc', img: 'cursor-arc-r.png', tooltip: 'Арка {Crtl}, {Alt}, {Пробел}'},
			{name: 'ruler', img: 'ruler_ui.png', tooltip: 'Позиционирование и сдвиг'},
			{name: 'grid', img: 'grid.png', tooltip: 'Таблица координат'},
			{name: 'line', img: 'line.png', tooltip: 'Произвольная линия'},
			{name: 'text', img: 'text.png', tooltip: 'Произвольный текст'}
		],
		onclick: function (name) {
			return _editor.select_tool(name);
		},
		on_popup: function (popup, bdiv) {
			popup.show(dhx4.absLeft(bdiv), 0, bdiv.offsetWidth, _editor._wrapper.offsetHeight);
			popup.p.style.top = (dhx4.absTop(bdiv) - 20) + "px";
			popup.p.querySelector(".dhx_popup_arrow").style.top = "20px";
		}
	});

	/**
	 * Верхняя панель инструментов
	 * @type {OTooolBar}
	 */
	_editor.tb_top = new $p.iface.OTooolBar({wrapper: _editor._layout.base, width: '100%', height: '28px', top: '0px', left: '0px', name: 'top',
		image_path: 'dist/imgs/',
		buttons: [

			{name: 'save_close', text: '&nbsp;<i class="fa fa-floppy-o fa-fw"></i>', tooltip: 'Рассчитать, записать и закрыть', float: 'left', width: '34px'},
			{name: 'calck', text: '<i class="fa fa-calculator fa-fw"></i>&nbsp;', tooltip: 'Рассчитать и записать данные', float: 'left'},

			{name: 'sep_0', text: '', float: 'left'},
			{name: 'stamp', img: 'stamp.png', tooltip: 'Загрузить из типового блока или заказа', float: 'left'},

			{name: 'sep_1', text: '', float: 'left'},
			{name: 'copy', text: '<i class="fa fa-clone fa-fw"></i>', tooltip: 'Скопировать выделенное', float: 'left'},
			{name: 'paste', text: '<i class="fa fa-clipboard fa-fw"></i>', tooltip: 'Вставить', float: 'left'},
			{name: 'paste_prop', text: '<i class="fa fa-paint-brush fa-fw"></i>', tooltip: 'Применить скопированные свойства', float: 'left'},

			{name: 'sep_2', text: '', float: 'left'},
			{name: 'back', text: '<i class="fa fa-undo fa-fw"></i>', tooltip: 'Шаг назад', float: 'left'},
			{name: 'rewind', text: '<i class="fa fa-repeat fa-fw"></i>', tooltip: 'Шаг вперед', float: 'left'},

			{name: 'sep_3', text: '', float: 'left'},
			{name: 'open_spec', text: '<i class="fa fa-table fa-fw"></i>', tooltip: 'Открыть спецификацию изделия', float: 'left'},

			{name: 'close', text: '<i class="fa fa-times fa-fw"></i>', tooltip: 'Закрыть без сохранения', float: 'right'}


		], onclick: function (name) {
			switch(name) {
				
				case 'save_close':
					if(_editor.project)
						_editor.project.save_coordinates({save: true, close: true});
					break;

				case 'close':
					if(pwnd._on_close)
						pwnd._on_close();
					_editor.select_tool('select_node');
					break;

				case 'calck':
					if(_editor.project)
						_editor.project.save_coordinates({save: true});
					break;

				case 'stamp':
					_editor.load_stamp();
					break;

				case 'new_stv':
					var fillings = _editor.project.getItems({class: Filling, selected: true});
					if(fillings.length)
						fillings[0].create_leaf();
					break;

				case 'back':
					undo.back();
					break;

				case 'rewind':
					undo.rewind();
					break;

				case 'copy':
					clipbrd.copy();
					break;

				case 'paste':
					clipbrd.paste();
					break;

				case 'paste_prop':
					$p.msg.show_msg(name);
					break;

				case 'open_spec':
					_editor.project.ox.form_obj()
						.then(function (w) {
							w.wnd.maximize();
						});
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
	_editor._layout.base.style.backgroundColor = "#f5f5f5";
	//_editor._layout.base.parentNode.parentNode.style.top = "0px";
	_editor.tb_top.cell.style.background = "transparent";
	_editor.tb_top.cell.style.boxShadow = "none";


	// Обработчик события после записи характеристики. Если в параметрах укзано закрыть - закрываем форму
	$p.eve.attachEvent("characteristic_saved", function (scheme, attr) {
		if(scheme == _editor.project && attr.close && pwnd._on_close)
			setTimeout(pwnd._on_close);
	});

	// Обработчик события при изменениях изделия
	$p.eve.attachEvent("scheme_changed", function (scheme) {
		if(scheme == _editor.project){
			if(attr.set_text && scheme._calc_order_row)
				attr.set_text(scheme.ox.prod_name(true) + " " + scheme._dp.sys.name + (scheme.ox._modified ? " *" : ""));
		}
	});


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
			var children = item.children || [];
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

	this.tools[1].activate();

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
				_canvas.style.backgroundColor = "#f9fbfa";

				var _scheme = new Scheme(_canvas);

				/**
				 * Подписываемся на события изменения размеров
				 */
				function pwnd_resize_finish(){
					_editor.project.resize_canvas(_editor._layout.cells("a").getWidth(), _editor._layout.cells("a").getHeight());
					_editor._acc.resize_canvas();
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
						if (evt.shiftKey || evt.ctrlKey) {
							_editor.view.center = panAndZoom.changeCenter(_editor.view.center, evt.deltaX, evt.deltaY, 1);
							return evt.preventDefault();

						}else if (evt.altKey) {
							mousePosition = new paper.Point(evt.offsetX, evt.offsetY);
							viewPosition = _editor.view.viewToProject(mousePosition);
							_ref1 = panAndZoom.changeZoom(_editor.view.zoom, evt.deltaY, _editor.view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
							_editor.view.zoom = newZoom;
							_editor.view.center = _editor.view.center.add(offset);
							evt.preventDefault();
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

				_editor._acc.attache(_editor.project._dp);
			}

			if(ox)
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

			if(this.project.ox.coordinates.count() && !confirmed){
				dhtmlx.confirm({
					title: $p.msg.bld_from_blocks_title,
					text: $p.msg.bld_from_blocks,
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn)
							this.load_stamp(true);
					}.bind(this)
				});
				return;
			}

			$p.cat.characteristics.form_selection_block(this._pwnd, {
				on_select: this.project.load_stamp.bind(this.project)
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
				var children = item.children || [];
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
			this._acc.unload();

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


/**
 * Обработчик сочетаний клавишь
 * @author Evgeniy Malyarov
 * @module keyboard
 */

/**
 * Управление редактором с клавиатуры
 * @param _editor
 * @constructor
 */
function Keybrd(_editor) {
	
}
/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * @author Evgeniy Malyarov
 * @module undo
 */

/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * Из публичных интерфейсов имеет только методы back() и rewind()
 * Основную работу делает прослушивая широковещательные события
 * @class UndoRedo
 * @constructor
 * @param _editor {Editor} - указатель на экземпляр редактора
 */
function UndoRedo(_editor){

	var _history = [],
		pos = -1,
		snap_timer;

	function run_snapshot() {
		
		// запускаем короткий пересчет изделия
		if(pos >= 0){

			// если pos < конца истории, отрезаем хвост истории
			if(pos > 0 && pos < (_history.length - 1)){
				_history.splice(pos, _history.length - pos - 1);
			}

			_editor.project.save_coordinates({snapshot: true});

		}

	}

	function save_snapshot(scheme) {
		_history.push(JSON.stringify({}._mixin(scheme.ox._obj, [], ["extra_fields","glasses","mosquito","specification"])));
		pos = _history.length - 1;
		enable_buttons();
	}

	function apply_snapshot() {
		_editor.project.load_stamp(JSON.parse(_history[pos]), true);
		enable_buttons();
	}
	
	function enable_buttons() {
		if(pos < 1)
			_editor.tb_top.buttons.back.classList.add("disabledbutton");
		else
			_editor.tb_top.buttons.back.classList.remove("disabledbutton");

		if(pos < (_history.length - 1))
			_editor.tb_top.buttons.rewind.classList.remove("disabledbutton");
		else
			_editor.tb_top.buttons.rewind.classList.add("disabledbutton");

	}

	function clear() {
		_history.length = 0;
		pos = -1;
	}

	// обрабатываем изменения изделия
	$p.eve.attachEvent("scheme_changed", function (scheme, attr) {
		if(scheme == _editor.project){

			// при открытии изделия чистим историю
			if(scheme.data._loading){
				if(!scheme.data._snapshot){
					clear();
					save_snapshot(scheme);	
				}

			} else{
				// при обычных изменениях, запускаем таймер снапшота
				if(snap_timer)
					clearTimeout(snap_timer);
				snap_timer = setTimeout(run_snapshot, 800);
				enable_buttons();
			}
		}

	});

	// при закрытии редактора чистим историю
	$p.eve.attachEvent("editor_closed", clear);

	// при готовности снапшота, добавляем его в историю
	$p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
		if(scheme == _editor.project){
			save_snapshot(scheme);
		}

	});

	this.back = function() {
		if(pos > 0)
			pos--;
		if(pos >= 0)
			apply_snapshot();
		else
			enable_buttons();
	};

	this.rewind = function() {
		if(pos <= (_history.length - 1)){
			pos++;
			apply_snapshot();
		}
	}
}
$p.injected_data._mixin({"tip_editor_right.html":"<div class=\"clipper editor_accordion\">\r\n\r\n    <div class=\"scroller\">\r\n        <div class=\"container\">\r\n\r\n            <!-- РАЗДЕЛ 1 - дерево слоёв -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_layers\"></div>\r\n            </div>\r\n            <div name=\"content_layers\" style=\"min-height: 200px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 2 - реквизиты элемента -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_elm\"></div>\r\n            </div>\r\n            <div name=\"content_elm\" style=\"min-height: 220px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 3 - реквизиты створки -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_stv\">\r\n                    <span name=\"title\">Створка</span>\r\n                </div>\r\n            </div>\r\n            <div name=\"content_stv\" style=\"min-height: 200px;\"></div>\r\n\r\n            <!-- РАЗДЕЛ 4 - реквизиты изделия -->\r\n            <div class=\"header\">\r\n                <div class=\"header__title\" name=\"header_props\">\r\n                    <span name=\"title\">Изделие</span>\r\n                </div>\r\n            </div>\r\n            <div name=\"content_props\" style=\"min-height: 330px;\"></div>\r\n\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"scroller__track\">\r\n        <div class=\"scroller__bar\" style=\"height: 26px; top: 0px;\"></div>\r\n    </div>\r\n\r\n</div>","tip_select_node.html":"<div class=\"otooltip\">\r\n    <p class=\"otooltip\">Инструмент <b>Элемент и узел</b> позволяет:</p>\r\n    <ul class=\"otooltip\">\r\n        <li>Выделить элемент<br />для изменения его свойств или перемещения</li>\r\n        <li>Выделить отдельные узлы и рычаги узлов<br />для изменения геометрии</li>\r\n        <li>Добавить новый узел (изгиб)<br />(кнопка {+} на цифровой клавиатуре)</li>\r\n        <li>Удалить выделенный узел (изгиб)<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n        <li>Добавить новый элемент, делением текущего<br />(кнопка {+} при нажатой кнопке {пробел})</li>\r\n        <li>Удалить выделенный элемент<br />(кнопки {del} или {-} на цифровой клавиатуре)</li>\r\n    </ul>\r\n    <hr />\r\n    <a title=\"Видеоролик, иллюстрирующий работу инструмента\" href=\"https://www.youtube.com/embed/UcBGQGqwUro?list=PLiVLBB_TTj5njgxk5E_EjwxzCGM4XyKlQ\" target=\"_blank\">\r\n        <i class=\"fa fa-video-camera fa-lg\"></i> Обучающее видео</a>\r\n    <a title=\"Справка по инструменту в WIKI\" href=\"http://www.oknosoft.ru/upzp/apidocs/classes/OTooolBar.html\" target=\"_blank\" style=\"margin-left: 9px;\">\r\n        <i class='fa fa-question-circle fa-lg'></i> Справка в wiki</a>\r\n</div>"});
return Editor;
}));
