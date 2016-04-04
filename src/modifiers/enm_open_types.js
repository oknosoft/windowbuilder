/**
 * Дополнительные методы перечисления Типы открывания
 * @author Evgeniy Malyarov
 * @module enm_open_types
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.enm.open_types;

		_mgr.__define({
			
			is_opening: {
				value: function (v) {
					
					if(!v || v.empty() || v == _mgr.Глухое || v == _mgr.Неподвижное)
						return false;
					
					return true;
					
				}
			}
		});

	}
);