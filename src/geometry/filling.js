/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  filling
 */


/**
 * Инкапсулирует поведение элемента заполнения.<br />
 * У заполнения есть коллекция рёбер, образующая путь контура.<br />
 * Путь всегда замкнутый, образует простой многоугольник без внутренних пересечений, рёбра могут быть гнутыми.
 * @class Filling
 * @param attr {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
function Filling(attr){

	Filling.superclass.constructor.call(this, attr);
	
	var _row = attr.row;

	/**
	 * За этим полем будут "следить" элементы раскладок и пересчитывать - перерисовывать себя при изменениях соседей
	 */
	this._noti = {};

	/**
	 * Формирует оповещение для тех, кто следит за this._noti
	 * @param obj
	 */
	this.notify = function (obj) {
		Object.getNotifier(this._noti).notify(obj);
		this.project.register_change();
	}.bind(this);
	

	// initialize
	(function(){

		var h = this.project.bounds.height + this.project.bounds.y;

		//this.guide = true

		if(_row.path_data)
			this.data.path = new paper.Path(_row.path_data);

		else if(attr.path){

			this.data.path = new paper.Path();
			this.path = attr.path;

		}else
			this.data.path = new paper.Path([
				[_row.x1, h - _row.y1],
				[_row.x1, h - _row.y2],
				[_row.x2, h - _row.y2],
				[_row.x2, h - _row.y1]
			]);
		this.data.path.closePath(true);
		this.data.path.guide = true;
		this.data.path.reduce();
		this.data.path.strokeWidth = 0;

		// для нового устанавливаем вставку по умолчанию
		if(_row.inset.empty())
			_row.inset = this.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});

		// для нового устанавливаем цвет по умолчанию
		if(_row.clr.empty())
			this.project._dp.sys.elmnts.find_rows({nom: _row.inset}, function (row) {
				_row.clr = row.clr;
				return false;
			});
		if(_row.clr.empty())
			this.project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, function (row) {
				_row.clr = row.clr;
				return false;
			});
		this.clr = _row.clr;

		if(_row.elm_type.empty())
			_row.elm_type = $p.enm.elm_types.Стекло;

		this.data.path.visible = false;

		this.addChild(this.data.path);
		//this.addChild(this.data.generatrix);


	}).call(this);

	/**
	 * Рёбра заполнения
	 * @property ribs
	 * @type {paper.Group}
	 */
	//this.ribs = new paper.Group();

}
Filling._extend(BuilderElement);

Filling.prototype.__define({

	profiles: {
		get : function(){
			return this.data._profiles || [];
		}
	},

	/**
	 * Массив раскладок
	 */
	onlays: {
		get: function () {
			return this.getItems({class: Onlay});
		}
	},

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Filling
	 */
	save_coordinates: {
		value: function () {

			var h = this.project.bounds.height + this.project.bounds.y,
				_row = this._row,
				bounds = this.bounds,
				cnns = this.project.connections.cnns,
				glass = this.project.ox.glasses.add({
					elm: _row.elm,
					nom: this.nom,
					width: bounds.width,
					height: bounds.height,
					s: this.s,
					is_rectangular: this.is_rectangular,
					thickness: this.thickness
				});

			_row.x1 = (bounds.bottomLeft.x - this.project.bounds.x).round(3);
			_row.y1 = (h - bounds.bottomLeft.y).round(3);
			_row.x2 = (bounds.topRight.x - this.project.bounds.x).round(3);
			_row.y2 = (h - bounds.topRight.y).round(3);
			_row.path_data = this.path.pathData;

			this.profiles.forEach(function (curr) {
				if(!curr.profile || !curr.profile._row || !curr.cnn){
					throw new ReferenceError("Не найдено ребро заполнения");
				}
				cnns.add({
					elm1: _row.elm,
					elm2: curr.profile._row.elm,
					node1: "",
					node2: "",
					cnn: curr.cnn.ref,
					aperture_len: curr.sub_path.length
				});
			}.bind(this));

		}
	},

	/**
	 * Создаёт створку в текущем заполнении
	 */
	create_leaf: {
		value: function () {

			// создаём пустой новый слой
			var contour = new Contour( {parent: this.parent});

			// задаём его путь - внутри будут созданы профили
			contour.path = this.profiles;

			// помещаем себя вовнутрь нового слоя
			this.parent = contour;
			this._row.cnstr = contour.cnstr;

			// фурнитура и параметры по умолчанию
			contour.furn = this.project.default_furn;

			// оповещаем мир о новых слоях
			Object.getNotifier(this.project._noti).notify({
				type: 'rows',
				tabular: "constructions"
			});

		}
	},

	s: {
		get : function(){
			return this.bounds.width * this.bounds.height / 1000000;
		},
		enumerable : true
	},

	/**
	 * Признак прямоугольности
	 */
	is_rectangular: {
		get : function(){
			return this.profiles.length == 4 && !this.data.path.hasHandles();
		}
	},

	is_sandwich: {
		get : function(){
			return false;
		}
	},

	/**
	 * путь элемента - состоит из кривых, соединяющих вершины элемента
	 * @property path
	 * @type paper.Path
	 */
	path: {
		get : function(){ return this.data.path; },
		set : function(attr){

			var data = this.data;
			data.path.removeSegments();
			data._profiles = [];

			if(attr instanceof paper.Path){

				// Если в передаваемом пути есть привязка к профилям контура - используем
				if(attr.data.curve_nodes){

					data.path.addSegments(attr.segments);
				}else{
					data.path.addSegments(attr.segments);
				}


			}else if(Array.isArray(attr)){
				var length = attr.length, prev, curr, next, sub_path;
				// получам эквидистанты сегментов, смещенные на размер соединения
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile);
					sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

					//sub_path.data.reversed = curr.profile.generatrix.getDirectedAngle(next.e) < 0;
					//if(sub_path.data.reversed)
					//	curr.outer = !curr.outer;
					curr.sub_path = sub_path.equidistant(
						(sub_path.data.reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);
				}
				// получам пересечения
				for(var i=0; i<length; i++ ){
					prev = i==0 ? attr[length-1] : attr[i-1];
					curr = attr[i];
					next = i==length-1 ? attr[0] : attr[i+1];
					if(!curr.pb)
						curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
					if(!curr.pe)
						curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
					if(!curr.pb || !curr.pe){
						throw "Filling:path";
					}
					curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
				}
				// формируем путь
				for(var i=0; i<length; i++ ){
					curr = attr[i];
					data.path.addSegments(curr.sub_path.segments);
					["anext","pb","pe"].forEach(function (prop) {
						delete curr[prop];
					});
					data._profiles.push(curr);
				}
			}

			if(data.path.segments.length && !data.path.closed)
				data.path.closePath(true);

			data.path.reduce();

			data = attr = null;
		}
	},

	// возвращает текущие (ранее установленные) узлы заполнения
	nodes: {
		get: function () {
			var res = [];
			if(this.profiles.length){
				this.profiles.forEach(function (curr) {
					res.push(curr.b);
				});
			}else{
				res = this.parent.glass_nodes(this.path);
			}
			return res;
		}
	},

	/**
	 * Возвращает массив внешних примыкающих профилей текущего заполнения
	 */
	outer_profiles: {
		get: function () {
			return this.profiles;
		}
	},

	/**
	 * Массив с рёбрами периметра
	 */
	perimeter: {
		get: function () {
			var res = [], tmp;
			this.profiles.forEach(function (curr) {
				res.push(tmp = {
					len: curr.sub_path.length,
					angle: curr.e.subtract(curr.b).angle
				});
				if(tmp.angle < 0)
					tmp.angle += 360;
			});
			return res;
		}
	},

	/**
	 * Координата x левой границы (только для чтения)
	 */
	x1: {
		get: function () {
			return (this.bounds.left - this.project.bounds.x).round(1);
		},
		set: function (v) {

		}
	},

	/**
	 * Координата x правой границы (только для чтения)
	 */
	x2: {
		get: function () {
			return (this.bounds.right - this.project.bounds.x).round(1);
		},
		set: function (v) {

		}
	},

	/**
	 * Координата y нижней границы (только для чтения)
	 */
	y1: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
		},
		set: function (v) {

		}
	},

	/**
	 * Координата y верхней (только для чтения)
	 */
	y2: {
		get: function () {
			return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
		},
		set: function (v) {

		}
	},

	// информация для редактора свойста
	info: {
		get : function(){
			return "№" + this.elm + " w:" + this.bounds.width.toFixed(0) + " h:" + this.bounds.height.toFixed(0);
		},
		enumerable : true
	},

	select_node: {
		value: function (v) {
			var point, segm, delta = 10e9;
			if(v == "b"){
				point = this.bounds.bottomLeft;
			}else{
				point = this.bounds.topRight;
			}
			this.data.path.segments.forEach(function (curr) {
				curr.selected = false;
				if(point.getDistance(curr.point) < delta){
					delta = point.getDistance(curr.point);
					segm = curr;
				}
			});
			segm.selected = true;
			this.view.update();
		}
	},

	/**
	 * Описание полей диалога свойств элемента
	 */
	oxml: {
		get: function () {
			return {
				" ": [
					{id: "info", path: "o.info", type: "ro"},
					"inset",
					"clr"
				],
				"Начало": [
					{id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
					{id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
				],
				"Конец": [
					{id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
					{id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
				]
			}
		},
		enumerable: false
	},

	default_clr_str: {
		value: "#def,#d0ddff,#eff",
		enumerable: false
	},

	/**
	 * Перерисовывает раскладки текущего заполнения
	 */
	redraw_onlay: {
		value: function () {
			this.onlays.forEach(function (elm) {
				elm.redraw();
			});
		}
	}

});

Editor.Filling = Filling;