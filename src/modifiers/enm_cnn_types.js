/**
 * Дополнительные методы перечисления Типы соединений
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module enm_cnn_types
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.enm.cnn_types;

		/**
		 * Массивы Типов соединений
		 * @type {Object}
		 */
		_mgr.acn = {cache :{}};
		_mgr.acn.__define({

			ii: {
				get : function(){
					return this.cache.ii
						|| ( this.cache.ii = [_mgr.Наложение] );
				},
				enumerable : false,
				configurable : false
			},

			i: {
				get : function(){
					return this.cache.i
						|| ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
				},
				enumerable : false,
				configurable : false
			},

			a: {
				get : function(){
					return this.cache.a
						|| ( this.cache.a = [
							_mgr.УгловоеДиагональное,
							_mgr.УгловоеКВертикальной,
							_mgr.УгловоеКГоризонтальной,
							_mgr.КрестВСтык] );
				},
				enumerable : false,
				configurable : false
			},

			t: {
				get : function(){
					return this.cache.t
						|| ( this.cache.t = [_mgr.ТОбразное] );
				},
				enumerable : false,
				configurable : false
			}
		});

		/**
		 * Короткие псевдонимы перечисления "Типы соединений"
		 * @type {Object}
		 */
		_mgr.tcn = {cache :{}};
		_mgr.tcn.__define({
			ad: {
				get : function(){
					return this.cache.ad || ( this.cache.ad = _mgr.УгловоеДиагональное );
				},
				enumerable : false,
				configurable : false
			},

			av: {
				get : function(){
					return this.cache.av || ( this.cache.av = _mgr.УгловоеКВертикальной );
				},
				enumerable : false,
				configurable : false
			},

			ah: {
				get : function(){
					return this.cache.ah || ( this.cache.ah = _mgr.УгловоеКГоризонтальной );
				},
				enumerable : false,
				configurable : false
			},

			t: {
				get : function(){
					return this.cache.t || ( this.cache.t = _mgr.ТОбразное );
				},
				enumerable : false,
				configurable : false
			},

			ii: {
				get : function(){
					return this.cache.ii || ( this.cache.ii = _mgr.Наложение );
				},
				enumerable : false,
				configurable : false
			},

			i: {
				get : function(){
					return this.cache.i || ( this.cache.i = _mgr.НезамкнутыйКонтур );
				},
				enumerable : false,
				configurable : false
			},

			xt: {
				get : function(){
					return this.cache.xt || ( this.cache.xt = _mgr.КрестПересечение );
				},
				enumerable : false,
				configurable : false
			},

			xx: {
				get : function(){
					return this.cache.xx || ( this.cache.xx = _mgr.КрестВСтык );
				},
				enumerable : false,
				configurable : false
			}
		});

	}
);