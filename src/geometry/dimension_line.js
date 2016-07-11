/**
 * ### Размерные линии на эскизе
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 21.08.2015
 *
 * @module geometry
 * @submodule dimension_line
 */

/**
 * ### Размерная линия на эскизе
 * Унаследована от [paper.Group](http://paperjs.org/reference/group/)<br />
 * См. так же, {{#crossLink "DimensionLineCustom"}}{{/crossLink}} - размерная линия, устанавливаемая пользователем
 *
 * @class DimensionLine
 * @extends paper.Group
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @constructor
 * @menuorder 46
 * @tooltip Размерная линия
 */
function DimensionLine(attr){


	DimensionLine.superclass.constructor.call(this, {parent: attr.parent});

	var _row = attr.row;

	if(_row && _row.path_data){
		attr._mixin(JSON.parse(_row.path_data));
		if(attr.elm1)
			attr.elm1 = this.project.getItem({elm: attr.elm1});
		if(attr.elm2)
			attr.elm2 = this.project.getItem({elm: attr.elm2});
	}

	this.data.pos = attr.pos;
	this.data.elm1 = attr.elm1;
	this.data.elm2 = attr.elm2 || this.data.elm1;
	this.data.p1 = attr.p1 || "b";
	this.data.p2 = attr.p2 || "e";
	this.data.offset = attr.offset;
	
	if(attr.impost)
		this.data.impost = true;
	
	if(attr.contour)
		this.data.contour = true;

	this.__define({
		
		_row: {
			get: function () {
				return _row;
			}
		},

		/**
		 * Удаляет элемент из контура и иерархии проекта
		 * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
		 * @method remove
		 */
		remove: {
			value: function () {
				if(_row){
					_row._owner.del(_row);
					_row = null;
					this.project.register_change();
				}
				DimensionLine.superclass.remove.call(this);
			}
		}
	});

	if(!this.data.pos && (!this.data.elm1 || !this.data.elm2)){
		this.remove();
		return null;
	}

	// создаём детей
	new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
	new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
	new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
	new paper.PointText({
		parent: this,
		name: 'text',
		justification: 'center',
		fillColor: 'black',
		fontSize: 72});
	

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
		}
	},

	// виртуальный датаменеджер для автоформ
	_manager: {
		get: function () {
			return $p.dp.builder_text;
		}
	},

	_mouseenter: {
		value: function (event) {
			paper.canvas_cursor('cursor-arrow-ruler');
		}
	},

	_mouseleave: {
		value: function (event) {
			//paper.canvas_cursor('cursor-arrow-white');
		}
	},

	_click: {
		value: function (event) {
			event.stop();
			this.wnd = new RulerWnd(null, this);
			this.wnd.size = this.size;
		}
	},

	_move_points: {
		value: function (event, xy) {

			var _bounds, delta, size;

			// получаем дельту - на сколько смещать
			if(this.data.elm1){

				// в _bounds[event.name] надо поместить координату по x или у (в зависисмости от xy), которую будем двигать
				_bounds = {};


				if(this.pos == "top" || this.pos == "bottom"){

					size = Math.abs(this.data.elm1[this.data.p1].x - this.data.elm2[this.data.p2].x);

					if(event.name == "right"){
						delta = new paper.Point(event.size - size, 0);
						_bounds[event.name] = Math.max(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);

					}else{
						delta = new paper.Point(size - event.size, 0);
						_bounds[event.name] = Math.min(this.data.elm1[this.data.p1].x, this.data.elm2[this.data.p2].x);
					}


				}else{

					size = Math.abs(this.data.elm1[this.data.p1].y - this.data.elm2[this.data.p2].y);

					if(event.name == "bottom"){
						delta = new paper.Point(0, event.size - size);
						_bounds[event.name] = Math.max(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);

					}
					else{
						delta = new paper.Point(0, size - event.size);
						_bounds[event.name] = Math.min(this.data.elm1[this.data.p1].y, this.data.elm2[this.data.p2].y);
					}
				}

			}else {

				_bounds = this.layer.bounds;

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
				this.project.move_points(delta);
				setTimeout(function () {
					this.deselect_all_points(true);
					this.register_update();
					//this.zoom_fit();
				}.bind(this.project), 200);
			}
		}
	},

	_sizes_wnd: {
		value: function (event) {
			if(event.wnd == this.wnd){

				switch(event.name) {
					case 'close':
						this.children.text.selected = false;
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
		}
	},

	redraw: {
		value: function () {

			var _bounds = this.layer.bounds,
				_dim_bounds = this.layer instanceof DimensionLayer ? this.project.dimension_bounds : this.layer.dimension_bounds,
				offset = 0,
				b, e, tmp, normal, length, bs, es;

			if(!this.pos){

				if(typeof this.data.p1 == "number")
					b = this.data.elm1.corns(this.data.p1);
				else
					b = this.data.elm1[this.data.p1];

				if(typeof this.data.p2 == "number")
					e = this.data.elm2.corns(this.data.p2);
				else
					e = this.data.elm2[this.data.p2];

			}else if(this.pos == "top"){
				b = _bounds.topLeft;
				e = _bounds.topRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "left"){
				b = _bounds.bottomLeft;
				e = _bounds.topLeft;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "bottom"){
				b = _bounds.bottomLeft;
				e = _bounds.bottomRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];

			}else if(this.pos == "right"){
				b = _bounds.bottomRight;
				e = _bounds.topRight;
				offset = _bounds[this.pos] - _dim_bounds[this.pos];
			}

			// если точки профиля еще не нарисованы - выходим
			if(!b || !e){
				this.visible = false;
				return;
			}

			tmp = new paper.Path({ insert: false, segments: [b, e] });

			if(this.data.elm1 && this.pos){

				b = tmp.getNearestPoint(this.data.elm1[this.data.p1]);
				e = tmp.getNearestPoint(this.data.elm2[this.data.p2]);
				if(tmp.getOffsetOf(b) > tmp.getOffsetOf(e)){
					normal = e;
					e = b;
					b = normal;
				}
				tmp.firstSegment.point = b;
				tmp.lastSegment.point = e;

			};

			// прячем крошечные размеры
			length = tmp.length;
			if(length < consts.sticking_l){
				this.visible = false;
				return;
			}

			this.visible = true;

			normal = tmp.getNormalAt(0).multiply(this.offset + offset);

			bs = b.add(normal.multiply(0.8));
			es = e.add(normal.multiply(0.8));

			if(this.children.callout1.segments.length){
				this.children.callout1.firstSegment.point = b;
				this.children.callout1.lastSegment.point = b.add(normal);
			}else
				this.children.callout1.addSegments([b, b.add(normal)]);

			if(this.children.callout2.segments.length){
				this.children.callout2.firstSegment.point = e;
				this.children.callout2.lastSegment.point = e.add(normal);
			}else
				this.children.callout2.addSegments([e, e.add(normal)]);

			if(this.children.scale.segments.length){
				this.children.scale.firstSegment.point = bs;
				this.children.scale.lastSegment.point = es;
			}else
				this.children.scale.addSegments([bs, es]);


			this.children.text.content = length.toFixed(0);
			this.children.text.rotation = e.subtract(b).angle;
			this.children.text.point = bs.add(es).divide(2);


		},
		enumerable : false
	},

	// размер
	size: {
		get: function () {
			return parseFloat(this.children.text.content);
		},
		set: function (v) {
			this.children.text.content = parseFloat(v).round(1);
		}
	},

	// угол к горизонту в направлении размера
	angle: {
		get: function () {
			return 0;
		},
		set: function (v) {

		}
	},

	// расположение относительно контура $p.enm.pos
	pos: {
		get: function () {
			return this.data.pos || "";
		},
		set: function (v) {
			this.data.pos = v;
			this.redraw();
		}
	},

	// отступ от внешней границы изделия
	offset: {
		get: function () {
			return this.data.offset || 90;
		},
		set: function (v) {
			var offset = (parseInt(v) || 90).round(0);
			if(this.data.offset != offset){
				this.data.offset = offset;
				this.project.register_change(true);	
			}
		}
	}

});

/**
 * ### Служебный слой размерных линий
 * Унаследован от [paper.Layer](http://paperjs.org/reference/layer/)
 * 
 * @class DimensionLayer
 * @extends paper.Layer
 * @param attr
 * @constructor
 */
function DimensionLayer(attr) {
	
	DimensionLayer.superclass.constructor.call(this);
	
	if(!attr || !attr.parent){
		this.__define({
			bounds: {
				get: function () {
					return this.project.bounds;
				}
			}
		});
	}
}
DimensionLayer._extend(paper.Layer);


/**
 * ### Размерные линии, определяемые пользователем
 * @class DimensionLineCustom
 * @extends DimensionLine
 * @param attr
 * @constructor
 */
function DimensionLineCustom(attr) {

	if(!attr.row)
		attr.row = attr.parent.project.ox.coordinates.add();

	// слой, которому принадлежит размерная линия
	if(!attr.row.cnstr)
		attr.row.cnstr = attr.parent.layer.cnstr;

	// номер элемента
	if(!attr.row.elm)
		attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;

	DimensionLineCustom.superclass.constructor.call(this, attr);

	this.on({
		mouseenter: this._mouseenter,
		mouseleave: this._mouseleave,
		click: this._click
	});

}
DimensionLineCustom._extend(DimensionLine);

DimensionLineCustom.prototype.__define({

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for DimensionLineCustom
	 */
	save_coordinates: {
		value: function () {

			var _row = this._row;

			// сохраняем размер
			_row.len = this.size;

			// устанавливаем тип элемента
			_row.elm_type = this.elm_type;

			// сериализованные данные
			_row.path_data = JSON.stringify({
				pos: this.pos,
				elm1: this.data.elm1.elm,
				elm2: this.data.elm2.elm,
				p1: this.data.p1,
				p2: this.data.p2,
				offset: this.offset
			});

		}
	},

	/**
	 * Возвращает тип элемента (размерная линия)
	 */
	elm_type: {
		get : function(){

			return $p.enm.elm_types.Размер;

		}
	},


	_click: {
		value: function (event) {
			event.stop();
			this.selected = true;
		}
	}
});