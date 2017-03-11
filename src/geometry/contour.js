/**
 * ### Контур (слой) изделия
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule contour
 */

/* global paper, $p */

/**
 * ### Сегмент заполнения
 * содержит информацию о примыкающем профиле и координатах начала и конца
 * @class GlassSegment
 * @constructor
 */
class GlassSegment {

  constructor(profile, b, e, outer) {

    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = !!outer;

    this.segment();

  }

  segment() {

    let gen;

    if(this.profile.children.some((addl) => {

        if(addl instanceof ProfileAddl && this.outer == addl.outer){

          if(!gen){
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;

          // TODO: учесть импосты, привязанные к добору

          if(b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)){
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })){

      this.segment();
    }

  }
}

/**
 * ### Контур (слой) изделия
 * Унаследован от  [paper.Layer](http://paperjs.org/reference/layer/)
 * новые элементы попадают в активный слой-контур и не могут его покинуть
 * @class Contour
 * @constructor
 * @extends paper.Layer
 * @menuorder 30
 * @tooltip Контур (слой) изделия
 */
function Contour(attr){

	// за этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
	this._noti = {};

  // метод - нотификатор
  this._notifier = Object.getNotifier(this._noti);

  // здесь живут группы текста и размерных линий
  this._layers = {};


	// строка в таблице конструкций
	if(attr.row){
    this._row = attr.row;
  }
	else{
	  const {constructions} = paper.project.ox;
    this._row = constructions.add({ parent: attr.parent ? attr.parent.cnstr : 0 });
    this._row.cnstr = constructions.aggregate([], ["cnstr"], "MAX") + 1;
	}


  Contour.superclass.constructor.call(this);

  if(attr.parent){
    this.parent = attr.parent;
  }


	// добавляем элементы контура
	if(this.cnstr){

		const {coordinates} = paper.project.ox;

		// профили и доборы
		coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => {

      const profile = new Profile({row: row, parent: this});

			coordinates.find_rows({cnstr: row.cnstr, parent: {in: [row.elm, -row.elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => {
				new ProfileAddl({row: row,	parent: profile});
			});

		});

		// заполнения
		coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => {
			new Filling({row: row,	parent: this});
		});

		// остальные элементы (текст)
		coordinates.find_rows({cnstr: this.cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => {

			if(row.elm_type == $p.enm.elm_types.Текст){
				new FreeText({row: row, parent: this.l_text});
			}
		});

	}

}
Contour._extend(paper.Layer);

Contour.prototype.__define({

  /**
   * Номер конструкции текущего слоя
   */
  cnstr: {
    get : function(){
      return this._row.cnstr;
    },
    set : function(v){
      this._row.cnstr = v;
    }
  },

  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify: {
    value: function (obj) {
      this._notifier.notify(obj);
      this.project.register_change();
    }
  },

	/**
	 * Врезаем оповещение при активации слоя
	 */
	activate: {
		value: function(custom) {
			this.project._activeLayer = this;
			$p.eve.callEvent("layer_activated", [this, !custom]);
			this.project.register_update();
		}
	},

  /**
   * Удаляет контур из иерархии проекта
   * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
   * @method remove
   */
  remove: {
	  value: function () {

      //удаляем детей
      const {children, _row} = this;
      while(children.length){
        children[0].remove();
      }

      const {ox} = this.project;
      ox.coordinates.find_rows({cnstr: this.cnstr}).forEach(function (row) {
        ox.coordinates.del(row._row);
      });

      // удаляем себя
      if(ox === _row._owner._owner){
        _row._owner.del(_row);
      }
      this._row = null;

      // стандартные действия по удалению элемента paperjs
      Contour.superclass.remove.call(this);
    }
  },

  /**
   * путь контура - при чтении похож на bounds
   * для вложенных контуров определяет положение, форму и количество сегментов створок
   * @property path
   * @type paper.Path
   */
  path: {
    get : function(){
      return this.bounds;
    },
    set : function(attr){

      if(Array.isArray(attr)){

        const noti = {type: consts.move_points, profiles: [], points: []};
        const {outer_nodes} = this;

        let need_bind = attr.length,
          available_bind = outer_nodes.length,
          elm, curr;

        // первый проход: по двум узлам либо примыканию к образующей
        if(need_bind){
          for(let i in attr){
            curr = attr[i];             // curr.profile - сегмент внешнего профиля
            for(let j in outer_nodes){
              elm = outer_nodes[j];   // elm - сегмент профиля текущего контура
              if(elm.data.binded){
                continue;
              }
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
          for(let i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            for(let j in outer_nodes){
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
          for(let i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            for(let j in outer_nodes){
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
          for(let i in attr){
            curr = attr[i];
            if(curr.binded)
              continue;
            elm = new Profile({
              generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
              proto: outer_nodes.length ? outer_nodes[0] : {
                  parent: this,
                  clr: this.project.default_clr()
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
          outer_nodes.forEach((elm) => {
            if(!elm.data.binded){
              elm.rays.clear(true);
              elm.remove();
              available_bind--;
            }
          });
        }

        // информируем систему об изменениях
        if(noti.points.length){
          this.notify(noti);
        }

        // пересчитываем вставки створок
        this.profiles.forEach((p) => p.default_inset());
        this.data._bounds = null;
      }
    },
    enumerable : true
  },

	/**
	 * Возвращает массив профилей текущего контура
	 * @property profiles
	 * @for Contour
	 * @returns {Array.<Profile>}
	 */
	profiles: {
		get: function(){
      return this.children.filter((elm) => elm instanceof Profile);
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
      return this.getItems({class: Profile}).filter((elm) => {
        return elm.rays.b.is_tt || elm.rays.e.is_tt || elm.rays.b.is_i || elm.rays.e.is_i;
      });
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
			return this.children.filter((elm) => {
        if((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
          if(hide){
            elm.visible = false;
          }
          return true;
        }
      });
		}
	},

  /**
   * Возвращает массив вложенных контуров текущего контура
   * @property contours
   * @for Contour
   * @type Array
   */
  contours: {
    get: function () {
      return this.children.filter((elm) => elm instanceof Contour);
    }
  },

	/**
	 * Габариты по внешним краям профилей контура
	 */
	bounds: {
		get: function () {

      const {data, parent} = this;

			if(!data._bounds || !data._bounds.width || !data._bounds.height){

			  this.profiles.forEach((profile) => {
          const path = profile.path && profile.path.segments.length ? profile.path : profile.generatrix;
          if(path){
            data._bounds = data._bounds ? data._bounds.unite(path.bounds) : path.bounds;
            if(!parent){
              const {d0} = profile;
              if(d0){
                data._bounds = data._bounds.unite(profile.generatrix.bounds)
              }
            }
          }
        });

        if(!data._bounds){
          data._bounds = new paper.Rectangle();
        }
			}

			return data._bounds;
		}
	},

	/**
	 * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
	 */
	dimension_bounds: {

		get: function(){
			let bounds = this.bounds;
			this.getItems({class: DimensionLineCustom}).forEach((dl) => {
				bounds = bounds.unite(dl.bounds);
			});
			return bounds;
		}
	},

	/**
	 * Перерисовывает элементы контура
	 * @method redraw
	 * @for Contour
	 */
	redraw: {
		value: function(on_redrawed){

			if(!this.visible){
        return on_redrawed ? on_redrawed() : undefined;
      }

			let llength = 0;

			function on_child_contour_redrawed(){
				llength--;
				if(!llength && on_redrawed)
					on_redrawed();
			}

			// сбрасываем кеш габаритов
			this.data._bounds = null;

			// чистим визуализацию
			if(!this.project.data._saving && this.l_visualization._by_spec){
        this.l_visualization._by_spec.removeChildren();
      }

			// сначала перерисовываем все профили контура
      this.profiles.forEach((elm) => {
				elm.redraw();
			});

			// затем, создаём и перерисовываем заполнения, которые перерисуют свои раскладки
      this.glass_recalc();

			// рисуем направление открывания
      this.draw_opening();

			// перерисовываем вложенные контуры
      this.children.forEach((child_contour) => {
				if (child_contour instanceof Contour){
					llength++;
					//setTimeout(function () {
					//	if(!this.project.has_changes())
					//		child_contour.redraw(on_child_contour_redrawed);
					//});
					child_contour.redraw(on_child_contour_redrawed);
				}
			});

			// информируем мир о новых размерах нашего контура
			$p.eve.callEvent("contour_redrawed", [this, this.data._bounds]);

			// если нет вложенных контуров, информируем проект о завершении перерисовки контура
			if(!llength && on_redrawed){
        on_redrawed();
      }

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
				if(elm.save_coordinates){
					elm.save_coordinates();

				}else if(elm instanceof paper.Group && (elm == elm.layer.l_text || elm == elm.layer.l_dimensions)){
					elm.children.forEach(function (elm) {
						if(elm.save_coordinates)
							elm.save_coordinates();
					});
				}
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
			const {profiles} = this;
			const to_remove = [];
			const res = [];

			let findedb, findede;

			// прочищаем, выкидывая такие, начало или конец которых соединениы не в узле
			for(let i=0; i<profiles.length; i++){
				const elm = profiles[i];
				if(elm.data.simulated)
					continue;
				findedb = false;
				findede = false;
				for(var j=0; j<profiles.length; j++){
					if(profiles[j] == elm)
						continue;
					if(!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
						findedb = true;
					if(!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
						findede = true;
				}
				if(!findedb || !findede)
					to_remove.push(elm);
			}
			for(let i=0; i<profiles.length; i++){
				const elm = profiles[i];
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

			const nodes = [];

			this.profiles.forEach((p) => {
				let findedb;
				let findede;
				nodes.forEach((n) => {
					if(p.b.is_nearest(n)){
            findedb = true;
          }
					if(p.e.is_nearest(n)){
            findede = true;
          }
				});
				if(!findedb){
          nodes.push(p.b.clone());
        }
				if(!findede){
          nodes.push(p.e.clone());
        }
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
			const	is_flap = !!this.parent;
			const nodes = [];

			// для всех профилей контура
      this.profiles.forEach((p) => {

				// ищем примыкания T к текущему профилю
				const ip = p.joined_imposts(),
					gen = p.generatrix,
					pb = p.cnn_point("b"),
					pe = p.cnn_point("e"),
          fn_sort = (a, b) => {
            const da = gen.getOffsetOf(a.point),
              db = gen.getOffsetOf(b.point);

            if (da < db){
              return -1;
            }
            else if (da > db){
              return 1;
            }
            return 0;
          };

				let pbg, peg;

				// для створочных импостов используем не координаты их b и e, а ближайшие точки примыкающих образующих
				if(is_flap && pb.is_t){
          pbg = pb.profile.generatrix.getNearestPoint(p.b);
        }
				else{
          pbg = p.b;
        }

				if(is_flap && pe.is_t){
          peg = pe.profile.generatrix.getNearestPoint(p.e);
        }
				else{
          peg = p.e;
        }

				// если есть примыкания T, добавляем сегменты, исключая соединения с пустотой
				if(ip.inner.length){

				  ip.inner.sort(fn_sort);

					if(!pb.is_i){
            nodes.push(new GlassSegment(p, pbg, ip.inner[0].point));
          }

					for(let i = 1; i < ip.inner.length; i++){
            nodes.push(new GlassSegment(p, ip.inner[i-1].point, ip.inner[i].point));
          }

					if(!pe.is_i){
            nodes.push(new GlassSegment(p, ip.inner[ip.inner.length-1].point, peg));
          }

				}
				if(ip.outer.length){

					ip.outer.sort(fn_sort);

					if(!pb.is_i){
            nodes.push(new GlassSegment(p, ip.outer[0].point, pbg, true));
          }

					for(let i = 1; i < ip.outer.length; i++){
            nodes.push(new GlassSegment(p, ip.outer[i].point, ip.outer[i-1].point, true));
          }

					if(!pe.is_i){
            nodes.push(new GlassSegment(p, peg, ip.outer[ip.outer.length-1].point, true));
          }
				}

        // добавляем, если нет соединений с пустотой
				if(!ip.inner.length){
					if(!pb.is_i && !pe.is_i){
            nodes.push(new GlassSegment(p, pbg, peg));
          }
				}

        // для импостов добавляем сегмент в обратном направлении
				if(!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)){
					if(!pb.is_i && !pe.is_i){
            nodes.push(new GlassSegment(p, peg, pbg, true));
          }
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
			const segments = this.glass_segments;
      const res = [];
			let curr, acurr;

			// возвращает массив сегментов, которые могут следовать за текущим
			function find_next(curr){
				if(!curr.anext){
					curr.anext = [];
					segments.forEach((segm) => {
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
				const anext = find_next(segm);
				for(let i = 0; i < anext.length; i++){
					if(anext[i] == curr){
            return anext;
          }
					else if(acurr.every((el) => el != anext[i] )){
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
				acurr.forEach((el) => {
					const ind = segments.indexOf(el);
					if(ind != -1){
            segments.splice(ind, 1);
          }
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

			const _contour = this;
      const contours = _contour.glass_contours;
      const glasses = _contour.glasses(true);

			/**
			 * Привязывает к пути найденной замкнутой области заполнение или вложенный контур текущего контура
			 * @param glass_contour {Array}
			 */
			function bind_glass(glass_contour){

				let rating = 0, glass, crating, cglass, glass_nodes, glass_path_center;

				for(let g in glasses){

					glass = glasses[g];
					if(glass.visible){
            continue;
          }

					// вычисляем рейтинг
					crating = 0;
					glass_nodes = glass.outer_profiles;
					// если есть привязанные профили, используем их. иначе - координаты узлов
					if(glass_nodes.length){
						for(let j = 0; j < glass_contour.length; j++){
							for(let i = 0; i < glass_nodes.length; i++){
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
					}
					else{
						glass_nodes = glass.nodes;
						for(let j = 0; j < glass_contour.length; j++){
							for(let i = 0; i < glass_nodes.length; i++){
								if(glass_contour[j].b.is_nearest(glass_nodes[i])){
									crating++;
									break;
								}
							}
							if(crating > 2){
                break;
              }
						}
					}

					if(crating > rating || !cglass){
						rating = crating;
						cglass = glass;
					}
					if(crating == rating && cglass != glass){
						if(!glass_path_center){
							glass_path_center = glass_contour[0].b;
							for(let i=1; i<glass_contour.length; i++){
                glass_path_center = glass_path_center.add(glass_contour[i].b);
              }
							glass_path_center = glass_path_center.divide(glass_contour.length);
						}
						if(glass_path_center.getDistance(glass.bounds.center, true) < glass_path_center.getDistance(cglass.bounds.center, true)){
              cglass = glass;
            }
					}
				}

				// TODO реализовать настоящее ранжирование
				if(cglass || (cglass = _contour.getItem({class: Filling, visible: false}))) {
					cglass.path = glass_contour;
					cglass.visible = true;
					if (cglass instanceof Filling) {
            cglass.redraw();
					}
				}else{
					// добавляем заполнение
					// 1. ищем в изделии любое заполнение
					// 2. если не находим, используем умолчание системы
					if(glass = _contour.getItem({class: Filling})){

					}
					else if(glass = _contour.project.getItem({class: Filling})){

					}
					else{

					}
					cglass = new Filling({proto: glass, parent: _contour, path: glass_contour});
          cglass.redraw();
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
			if(!nodes.length){
        return nodes;
      }
      let prev = nodes[0];
      const res = [prev];
			let couner = nodes.length + 1;

			while (res.length < nodes.length && couner){
				couner--;
				for(let i = 0; i < nodes.length; i++){
					const curr = nodes[i];
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
				for(let i = 0; i < res.length; i++){
          nodes.push(res[i]);
        }
				res.length = 0;
			}
		}
	},

	// виртуальные метаданные для автоформ
	_metadata: {
		get : function(){
			var t = this,
				_xfields = t.project.ox._metadata.tabular_sections.constructions.fields; //_dgfields = this.project._dp._metadata.fields

			return {
				fields: {
					furn: _xfields.furn,
					clr_furn: _xfields.clr_furn,
					direction: _xfields.direction,
					h_ruch: _xfields.h_ruch
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

			if(this._row.furn == v){
        return;
      }

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
			// if(this.clr_furn.empty()){
			// 	this.project.ox.constructions.find_rows({clr_furn: {not: $p.cat.clrs.get()}}, function (row) {
			// 		this.clr_furn = row.clr_furn;
			// 		return false;
			// 	}.bind(this._row));
			// }
			// if(this.clr_furn.empty()){
			// 	this._row.furn.colors.each(function (row) {
			// 		this.clr_furn = row.clr;
			// 		return false;
			// 	}.bind(this._row));
			// }

			// перезаполняем параметры фурнитуры
			this._row.furn.refill_prm(this);

			this.project.register_change(true);

			setTimeout($p.eve.callEvent.bind($p.eve, "furn_changed", [this]));

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
	 * Возвращает структуру профилей по сторонам
	 */
	profiles_by_side: {
		value: function (side) {
			// получаем таблицу расстояний профилей от рёбер габаритов
			const {profiles, bounds} = this;
      const res = {};
      const ares = [];

			function by_side(name) {
				ares.sort(function (a, b) {
					return a[name] - b[name];
				});
				res[name] = ares[0].profile;
			}

			if(profiles.length){
				profiles.forEach((profile) => {
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

			if(!cache){
        cache = {
          profiles: this.outer_nodes,
          bottom: this.profiles_by_side("bottom")
        };
      }

      const profile_node = this.direction == $p.enm.open_directions.Правое ? "b" : "e";
      const other_node = profile_node == "b" ? "e" : "b";

      let profile = cache.bottom;

      const next = () => {
					side--;
					if(side <= 0){
            return profile;
          }

					cache.profiles.some((curr) => {
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
			return (this.side_count != 4) || !this.profiles.some((profile) => {
				return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 1);
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
			if(!this.is_rectangular){
        return 0;
      }
      const profiles = this.profiles_by_side();
			return this.bounds ? this.bounds.width - profiles.left.nom.sizefurn - profiles.right.nom.sizefurn : 0;
		}
	},

	/**
	 * Высота контура по фальцу
	 */
	h: {
		get : function(){
			if(!this.is_rectangular){
        return 0;
      }
      const profiles = this.profiles_by_side();
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
			if(this.project.contours.count == 1 || this.parent){
        return true;
      }

			// если контур реально верхний или правый и т.д. - возвращаем результат сразу
			let res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

			if(!res){
			  let rect;
				if(pos == "top"){
					rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
				}
				else if(pos == "left"){
					rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
				}
				else if(pos == "right"){
					rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
				}
				else if(pos == "bottom"){
					rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
				}

				res = !this.project.contours.some((l) => {
					return l != this && rect.intersects(l.bounds);
				});
			}

			return res;

		}
	},

  /**
   * Cлужебная группа текстовых комментариев
   */
  l_text: {
    get: function () {
      const {_layers} = this;
      return _layers.text || (_layers.text = new paper.Group({ parent: this }));
    }
  },

  /**
   * Cлужебная группа визуализации допов,  петель и ручек
   */
  l_visualization: {
    get: function () {
      const {_layers} = this;
      return _layers.visualization || (_layers.visualization = new paper.Group({ parent: this, guide: true }));
    }
  },

  /**
   * Cлужебная группа размерных линий
   */
  l_dimensions: {
    get: function () {
      const {_layers} = this;
      if(!_layers.dimensions){
        _layers.dimensions = new paper.Group({ parent: this });
        _layers.dimensions.bringToFront();
      }
      return _layers.dimensions;
    }
  },

	/**
	 * Рисует направление открывания
	 */
	draw_opening: {
		value: function () {

      const _contour = this;
      const {l_visualization, furn} = this;

			if(!this.parent || !$p.enm.open_types.is_opening(furn.open_type)){
				if(l_visualization._opening && l_visualization._opening.visible)
					l_visualization._opening.visible = false;
				return;
			}

      // создаём кеш элементов по номеру фурнитуры
      const cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side("bottom")
      };

			// рисует линии открывания на поворотной, поворотнооткидной и фрамужной фурнитуре
			function rotary_folding() {

        const {_opening} = l_visualization;
        const {side_count} = _contour;

				furn.open_tunes.forEach((row) => {

					if(row.rotation_axis){
						const axis = _contour.profile_by_furn_side(row.side, cache);
            const other = _contour.profile_by_furn_side(
								row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

						_opening.moveTo(axis.corns(3));
						_opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
						_opening.lineTo(axis.corns(4));

					}
				});
			}

			// рисует линии открывания на раздвижке
			function sliding() {
			  // находим центр
        const {center} = _contour.bounds;
        const {_opening} = l_visualization;

        if(_contour.direction == $p.enm.open_directions.Правое) {
          _opening.moveTo(center.add([-100,0]));
          _opening.lineTo(center.add([100,0]));
          _opening.moveTo(center.add([30,30]));
          _opening.lineTo(center.add([100,0]));
          _opening.lineTo(center.add([30,-30]));
        }
        else {
          _opening.moveTo(center.add([100,0]));
          _opening.lineTo(center.add([-100,0]));
          _opening.moveTo(center.add([-30,30]));
          _opening.lineTo(center.add([-100,0]));
          _opening.lineTo(center.add([-30,-30]));
        }
			}

			// подготавливаем слой для рисования
			if(!l_visualization._opening){
        l_visualization._opening = new paper.CompoundPath({
          parent: _contour.l_visualization,
          strokeColor: 'black'
        });
      }
			else{
        l_visualization._opening.removeChildren();
      }

			// рисуем раправление открывания
      return furn.is_sliding ? sliding() : rotary_folding();

		}
	},

	/**
	 * Рисует дополнительную визуализацию. Данные берёт из спецификации
	 */
	draw_visualization: {
		value: function () {

		  const {profiles, l_visualization} = this;

			if(l_visualization._by_spec){
        l_visualization._by_spec.removeChildren();
      }
			else{
        l_visualization._by_spec = new paper.Group({ parent: l_visualization });
      }

			// получаем строки спецификации с визуализацией
			this.project.ox.specification.find_rows({dop: -1}, (row) => {
				profiles.some((elm) => {
					if(row.elm == elm.elm){

						// есть визуализация для текущего профиля
						row.nom.visualization.draw(elm, l_visualization, row.len * 1000);

						return true;
					}
				});
			});

			// перерисовываем вложенные контуры
			this.children.forEach((l) => l instanceof Contour && l.draw_visualization());

		}
	},

  /**
   * Массив с рёбрами периметра
   */
  perimeter: {
    get: function () {
      const res = [];
      this.outer_profiles.forEach((curr) => {
        const tmp = curr.sub_path ? {
            len: curr.sub_path.length,
            angle: curr.e.subtract(curr.b).angle
          } : {
            len: curr.elm.length,
            angle: curr.elm.angle_hor
          };
        res.push(tmp);
        if(tmp.angle < 0){
          tmp.angle += 360;
        }
      });
      return res;
    }
  },

	/**
	 * формирует авторазмерные линии
	 */
	draw_sizes: {

		value: function () {

		  const {contours, parent, l_dimensions, bounds} = this;

			// сначала, перерисовываем размерные линии вложенных контуров, чтобы получить отступы
      contours.forEach((l) => l.draw_sizes());

			// для внешних контуров строим авторазмерные линии
			if(!parent){

        const by_side = this.profiles_by_side();

				// сначала, строим размерные линии импостов

				// получаем все профили контура, делим их на вертикальные и горизонтальные
				const ihor = [{
				  point: bounds.top.round(0),
          elm: by_side.top,
          p: by_side.top.b.y < by_side.top.e.y ? "b" : "e"
				}, {
				  point: bounds.bottom.round(0),
          elm: by_side.bottom,
          p: by_side.bottom.b.y < by_side.bottom.e.y ? "b" : "e"
        }];
				const ivert = [{
				  point: bounds.left.round(0),
          elm: by_side.left,
          p: by_side.left.b.x > by_side.left.e.x ? "b" : "e"
        }, {
				  point: bounds.right.round(0),
          elm: by_side.right,
          p: by_side.right.b.x > by_side.right.e.x ? "b" : "e"
        }];

				this.profiles.forEach((elm) => {
          if(ihor.every((v) => v.point != elm.b.y.round(0))){
            ihor.push({
              point: elm.b.y.round(0),
              elm: elm,
              p: "b"
            });
          }
          if(ihor.every((v) => v.point != elm.e.y.round(0))){
            ihor.push({
              point: elm.e.y.round(0),
              elm: elm,
              p: "e"
            });
          }
          if(ivert.every((v) => v.point != elm.b.x.round(0))){
            ivert.push({
              point: elm.b.x.round(0),
              elm: elm,
              p: "b"
            });
          }
          if(ivert.every((v) => v.point != elm.e.x.round(0))){
            ivert.push({
              point: elm.e.x.round(0),
              elm: elm,
              p: "e"
            });
          }
				});

				if(ihor.length > 2 || ivert.length > 2){

          ihor.sort((a, b) => b.point - a.point);
          ivert.sort((a, b) => a.point - b.point);

					// для ihor добавляем по вертикали
					if(!l_dimensions.ihor){
            l_dimensions.ihor = {};
          }
          if(this.is_pos("right")){
            this.imposts_dimensions(ihor, l_dimensions.ihor, "right");
          }
          else if(this.is_pos("left")){
            this.imposts_dimensions(ihor, l_dimensions.ihor, "left");
          }

					// для ivert добавляем по горизонтали
					if(!l_dimensions.ivert){
            l_dimensions.ivert = {};
          }
          if(this.is_pos("bottom")){
            this.imposts_dimensions(ivert, l_dimensions.ivert, "bottom");
          }
          else if(this.is_pos("top")){
            this.imposts_dimensions(ivert, l_dimensions.ivert, "top");
          }
				}

				// далее - размерные линии контура
        this.draw_sizes_contour(ihor, ivert);

			}

			// перерисовываем размерные линии текущего контура
      l_dimensions.children.forEach((dl) => dl.redraw && dl.redraw());

		}
	},

  /**
   * ### Формирует размерные линии контура
   */
  draw_sizes_contour: {

    value: function (ihor, ivert) {

      const {project, l_dimensions} = this;

      if (project.contours.length > 1) {

        if(this.is_pos("left") && !this.is_pos("right") && project.bounds.height != this.bounds.height){
          if(!l_dimensions.left){
            l_dimensions.left = new DimensionLine({
              pos: "left",
              parent: l_dimensions,
              offset: ihor.length > 2 ? 220 : 90,
              contour: true
            });
          }else
            l_dimensions.left.offset = ihor.length > 2 ? 220 : 90;

        }else{
          if(l_dimensions.left){
            l_dimensions.left.remove();
            l_dimensions.left = null;
          }
        }

        if(this.is_pos("right") && project.bounds.height != this.bounds.height){
          if(!l_dimensions.right){
            l_dimensions.right = new DimensionLine({
              pos: "right",
              parent: l_dimensions,
              offset: ihor.length > 2 ? -260 : -130,
              contour: true
            });
          }else
            l_dimensions.right.offset = ihor.length > 2 ? -260 : -130;

        }else{
          if(l_dimensions.right){
            l_dimensions.right.remove();
            l_dimensions.right = null;
          }
        }

        if(this.is_pos("top") && !this.is_pos("bottom") && project.bounds.width != this.bounds.width){
          if(!l_dimensions.top){
            l_dimensions.top = new DimensionLine({
              pos: "top",
              parent: l_dimensions,
              offset: ivert.length > 2 ? 220 : 90,
              contour: true
            });
          }else
            l_dimensions.top.offset = ivert.length > 2 ? 220 : 90;
        }else{
          if(l_dimensions.top){
            l_dimensions.top.remove();
            l_dimensions.top = null;
          }
        }

        if(this.is_pos("bottom") && project.bounds.width != this.bounds.width){
          if(!l_dimensions.bottom){
            l_dimensions.bottom = new DimensionLine({
              pos: "bottom",
              parent: l_dimensions,
              offset: ivert.length > 2 ? -260 : -130,
              contour: true
            });
          }else
            l_dimensions.bottom.offset = ivert.length > 2 ? -260 : -130;

        }else{
          if(l_dimensions.bottom){
            l_dimensions.bottom.remove();
            l_dimensions.bottom = null;
          }
        }

      }
    }
  },

  /**
   * ### Формирует размерные линии импоста
   */
  imposts_dimensions: {
    value: function (arr, collection, pos) {

      const offset = (pos == "right" || pos == "bottom") ? -130 : 90;

      for(let i = 0; i < arr.length - 1; i++){
        if(!collection[i]){
          collection[i] = new DimensionLine({
            pos: pos,
            elm1: arr[i].elm,
            p1: arr[i].p,
            elm2: arr[i+1].elm,
            p2: arr[i+1].p,
            parent: this.l_dimensions,
            offset: offset,
            impost: true
          });
        }
      }
    }
  },

	/**
	 * ### Стирает размерные линии
	 *
	 * @method clear_dimentions
	 * @for Contour
	 */
	clear_dimentions: {

		value: function () {
		  const {l_dimensions} = this;

		  function clear_pos(pos) {
        if(l_dimensions[pos]){
          l_dimensions[pos].removeChildren();
          l_dimensions[pos].remove();
          l_dimensions[pos] = null;
        }
      }

			for(let key in l_dimensions.ihor){
        l_dimensions.ihor[key].removeChildren();
        l_dimensions.ihor[key].remove();
				delete l_dimensions.ihor[key];
			}
			for(let key in l_dimensions.ivert){
        l_dimensions.ivert[key].removeChildren();
        l_dimensions.ivert[key].remove();
				delete l_dimensions.ivert[key];
			}

			['bottom','top','right','left'].forEach(clear_pos);

		}
	},

	/**
	 * ### Непрозрачность без учета вложенных контуров
	 * В отличии от прототипа `opacity`, затрагивает только элементы текущего слоя
	 */
	opacity: {
		get: function () {
			return this.children.length ? this.children[0].opacity : 1;
		},

		set: function (v) {
			this.children.forEach(function(elm){
				if(elm instanceof BuilderElement)
					elm.opacity = v;
			});
		}
	},

	/**
	 * Обработчик события при удалении элемента
	 */
	on_remove_elm: {

		value: function (elm) {
			// при удалении любого профиля, удаляем размрные линии импостов
			if(this.parent){
        this.parent.on_remove_elm(elm);
      }
			if (elm instanceof Profile && !this.project.data._loading){
        this.clear_dimentions();
      }
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

			if (elm instanceof Profile && !this.project.data._loading)
				this.clear_dimentions();

		}
	},

	/**
	 * Обработчик при изменении системы
	 */
	on_sys_changed: {
		value: function () {

			this.profiles.forEach((elm) => elm.default_inset(true));

			this.glasses().forEach((elm) => {
				if (elm instanceof Contour){
          elm.on_sys_changed();
        }
				else{
					// заполнения проверяем по толщине
					if(elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
						elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
					// проверяем-изменяем соединения заполнений с профилями
					elm.profiles.forEach((curr) => {
						if(!curr.cnn || !curr.cnn.check_nom2(curr.profile))
							curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
					});
				}
			});
		}
	}

});

/**
 * Экспортируем конструктор Contour, чтобы фильтровать инстанции этого типа
 * @property Contour
 * @for MetaEngine
 * @type {function}
 */
Editor.Contour = Contour;

