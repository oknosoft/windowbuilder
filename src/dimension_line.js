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

	var _row, t = this;

	DimensionLine.superclass.constructor.call(t, attr);

	t.bringToFront();

	t.__define({
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
	t.remove = function () {
		if(_row){
			_row._owner.del(_row);
			_row = null;
		}
		DimensionLine.superclass.remove.call(t);
	};

}
DimensionLine._extend(paper.PointText);

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




	// координата x
	x: {
		get: function () {
			return Math.round(this._row.x1);
		},
		set: function (v) {
			this._row.x1 = v;
			this.point.x = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// координата y
	y: {
		get: function () {
			return Math.round(this._row.y1);
		},
		set: function (v) {
			this._row.y1 = v;
			this.point.y = v;
			this.project.register_update();
		},
		enumerable: false
	},



	// угол к горизонту
	angle: {
		get: function () {
			return Math.round(this.rotation);
		},
		set: function (v) {
			this._row.angle_hor = v;
			this.rotation = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// выравнивание текста
	align: {
		get: function () {
			return $p.enm.text_aligns.get(this.justification);
		},
		set: function (v) {
			this.justification = $p.is_data_obj(v) ? v.ref : v;
			this.project.register_update();
		},
		enumerable: false
	}

});
