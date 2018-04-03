/**
 * Дополнительные методы перечисления Типы элементов
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module enm_elm_types
 */

(function(_mgr){

	const cache = {};

  /**
   * Массивы Типов элементов
   * @type Object
   */
	_mgr.__define({

		profiles: {
			get(){
				return cache.profiles
					|| ( cache.profiles = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп] );
			}
		},

		profile_items: {
			get(){
				return cache.profile_items
					|| ( cache.profile_items = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп,
						_mgr.Добор,
						_mgr.Соединитель,
						_mgr.Раскладка
					] );
			}
		},

		rama_impost: {
			get(){
				return cache.rama_impost
					|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
			}
		},

		impost_lay: {
			get(){
				return cache.impost_lay
					|| ( cache.impost_lay = [ _mgr.Импост, _mgr.Раскладка] );
			}
		},

		stvs: {
			get(){
				return cache.stvs || ( cache.stvs = [_mgr.Створка] );
			}
		},

		glasses: {
			get(){
				return cache.glasses
					|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
			}
		}

	});


})($p.enm.elm_types);
