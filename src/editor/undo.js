/**
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * @author Evgeniy Malyarov
 * @module undo
 */

/**
 * ### История редактирования
 * Объект для сохранения истории редактирования и реализации команд (вперёд|назад)
 * Из публичных интерфейсов имеет только методы back() и rewind()
 * Основную работу делает прослушивая широковещательные события
 *
 * @class UndoRedo
 * @constructor
 * @param _editor {Editor} - указатель на экземпляр редактора
 */
class UndoRedo {

  constructor(_editor) {

    this._editor = _editor;
    this._history = [];
    this._pos = -1;

    // обрабатываем изменения изделия
    $p.eve.attachEvent("scheme_changed", this.scheme_changed.bind(this));

    // при закрытии редактора чистим историю
    $p.eve.attachEvent("editor_closed", this.clear.bind(this));

    // при готовности снапшота, добавляем его в историю
    $p.eve.attachEvent("scheme_snapshot", this.scheme_snapshot.bind(this));

  }

  run_snapshot() {

    // запускаем короткий пересчет изделия
    if (this._pos >= 0) {

      // если pos < конца истории, отрезаем хвост истории
      if (this._pos > 0 && this._pos < (this._history.length - 1)) {
        this._history.splice(this._pos, this._history.length - this._pos - 1);
      }

      this._editor.project.save_coordinates({snapshot: true, clipboard: false});

    }

  }

  scheme_snapshot(scheme, attr) {
    if (scheme == this._editor.project && !attr.clipboard) {
      this.save_snapshot(scheme);
    }
  }

  scheme_changed(scheme, attr) {

    if (scheme == this._editor.project) {

      // при открытии изделия чистим историю
      if (scheme.data._loading) {
        if (!scheme.data._snapshot) {
          this.clear();
          this.save_snapshot(scheme);
        }

      } else {
        // при обычных изменениях, запускаем таймер снапшота
        if (this._snap_timer)
          clearTimeout(this._snap_timer);
        this._snap_timer = setTimeout(this.run_snapshot.bind(this), 700);
        this.enable_buttons();
      }
    }

  }

  save_snapshot(scheme) {
    this._history.push(JSON.stringify({}._mixin(scheme.ox._obj, [], ["extra_fields", "glasses", "specification", "predefined_name"])));
    this._pos = this._history.length - 1;
    this.enable_buttons();
  }

  apply_snapshot() {
    this._editor.project.load_stamp(JSON.parse(this._history[this._pos]), true);
    this.enable_buttons();
  }

  enable_buttons() {
    if (this._pos < 1)
      this._editor.tb_top.buttons.back.classList.add("disabledbutton");
    else
      this._editor.tb_top.buttons.back.classList.remove("disabledbutton");

    if (this._pos < (this._history.length - 1))
      this._editor.tb_top.buttons.rewind.classList.remove("disabledbutton");
    else
      this._editor.tb_top.buttons.rewind.classList.add("disabledbutton");

  }

  clear() {
    this._history.length = 0;
    this._pos = -1;
  }

  back() {
    if (this._pos > 0)
      this._pos--;
    if (this._pos >= 0)
      this.apply_snapshot();
    else
      this.enable_buttons();
  }

  rewind() {
    if (this._pos <= (this._history.length - 1)) {
      this._pos++;
      this.apply_snapshot();
    }
  }

};


