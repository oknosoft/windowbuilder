/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module profile_addl
 * Created 16.05.2016
 */


/**
 * ### Дополнительный профиль
 * Класс описывает поведение доборного и расширительного профилей
 *
 * - похож в поведении на сегмент створки, но расположен в том же слое, что и ведущий элемент
 * - у дополнительного профиля есть координаты конца и начала, такие же, как у Profile
 * - в случае внутреннего добора, могут быть Т - соединения, как у импоста
 * - в случае внешнего, концы соединяются с пустотой
 * - имеет одно ii примыкающее соединение
 * - есть путь образующей - прямая или кривая линия, такая же, как у створки
 * - длина дополнительного профиля может отличаться от длины ведущего элемента
 *
 * @class ProfileAddl
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 */
function ProfileAddl(attr){

	ProfileAddl.superclass.constructor.call(this, attr);

	this.data.generatrix.strokeWidth = 0;

	this.data.side = attr.side || "inner";

	// if(this.parent){
	//
	// 	// Подключаем наблюдателя за событиями контура с именем _consts.move_points_
	// 	this._observer = this.observer.bind(this);
	// 	Object.observe(this.layer._noti, this._observer, [consts.move_points]);
	//
	// }

}
ProfileAddl._extend(ProfileItem);


ProfileAddl.prototype.__define({

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
			_row.parent = this.parent.elm;


			// добавляем припуски соединений
			_row.len = this.length;

			// сохраняем информацию о соединениях
			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile instanceof Filling)
					row_b.node2 = "t";
				else if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile instanceof Filling)
					row_e.node2 = "t";
				else if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
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

		}
	},

	/**
	 * Примыкающий внешний элемент - имеет смысл для сегментов створок
	 * @property nearest
	 * @type Profile
	 */
	nearest: {
		value : function(){
			this.data._nearest_cnn = $p.cat.cnns.elm_cnn(this, this.parent, acn.ii, this.data._nearest_cnn);
			return this.parent;
		}
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

			return 0;
			//
			// var res = 0, curr = this, nearest;
			//
			// while(nearest = curr.nearest()){
			// 	res -= nearest.d2 + (curr.data._nearest_cnn ? curr.data._nearest_cnn.sz : 20);
			// 	curr = nearest;
			// }
			// return res;
		}
	},

	/**
	 * Расстояние от узла до внешнего ребра элемента
	 * для рамы, обычно = 0, для импоста 1/2 ширины
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d1
	 * @type Number
	 */
	d1: {
		get : function(){ return -(this.d0 - this.sizeb); }
	},

	/**
	 * Расстояние от узла до внутреннего ребра элемента
	 * зависит от ширины элементов и свойств примыкающих соединений
	 * @property d2
	 * @type Number
	 */
	d2: {
		get : function(){ return this.d1 - this.width; }
	},

	/**
	 * Возвращает истина, если соединение с наружной стороны
	 */
	outer: {
		get: function () {
			return this.data.side == "outer";
		}	
	},

	/**
	 * Возвращает тип элемента (Добор)
	 */
	elm_type: {
		get : function(){

			return $p.enm.elm_types.Добор;

		}
	},

	/**
	 * С этой функции начинается пересчет и перерисовка сегмента добора
	 * Возвращает объект соединения конца профиля
	 * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
	 * - Не делает подмену соединения, хотя могла бы
	 * - Не делает подмену вставки, хотя могла бы
	 *
	 * @method cnn_point
	 * @param node {String} - имя узла профиля: "b" или "e"
	 * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
	 * @return {CnnPoint} - объект {point, profile, cnn_types}
	 */
	cnn_point: {
		value: function(node, point){

			var res = this.rays[node],

				check_distance = function(elm, with_addl) {

					if(elm == this || elm == this.parent)
						return;

					var gp = elm.generatrix.getNearestPoint(point), distance;

					if(gp && (distance = gp.getDistance(point)) < consts.sticking){
						if(distance <= res.distance){
							res.point = gp;
							res.distance = distance;
							res.profile = elm;
						}
					}

					// if(elm.d0 != 0 && element.rays.outer){
					// 	// для вложенных створок учтём смещение
					// 	res.point = element.rays.outer.getNearestPoint(point);
					// 	res.distance = 0;
					// }else{
					// 	res.point = gp;
					// 	res.distance = distance;
					// }

					if(with_addl)
						elm.getItems({class: ProfileAddl}).forEach(function (addl) {
							check_distance(addl, with_addl);
						});

				}.bind(this);

			if(!point)
				point = this[node];


			// Если привязка не нарушена, возвращаем предыдущее значение
			if(res.profile && res.profile.children.length){

				check_distance(res.profile);

				if(res.distance < consts.sticking)
					return res;
			}


			// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
			res.clear();
			res.cnn_types = acn.t;

			this.layer.profiles.forEach(function (addl) {
				check_distance(addl, true);
			});


			return res;

		}
	},

	/**
	 * Рассчитывает точки пути на пересечении текущего и указанного профилей
	 * @method path_points
	 * @param cnn_point {CnnPoint}
	 */
	path_points: {
		value: function(cnn_point, profile_point){

			var _profile = this,
				_corns = this.data._corns,
				rays = this.rays,
				prays,  normal;

			if(!this.generatrix.curves.length)
				return cnn_point;

			// ищет точку пересечения открытых путей
			// если указан индекс, заполняет точку в массиве _corns. иначе - возвращает расстояние от узла до пересечения
			function intersect_point(path1, path2, index){
				var intersections = path1.getIntersections(path2),
					delta = Infinity, tdelta, point, tpoint;

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

			// Определяем сторону примыкающего
			function detect_side(){

				var interior = _profile.generatrix.getPointAt(0.5, true);

				return prays.inner.getNearestPoint(interior).getDistance(interior, true) < 
						prays.outer.getNearestPoint(interior).getDistance(interior, true) ? 1 : -1;

			}

			// если пересечение в узлах, используем лучи профиля
			prays = cnn_point.profile.rays;

			// добор всегда Т. сначала определяем, изнутри или снаружи находится наш профиль
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
		}
	},

	/**
	 * Вспомогательная функция обсервера, выполняет привязку узлов добора
	 */
	do_bind: {
		value: function (p, bcnn, ecnn, moved) {

			var imposts, moved_fact,

				bind_node = function (node, cnn) {

					if(!cnn.profile)
						return;
					
					var gen = this.outer ? this.parent.rays.outer : this.parent.rays.inner;
						mpoint = cnn.profile.generatrix.intersect_point(gen, cnn.point, "nearest");
					if(!mpoint.is_nearest(this[node])){
						this[node] = mpoint;
						moved_fact = true;
					}

				}.bind(this);
			
			// при смещениях родителя, даигаем образующую
			if(this.parent == p){

				bind_node("b", bcnn);
				bind_node("e", ecnn);

			}

			if(bcnn.cnn && bcnn.profile == p){

				bind_node("b", bcnn);

			}
			if(ecnn.cnn && ecnn.profile == p){

				bind_node("e", ecnn);

			}

			// если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
			if(moved && moved_fact){
				// imposts = this.joined_imposts();
				// imposts = imposts.inner.concat(imposts.outer);
				// for(var i in imposts){
				// 	if(moved.profiles.indexOf(imposts[i]) == -1){
				// 		imposts[i].profile.observer(this);
				// 	}
				// }
			}
		}
	}

});
