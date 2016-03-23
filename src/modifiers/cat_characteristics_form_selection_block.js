/**
 * Форма выбора типового блока
 *
 * Created 23.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module cat_characteristics_form_selection_block
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.characteristics;

		// попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
		_mgr.form_selection_block = function(pwnd, attr){
			
		};

	}
);