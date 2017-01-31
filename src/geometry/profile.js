/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule profile
 */

/**
 * Объект, описывающий геометрию соединения
 * @class CnnPoint
 * @constructor
 */
class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  /**
   * Проверяет, является ли соединение в точке Т-образным.
   * L для примыкающих рассматривается, как Т
   */
  get is_t() {
    // если это угол, то точно не T
    if(!this.cnn || this.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное){
      return false;
    }

    // если это Ʇ, или † то без вариантов T
    if(this.cnn.cnn_type == $p.enm.cnn_types.ТОбразное){
      return true;
    }

    // если это Ꞁ или └─, то может быть T в разрыв - проверяем
    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.vert){
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.hor){
      return true;
    }

    return false;
  }

  /**
   * Строгий вариант свойства is_t: Ꞁ и └ не рассматриваются, как T
   */
  get is_tt() {
    // если это угол, то точно не T
    return !(this.is_i || this.profile_point == "b" || this.profile_point == "e" || this.profile == this.parent);
  }

  /**
   * Проверяет, является ли соединение в точке L-образным
   * Соединения Т всегда L-образные
   */
  get is_l() {
    return this.is_t ||
      !!(this.cnn && (this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной ||
      this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной));
  }

  /**
   * Проверяет, является ли соединение в точке соединением с пустотой
   */
  get is_i() {
    return !this.profile && !this.is_cut;
  }

  /**
   * Профиль, которому принадлежит точка соединения
   * @type Profile
   */
  get parent() {
    return this._parent;
  }

  /**
   * Имя точки соединения (b или e)
   * @type {String}
   */
  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point){
      delete this.profile_point;
    }
    if(this.is_cut){
      delete this.is_cut;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.tcn.i){
      this.cnn = null;
    }
  }

  /**
   * Массив ошибок соединения
   * @type Array
   */
  get err() {
    return this._err;
  }
  set err(v) {
    if(!v){
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1){
      this._err.push(v);
    }
  }

  /**
   * Профиль, с которым пересекается наш элемент в точке соединения
   * @property profile
   * @type Profile
   */
  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2){
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }
  set profile(v) {
    this._profile = v;
  }

  initialize() {

    const {_parent, _node} = this;

    //  массив ошибок соединения
    this._err = [];

    // строка в таблице соединений
    this._row = _parent.project.connections.cnns.find({elm1: _parent.elm, node1: _node});

    // примыкающий профиль
    this._profile;

    if(this._row){

      /**
       * Текущее соединение - объект справочника соединения
       * @type _cat.cnns
       */
      this.cnn = this._row.cnn;

      /**
       * Массив допустимых типов соединений
       * По умолчанию - соединение с пустотой
       * @type Array
       */
      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else{
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else{
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    /**
     * Расстояние до ближайшего профиля
     * @type Number
     */
    this.distance = Infinity;

    this.point = null;

    this.profile_point = "";

  }
}

/**
 * Объект, описывающий лучи пути профиля
 * @class ProfileRays
 * @constructor
 */
class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, "b");
    this.e = new CnnPoint(this.parent, "e");
    this.inner = new paper.Path({ insert: false });
    this.outer = new paper.Path({ insert: false });
  }

  clear_segments() {
    if(this.inner.segments.length){
      this.inner.removeSegments();
    }
    if(this.outer.segments.length){
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn){
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const path = parent.generatrix;
    const len = path.length;

    this.clear_segments();

    if(!len){
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    // первая точка эквидистанты. аппроксимируется касательной на участке (from < начала пути)
    let point_b = path.firstSegment.point,
      tangent_b = path.getTangentAt(0),
      normal_b = path.getNormalAt(0),
      point_e = path.lastSegment.point,
      tangent_e, normal_e;

    // добавляем первые точки путей
    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    // для прямого пути, чуть наклоняем нормаль
    if(path.is_linear()){

      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));

    }else{

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for(let i = step; i<=len; i+=step) {
        point_b = path.getPointAt(i);
        if(!point_b){
          continue;
        }
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


/**
 * ### Элемент профиля
 * Виртуальный класс описывает общие свойства профиля и раскладки
 *
 * @class ProfileItem
 * @extends BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @menuorder 41
 * @tooltip Элемент профиля
 */
function ProfileItem(attr){

	ProfileItem.superclass.constructor.call(this, attr);

	this.initialize(attr);

}
ProfileItem._extend(BuilderElement);

ProfileItem.prototype.__define({

  setSelection: {
    value: function (selection) {

      BuilderElement.prototype.setSelection.call(this, selection);

      const {generatrix, path} = this.data;

      generatrix.setSelection(selection);

      if(selection){

        const {angle_hor, rays} = this;
        const {inner, outer} = rays;
        const delta = ((angle_hor > 20 && angle_hor < 70) || (angle_hor > 200 && angle_hor < 250)) ? [500, 500] : [500, -500];
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        })

        path.setSelection(0);

        for(let t = 0; t < inner.length; t+=40){
          const ip = inner.getPointAt(t);
          const fp = new paper.Path({
            insert: false,
            segments: [
              ip.add(delta),
              ip.subtract(delta)
            ]
          })
          const op = fp.intersect_point(outer, ip);
          if(ip && op){
            const cip = path.contains(ip);
            const cop = path.contains(op);
            if(cip && cop){
              this._hatching.moveTo(ip);
              this._hatching.lineTo(op);
            }
            else if(cip && !cop){
              const pp = fp.intersect_point(path, op);
              this._hatching.moveTo(ip);
              this._hatching.lineTo(pp);
            }
            else if(!cip && cop){
              const pp = fp.intersect_point(path, ip);
              this._hatching.moveTo(pp);
              this._hatching.lineTo(op);
            }
          }
        }

      }
      else{
        if(this._hatching){
          this._hatching.remove();
          this._hatching = null;
        }
      }

    }
  },

	/**
	 * ### Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for ProfileItem
	 */
	save_coordinates: {
		value: function () {

		  const {data, _row, rays, generatrix, project} = this;

			if(!generatrix){
        return;
      }

      const cnns = project.connections.cnns;
      const b = rays.b;
      const e = rays.e;

			let	row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
				});

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = generatrix.pathData;
			_row.nom = this.nom;


			// добавляем припуски соединений
			_row.len = this.length.round(1);

			// сохраняем информацию о соединениях
			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
			}

			// для створочных и доборных профилей добавляем соединения с внешними элементами
			if(row_b = this.nearest()){
				cnns.add({
					elm1: _row.elm,
					elm2: row_b.elm,
					cnn: data._nearest_cnn,
					aperture_len: _row.len
				});
			}

			// получаем углы между элементами и к горизонту
			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0){
        _row.alp1 = _row.alp1 + 360;
      }

			_row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0){
        _row.alp2 = _row.alp2 + 360;
      }

			// устанавливаем тип элемента
			_row.elm_type = this.elm_type;

			// TODO: Рассчитать положение и ориентацию

			// вероятно, импост, всегда занимает положение "центр"


			// координаты доборов
			this.addls.forEach(function (addl) {
				addl.save_coordinates();
			});

		}
	},

	/**
	 * Вызывается из конструктора - создаёт пути и лучи
	 * @method initialize
	 * @for ProfileItem
	 * @private
	 */
	initialize: {
		value : function(attr){

			const h = this.project.bounds.height + this.project.bounds.y,
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

          const first_point = new paper.Point([_row.x1, h - _row.y1]);
					this.data.generatrix = new paper.Path(first_point);

					if(_row.r){
						this.data.generatrix.arcTo(
              first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
								_row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
					}else{
						this.data.generatrix.lineTo([_row.x2, h - _row.y2]);
					}
				}
			}

			// точки пересечения профиля с соседями с внутренней стороны
			this.data._corns = [];

			// кеш лучей в узлах профиля
			this.data._rays = new ProfileRays(this);

			this.data.generatrix.strokeColor = 'grey';

			this.data.path = new paper.Path();
			this.data.path.strokeColor = 'black';
			this.data.path.strokeWidth = 1;
			this.data.path.strokeScaling = false;

			this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;
			//this.data.path.fillColor = new paper.Color(0.96, 0.98, 0.94, 0.96);

			this.addChild(this.data.path);
			this.addChild(this.data.generatrix);

		}
	},

	/**
	 * ### Обсервер
	 * Наблюдает за изменениями контура и пересчитывает путь элемента при изменении соседних элементов
	 *
	 * @method observer
	 * @for ProfileItem
	 * @private
	 */
	observer: {
		value: function(an){

			var bcnn, ecnn, moved;

			if(Array.isArray(an)){
				moved = an[an.length-1];

				if(moved.profiles.indexOf(this) == -1){

					bcnn = this.cnn_point("b");
					ecnn = this.cnn_point("e");

					// если среди профилей есть такой, к которму примыкает текущий, пробуем привязку
					moved.profiles.forEach(function (p) {
						this.do_bind(p, bcnn, ecnn, moved);
					}.bind(this));

					moved.profiles.push(this);
				}

			}else if(an instanceof Profile){
				this.do_bind(an, this.cnn_point("b"), this.cnn_point("e"));

			}

		}
	},

	/**
	 * ### Координаты начала элемента
	 * @property b
	 * @for ProfileItem
	 * @type paper.Point
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
		}
	},

	/**
	 * Координаты конца элемента
	 * @property e
	 * @for ProfileItem
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
		}
	},

	/**
	 * ### Точка corns(1)
	 *
	 * @property bc
	 * @for ProfileItem
	 * @type Point
	 */
	bc: {
		get : function(){
			return this.corns(1);
		}
	},

	/**
	 * ### Точка corns(2)
	 *
	 * @property ec
	 * @for ProfileItem
	 * @type Point
	 */
	ec: {
		get : function(){
			return this.corns(2);
		}
	},

	/**
	 * ### Координата x начала профиля
	 *
	 * @property x1
	 * @for ProfileItem
	 * @type Number
	 */
	x1: {
		get : function(){
			return (this.b.x - this.project.bounds.x).round(1);
		},
		set: function(v){
			this.select_node("b");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.b.x, 0));
		}
	},

	/**
	 * ### Координата y начала профиля
	 *
	 * @property y1
	 * @for ProfileItem
	 * @type Number
	 */
	y1: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.b.y).round(1);
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("b");
			this.move_points(new paper.Point(0, v - this.b.y));
		}
	},

	/**
	 * ###Координата x конца профиля
	 *
	 * @property x2
	 * @for ProfileItem
	 * @type Number
	 */
	x2: {
		get : function(){
			return (this.e.x - this.project.bounds.x).round(1);
		},
		set: function(v){
			this.select_node("e");
			this.move_points(new paper.Point(parseFloat(v) + this.project.bounds.x - this.e.x, 0));
		}
	},

	/**
	 * ### Координата y конца профиля
	 *
	 * @property y2
	 * @for ProfileItem
	 * @type Number
	 */
	y2: {
		get : function(){
			return (this.project.bounds.height + this.project.bounds.y - this.e.y).round(1);
		},
		set: function(v){
			v = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
			this.select_node("e");
			this.move_points(new paper.Point(0, v - this.e.y));
		}
	},

	/**
	 * ### Соединение в точке 'b' для диалога свойств
	 *
	 * @property cnn1
	 * @for ProfileItem
	 * @type _cat.cnns
	 * @private
	 */
	cnn1: {
		get : function(){
			return this.cnn_point("b").cnn || $p.cat.cnns.get();
		},
		set: function(v){
			this.rays.b.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		}
	},

	/**
	 * Соединение в точке 'e' для диалога свойств
	 *
	 * @property cnn2
	 * @for ProfileItem
	 * @type _cat.cnns
	 * @private
	 */
	cnn2: {
		get : function(){
			return this.cnn_point("e").cnn || $p.cat.cnns.get();
		},
		set: function(v){
			this.rays.e.cnn = $p.cat.cnns.get(v);
			this.project.register_change();
		}
	},

	/**
	 * информация для диалога свойств
	 *
	 * @property info
	 * @for ProfileItem
	 * @type String
	 * @final
	 * @private
	 */
	info: {
		get : function(){
			return "№" + this.elm + " α:" + this.angle_hor.toFixed(0) + "° l:" + this.length.toFixed(0);
		}
	},

	/**
	 * ### Радиус сегмента профиля
	 *
	 * @property r
	 * @for ProfileItem
	 * @type Number
	 */
	r: {
		get : function(){
			return this._row.r;
		},
		set: function(v){
		  if(this._row.r != v){
        this.data._rays.clear();
        this._row.r = v;
        this.set_generatrix_radius();
      }
		}
	},

  /**
   * Искривляет образующую в соответствии с радиусом
   */
  set_generatrix_radius: {
	  value: function (h) {

	    const _row = this._row,
        gen = this.data.generatrix,
        b = gen.firstSegment.point.clone(),
        e = gen.lastSegment.point.clone(),
        min_radius = b.getDistance(e) / 2;

	    if(!h){
        h = this.project.bounds.height + this.project.bounds.y
      }

      gen.removeSegments(1);
      gen.firstSegment.handleIn = null;
      gen.firstSegment.handleOut = null;

      if(_row.r < min_radius){
        _row.r = 0;
      }else if(_row.r == min_radius){
        _row.r += 0.001;
      }

      if(_row.r){
        let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
        if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw){
          p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
        }
        gen.arcTo(p, e);

      }else{

        gen.lineTo(e);

      }

      gen.layer.notify({
        type: consts.move_points,
        profiles: [this],
        points: []
      });

    }
  },

	/**
	 * ### Направление дуги сегмента профиля против часовой стрелки
	 *
	 * @property arc_ccw
	 * @for ProfileItem
	 * @type Boolean
	 */
	arc_ccw: {
		get : function(){
      return this._row.arc_ccw;
		},
		set: function(v){
		  if(this._row.arc_ccw != v){
        this.data._rays.clear();
        this._row.arc_ccw = v;
        this.set_generatrix_radius();
      }
		}
	},

	/**
	 * ### Дополняет cnn_point свойствами соединения
	 *
	 * @method postcalc_cnn
	 * @for ProfileItem
	 * @param node {String} b, e - начало или конец элемента
	 * @returns CnnPoint
	 */
	postcalc_cnn: {
		value: function(node){

			var cnn_point = this.cnn_point(node);

			cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

			if(!cnn_point.point)
				cnn_point.point = this[node];

			return cnn_point;
		}
	},

	/**
	 * ### Пересчитывает вставку после пересчета соединений
	 * Контроль пока только по типу элемента
	 *
	 * @method postcalc_inset
	 * @for ProfileItem
	 * @chainable
	 */
	postcalc_inset: {

		value: function(){

			// если слева и справа T - и тип не импост или есть не T и тпи импост
			this.inset = this.project.check_inset({ elm: this });

			return this;
		}
	},

	/**
	 * ### Рассчитывает точки пути
	 * на пересечении текущего и указанного профилей
	 *
	 * @method path_points
	 * @for ProfileItem
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

			//TODO учесть импосты, у которых образующая совпадает с ребром
			function detect_side(){

				if(cnn_point.profile instanceof ProfileItem){
					var isinner = intersect_point(prays.inner, _profile.generatrix),
						isouter = intersect_point(prays.outer, _profile.generatrix);
					if(isinner != undefined && isouter == undefined)
						return 1;
					else if(isinner == undefined && isouter != undefined)
						return -1;
					else
						return 1;
				}else
					return 1;

			}

			// если пересечение в узлах, используем лучи профиля
			if(cnn_point.profile instanceof ProfileItem){
				prays = cnn_point.profile.rays;

			}else if(cnn_point.profile instanceof Filling){
				prays = {
					inner: cnn_point.profile.path,
					outer: cnn_point.profile.path
				};
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
				if(this.orientation == $p.enm.orientations.vert){
					if(profile_point == "b"){
						intersect_point(prays.outer, rays.outer, 1);
						intersect_point(prays.outer, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.outer, rays.outer, 2);
						intersect_point(prays.outer, rays.inner, 3);
					}
				}else if(this.orientation == $p.enm.orientations.hor){
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
				if(this.orientation == $p.enm.orientations.vert){
					if(profile_point == "b"){
						intersect_point(prays.inner, rays.outer, 1);
						intersect_point(prays.inner, rays.inner, 4);

					}else if(profile_point == "e"){
						intersect_point(prays.inner, rays.outer, 2);
						intersect_point(prays.inner, rays.inner, 3);
					}
				}else if(this.orientation == $p.enm.orientations.hor){
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
		}
	},

	/**
	 * ### Точка внутри пути
	 * Возвращает точку, расположенную гарантированно внутри профиля
	 *
	 * @property interiorPoint
	 * @for ProfileItem
	 * @type paper.Point
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
		}
	},

	/**
	 * ### Выделяет начало или конец профиля
	 *
	 * @method select_node
	 * @for ProfileItem
	 * @param node {String} b, e - начало или конец элемента
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
		}
	},

	/**
	 * ### Выделяет сегмент пути профиля, ближайший к точке
	 *
	 * @method select_corn
	 * @for ProfileItem
	 * @param point {paper.Point}
	 */
	select_corn: {
		value:  function(point){

			var res = {dist: Infinity},
				dist;

			this.path.segments.forEach(function (segm) {
				dist = segm.point.getDistance(point);
				if(dist < res.dist){
					res.dist = dist;
					res.segm = segm;
				}
			});

			dist = this.b.getDistance(point);
			if(dist < res.dist){
				res.dist = dist;
				res.segm = this.generatrix.firstSegment;
			}

			dist = this.e.getDistance(point);
			if(dist < res.dist){
				res.dist = dist;
				res.segm = this.generatrix.lastSegment;
			}

			if(res.dist < consts.sticking0){
				this.project.deselectAll();
				res.segm.selected = true;
			}
		}
	},

	/**
	 * ### Угол к горизонту
	 * Рассчитывается для прямой, проходящей через узлы
	 *
	 * @property angle_hor
	 * @for ProfileItem
	 * @type Number
	 * @final
	 */
	angle_hor: {
		get : function(){
			var res = (new paper.Point(this.e.x - this.b.x, this.b.y - this.e.y)).angle.round(1);
			return res < 0 ? res + 360 : res;
		}
	},

	/**
	 * ### Длина профиля с учетом соединений
	 *
	 * @property length
	 * @for ProfileItem
	 * @type Number
	 * @final
	 */
	length: {

		get: function () {

		  const {b, e, outer} = this.rays;
			const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
      const ppoints = {};

			// находим проекции четырёх вершин на образующую
			for(let i = 1; i<=4; i++){
        ppoints[i] = gen.getNearestPoint(this.corns(i));
      }

			// находим точки, расположенные ближе к концам
			ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
			ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

			// получаем фрагмент образующей
			const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
			const res = sub_gen.length + (b.cnn ? b.cnn.sz : 0) + (e.cnn ? e.cnn.sz : 0);
			sub_gen.remove();

			return res;
		}
	},

	/**
	 * ### Ориентация профиля
	 * Вычисляется по гулу к горизонту.
	 * Если угол в пределах `orientation_delta`, элемент признаётся горизонтальным или вертикальным. Иначе - наклонным
	 *
	 * @property orientation
	 * @for ProfileItem
	 * @type _enm.orientations
	 * @final
	 */
	orientation: {
		get : function(){
			var angle_hor = this.angle_hor;
			if(angle_hor > 180)
				angle_hor -= 180;
			if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
				(angle_hor > 180-consts.orientation_delta && angle_hor < 180+consts.orientation_delta))
				return $p.enm.orientations.hor;
			if((angle_hor > 90-consts.orientation_delta && angle_hor < 90+consts.orientation_delta) ||
				(angle_hor > 270-consts.orientation_delta && angle_hor < 270+consts.orientation_delta))
				return $p.enm.orientations.vert;
			return $p.enm.orientations.incline;
		}
	},

	/**
	 * ### Признак прямолинейности
	 * Вычисляется, как `is_linear()` {{#crossLink "BuilderElement/generatrix:property"}}образующей{{/crossLink}}
	 *
	 * @method is_linear
	 * @for ProfileItem
	 * @returns Boolean
	 */
	is_linear: {
		value : function(){
			return this.generatrix.is_linear();
		}
	},

	/**
	 * ### Выясняет, примыкает ли указанный профиль к текущему
	 * Вычисления делаются на основании близости координат концов текущего профиля образующей соседнего
	 *
	 * @method is_nearest
	 * @for ProfileItem
	 * @param p {ProfileItem}
	 * @returns Boolean
	 */
	is_nearest: {
		value : function(p){
			return (this.b.is_nearest(p.b, true) && this.e.is_nearest(p.e, true)) ||
				(this.generatrix.getNearestPoint(p.b).is_nearest(p.b) && this.generatrix.getNearestPoint(p.e).is_nearest(p.e));
		}
	},

	/**
	 * ### Выясняет, параллельны ли профили
	 * в пределах `consts.orientation_delta`
	 *
	 * @method is_collinear
	 * @for ProfileItem
	 * @param p {ProfileItem}
	 * @returns Boolean
	 */
	is_collinear: {
		value : function(p) {
			var angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
			if (angl < 0)
				angl += 180;
			return Math.abs(angl) < consts.orientation_delta;
		}
	},

	/**
	 * ### Опорные точки и лучи
	 *
	 * @property rays
	 * @for ProfileItem
	 * @type ProfileRays
	 * @final
	 */
	rays: {
		get : function(){
			if(!this.data._rays.inner.segments.length || !this.data._rays.outer.segments.length)
				this.data._rays.recalc();
			return this.data._rays;
		}
	},

	/**
	 * ### Доборы текущего профиля
	 *
	 * @property addls
	 * @for ProfileItem
	 * @type Array.<ProfileAddl>
	 * @final
	 */
	addls: {
		get : function(){
			return this.children.reduce(function (val, elm) {
				if(elm instanceof ProfileAddl){
					val.push(elm);
				}
				return val;
			}, []);
		}
	},

	/**
	 * ### Координаты вершин (cornx1...corny4)
	 *
	 * @method corns
	 * @for ProfileItem
	 * @param corn {String|Number} - имя или номер вершины
	 * @return {Point|Number} - координата или точка
	 */
	corns: {
		value: function(corn){

			if(typeof corn == "number")
				return this.data._corns[corn];

			else if(corn instanceof paper.Point){

				var res = {dist: Infinity, profile: this},
					dist;

				for(var i = 1; i<5; i++){
					dist = this.data._corns[i].getDistance(corn);
					if(dist < res.dist){
						res.dist = dist;
						res.point = this.data._corns[i];
						res.point_name = i;
					}
				}

				if(res.point.is_nearest(this.b)){
					res.dist = this.b.getDistance(corn);
					res.point = this.b;
					res.point_name = "b";

				}else if(res.point.is_nearest(this.e)){
					res.dist = this.e.getDistance(corn);
					res.point = this.e;
					res.point_name = "e";
				}

				return res;

			}else{
				var index = corn.substr(corn.length-1, 1),
					axis = corn.substr(corn.length-2, 1);
				return this.data._corns[index][axis];
			}
		}
	},

	/**
	 * ### Формирует путь сегмента профиля
	 * Пересчитывает соединения с соседями и стоит путь профиля на основании пути образующей
	 * - Сначала, вызывает {{#crossLink "ProfileItem/postcalc_cnn:method"}}postcalc_cnn(){{/crossLink}} для узлов `b` и `e`
	 * - Внутри `postcalc_cnn`, выполняется {{#crossLink "ProfileItem/cnn_point:method"}}cnn_point(){{/crossLink}} для пересчета соединений на концах профиля
	 * - Внутри `cnn_point`:
	 *    + {{#crossLink "ProfileItem/check_distance:method"}}check_distance(){{/crossLink}} - проверяет привязку, если вернулось false, `cnn_point` завершает свою работы
	 *    + цикл по всем профилям и поиск привязки
	 * - {{#crossLink "ProfileItem/postcalc_inset:method"}}postcalc_inset(){{/crossLink}} - проверяет корректность вставки, заменяет при необходимости
	 * - {{#crossLink "ProfileItem/path_points:method"}}path_points(){{/crossLink}} - рассчитывает координаты вершин пути профиля
	 *
	 * @method redraw
	 * @for ProfileItem
	 * @chainable
	 */
	redraw: {
		value: function () {

			// получаем узлы
			var bcnn = this.postcalc_cnn("b"),
				ecnn = this.postcalc_cnn("e"),
				path = this.data.path,
				gpath = this.generatrix,
				rays = this.rays,
				offset1, offset2, tpath, step;

			// уточняем вставку
			if(this.project._dp.sys.allow_open_cnn)
				this.postcalc_inset();

			// получаем соединения концов профиля и точки пересечения с соседями
			this.path_points(bcnn, "b");
			this.path_points(ecnn, "e");

			// очищаем существующий путь
			path.removeSegments();

			// TODO отказаться от повторного пересчета и задействовать клоны rays-ов
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

			this.children.forEach(function (elm) {
				if(elm instanceof ProfileAddl){
					elm.observer(elm.parent);
					elm.redraw();
				}
			});

			return this;
		}
	},

	/**
	 * ### Двигает узлы
	 * Обрабатывает смещение выделенных сегментов образующей профиля
	 *
	 * @method move_points
	 * @for ProfileItem
	 * @param delta {paper.Point} - куда и насколько смещать
	 * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
	 * @param [start_point] {paper.Point} - откуда началось движение
	 */
	move_points: {
		value:  function(delta, all_points, start_point){

			if(!delta.length)
				return;

			var changed,
				other = [],
				noti = {type: consts.move_points, profiles: [this], points: []}, noti_points;


			// если не выделено ни одного сегмента, двигаем все сегменты
			if(!all_points){
				all_points = !this.generatrix.segments.some(function (segm) {
					if (segm.selected)
						return true;
				});
			}

			this.generatrix.segments.forEach(function (segm) {

				var cnn_point, free_point;

				if (segm.selected || all_points){

					noti_points = {old: segm.point.clone(), delta: delta};

					// собственно, сдвиг узлов
					free_point = segm.point.add(delta);

					if(segm.point == this.b){
						cnn_point = this.rays.b;
						if(!cnn_point.profile_point || paper.Key.isDown('control'))
							cnn_point = this.cnn_point("b", free_point);

					}else if(segm.point == this.e){
						cnn_point = this.rays.e;
						if(!cnn_point.profile_point || paper.Key.isDown('control'))
							cnn_point = this.cnn_point("e", free_point);

					}

					if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
						segm.point = cnn_point.point;

					}else{
						segm.point = free_point;
						// если соединение угловое диагональное, тянем тянем соседние узлы сразу
						if(cnn_point && !paper.Key.isDown('control')){
							if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
								other.push(cnn_point.profile_point == "b" ? cnn_point.profile.data.generatrix.firstSegment : cnn_point.profile.data.generatrix.lastSegment );
								cnn_point.profile[cnn_point.profile_point] = free_point;
								noti.profiles.push(cnn_point.profile);
							}
						}
					}

					// накапливаем точки в нотификаторе
					noti_points.new = segm.point;
					if(start_point)
						noti_points.start = start_point;
					noti.points.push(noti_points);

					changed = true;
				}

			}.bind(this));


			// информируем систему об изменениях
			if(changed){
				this.data._rays.clear();

				if(this.parent.notify)
					this.parent.notify(noti);

				var notifier = Object.getNotifier(this);
				notifier.notify({ type: 'update', name: "x1" });
				notifier.notify({ type: 'update', name: "y1" });
				notifier.notify({ type: 'update', name: "x2" });
				notifier.notify({ type: 'update', name: "y2" });
			}

			return other;
		}
	},

	/**
	 * Описание полей диалога свойств элемента
	 */
	oxml: {
		get: function () {
			var cnn_ii = this.selected_cnn_ii(),
				oxml = {
					" ": [
						{id: "info", path: "o.info", type: "ro"},
						"inset",
						"clr"
					],
					"Начало": ["x1", "y1", "cnn1"],
					"Конец": ["x2", "y2", "cnn2"]
				};

			if(cnn_ii)
				oxml["Примыкание"] = ["cnn3"];

			return oxml;
		}
	},

	/**
	 * Выясняет, имеет ли текущий профиль соединение с `profile` в окрестности точки `point`
	 */
	has_cnn: {
		value: function (profile, point) {

			var t = this;

			while (t.parent instanceof ProfileItem)
				t = t.parent;

			while (profile.parent instanceof ProfileItem)
				profile = profile.parent;

			if(
				(t.b.is_nearest(point, true) && t.cnn_point("b").profile == profile) ||
				(t.e.is_nearest(point, true) && t.cnn_point("e").profile == profile) ||
				(profile.b.is_nearest(point, true) && profile.cnn_point("b").profile == t) ||
				(profile.e.is_nearest(point, true) && profile.cnn_point("e").profile == t)
			)
				return true;

			else
				return false;

		}
	},

	/**
	 * Вызывает одноименную функцию _scheme в контексте текущего профиля
	 */
	check_distance: {
		value: function (element, res, point, check_only) {
			return this.project.check_distance(element, this, res, point, check_only);
		}
	},

	/**
	 * Строка цвета по умолчанию для эскиза
	 */
	default_clr_str: {
		value: "FEFEFE"
	},

	/**
	 * ### Непрозрачность профиля
	 * В отличии от прототипа `opacity`, не изменяет прозрачость образующей
	 */
	opacity: {
		get: function () {
			return this.path ? this.path.opacity : 1;
		},

		set: function (v) {
			if(this.path)
				this.path.opacity = v;
		}
	}

});



/**
 * ### Профиль
 * Класс описывает поведение сегмента профиля (створка, рама, импост)<br />
 * У профиля есть координаты конца и начала, есть путь образующей - прямая или кривая линия
 *
 * @class Profile
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 42
 * @tooltip Профиль
 *
 * @example
 *
 *     // Создаём элемент профиля на основании пути образующей
 *     // одновременно, указываем контур, которому будет принадлежать профиль, вставку и цвет
 *     new Profile({
 *       generatrix: new paper.Path({
 *         segments: [[1000,100], [0, 100]]
 *       }),
 *       proto: {
 *         parent: _contour,
 *         inset: _inset
 *         clr: _clr
 *       }
 *     });
 */
function Profile(attr){

	Profile.superclass.constructor.call(this, attr);

	if(this.parent){

		// Подключаем наблюдателя за событиями контура с именем _consts.move_points_
		this._observer = this.observer.bind(this);
		Object.observe(this.layer._noti, this._observer, [consts.move_points]);

		// Информируем контур о том, что у него появился новый ребёнок
		this.layer.on_insert_elm(this);
	}

}
Profile._extend(ProfileItem);

Profile.prototype.__define({


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
						_profile.data._nearest_cnn = $p.cat.cnns.elm_cnn(_profile, _profile.data._nearest, $p.enm.cnn_types.acn.ii, _profile.data._nearest_cnn);
						return true;
					}
				}
				_profile.data._nearest = null;
				_profile.data._nearest_cnn = null;
			}

			if(_profile.layer && _profile.layer.parent){
				if(!check_nearest()){
					children = _profile.layer.parent.children;
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
		}
	},

	/**
	 * Расстояние от узла до опорной линии
	 * для сегментов створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
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
		}
	},

	/**
	 * Расстояние от узла до внешнего ребра элемента
	 * для рамы, обычно = 0, для импоста 1/2 ширины, зависит от `d0` и `sizeb`
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
	 * Возвращает массив примыкающих ипостов
	 */
	joined_imposts: {

		value : function(check_only){

		  const {rays, generatrix} = this;
      const tinner = [];
      const touter = [];

      if(this.parent.profiles.some((curr) => {

          if(curr == this){
            return
          }

          const pb = curr.cnn_point("b");
          if(pb.profile == this && pb.cnn && pb.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

            if(check_only){
              return true;
            }

            // выясним, с какой стороны примыкающий профиль
            const ip = curr.corns(1);
            if(rays.inner.getNearestPoint(ip).getDistance(ip, true) < rays.outer.getNearestPoint(ip).getDistance(ip, true))
              tinner.push({point: generatrix.getNearestPoint(pb.point), profile: curr});
            else
              touter.push({point: generatrix.getNearestPoint(pb.point), profile: curr});
          }

          const pe = curr.cnn_point("e");
          if(pe.profile == this && pe.cnn && pe.cnn.cnn_type == $p.enm.cnn_types.tcn.t){

            if(check_only){
              return true;
            }

            const ip = curr.corns(2);
            if(rays.inner.getNearestPoint(ip).getDistance(ip, true) < rays.outer.getNearestPoint(ip).getDistance(ip, true))
              tinner.push({point: generatrix.getNearestPoint(pe.point), profile: curr});
            else
              touter.push({point: generatrix.getNearestPoint(pe.point), profile: curr});
          }

        })) {
        return true;
      }

      return check_only ? false : {inner: tinner, outer: touter};

		}
	},

  /**
   * Возвращает массив примыкающих створочных элементов
   */
  joined_nearests: {
	  value: function () {

	    const res = [];

	    this.layer.contours.forEach((contour) => {
        contour.profiles.forEach((profile) => {
          if(profile.nearest() == this){
            res.push(profile)
          }
        })
      })

      return res;
    }
  },

	/**
	 * Возвращает тип элемента (рама, створка, импост)
	 */
	elm_type: {
		get : function(){

			// если начало или конец элемента соединены с соседями по Т, значит это импост
			if(this.data._rays && (this.data._rays.b.is_tt || this.data._rays.e.is_tt))
				return $p.enm.elm_types.Импост;

			// Если вложенный контур, значит это створка
			if(this.layer.parent instanceof Contour)
				return $p.enm.elm_types.Створка;

			return $p.enm.elm_types.Рама;

		}
	},

	/**
	 * ### Соединение конца профиля
	 * С этой функции начинается пересчет и перерисовка профиля
	 * Возвращает объект соединения конца профиля
	 * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
	 * - Попутно устанавливает признак `is_cut`, если в точке сходятся больше двух профилей
	 * - Не делает подмену соединения, хотя могла бы
	 * - Не делает подмену вставки, хотя могла бы
	 *
	 * @method cnn_point
	 * @for ProfileItem
	 * @param node {String} - имя узла профиля: "b" или "e"
	 * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
	 * @return {CnnPoint} - объект {point, profile, cnn_types}
	 */
	cnn_point: {
		value: function(node, point){

			var res = this.rays[node];

			if(!point)
				point = this[node];


			// Если привязка не нарушена, возвращаем предыдущее значение
			if(res.profile &&
				res.profile.children.length &&
				this.check_distance(res.profile, res, point, true) === false)
				return res;

			// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
			res.clear();
			if(this.parent){
				var profiles = this.parent.profiles,
					allow_open_cnn = this.project._dp.sys.allow_open_cnn,
					ares = [];

				for(var i=0; i<profiles.length; i++){
					if(this.check_distance(profiles[i], res, point, false) === false){

						// для простых систем разрывы профиля не анализируем
						if(!allow_open_cnn)
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
		}
	},

	/**
	 * Положение элемента в контуре
	 */
	pos: {
		get: function () {
			var by_side = this.layer.profiles_by_side();
			if(by_side.top == this)
				return $p.enm.positions.Верх;
			if(by_side.bottom == this)
				return $p.enm.positions.Низ;
			if(by_side.left == this)
				return $p.enm.positions.Лев;
			if(by_side.right == this)
				return $p.enm.positions.Прав;
			// TODO: рассмотреть случай с выносом стоек и разрывами
			return $p.enm.positions.Центр;
		}
	},


	/**
	 * Вспомогательная функция обсервера, выполняет привязку узлов
	 */
	do_bind: {
		value: function (p, bcnn, ecnn, moved) {

			var mpoint, imposts, moved_fact;

			if(bcnn.cnn && bcnn.profile == p){
				// обрабатываем угол
				if($p.enm.cnn_types.acn.a.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					if(!this.b.is_nearest(p.e)){
						if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(this.b.getDistance(p.e, true) < this.b.getDistance(p.b, true))
									this.b = p.e;
								else
									this.b = p.b;
								moved_fact = true;
							}
						} else{
							// отрываем привязанный ранее профиль
							bcnn.clear();
							this.data._rays.clear_segments();
						}
					}

				}
				// обрабатываем T
				else if($p.enm.cnn_types.acn.t.indexOf(bcnn.cnn.cnn_type)!=-1 ){
					// импосты в створках и все остальные импосты
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(this.b);
					if(!mpoint.is_nearest(this.b)){
						this.b = mpoint;
						moved_fact = true;
					}
				}

			}
			if(ecnn.cnn && ecnn.profile == p){
				// обрабатываем угол
				if($p.enm.cnn_types.acn.a.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					if(!this.e.is_nearest(p.b)){
						if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.tcn.ad){
							if(paper.Key.isDown('control')){
								console.log('control');
							}else{
								if(this.e.getDistance(p.b, true) < this.e.getDistance(p.e, true))
									this.e = p.b;
								else
									this.e = p.e;
								moved_fact = true;
							}
						} else{
							// отрываем привязанный ранее профиль
							ecnn.clear();
							this.data._rays.clear_segments();
						}
					}
				}
				// обрабатываем T
				else if($p.enm.cnn_types.acn.t.indexOf(ecnn.cnn.cnn_type)!=-1 ){
					// импосты в створках и все остальные импосты
					mpoint = (p.nearest() ? p.rays.outer : p.generatrix).getNearestPoint(this.e);
					if(!mpoint.is_nearest(this.e)){
						this.e = mpoint;
						moved_fact = true;
					}
				}

			}

			// если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
			if(moved && moved_fact){
				imposts = this.joined_imposts();
				imposts = imposts.inner.concat(imposts.outer);
				for(var i in imposts){
					if(moved.profiles.indexOf(imposts[i]) == -1){
						imposts[i].profile.observer(this);
					}
				}
			}
		}
	}

});

Editor.Profile = Profile;
