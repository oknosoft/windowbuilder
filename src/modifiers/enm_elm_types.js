/**
 * Дополнительные методы перечисления Типы элементов
 * @author Evgeniy Malyarov
 * @module enm_elm_types
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.enm.elm_types,

			/**
			 * Массивы Типов элементов
			 * @type {Object}
			 */
			cache = {};

		_mgr.__define({

			profiles: {
				get : function(){
					return cache.profiles
						|| ( cache.profiles = [
							_mgr.Рама,
							_mgr.Створка,
							_mgr.Импост,
							_mgr.Штульп] );
				},
				enumerable : false,
				configurable : false
			},

			rama_impost: {
				get : function(){
					return cache.rama_impost
						|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
				},
				enumerable : false,
				configurable : false
			},

			stvs: {
				get : function(){
					return cache.stvs || ( cache.stvs = [_mgr.Створка] );
				},
				enumerable : false,
				configurable : false
			},

			glasses: {
				get : function(){
					return cache.glasses
						|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
				},
				enumerable : false,
				configurable : false
			}

		});

	}
);