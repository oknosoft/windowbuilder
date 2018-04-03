/**
 * Поле ввода адреса связанная с ним форма ввода адреса
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  wnd_oaddress
 */


/**
 *  Конструктор поля ввода клиента дилера
 */
class eXcell_client extends eXcell {

  constructor(cell) {

    if (!cell){
      return;
    }

    super(cell);

    this.cell = cell;
    this.open_selection = this.open_selection.bind(this);
    this.open_obj = this.open_obj.bind(this);
    this.edit = eXcell_client.prototype.edit.bind(this);
    this.detach = eXcell_client.prototype.detach.bind(this);

  }

  get grid() {
    return this.cell.parentNode.grid;
  }

  ti_keydown(e) {
    const {code, ctrlKey} = e;
    const {grid} = this;
    // по {del} очищаем значение
    if(code === 'Delete') {
      this.setValue('')
      grid.editStop();
      return $p.iface.cancel_bubble(e);
    }
    // по {tab} добавляем неразрывный пробел
    else if(code === 'Tab') {
      const {cell: {firstChild}} = this;
      firstChild.childNodes[0].value += '\u00A0';
      return $p.iface.cancel_bubble(e);
    }
    // по {enter} заканчиваем редактирование
    else if(code === 'Enter') {
      grid.editStop();
      return $p.iface.cancel_bubble(e);
    }
    // по {F4} открываем форму списка
    else if(code === 'F4' || (ctrlKey && code === 'KeyF')) {
      return this.open_selection(e);
    }
    // по {F2} открываем форму объекта
    else if(code === 'F2') {
      return this.open_obj(e);
    }
  }

  open_selection(e) {
    const v = this.grid.get_cell_field();
    if(v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('ClientOfDealerSearch', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  open_obj(e) {
    const v = this.grid.get_cell_field();
    if(v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('ClientOfDealer', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  /**
   * Устанавливает текст в ячейке. например, this.setCValue("<input type='button' value='"+val+"'>",val);
   */
  setValue(val, fld) {
    const v = this.grid.get_cell_field();
    if(v && v.field && (!fld || v.field === fld) && v.obj[v.field] !== val) {
      v.obj[v.field] = val;
    }
    this.setCValue(val);
  }

  /**
   * Получает значение ячейки из поля ввода
   */
  getValue() {
    const {cell: {firstChild}} = this;
    if(firstChild && firstChild.childNodes.length) {
      return firstChild.childNodes[0].value;
    }
    else {
      const v = this.grid.get_cell_field();
      return v && v.field ? v.obj[v.field] : '';
    }

  }

  /**
   * Создаёт элементы управления редактора и назначает им обработчики
   */
  edit() {

    this.val = this.getValue();		//save current value
    this.cell.innerHTML = '<div class="ref_div21"><input type="text" class="dhx_combo_edit" style="height: 20px;"><div class="ref_field21">&nbsp;</div></div>';

    const {cell: {firstChild}, val} = this;
    const ti = firstChild.childNodes[0];
    ti.value = val;
    ti.onclick = $p.iface.cancel_bubble;		//blocks onclick event
    ti.focus();
    ti.onkeydown = this.ti_keydown.bind(this);
    firstChild.childNodes[1].onclick = this.open_obj;
  };

  /**
   * Вызывается при отключении редактора
   */
  detach() {
    const val = this.getValue();
    val !== null && this.setValue(val);
    return !$p.utils.is_equal(this.val, this.getValue());				// compares the new and the old values
  }

}
window.eXcell_client = eXcell_client;

