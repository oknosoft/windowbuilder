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

	this.data._nodes = {
			elm1: attr.elm1,
			elm2: attr.elm2 || attr.elm1,
			p1: attr.p1 || "b",
			p2: attr.p2 || "e",

			callout1: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
			callout2: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
			scale: new paper.Path({parent: this, strokeColor: 'black', guide: true}),
			text: new paper.PointText({
				parent: this,
				justification: 'center',
				fillColor: 'black',
				fontSize: 60})
		};

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

	redraw: {
		value: function () {

			var _nodes = this.data._nodes,
				_bounds = this.parent.parent.bounds,
				b = _nodes.elm1[_nodes.p1],
				e = _nodes.elm2[_nodes.p2],
				tmp = new paper.Path({
					insert: false,
					segments: [b, e]
				}),
				normal = tmp.getNormalAt(0).multiply(100),
				length = tmp.length,
				bs = b.add(normal.multiply(0.8)),
				es = e.add(normal.multiply(0.8));

			// выяснить ориентацию
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

			// сместить

			// нарисовать


		},
		enumerable : false
	},

	// размер
	size: {
		get: function () {
			return 0;
		},
		set: function (v) {

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
			return 0;
		},
		set: function (v) {

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
