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
						if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
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
						if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
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
	 * С этой функции начинается пересчет и перерисовка профиля
	 * Возвращает объект соединения конца профиля
	 * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
	 * - Попутно устанавливает признак `is_cut`, если в точке сходятся больше двух профилей
	 * - Не делает подмену соединения, хотя могла бы
	 * - Не делает подмену вставки, хотя могла бы
	 *
	 * @method cnn_point
	 * @param node {String} - имя узла профиля: "b" или "e"
	 * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
	 * @return {CnnPoint} - объект {point, profile, cnn_types}
	 */
	this.cnn_point = function(node, point){

		var res = this.rays[node],
			open_cnn = this.project._dp.sys.allow_open_cnn;

		if(!point)
			point = this[node];


		// Если привязка не нарушена, возвращаем предыдущее значение
		if(res.profile && res.profile.children.length){
			if(!res.is_l && (res.profile_point == "b" || res.profile_point == "e"))
				return res;

			else if(this.check_distance(res.profile, res, point, true) === false)
				return res;
		}

		// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
		res.clear();
		if(this.parent){
			var profiles = this.parent.profiles, ares = [];
			for(var i in profiles){
				if(this.check_distance(profiles[i], res, point, false) === false){

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
		get : function(){
			return (this.b.x - this.project.bounds.x).round(1); 
		},
		set: function(v){
			this.select_node("b");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.b.x, 0));	
		},
		enumerable : false
	},

	/**
	 * Координата y начала профиля
	 * @property y1
	 * @type {Number}
	 */
	y1: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.b.y).round(1); 
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("b");
			this.move_points(new paper.Point(0, v - this.b.y)); 
		},
		enumerable : false
	},

	/**
	 * Координата x конца профиля
	 * @property x2
	 * @type {Number}
	 */
	x2: {
		get : function(){ 
			return (this.e.x - this.project.bounds.x).round(1); 
		},
		set: function(v){
			this.select_node("e");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.e.x, 0));
		},
		enumerable : false
	},

	/**
	 * Координата y конца профиля
	 * @property y2
	 * @type {Number}
	 */
	y2: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.e.y).round(1); 
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("e");
			this.move_points(new paper.Point(0, v - this.e.y));
		},
		enumerable : false
	},
	
	cnn1: {
		get : function(){
			return this.cnn_point("b").cnn || $p.cat.cnns.get(); 
		},
		set: function(v){
			this.rays.b.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		},
		enumerable : false
	},

	cnn2: {
		get : function(){
			return this.cnn_point("e").cnn || $p.cat.cnns.get(); 
		},
		set: function(v){
			this.rays.e.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		},
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

			// TODO отказаться от повторного пересчета и заействовать клоны rays-ов
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
				if(pb.profile == t && pb.cnn && pb.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

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
				if(pe.profile == t && pe.cnn && pe.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

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
					{id: "info", path: "o.info", type: "ro"},
					"inset",
					"clr"
				],
				"Начало": ["x1", "y1", "cnn1"],
				"Конец": ["x2", "y2", "cnn2"]
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

		},
		enumerable : false
	},

	/**
	 * Вызывает одноименную функцию _scheme в контексте текущего профиля
	 */
	check_distance: {
		value: function (element, res, point, check_only) {
			return this.project.check_distance(element, this, res, point, check_only);
		},
		enumerable : false
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
			this.err = null;
			this.distance = 10e9;
			this.cnn_types = acn.i;
			if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.tcn.i)
				this.cnn = null;
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
