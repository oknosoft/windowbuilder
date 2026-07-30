/**
 * Поле ввода контрагента
 *
 */
class eXcell_partner extends eXcell {

  constructor(cell) {
    super(cell);
    if (cell){
      this.cell = cell;
      this.combo_change = this.combo_change.bind(this);
      this.edit = eXcell_partner.prototype.edit.bind(this);
      this.detach = eXcell_partner.prototype.detach.bind(this);
    }
  }

  get grid() {
    return this.cell.parentNode.grid;
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

    function fin(rows) {
      if(presentation?.like) {
        const {like} = presentation;
        if((like.length === 10 || like.length === 12) && /^\d*$/.test(like)) {
          if(!rows.find(v => v.inn === like)) {
            rows.unshift({
              name: `Создать по ИНН ${like}`,
              ref: parseInt(like, 10),
            });
          }
        }
      }
      return rows.map(v => ({
        text: v.name,
        value: v.ref,
      }))
    }

    const {adapter, _owner: {branches, partners, $p: {utils}}} = this;
    let currentBranch = sessionStorage.branch && sessionStorage.branch !== utils.blank.guid && branches.get(sessionStorage.branch);
    if(currentBranch?.partners?.count() && currentBranch.partners.count() < 200) {
      const res = new Set(), refs = new Set();
      for(const {acl_obj} of currentBranch.partners) {
        if(acl_obj && !acl_obj.empty()) {
          res.add(acl_obj);
          if(acl_obj.is_new()) {
            refs.add(acl_obj.ref);
          }
        }
      }
      return (refs.size ? adapter.load_array(partners, Array.from(refs)) : Promise.resolve())
        .then(() => {
          let all = Array.from(res).map(v => ({class_name: partners.class_name, ...v._obj}));
          if(all.length > 5) {
            const selector = {};
            for(const elm of query.selector.$and){
              const key = Object.keys(elm)[0];
              if(key === 'search') {
                const like = elm[key];
                selector.presentation = (o) => {
                  return ['name', 'inn', 'id'].some((fld) => utils._like(o[fld], like));
                };
              }
              else {
                selector[key] = elm[key];
              }
            }
            all = utils._find_rows(all, selector).sort(utils.sort('name'));
          }
          return fin(all);
        });
    }

    return adapter.fetch('/r/_find', {method: 'POST', body: JSON.stringify(query)})
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
        return fin(docs);
      });
  }

  combo_change() {
    const {combo, grid} = this;
    const {ui: {dialogs}, cat: {partners}, adapters: {pouch}} = $p;
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
      if(typeof val === 'number') {
        curr.obj[curr.field] = '';
        pouch.fetch(`/r/partners/${val}`)
          .then((res) => res.json())
          .then((raw) => {
            if(raw.error) {
              throw raw.message;
            }
            if(Array.isArray(raw)) {
              dialogs.alert({
                timeout: 0,
                title: `Контрагент по ИНН`,
                Component: partners.DialogCreate,
                props: {raw, obj: curr.obj},
                //initFullScreen: true,
                hide_btn: true,
                //noSpace: true,
              });
              raw;
            }
          })
          .catch((err) => {
            //setValue(obj[fld]);
            dialogs.alert({
              title: 'Контрагент по ИНН',
              text: err?.message || err,
            });
          });
      }
      else {
        const partner = partners.get(val);
        (partner.is_new() ? partner.load() : Promise.resolve())
          .then(() => {
            curr.obj[curr.field] = partner;
            partners.search.handleSelect(partner);
          });
      }
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

