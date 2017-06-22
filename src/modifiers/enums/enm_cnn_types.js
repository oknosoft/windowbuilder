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


	/**
	 * Массивы Типов соединений
	 * @type Object
	 */
	_mgr.acn = {

	  cache: {},

    get ii() {
      return this.cache.ii || ( this.cache.ii = [_mgr.Наложение] );
    },

    get i() {
      return this.cache.i || ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
    },

    get a() {
      return this.cache.a
        || ( this.cache.a = [
          _mgr.УгловоеДиагональное,
          _mgr.УгловоеКВертикальной,
          _mgr.УгловоеКГоризонтальной,
          _mgr.КрестВСтык] );
    },

    get t() {
      return this.cache.t || ( this.cache.t = [_mgr.ТОбразное, _mgr.КрестВСтык] );
    },

	};


	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type Object
	 */
	Object.defineProperties(_mgr, {
	  ad: {
	    get: function () {
        return _mgr.УгловоеДиагональное;
      }
    },
    av: {
      get: function () {
        return _mgr.УгловоеКВертикальной;
      }
    },
    ah: {
      get: function () {
        return _mgr.УгловоеКГоризонтальной;
      }
    },
    t: {
      get: function () {
        return _mgr.ТОбразное;
      }
    },
    ii: {
      get: function () {
        return _mgr.Наложение;
      }
    },
    i: {
      get: function () {
        return _mgr.НезамкнутыйКонтур;
      }
    },
    xt: {
      get: function () {
        return _mgr.КрестПересечение;
      }
    },
    xx: {
      get: function () {
        return _mgr.КрестВСтык;
      }
    },

  });

})($p.enm.cnn_types);
