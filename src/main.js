/**
 * Классы объектов построителя на базе paper.js
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 * @module  paper_ex
 */


/**
 * Экспортируем конструктор Scheme, чтобы экземпляры построителя можно было создать снаружи
 * @property Scheme
 * @for $p
 * @type {Scheme}
 */
if(typeof $p !== "undefined")
	$p.Editor = Editor;

/**
 * Обёртка для подключения через AMD или CommonJS
 * https://github.com/umdjs/umd
 */
if (typeof define === 'function' && define.amd) {
	// Support AMD (e.g. require.js)
	define('Editor', Editor);
} else if (typeof module === 'object' && module) { // could be `null`
	// Support CommonJS module
	module.exports = Editor;
}


/**
 * Здесь делаем mixin и расширения классам paper.js
 */

/**
 * Расширение класса Path
 */
paper.Path.prototype._define({

	/**
	 * Вычисляет направленный угол в точке пути
	 * @param point
	 * @return {*}
	 */
	getDirectedAngle: {
		value: function (point) {
			var np = this.getNearestPoint(point),
				offset = this.getOffsetOf(np);
			return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
		}
	},

	/**
	 * Выясняет, является ли путь прямым
	 * @return {Boolean}
	 */
	is_linear: {
		value: function () {
			return this.curves.length == 1 && this.firstCurve.isLinear();
		}
	},

	/**
	 * возвращает фрагмент пути между точками
	 */
	get_subpath: {
		value: function (point1, point2) {
			var path = this.clone(), tmp,
				loc1 = path.getLocationOf(point1),
				loc2 = path.getLocationOf(point2);
			if(loc1.offset > loc2.offset){
				tmp = path.split(loc1.index, loc1.parameter);
				tmp.remove();
				loc2 = path.getLocationOf(point2);
				tmp = path.split(loc2.index, loc2.parameter);
				path.remove();
				tmp.reverse();
			}else{
				tmp = path.split(loc2.index, loc2.parameter);
				tmp.remove();
				loc1 = path.getLocationOf(point1);
				tmp = path.split(loc1.index, loc1.parameter);
				path.remove();
			}
			return tmp;
		}
	}
});


/**
 * Выясняет, расположена ли точка в окрестности точки
 * @param point {paper.Point}
 * @param [sticking] {Boolean}
 * @returns {Boolean}
 */
paper.Point.prototype.is_nearest = function (point, sticking) {
	return this.getDistance(point, true) < (sticking ? consts.sticking2 : 10);
};

/**
 * Расширение класса Tool
 */
paper.Tool.prototype._define({

	/**
	 * Отключает и выгружает из памяти окно свойств инструмента
	 * @param tool
	 */
	detache_wnd: {
		value: function(){
			if(this.wnd && this.wnd.wnd_options){
				this.wnd.wnd_options(this.options.wnd);
				$p.wsql.save_options("editor", this.options);
				this.wnd.close();
			}
			this.wnd = null;
			this.profile = null;
		}
	},

	/**
	 * Подключает окно редактор свойств текущего элемента, выбранного инструментом
	 */
	attache_wnd: {
		value: function(profile, _editor){

			this.profile = profile;

			if(!this.wnd || !this._grid){
				$p.wsql.restore_options("editor", this.options);
				this.wnd = $p.iface.dat_blank(_editor._dxw, this.options.wnd);
				this.wnd.buttons = this.wnd.bottom_toolbar({
					wrapper: this.wnd.cell, width: '100%', height: '28px', bottom: '0px', left: '0px', name: 'aling_bottom',
					buttons: [
						{name: 'left', img: 'align_left.png', title: $p.msg.align_node_left, float: 'left'},
						{name: 'bottom', img: 'align_bottom.png', title: $p.msg.align_node_bottom, float: 'left'},
						{name: 'top', img: 'align_top.png', title: $p.msg.align_node_top, float: 'left'},
						{name: 'right', img: 'align_right.png', title: $p.msg.align_node_right, float: 'left'},
						{name: 'delete', img: 'trash.gif', title: 'Удалить элемент', clear: 'right', float: 'right'}
					],
					onclick: function (name) {
						return _editor.profile_align(name);
					}
				});

				this._grid = this.wnd.attachHeadFields({
					obj: profile,
					oxml: {
						" ": ["inset", "clr"],
						"Начало": ["x1", "y1"],
						"Конец": ["x2", "y2"]

					}
				});
				this._grid.attachEvent("onRowSelect", function(id,ind){
					if(id == "x1" || id == "y1")
						_editor.project.select_node(profile, "b");
					else if(id == "x2" || id == "y2")
						_editor.project.select_node(profile, "e");
				});
			}else{
				this._grid.attach({obj: profile})
			}
		}
	}

});




