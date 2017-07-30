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
    this._pos = -1;

    this._diff = [];
    this.run_snapshot = this.run_snapshot.bind(this);
    this.scheme_changed = this.scheme_changed.bind(this);
    this.scheme_snapshot = this.scheme_snapshot.bind(this);
    this.clear = this.clear.bind(this);

    // При изменениях изделия, запускаем таймер снапшота
    _editor.eve.on('scheme_changed', this.scheme_changed);

    // При готовности снапшота, добавляем его в историю
    _editor.eve.on('scheme_snapshot', this.scheme_snapshot);

  }

  /**
   * Инициализирует создание снапшота - запускает пересчет изделия
   */
  run_snapshot() {
    this._pos >= 0 && this._editor.project.save_coordinates({snapshot: true, clipboard: false});
  }

  /**
   * Обрабатывает событие scheme_snapshot после пересчета спецификации
   * @param scheme
   * @param attr
   */
  scheme_snapshot(scheme, attr) {
    scheme === this._editor.project && !attr.clipboard && this.save_snapshot(scheme);
  }

  /**
   * При изменениях изделия, запускает таймер снапшота
   * @param scheme
   * @param attr
   */
  scheme_changed(scheme, attr) {
    const snapshot = scheme._attr._snapshot || (attr && attr.snapshot);
    this._snap_timer && clearTimeout(this._snap_timer);
    if (!snapshot && scheme == this._editor.project) {
      // при открытии изделия чистим историю
      if (scheme._attr._loading) {
        this._snap_timer = setTimeout(() => {
          this.clear();
          this.save_snapshot(scheme);
        }, 700);
      }
      else {
        // при обычных изменениях, запускаем таймер снапшота
        this._snap_timer = setTimeout(this.run_snapshot, 700);
      }
    }
  }

  /**
   * Вычисляет состояние через diff
   * @param pos
   * @return {*}
   */
  calculate(pos) {
    const {_diff} = this;
    const curr = _diff[0]._clone();
    for (let i = 1; i < _diff.length && i <= pos; i++) {
      _diff[i].forEach((change) => {
        DeepDiff.applyChange(curr, true, change);
      });
    }
    return curr;
  }


  save_snapshot(scheme) {
    const curr = scheme.ox._obj._clone(['_row', 'extra_fields', 'glasses', 'specification', 'predefined_name']);
    const {_diff, _pos} = this;
    if (!_diff.length) {
      _diff.push(curr);
    }
    else {
      const diff = DeepDiff.diff(this.calculate(Math.min(_diff.length - 1, _pos)), curr);
      if (diff && diff.length) {
        // если pos < конца истории, отрезаем хвост истории
        if (_pos > 0 && _pos < (_diff.length - 1)) {
          _diff.splice(_pos, _diff.length - _pos - 1);
        }
        _diff.push(diff);
      }
    }
    this._pos = _diff.length - 1;
    this.enable_buttons();
  }

  apply_snapshot() {
    this.disable_buttons();
    this._editor.project.load_stamp(this.calculate(this._pos), true);
    this.enable_buttons();
  }

  enable_buttons() {
    const {back, rewind} = this._editor.tb_top.buttons;
    if (this._pos < 1)
      back.classList.add('disabledbutton');
    else
      back.classList.remove('disabledbutton');

    if (this._pos < (this._diff.length - 1))
      rewind.classList.remove('disabledbutton');
    else
      rewind.classList.add('disabledbutton');

  }

  disable_buttons() {
    const {back, rewind} = this._editor.tb_top.buttons;
    back.classList.add('disabledbutton');
    rewind.classList.add('disabledbutton');
  }

  clear() {
    this._diff.length = 0;
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
    if (this._pos <= (this._diff.length - 1)) {
      this._pos++;
      this.apply_snapshot();
    }
  }

  unload() {
    this.clear();
    this._snap_timer && clearTimeout(this._snap_timer);
    this._editor.eve.off('scheme_changed', this.scheme_changed);
    this._editor.eve.off('scheme_snapshot', this.scheme_snapshot);
    for (const fld in this) {
      delete this[fld];
    }
  }

};


