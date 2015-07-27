/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
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

	var _row = attr.row,
		_profile = this, _corns = [], _r,


	// кеш лучей в узлах профиля
		_rays = new function ProfileRays(){

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

			this.recalc = function(){

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
					this.outer.add(point_b.add(normal_b.multiply(d1)));
					this.inner.add(point_b.add(normal_b.multiply(d2)));
					this.outer.add(point_e.add(normal_b.multiply(d1)));
					this.inner.add(point_e.add(normal_b.multiply(d2)));
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

		};

	Profile.superclass.constructor.call(this, attr);

	// initialize
	(function(){

		var h = _profile.project.bounds.height;

		if(attr.generatrix) {
			this.data.generatrix = attr.generatrix;

		} else {

			_r = $p.fix_number(_row.r, true);

			if(_row.path_data) {
				this.data.generatrix = new paper.Path(attr.path_data);

			}else{
				this.data.generatrix = new paper.Path([_row.x1, h - _row.y1]);
				if(attr.r){
					this.data.generatrix.arcTo(
						$p.m.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2, _r, _row.arc_ccw, _row.more_180), [_row.x2, h - _row.y2]);
				}else{
					this.data.generatrix.lineTo([_row.x2, h - _row.y2]);
				}
			}
		}

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
	this._define('d0', {
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
	this._define('d1', {
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
	this._define('d2', {
		get : function(){ return this.d1 - this.width; },
		enumerable : true,
		configurable : false
	});

	/**
	 * Координаты начала элемента
	 * @property b
	 * @type Point
	 */
	this._define('b', {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.firstSegment.point;
		},
		set : function(newValue){
			_rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.firstSegment.point = newValue;
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Координаты конца элемента
	 * @property e
	 * @type Point
	 */
	this._define('e', {
		get : function(){
			if(this.data.generatrix)
				return this.data.generatrix.lastSegment.point;
		},
		set : function(newValue){
			_rays.clear();
			if(this.data.generatrix)
				this.data.generatrix.lastSegment.point = newValue;
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Опорные точки и лучи
	 * @property rays
	 * @type {Object}
	 */
	this._define("rays", {
		get : function(){
			if(!_rays.inner || !_rays.outer)
				_rays.recalc();

			return _rays;
		},
		enumerable : false,
		configurable : false
	});

	/**
	 * Радиус сегмента профиля
	 * @property r
	 * @type {Number}
	 */
	this._define("r", {
		get : function(){
			return _r;
		},
		set: function(v){
			_rays.clear();
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Направление дуги сегмента профиля против часовой стрелки
	 * @property arc_ccw
	 * @type {Boolean}
	 */
	this._define("arc_ccw", {
		get : function(){

		},
		set: function(v){
			_rays.clear();
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Дуга сегмента профиля > 180
	 * @property arc_ccw
	 * @type {Boolean}
	 */
	this._define("more_180", {
		get : function(){

		},
		set: function(v){
			_rays.clear();
		},
		enumerable : true,
		configurable : false
	});

	/**
	 * Координата начала профиля
	 * @property x1
	 * @type {Number}
	 */
	this._define("x1", {
		get : function(){ return Math.round(this.b.x*10)/10; },
		set: function(v){
			_profile.project.select_node(_profile, "b");
			_profile.move_points(new paper.Point(v - this.b.x, 0));	},
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата начала профиля
	 * @property y1
	 * @type {Number}
	 */
	this._define("y1", {
		get : function(){
			return Math.round((_profile.project.bounds.height-this.b.y)*10)/10; },
		set: function(v){
			v = _profile.project.bounds.height-v;
			_profile.project.select_node(_profile, "b");
			_profile.move_points(new paper.Point(0, v - this.b.y)); },
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата конца профиля
	 * @property x2
	 * @type {Number}
	 */
	this._define("x2", {
		get : function(){ return Math.round(this.e.x*10)/10; },
		set: function(v){
			_profile.project.select_node(_profile, "e");
			_profile.move_points(new paper.Point(v - this.e.x, 0)); },
		enumerable : false,
		configurable : false
	});

	/**
	 * Координата конца профиля
	 * @property y2
	 * @type {Number}
	 */
	this._define("y2", {
		get : function(){
			return Math.round((_profile.project.bounds.height-this.e.y)*10)/10; },
		set: function(v){
			v = _profile.project.bounds.height-v;
			_profile.project.select_node(_profile, "e");
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
		if(res.profile){
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
	 * Дополняет cnn_point свойствами соединения
	 * @param cnn_point {CnnPoint}
	 */
	this.postcalc_cnn = function(cnn_point){

		// если установленное ранее соединение проходит проходит по типу, нового не ищем
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
			noti = {type: consts.move_points, profiles: [this], points: []}, noti_points;

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

				// тянем примыкающий в узле соседний профиль
				//if(cnn_point && cnn_point.profile_point){
				//	if(cnn_point.cnn && acn.a.indexOf(cnn_point.cnn.cnn_type)!=-1 )
				//		cnn_point.profile[cnn_point.profile_point] = segments[j].point;
				//	else{
				//		cnn_point.cnn_types = acn.i;
				//		cnn_point.profile = null;
				//		//cnn_point.cnn = null;
				//	}
				//
				//}

				changed = true;
			}
		}
		if(changed){


			//// тянем профили, примыкающие к нашему по Т
			//this.parent.children.forEach(function(element) {
			//	if (element === _profile || !(element instanceof Profile))
			//		return;
			//
			//	if(element.rays.b.profile == _profile && element.rays.b.cnn_types == acn.t){
			//		element.b = _profile.generatrix.getNearestPoint(element.b);
			//
			//	}else if(element.rays.e.profile == _profile && element.rays.e.cnn_types == acn.t){
			//		element.e = _profile.generatrix.getNearestPoint(element.e);
			//
			//	}
			//
			//});

			_rays.clear();

			// информируем систему об изменениях
			_profile.parent.notify(noti);

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

	/**
	 * Формирует путь сегмента профиля на основании пути образующей
	 * @method redraw
	 */
	this.redraw = function(){

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
		if(gpath.is_linear()){
			path.add(_corns[1], _corns[2], _corns[3]);

		}else{
			path.add(_corns[1]);

			tpath = new paper.Path({insert: false});
			offset1 = rays.outer.getNearestLocation(_corns[1]).offset;
			offset2 = rays.outer.getNearestLocation(_corns[2]).offset;
			step = (offset2 - offset1) / 50;
			for(var i = offset1 + step; i<offset2; i+=step)
				tpath.add(rays.outer.getPointAt(i));
			tpath.simplify(0.8);
			path.join(tpath);
			path.add(_corns[2]);

			path.add(_corns[3]);

			tpath = new paper.Path({insert: false});
			offset1 = rays.inner.getNearestLocation(_corns[3]).offset;
			offset2 = rays.inner.getNearestLocation(_corns[4]).offset;
			step = (offset2 - offset1) / 50;
			for(var i = offset1 + step; i<offset2; i+=step)
				tpath.add(rays.inner.getPointAt(i));
			tpath.simplify(0.8);
			path.join(tpath);

		}

		path.add(_corns[4]);
		path.closePath();
		path.reduce();

		return this;
	};

}
Profile._extend(BuilderElement);