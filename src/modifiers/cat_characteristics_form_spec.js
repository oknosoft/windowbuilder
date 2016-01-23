/**
 * Форма просмотра спецификации и технологии
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov*
 * @module cat_characteristics_form_spec
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.characteristics;

		_mgr.form_spec = function(pwnd, attr){

		}

		//_mgr.attache_event("before_save", function (attr) {
		//	var obj = this,
		//		data = {
		//			action: "save",
		//			obj: obj
		//		};
		//
		//	// возможно, надо что-то дорассчитать-дозаполнить на клиенте
		//	// todo габариты изделия и цыфры в конструкциях
		//	// todo номера соединяемых элементов
		//
		//	// записываем характеристику через форму 1С
		//	$p.eve.socket.send(data);
		//
		//
		//	return false;
		//
		//});


	}
);
