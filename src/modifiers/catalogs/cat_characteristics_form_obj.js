// индивидуальная форма объекта характеристики
$p.cat.characteristics.form_obj = function (pwnd, attr, handlers) {

  const _meta = this.metadata();

  attr.draw_tabular_sections = function (o, wnd, tabular_init) {

    _meta.form.obj.tabular_sections_order.forEach((ts) => {
      if(ts == 'specification') {
        // табчасть со специфическим набором кнопок
        tabular_init('specification', $p.injected_data['toolbar_characteristics_specification.xml']);
        wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent('onclick', (btn_id) => {

          if(btn_id == 'btn_origin') {
            const selId = wnd.elmnts.grids.specification.getSelectedRowId();
            if(selId && !isNaN(Number(selId))) {
              return o.open_origin(Number(selId) - 1);
            }

            $p.msg.show_msg({
              type: 'alert-warning',
              text: $p.msg.no_selected_row.replace('%1', 'Спецификация'),
              title: o.presentation,
            });
          }

        });
      }
      else {
        tabular_init(ts);
      }
    });
  };

  return this.constructor.prototype.form_obj.call(this, pwnd, attr)
    .then((res) => {
      if(res) {
        o = res.o;
        wnd = res.wnd;
        wnd.close_confirmed = true;
        wnd.elmnts.frm_toolbar.attachEvent('onclick', (btn_id) => {
          if(btn_id === 'btn_history') {
            $p.dp.buyers_order.open_component(wnd, {ref: o.ref, cmd: {hfields: null, db: null}, _mgr: this}, handlers, 'ObjHistory');
          }
        });
        return res;
      }
    });
};
