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
	}

});




