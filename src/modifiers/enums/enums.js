/**
 * ### Модификаторы перечислений
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module enmums
 *
 * Created 22.04.2016
 */

(function({enm}){

  /**
   * Синонимы в приход/расход
   */
  enm.debit_credit_kinds.__define({
    debit: {
      get() {
        return this.Приход;
      }
    },
    credit: {
      get() {
        return this.Расход;
      }
    },
  });

	/**
	 * Дополнительные методы перечисления Типы открывания
	 */
	enm.open_types.__define({

    is_opening: {
      value(v) {
        if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное) {
          return false;
        }
        return true;
      }
    }

  });

	/**
	 * Синонимы в ориентации
	 */
	enm.orientations.__define({

		hor: {
			get() {
				return this.Горизонтальная;
			}
		},

		vert: {
			get() {
				return this.Вертикальная;
			}
		},

		incline: {
			get() {
				return this.Наклонная;
			}
		}
	});

	/**
	 * Синонимы в ПоложенииЭлемента
	 */
	enm.positions.__define({

		left: {
			get() {
				return this.Лев;
			}
		},

		right: {
			get() {
				return this.Прав;
			}
		},

		top: {
			get() {
				return this.Верх;
			}
		},

		bottom: {
			get() {
				return this.Низ;
			}
		},

		hor: {
			get() {
				return this.ЦентрГоризонталь;
			}
		},

		vert: {
			get() {
				return this.ЦентрВертикаль;
			}
		}
	});


})($p);
