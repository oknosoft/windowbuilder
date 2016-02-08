/**
 * Дополнительные методы справочника Контрагенты
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_partners
 */

$p.modifiers.push(
	function($p){

		var _mgr = $p.cat.predefined_elmnts,
			_predefined = {};

		_mgr.predefined = function(name){

			if(_predefined[name])
				return _predefined[name];

			var res;
			_mgr.find_rows({name: name}, function (o) {
				res = o;
				return false;
			});
			if(res){
				_predefined[name] = res.elm;
				return res.elm;
			}
		};

	}
);