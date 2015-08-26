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
 * @param attr.parent {BuilderElement} - элемент, к которому привязывается комментарий
 * @constructor
 * @extends paper.PointText
 */
function FreeText(attr){

	var _row, t = this;

	if(!attr.fontSize)
		attr.fontSize = consts.font_size;

	if(attr.row)
		_row = attr.row;
	else
		_row = attr.row = attr.parent.project.ox.coordinates.add();

	if(attr.point){
		var tpoint;
		if(attr.point instanceof paper.Point)
			tpoint = attr.point;
		else
			tpoint = new paper.Point(attr.point);
		_row.x1 = tpoint.x;
		_row.y1 = tpoint.y;
	}else
		attr.point = [_row.x1, _row.y1];

	// разберёмся с родителем
	if(!(attr.parent.parent instanceof Contour)){
		while(!(attr.parent instanceof Contour))
			attr.parent = attr.parent.parent;
		attr.parent = attr.parent.l_text;
	}else
		attr.parent = attr.parent.parent.l_text;

	FreeText.superclass.constructor.call(t, attr);

	t.bringToFront();

	t._define({
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
		_row._owner.del(_row);
		_row = null;
		FreeText.superclass.remove.call(t);
	};

}
FreeText._extend(paper.PointText);

FreeText.prototype._define({

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

	// транслирует цвет из справочника в строку и обратно
	clr: {
		get: function () {
			return this._row ? this._row.clr : $p.cat.clrs.get();
		},
		set: function (v) {
			this._row.clr = v;
			if(this._row.clr.clr_str.length == 6)
				this.fillColor = "#" + this._row.clr.clr_str;
			this.project.register_update();
		},
		enumerable: false
	},

	// семейство шрифта
	font_family: {
		get: function () {
			return this.fontFamily || "";
		},
		set: function (v) {
			this.fontFamily = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// размер шрифта
	font_size: {
		get: function () {
			return this.fontSize || consts.font_size;
		},
		set: function (v) {
			this.fontSize = v;
			this.project.register_update();
		},
		enumerable: false
	},

	// жирность шрифта
	bold: {
		get: function () {
			return this.fontWeight != 'normal';
		},
		set: function (v) {
			this.fontWeight = v ? 'bold' : 'normal';
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

	// текст элемента
	text: {
		get: function () {
			return this.content;
		},
		set: function (v) {
			if(v){
				this.content = v;
				this.project.register_update();
			}
			else{
				Object.getNotifier(this).notify({
					type: 'unload'
				});
				setTimeout(this.remove, 50);
			}

		},
		enumerable: false
	},

	// угол к горизонту
	angle: {
		get: function () {
			return Math.round(this.rotation);
		},
		set: function (v) {
			this._row.alp = v;
			this.rotation = v;
			this.project.register_update();
		},
		enumerable: false
	},

	align: {
		get: function () {
			return $p.enm.text_aligns.get(this.justification);
		},
		set: function (v) {
			this.justification = $p.is_data_obj(v) ? v.ref : v;
			this.project.register_update();
		},
		enumerable: false
	},



	// обновляет координаты
	refresh_pos: {
		value: function () {
			this.x = this.point.x;
			this.y = this.point.y;
			Object.getNotifier(this).notify({
				type: 'update',
				name: "x"
			});
			Object.getNotifier(this).notify({
				type: 'update',
				name: "y"
			});
		}
	}

});
