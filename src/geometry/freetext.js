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

	var _row;

	if(!attr.fontSize)
		attr.fontSize = consts.font_size;

	if(attr.row)
		_row = attr.row;
	else{
		_row = attr.row = attr.parent.project.ox.coordinates.add();
	}

	if(!_row.cnstr)
		_row.cnstr = attr.parent.layer.cnstr;

	if(!_row.elm)
		_row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;

	// разберёмся с родителем
	// if(attr.parent instanceof paper.path){
	// 	attr.parent = attr.parent.layer.l_text;
	// }

	FreeText.superclass.constructor.call(this, attr);

	this.__define({
		_row: {
			get: function () {
				return _row;
			},
			enumerable: false
		}
	});

	if(attr.point){
		if(attr.point instanceof paper.Point)
			this.point = attr.point;
		else
			this.point = new paper.Point(attr.point);
	}else{

		
		this.clr = _row.clr;
		this.angle = _row.angle_hor;

		if(_row.path_data){
			var path_data = JSON.parse(_row.path_data);
			this.x = _row.x1 + path_data.bounds_x || 0;
			this.y = _row.y1 - path_data.bounds_y || 0;
			this._mixin(path_data, null, ["bounds_x","bounds_y"]);
		}else{
			this.x = _row.x1;
			this.y = _row.y1;
		}
	}

	this.bringToFront();


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

FreeText.prototype.__define({

	save_coordinates: {
		value: function () {

			var _row = this._row,
				path_data = {
					text: this.text,
					font_family: this.font_family,
					font_size: this.font_size,
					bold: this.bold,
					align: this.align.ref,
					bounds_x: this.project.bounds.x,
					bounds_y: this.project.bounds.y
				};

			_row.x1 = this.x;
			_row.y1 = this.y;
			_row.angle_hor = this.angle;
			_row.path_data = JSON.stringify(path_data);

			// устанавливаем тип элемента
			_row.elm_type = this.elm_type;
		}
	},

	/**
	 * Возвращает тип элемента (Текст)
	 */
	elm_type: {
		get : function(){

			return $p.enm.elm_types.Текст;

		}
	},

	move_points: {
		value: function (point) {

			this.point = point;

			Object.getNotifier(this).notify({
				type: 'update',
				name: "x"
			});
			Object.getNotifier(this).notify({
				type: 'update',
				name: "y"
			});
		}
	},

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
			return (this.point.x - this.project.bounds.x).round(1);
		},
		set: function (v) {
			this.point.x = parseFloat(v) + this.project.bounds.x;
			this.project.register_update();
		},
		enumerable: false
	},

	// координата y
	y: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.point.y).round(1);
		},
		set: function (v) {
			this.point.y = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
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
				setTimeout(this.remove.bind(this), 50);
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
