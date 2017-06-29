/**
 * Расширения объектов paper.js
 *
 * &copy; http://www.oknosoft.ru 2014-2017
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule paper_ex
 */

/**
 * Расширение класса Path
 */
Object.defineProperties(paper.Path.prototype, {

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
      }
    },

    /**
     * Угол по отношению к соседнему пути _other_ в точке _point_
     */
    angle_to: {
      value : function(other, point, interior, round){
        const p1 = this.getNearestPoint(point),
          p2 = other.getNearestPoint(point),
          t1 = this.getTangentAt(this.getOffsetOf(p1)),
          t2 = other.getTangentAt(other.getOffsetOf(p2));
        let res = t2.angle - t1.angle;
        if(res < 0){
          res += 360;
        }
        if(interior && res > 180){
          res = 180 - (res - 180);
        }
        return round ? res.round(round) : res.round(1);
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
            if(Math.abs(dc - da) > consts.epsilon)
              return false;
          }
        }
        return true;
      }
    },

    /**
     * возвращает фрагмент пути между точками
     * @param point1 {paper.Point}
     * @param point2 {paper.Point}
     * @return {paper.Path}
     */
    get_subpath: {
      value: function (point1, point2) {
        let tmp;

        if(!this.length || (point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point))){
          tmp = this.clone(false);
        }
        else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
          tmp = this.clone(false);
          tmp.reverse();
          tmp._reversed = true;
        }
        else{
          let loc1 = this.getLocationOf(point1);
          let loc2 = this.getLocationOf(point2);
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
          }
          else{
            // для кривого строим по точкам, наподобие эквидистанты
            const step = (loc2.offset - loc1.offset) * 0.02;

            tmp = new paper.Path({
              segments: [point1],
              insert: false
            });

            if(step < 0){
              tmp._reversed = true;
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
            tmp._reversed = true;
        }

        return tmp;
      }
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
        }

        return res.elongation(elong);
      }
    },

    /**
     * Удлиняет путь касательными в начальной и конечной точках
     */
    elongation: {
      value: function (delta) {

        if(delta){
          let tangent = this.getTangentAt(0);
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
      }
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
        const intersections = this.getIntersections(path);
        let delta = Infinity, tdelta, tpoint;

        if(intersections.length == 1){
          return intersections[0].point;
        }
        else if(intersections.length > 1){

          if(!point){
            point = this.getPointAt(this.length /2);
          }

          intersections.forEach((o) => {
            tdelta = o.point.getDistance(point, true);
            if(tdelta < delta){
              delta = tdelta;
              tpoint = o.point;
            }
          });
          return tpoint;
        }
        else if(elongate == "nearest"){

          // ищем проекцию ближайшей точки на path на наш путь
          return this.getNearestPoint(path.getNearestPoint(point));

        }
        else if(elongate){

          // продлеваем пути до пересечения
          let p1 = this.getNearestPoint(point),
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
      }
    }

  });


Object.defineProperties(paper.Point.prototype, {

	/**
	 * Выясняет, расположена ли точка в окрестности точки
	 * @param point {paper.Point}
	 * @param [sticking] {Boolean|Number}
	 * @return {Boolean}
	 */
	is_nearest: {
		value: function (point, sticking) {
		  if(sticking === 0){
        return Math.abs(this.x - point.x) < consts.epsilon && Math.abs(this.y - point.y) < consts.epsilon;
      }
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 16);
		}
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
		}
	},

	/**
	 * ### Рассчитывает координаты центра окружности по точкам и радиусу
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
		}
	},

	/**
	 * ### Рассчитывает координаты точки, лежащей на окружности
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 * @param r
	 * @param arc_ccw
	 * @param more_180
	 * @return {{x: number, y: number}}
	 */
	arc_point: {
		value: function(x1,y1, x2,y2, r, arc_ccw, more_180){
			const point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				let dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
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
		}
	},

  /**
   * Рассчитывает радиус окружности по двум точкам и высоте
   */
  arc_r: {
	  value: function (x1,y1,x2,y2,h) {
      if (!h){
        return 0;
      }
	    const [dx, dy] = [(x1-x2), (y1-y2)];
      return (h/2 + (dx * dx + dy * dy) / (8 * h)).round(3);
    }
  },

	/**
	 * ### Привязка к углу
	 * Сдвигает точку к ближайшему лучу с углом, кратным snapAngle
	 *
	 * @param [snapAngle] {Number} - шаг угла, по умолчанию 45°
	 * @return {paper.Point}
	 */
	snap_to_angle: {
		value: function(snapAngle) {

			if(!snapAngle){
        snapAngle = Math.PI*2/8;
      }

			let angle = Math.atan2(this.y, this.x);
			angle = Math.round(angle/snapAngle) * snapAngle;

			const dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*this.x + diry*this.y;

			return new paper.Point(dirx*d, diry*d);
		}
	},

  bind_to_nodes: {
	  value: function (sticking) {
      return paper.project.activeLayer.nodes.some((point) => {
        if(point.is_nearest(this, sticking)){
          this.x = point.x;
          this.y = point.y;
          return true;
        }
      });
    }
  }

});





