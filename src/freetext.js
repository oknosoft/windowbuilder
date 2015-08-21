/**
 *
 * Created 21.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 * @module  freetext
 */

/**
 * Произвольный текст на эскизе
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @constructor
 * @extends paper.PointText
 */
function FreeText(attr){

	var _row;

	FreeText.superclass.constructor.call(this, attr);

	if(attr.row)
		_row = attr.row;
	else
		_row = attr.row = this.project.ox.coordinates.add();

	this._define({
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
		_row._owner.del(_row);
		_row = null;
		FreeText.superclass.remove.call(this);
	};

}
FreeText._extend(paper.PointText);

FreeText.prototype._define({

	// виртуальные метаданные для автоформ
	_metadata: {
		get: function () {
			return {
				fields: {
					text: {},
					rotation: {},
					fontFamily: {},
					fontWeight: {},
					fontSize: {},
					color: {},
					x: {},
					y: {}
				}
			};
		},
		enumerable: false
	},

	// виртуальный датаменеджер для автоформ
	_manager: {
		get: function () {
			return this.project._dp._manager;
		},
		enumerable: false
	},

	// транслирует цвет из справочника в строку и обратно
	color: {
		get: function () {
			return this._row.color;
		},
		set: function (v) {
			this._row.color = v;
		},
		enumerable: false
	},

	// координата x
	x: {
		get: function () {
			return this._row.x1;
		},
		set: function (v) {
			this._row.x1 = v;
			this.point.x = v;
		},
		enumerable: false
	},

	// координата y
	y: {
		get: function () {
			return this._row.y1;
		},
		set: function (v) {
			this._row.y1 = v;
			this.point.y = v;
		},
		enumerable: false
	},

	text: {
		get: function () {
			return this.content;
		},
		set: function (v) {
			if(v)
				this.content = v;
			else
				setTimeout(this.remove, 100);
		},
		enumerable: false
	}

});
