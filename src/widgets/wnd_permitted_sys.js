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
class eXcell_permitted_sys extends eXcell {

  constructor(cell) {

    if (!cell) {
      return;
    }

    super(cell);

    this.cell = cell;
    // this.open_selection = this.open_selection.bind(this);
    this.open_obj = this.open_obj.bind(this);
    this.edit = eXcell_permitted_sys.prototype.edit.bind(this);
    this.detach = eXcell_permitted_sys.prototype.detach.bind(this);

  }

  get grid() {
    return this.cell.parentNode.grid;
  }

  ti_keydown(e) {
    const {code, ctrlKey} = e;
    const {grid} = this;
    const {iface, job_prm: {builder}} = $p;
    const td = this.cell.firstChild;
    const ti = td.childNodes[0];
    ti.readOnly = true;
    // по {F4} открываем форму списка
    // if(code === 'F4' || (ctrlKey && code === 'KeyF')) {
    //   return this.open_selection(e);
    // }
    // по {F2} открываем форму объекта, другие клавиши не обрабатываем
    return code === 'F2' ? this.open_obj(e) : iface.cancel_bubble(e, true);
  }

  open_obj(e) {
    let v = this.grid.get_cell_field();
    if (!v) {
      this.grid._obj._extra('permitted_sys', '');
      v = this.grid.get_cell_field();
    }
    v && v.field && this.grid.xcell_action && this.grid.xcell_action('Sysparams', v.field);
    return $p.iface.cancel_bubble(e);
  }

  /**
   * Устанавливает текст в ячейке. например, this.setCValue("<input type='button' value='"+val+"'>",val);
   */
  setValue(val) {
    const v = this.getValue();
    this.setCValue(v);
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
      const empty = 'Любые системы';
      const {DocCalc_orderExtra_fieldsRow, cat} = $p;
      if(v && v.obj instanceof DocCalc_orderExtra_fieldsRow) {
        const refs = v.obj.txt_row.split(',');
        return refs.length ? refs.map((ref) => cat.production_params.get(ref).name).join(', ') : empty;
      }
      else {
        return empty;
      }
    }
  }

  /**
   * Создаёт элементы управления редактора и назначает им обработчики
   */
  edit() {

    this.val = this.getValue(); //save current value
    this.cell.innerHTML = `<div class="ref_div21"><input type="text" class="dhx_combo_edit" style="height: 20px;"><div class="ref_ofrm21" title="Открыть форму ввода по реквизитам {F2}">&nbsp;</div></div>`;

    const {
      cell: {
        firstChild
      },
      val
    } = this;
    const ti = firstChild.childNodes[0];
    ti.value = val;
    ti.readOnly = true;
    ti.onclick = $p.iface.cancel_bubble; //blocks onclick event
    ti.focus();
    ti.onkeydown = this.ti_keydown.bind(this);
    firstChild.childNodes[1].onclick = this.open_obj;
      }

  /**
   * Вызывается при отключении редактора
   */
  detach() {
    const val = this.getValue();
    val !== null && this.setValue(val);
    return true; /*!$p.utils.is_equal(this.val, this.getValue()); // compares the new and the old values*/
  }

}
window.eXcell_permitted_sys = eXcell_permitted_sys;
