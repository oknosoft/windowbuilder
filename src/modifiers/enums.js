/**
 * ### Модификаторы перечислений
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 22.04.2016
 * 
 * @module modifiers 
 * @submodule enmums
 * 
 */


$p.modifiers.push(
	
	function($p) {
		
		/**
		 * Дополнительные методы перечисления Типы открывания
		 */
		$p.enm.open_types.__define({

			is_opening: {
				value: function (v) {

					if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное)
						return false;

					return true;

				}
			}

			/*
			,

			rotary: {
				get: function () {
					return this.Поворотное;
				}
			},

			folding: {
				get: function () {
					return this.Откидное;
				}
			},

			rotary_folding: {
				get: function () {
					return this.ПоворотноОткидное;
				}
			},

			deaf: {
				get: function () {
					return this.Глухое;
				}
			},

			sliding: {
				get: function () {
					return this.Раздвижное;
				}
			},

			fixed: {
				get: function () {
					return this.Неподвижное;
				}
			}
			*/

		});

		/**
		 * Дополнительные методы перечисления Ориентация
		 */
		$p.enm.orientations.__define({

			hor: {
				get: function () {
					return this.Горизонтальная;
				}
			},

			vert: {
				get: function () {
					return this.Вертикальная;
				}
			},

			incline: {
				get: function () {
					return this.Наклонная;
				}
			}
		});

	}
);