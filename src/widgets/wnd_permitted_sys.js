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
    const {
      code,
      ctrlKey
    } = e;
    const {
      grid
    } = this;
    const {
      iface,
      job_prm: {
        builder
      }
    } = $p;
    const td = this.cell.firstChild;
    const ti = td.childNodes[0];
    ti.readOnly = true;
    // по {F4} открываем форму списка
    // if(code === 'F4' || (ctrlKey && code === 'KeyF')) {
    //   return this.open_selection(e);
    // }
    // по {F2} открываем форму объекта
    if (code === 'F2' && builder.client_of_dealer_mode != 'string') {
      return this.open_obj(e);
    }

    // если разрешена только форма, другие клавиши не обрабатываем
    if (builder.client_of_dealer_mode == 'frm') {
      return iface.cancel_bubble(e, true);
    }

    // по {del} очищаем значение
    if (code === 'Delete') {
      this.setValue('');
      grid.editStop();
      return iface.cancel_bubble(e);
    }
    // по {tab} добавляем неразрывный пробел
    if (code === 'Tab') {
      const {
        cell: {
          firstChild
        }
      } = this;
      firstChild.childNodes[0].value += '\u00A0';
      return iface.cancel_bubble(e);
    }
    // по {enter} заканчиваем редактирование
    if (code === 'Enter') {
      grid.editStop();
      return iface.cancel_bubble(e);
    }
  }

  // open_selection(e) {
  //   const v = this.grid.get_cell_field();
  //   if(v && v.field) {
  //     v.obj[v.field] = this.getValue();
  //     this.grid.xcell_action && this.grid.xcell_action('ClientOfDealerSearch', v.field);
  //   }
  //   return $p.iface.cancel_bubble(e);
  // }

  open_obj(e) {
    const v = this.grid.get_cell_field();
    if (v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('Sysparams', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  /**
   * Устанавливает текст в ячейке. например, this.setCValue("<input type='button' value='"+val+"'>",val);
   */
  setValue(val) {

    const v = this.grid.get_cell_field();

    if (v.obj instanceof $p.DocCalc_order) {
      const  str = v.obj.extra_fields.find({
        property: $p.cch.properties.predefined("permitted_sys")
      });
      if (str && str._obj && str._obj.txt_row.length > 0) {
        val = "Fill";

      } else {
        val = "Empty";

      }


    }

    this.setCValue(val);

    // const v = this.grid.get_cell_field();
    // var rez = "";
    // var txt_row = "";
    // if (v.obj instanceof $p.DocCalc_orderExtra_fieldsRow) {
    //   txt_row = val;
    //   return txt_row;
    // } else {
    //
    //   txt_row = v.obj.extra_fields.find({
    //     property: $p.cch.properties.predefined("permitted_sys")
    //   }).txt_row;
    //   if (val === "") {
    //     var arr = txt_row.split(',');
    //     if (arr.length) {
    //       arr.forEach((row) => {
    //         rez += $p.cat.production_params.by_ref[row].name + " | ";
    //
    //       });
    //     } else {
    //
    //       rez = "no";
    //     }
    //
    //     //console.log(rez)
    //     //this.setCValue(rez);
    //     this.setCValue(txt_row);
    //   } else {
    //     this.setCValue(val);
    //
    //   }
    // }

  }

  /**
   * Получает значение ячейки из поля ввода
   */
  getValue() {

    const {
      cell: {
        firstChild
      }
    } = this;
    if (firstChild && firstChild.childNodes.length) {
      return firstChild.childNodes[0].value;
    } else {
      const v = this.grid.get_cell_field();
      if (v.obj instanceof $p.DocCalc_orderExtra_fieldsRow) {
        return v.obj._obj.txt_row !== "" ? "Fill" : 'Empty';
        //return v.obj._obj.txt_row ;

      } else {
        return "";

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
