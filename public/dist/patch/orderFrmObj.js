
export function orderFrmObj({doc: {calc_order}}) {

  const form_obj = calc_order.form_obj.bind(calc_order);

  calc_order.form_obj = async function form_obj_patched(pwnd, attr, handlers) {
    const o = await calc_order.get(attr.hasOwnProperty("ref") ? attr.ref : attr, true, true);
    if(!o.is_new()) {
      if(o.obj_delivery_state.is('Шаблон')) {
        await o.load_templates();
      }
      else {
        await o.load_linked_refs();
      }
      o._data._loading = true;
    }
    return form_obj(pwnd, attr, handlers)
      .then(res => {
        o._data._loading = false;
        return res;
      });
  };

}
