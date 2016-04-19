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

	var _row;

	this.data.pos = attr.pos;
	this.data.elm1 = attr.elm1;
	this.data.elm2 = attr.elm2 || this.data.elm1;
	this.data.p1 = attr.p1 || "b";
	this.data.p2 = attr.p2 || "e";

	if(!this.data.pos && (!this.data.elm1 || !this.data.elm2)){
		this.remove();
		return null;
	}

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
				this.project.move_points(delta);
				setTimeout(function () {
					this.deselect_all_points(true);
					this.register_update();
					//this.zoom_fit();
				}.bind(this.project), 200);
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
