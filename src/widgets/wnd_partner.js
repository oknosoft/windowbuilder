/**
 * Поле ввода контрагента
 *
 */
class eXcell_partner extends eXcell {

  constructor(cell) {
    super(cell);
    if (cell){
      this.cell = cell;
      this.open_selection = this.open_selection.bind(this);
      this.open_obj = this.open_obj.bind(this);
      this.combo_change = this.combo_change.bind(this);
      this.edit = eXcell_partner.prototype.edit.bind(this);
      this.detach = eXcell_partner.prototype.detach.bind(this);
    }
  }

  get grid() {
    return this.cell.parentNode.grid;
  }

  ti_keydown(e) {
    const {code, ctrlKey} = e;
    const {grid} = this;
    // по {F4} открываем форму списка
    if(code === 'F4' || (ctrlKey && code === 'KeyF')) {
      return this.open_selection(e);
    }
    // по {F2} открываем форму объекта
    if(code === 'F2') {
      return this.open_obj(e);
    }

    // по {enter} заканчиваем редактирование
    if(code === 'Enter') {
      // если текст только цифры длиной 10 или 12 символов, запрашиваем на сервере
      grid.editStop();
      return $p.iface.cancel_bubble(e);
    }
  }

  open_selection(e) {
    const v = this.grid.get_cell_field();
    if(v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('PartnersList', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  open_obj(e) {
    const v = this.grid.get_cell_field();
    if(v?.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('PartnerObj', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  get_option_list({_attr, _dhtmlx, _top, presentation, ...other}) {
    const curr = _attr.grid.get_cell_value();
    const query = {
      selector: {
        $and: [
          {class_name: this.class_name},
          ...Object.keys(other).map(fld => ({[fld]: other[fld]})),
        ],
      },
      fields: ['ref', 'id', 'inn', 'name'],
      limit: _top,
    };
    if(presentation) {
      query.selector.$and.push({search: presentation.like});
    }
    return this.adapter.fetch('/r/_find', {
      method: 'POST',
      body: JSON.stringify(query),
    })
    //return this.get_option_list(other)
      .then((res) => res.json())
      .then(({docs}) => {
        if(curr && !curr.empty() && !docs.find(({ref}) => ref == curr)) {
          // res.unshift({
          //   text: curr.presentation,
          //   value: curr.ref,
          //   selected: true,
          // });
        }
        return docs.map(v => ({
          text: v.name,
          value: v.ref,
        }));
      });
  }

  combo_change() {
    const {combo, grid} = this;
    const curr = grid.get_cell_field();
    if(curr?.field) {
      let val = combo.getSelectedValue();
      if(!val && combo.getComboText()){
        val = combo.getOptionByLabel(combo.getComboText());
        if(val){
          val = val.value;
        }
        else{
          combo.setComboText("");
        }
      }
      curr.obj[curr?.field] = val;
    }
  }

  /**
   * @summary Устанавливает текст в ячейке
   * @desc например, this.setCValue("<input type='button' value='"+val+"'>",val);
   */
  setValue(val, fld) {
    this.setCValue(val?.presentation || val || '');
  }

  /**
   * Получает значение ячейки из поля ввода
   */
  getValue() {
    return this.grid.get_cell_value();
  }

  shiftNext() {
    this.grid.editStop();
  }

  /**
   * Создаёт элементы управления редактора и назначает им обработчики
   */
  edit() {
    if(this.combo) {
      return;
    }

    this.val = this.getValue();		//save current value
    const {cell, grid, get_option_list, combo_change} = this;
    cell.innerHTML = "";
    this.combo = new $p.iface.OCombo({parent: cell, grid, get_option_list}._mixin(grid.get_cell_field()));
    const dhxevs = this.combo.dhxevs.data.onchange;
    Object.keys(dhxevs).forEach(key => delete dhxevs[key]);
    this.combo.attachEvent('onChange', combo_change);
    this.combo.getInput().focus();
  }

  /**
   * Вызывается при отключении редактора
   */
  detach() {
    if(this.combo){
      if(this.combo.getComboText){
        this.setValue(this.combo.getComboText());         // текст в элементе управления
        if(!this.combo.getSelectedValue()) {
          this.combo.callEvent("onChange");
        }
        let res = !$p.utils.is_equal(this.val, this.getValue());// compares the new and the old values
        this.combo.unload();
        return res;
      }
      else if(this.combo.unload){
        this.combo.unload();
      }
    }
    return false;				// compares the new and the old values
  }

}
window.eXcell_partner = eXcell_partner;

