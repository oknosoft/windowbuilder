/**
 * ### Движок графического построителя
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module geometry
 */

/**
 * Константы и параметры
 */
const consts = new function Settings(){

	this.tune_paper = function (settings) {

	  const builder = $p.job_prm.builder || {};

		/**
		 * Размер визуализации узла пути
		 * @property handleSize
		 * @type number
		 */
		settings.handleSize = builder.handle_size;

		/**
		 * Прилипание. На этом расстоянии узел пытается прилепиться к другому узлу или элементу
		 * @property sticking
		 * @type number
		 */
		this.sticking = builder.sticking || 90;
		this.sticking_l = builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = builder.font_size || 72;
    this.elm_font_size = builder.elm_font_size || 52;

    if($p.wsql.alasql.utils.isNode) {
      this.font_size *= 1.2;
      this.elm_font_size *= 1.2;
    }

		// в пределах этого угла, считаем элемент вертикальным или горизонтальным
		this.orientation_delta = builder.orientation_delta || 30;


	}.bind(this);


  this.epsilon = 0.01;
	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';

};
