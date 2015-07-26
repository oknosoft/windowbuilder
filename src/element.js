/**
 * <br />&copy; http://www.oknosoft.ru 2009-2015
 * Created 24.07.2015
 * @module  element
 */


/**
 * Базовый класс элементов построителя. его свойства и методы присущи всем элементам построителя,
 * но не характерны для классов Path и Group фреймворка paper.js
 * @class BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента
 *  @param attr.b {paper.Point} - координата узла начала элемента - не путать с координатами вершин пути элемента
 *  @param attr.e {paper.Point} - координата узла конца элемента - не путать с координатами вершин пути элемента
 *  @param attr.contour {Contour} - контур, которому принадлежит элемент
 *  @param attr.type_el {_enm.elm_types}  может измениться при конструировании. например, импост -> рама
 *  @param [attr.nom] {_cat.nom} -   если не указано, будет вычислена по типу элемента
 *  @param [attr.path] (r && arc_ccw && more_180)
 * @constructor
 * @extends paper.Group
 * @uses BuilderElementProperties
 * @uses NomenclatureProperties
 */
function BuilderElement(attr){

	var _row;

	BuilderElement.superclass.constructor.call(this);

	if(attr.row)
		_row = attr.row;
	else
		_row = this.project.ox.coordinates.add();

	// номенклатура
	this._define("nom", {
		get : function(){
			return _row.nom;
		},
		set : function(v){
			_row.nom = v;
		},
		enumerable : false,
		configurable : false
	});

	// цвет
	this._define("clr", {
		get : function(){
			return _row.clr;
		},
		set : function(v){
			_row.clr = v;
		},
		enumerable : false,
		configurable : false
	});

	if(attr.proto){

		this.nom = attr.proto.nom;
		this.clr = attr.proto.clr;

		if(attr.proto.parent)
			this.parent = attr.proto.parent;

		if(attr.proto instanceof Profile)
			this.insertBelow(attr.proto);

	}else if(attr.row){

		if(attr.parent)
			this.parent = attr.parent;
	}



	this.project.register_change();

	/**
	 * Формирует путь элемента и перерисовывает его. Переопределяется в наследниках
	 * @method redraw
	 */
	this.redraw = function(){

	};

	/**
	 * Удаляет элемент из контура и иерархии проекта
	 * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
	 * @method remove
	 */
	this.remove = function () {
		_row._owner.del(_row);
		_row = null;
		BuilderElement.superclass.remove.call(this);
	};

}
(function(){

	BuilderElement._extend(paper.Group);                     // BuilderElement наследует свойства класса Path
	NomenclatureProperties.call(BuilderElement.prototype);      // а еще, привязываем свойства класса NomenclatureProperties
	BuilderElementProperties.call(BuilderElement.prototype);    // новые свойства привязываем к прототипу, а не к самому BuilderElement-у

	/**
	 * Cвойства элемента, не зависящие от номенклатуры
	 * @class BuilderElementProperties
	 * @static
	 */
	function BuilderElementProperties(){

		/**
		 * Элемент - владелец. имеет смысл для раскладок и рёбер заполнения
		 * @property owner
		 * @type BuilderElement
		 */
		this._define('owner', {
			get : function(){ return this.data.owner; },
			set : function(newValue){ this.data.owner = newValue; },
			enumerable : false,
			configurable : false
		});

		/**
		 * прочитать - установить путь образующей. здесь может быть линия, простая дуга или безье
		 * по ней будут пересчитаны pathData и прочие свойства
		 * @property generatrix
		 * @type paper.Path
		 */
		this._define('generatrix', {
			get : function(){ return this.data.generatrix; },
			set : function(attr){

				this.data.generatrix.removeSegments();

				if(this.hasOwnProperty('rays'))
					this.rays.clear();

				if(Array.isArray(attr))
					this.data.generatrix.addSegments(attr);

				else if(attr.proto &&  attr.p1 &&  attr.p2){

					// сначала, выясняем направление пути
					var tpath = attr.proto;
					if(tpath.getDirectedAngle(attr.ipoint) < 0)
						tpath.reverse();

					// далее, уточняем порядок p1, p2
					var d1 = tpath.getOffsetOf(attr.p1),
						d2 = tpath.getOffsetOf(attr.p2), d3;
					if(d1 > d2){
						d3 = d2;
						d2 = d1;
						d1 = d3;
					}
					if(d1 > 0){
						tpath = tpath.split(d1);
						d2 = tpath.getOffsetOf(attr.p2);
					}
					if(d2 < tpath.length)
						tpath.split(d2);

					this.data.generatrix.remove();
					this.data.generatrix = tpath;
					this.data.generatrix.parent = this;

					if(this.parent.parent)
						this.data.generatrix.guide = true;
				}
			},
			enumerable : true,
			configurable : false
		});

		/**
		 * путь элемента - состоит из кривых, соединяющих вершины элемента
		 * для профиля, вершин всегда 4, для заполнений может быть <> 4
		 * @property path
		 * @type paper.Path
		 */
		this._define('path', {
			get : function(){ return this.data.path; },
			set : function(attr){
				if(attr instanceof paper.Path){
					this.data.path.removeSegments();
					this.data.path.addSegments(attr.segments);
					if(!this.data.path.closed)
						this.data.path.closePath(true);
				}
			},
			enumerable : true,
			configurable : false
		});

	}

	/**
	 * Cвойства элемента, определяемые номенклатурой
	 * @class NomenclatureProperties
	 * @static
	 */
	function NomenclatureProperties(){

		// ширина
		this._define("width", {
			get : function(){
				return this.nom.width || 80;
			},
			enumerable : false,
			configurable : false
		});

		// толщина (для заполнений и, возможно, профилей в 3D)
		this._define("thickness", {
			get : function(){
				return this.nom.thickness || 0;
			},
			enumerable : false,
			configurable : false
		});

		// опорный размер (0 для рам и створок, 1/2 ширины для импостов)
		this._define("sizeb", {
			get : function(){
				return this.nom.sizeb || 0;
			},
			enumerable : false,
			configurable : false
		});

		// размер до фурнитурного паза
		this._define("sizefurn", {
			get : function(){
				return this.nom.sizefurn || 20;
			},
			enumerable : false,
			configurable : false
		});

	}

})();

