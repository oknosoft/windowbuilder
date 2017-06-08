/**
 * Дополнительные методы перечисления Типы соединений
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
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
      return this.cache.t || ( this.cache.t = [_mgr.ТОбразное] );
    },

    get lay() {
      return this.cache.lay || ( this.cache.lay = [_mgr.ТОбразное, _mgr.КрестВСтык] );
    }

	};


	/**
	 * Короткие псевдонимы перечисления "Типы соединений"
	 * @type Object
	 */
	_mgr.tcn = {

    get ad() {
      return _mgr.УгловоеДиагональное;
    },

    get av() {
      return _mgr.УгловоеКВертикальной;
    },

    get ah() {
      return _mgr.УгловоеКГоризонтальной;
    },

    get t() {
      return _mgr.ТОбразное;
    },

    get ii() {
      return _mgr.Наложение;
    },

    get i() {
      return _mgr.НезамкнутыйКонтур;
    },

    get xt() {
      return _mgr.КрестПересечение;
    },

    get xx() {
      return _mgr.КрестВСтык;
    }

	};

})($p.enm.cnn_types);
