/**
 * ### Движок графического построителя
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * 
 * @module geometry
 */

"use strict";

/**
 * Константы и параметры
 */
	var consts = new function Settings(){


	this.tune_paper = function (settings) {
		/**
		 * Размер визуализации узла пути
		 * @property handleSize
		 * @type {number}
		 */
		settings.handleSize = $p.job_prm.builder.handle_size;

		/**
		 * Прилипание. На этом расстоянии узел пытается прилепиться к другому узлу или элементу
		 * @property sticking
		 * @type {number}
		 */
		this.sticking = $p.job_prm.builder.sticking || 90;
		this.sticking_l = $p.job_prm.builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = $p.job_prm.builder.font_size || 60;

		// в пределах этого угла, считаем элемент вертикальным или горизонтальным
		this.orientation_delta = $p.job_prm.builder.orientation_delta || 7;
		

	}.bind(this);



	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';



};