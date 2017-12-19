/**
 * Дополнительные методы перечисления Типы соединений
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
	    get: function () {
        return this.УгловоеДиагональное;
      }
    },
    av: {
      get: function () {
        return this.УгловоеКВертикальной;
      }
    },
    ah: {
      get: function () {
        return this.УгловоеКГоризонтальной;
      }
    },
    t: {
      get: function () {
        return this.ТОбразное;
      }
    },
    ii: {
      get: function () {
        return this.Наложение;
      }
    },
    i: {
      get: function () {
        return this.НезамкнутыйКонтур;
      }
    },
    xt: {
      get: function () {
        return this.КрестПересечение;
      }
    },
    xx: {
      get: function () {
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
