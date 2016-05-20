/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * @author Evgeniy Malyarov
 * @module undo
 */

/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * Из публичных интерфейсов имеет только методы back() и rewind()
 * Основную работу делает прослушивая широковещательные события
 * @class UndoRedo
 * @constructor
 * @param _editor {Editor} - указатель на экземпляр редактора
 */
function UndoRedo(_editor){

	var _history = [],
		pos = -1,
		snap_timer;

	function run_snapshot() {
		
		// запускаем короткий пересчет изделия
		if(pos >= 0){

			// если pos < конца истории, отрезаем хвост истории
			if(pos > 0 && pos < (_history.length - 1)){
				_history.splice(pos, _history.length - pos - 1);
			}

			_editor.project.save_coordinates({snapshot: true, clipboard: false});

		}

	}

	function save_snapshot(scheme) {
		_history.push(JSON.stringify({}._mixin(scheme.ox._obj, [], ["extra_fields","glasses","mosquito","specification","predefined_name"])));
		pos = _history.length - 1;
		enable_buttons();
	}

	function apply_snapshot() {
		_editor.project.load_stamp(JSON.parse(_history[pos]), true);
		enable_buttons();
	}
	
	function enable_buttons() {
		if(pos < 1)
			_editor.tb_top.buttons.back.classList.add("disabledbutton");
		else
			_editor.tb_top.buttons.back.classList.remove("disabledbutton");

		if(pos < (_history.length - 1))
			_editor.tb_top.buttons.rewind.classList.remove("disabledbutton");
		else
			_editor.tb_top.buttons.rewind.classList.add("disabledbutton");

	}

	function clear() {
		_history.length = 0;
		pos = -1;
	}

	// обрабатываем изменения изделия
	$p.eve.attachEvent("scheme_changed", function (scheme, attr) {
		if(scheme == _editor.project){

			// при открытии изделия чистим историю
			if(scheme.data._loading){
				if(!scheme.data._snapshot){
					clear();
					save_snapshot(scheme);	
				}

			} else{
				// при обычных изменениях, запускаем таймер снапшота
				if(snap_timer)
					clearTimeout(snap_timer);
				snap_timer = setTimeout(run_snapshot, 700);
				enable_buttons();
			}
		}

	});

	// при закрытии редактора чистим историю
	$p.eve.attachEvent("editor_closed", clear);

	// при готовности снапшота, добавляем его в историю
	$p.eve.attachEvent("scheme_snapshot", function (scheme, attr) {
		if(scheme == _editor.project && !attr.clipboard){
			save_snapshot(scheme);
		}

	});

	this.back = function() {
		if(pos > 0)
			pos--;
		if(pos >= 0)
			apply_snapshot();
		else
			enable_buttons();
	};

	this.rewind = function() {
		if(pos <= (_history.length - 1)){
			pos++;
			apply_snapshot();
		}
	}
}