/**
 * Дополнительные методы перечисления Типы соединений
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 23.12.2015
 *
 * @module enm_cnn_types
 */

(function(_mgr){

	const acn = {
    ii: [_mgr.Наложение],
    i: [_mgr.НезамкнутыйКонтур],
    a: [
      _mgr.УгловоеДиагональное,
      _mgr.УгловоеКВертикальной,
      _mgr.УгловоеКГоризонтальной,
      _mgr.КрестВСтык],
    t: [_mgr.ТОбразное, _mgr.КрестВСтык],
	};


	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type Object
	 */
	Object.defineProperties(_mgr, {
	  ad: {
	    get() {
        return this.УгловоеДиагональное;
      }
    },
    av: {
      get() {
        return this.УгловоеКВертикальной;
      }
    },
    ah: {
      get() {
        return this.УгловоеКГоризонтальной;
      }
    },
    t: {
      get() {
        return this.ТОбразное;
      }
    },
    ii: {
      get() {
        return this.Наложение;
      }
    },
    i: {
      get() {
        return this.НезамкнутыйКонтур;
      }
    },
    xt: {
      get() {
        return this.КрестПересечение;
      }
    },
    xx: {
      get() {
        return this.КрестВСтык;
      }
    },

    /**
     * Массивы Типов соединений
     * @type Object
     */
    acn: {
      value: acn
    },

  });

})($p.enm.cnn_types);
