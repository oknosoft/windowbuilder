/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module profile_addl
 * Created 16.05.2016
 */


/**
 * ### Дополнительный профиль
 * Класс описывает поведение доборного и расширительного профилей
 *
 * - похож в поведении на сегмент створки, но расположен в том же слое, что и ведущий элемент
 * - у дополнительного профиля есть координаты конца и начала, такие же, как у Profile
 * - в случае внутреннего добора, могут быть Т - соединения, как у импоста
 * - в случае внешнего, концы соединяются с пустотой
 * - имеет одно ii примыкающее соединение
 * - есть путь образующей - прямая или кривая линия, такая же, как у створки
 * - длина дополнительного профиля может отличаться от длины ведущего элемента
 *
 * @class ProfileAddl
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 */
function ProfileAddl(attr){

	ProfileAddl.superclass.constructor.call(this, attr);

}
ProfileAddl._extend(ProfileItem);


ProfileAddl.prototype.__define({

	/**
	 * Вычисляемые поля в таблице координат
	 * @method save_coordinates
	 * @for Profile
	 */
	save_coordinates: {
		value: function () {

			if(!this.data.generatrix)
				return;

			var _row = this._row,

				cnns = this.project.connections.cnns,
				b = this.rays.b,
				e = this.rays.e,

				row_b = cnns.add({
					elm1: _row.elm,
					node1: "b",
					cnn: b.cnn ? b.cnn.ref : "",
					aperture_len: this.corns(1).getDistance(this.corns(4))
				}),
				row_e = cnns.add({
					elm1: _row.elm,
					node1: "e",
					cnn: e.cnn ? e.cnn.ref : "",
					aperture_len: this.corns(2).getDistance(this.corns(3))
				}),

				gen = this.generatrix;

			_row.x1 = this.x1;
			_row.y1 = this.y1;
			_row.x2 = this.x2;
			_row.y2 = this.y2;
			_row.path_data = gen.pathData;
			_row.nom = this.nom;
			_row.parent = this.parent.elm;


			// добавляем припуски соединений
			_row.len = this.length;

			// сохраняем информацию о соединениях
			if(b.profile){
				row_b.elm2 = b.profile.elm;
				if(b.profile instanceof Filling)
					row_b.node2 = "t";
				else if(b.profile.e.is_nearest(b.point))
					row_b.node2 = "e";
				else if(b.profile.b.is_nearest(b.point))
					row_b.node2 = "b";
				else
					row_b.node2 = "t";
			}
			if(e.profile){
				row_e.elm2 = e.profile.elm;
				if(e.profile instanceof Filling)
					row_e.node2 = "t";
				else if(e.profile.b.is_nearest(e.point))
					row_e.node2 = "b";
				else if(e.profile.e.is_nearest(e.point))
					row_e.node2 = "b";
				else
					row_e.node2 = "t";
			}

			// получаем углы между элементами и к горизонту
			_row.angle_hor = this.angle_hor;

			_row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - gen.getTangentAt(0).angle) * 10) / 10;
			if(_row.alp1 < 0)
				_row.alp1 = _row.alp1 + 360;

			_row.alp2 = Math.round((gen.getTangentAt(gen.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
			if(_row.alp2 < 0)
				_row.alp2 = _row.alp2 + 360;

			// устанавливаем тип элемента
			_row.elm_type = this.elm_type;

		}
	},

	/**
	 * Примыкающий внешний элемент - имеет смысл для сегментов створок
	 * @property nearest
	 * @type Profile
	 */
	nearest: {
		value : function(){
			this.data._nearest_cnn = $p.cat.cnns.elm_cnn(this, this.parent, acn.ii, this.data._nearest_cnn);
			return this.parent;
		}
	},

	/**
	 * Расстояние от узла до опорной линии
	 * для створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
	 * не имеет смысла для заполнения, но нужно для рёбер заполнений
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
	 * для рамы, обычно = 0, для импоста 1/2 ширины
	 * зависит от ширины элементов и свойств примыкающих соединений
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
	 * Возвращает тип элемента (Добор)
	 */
	elm_type: {
		get : function(){

			return $p.enm.elm_types.Добор;

		}
	},

	/**
	 * С этой функции начинается пересчет и перерисовка сегмента раскладки
	 * Возвращает объект соединения конца профиля
	 * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
	 * - Попутно устанавливает признак `is_cut`, если в точке сходятся больше двух профилей
	 * - Не делает подмену соединения, хотя могла бы
	 * - Не делает подмену вставки, хотя могла бы
	 *
	 * @method cnn_point
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
			if(res.profile && res.profile.children.length){

				if(this.check_distance(res.profile, res, point, true) === false)
					return res;
			}


			// TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
			res.clear();
			if(this.parent){

				// var res_bind = this.bind_node(point);
				// if(res_bind.binded){
				// 	res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
				// }
			}

			return res;

		}
	}

});
