/**
 *
 *
 * @module scheme_change
 *
 * Created by Evgeniy Malyarov on 22.04.2019.
 */


export default function handleSchemeChange(scheme) {
  const {current_user} = $p;
  if(current_user){
    if(scheme._data._inited) {
      return;
    }
    scheme._data._inited = true;
    if(!current_user.branch.empty()) {
      apply_ref_filter('manager', [current_user.ref], scheme, 'cat.users');
    }
    else {
      apply_ref_filter('obj_delivery_state', [], scheme);
    }
  }
}

export function apply_ref_filter(left_value, objs, scheme, class_name) {
  const {selection} = scheme || this.props.scheme || {};
  if(!selection) {
    return;
  }
  let row = selection.find({left_value});
  if(!row) {
    row = selection.add({left_value});
  }
  if(!objs.length) {
    row.use = false;
    return;
  }
  row.use = true;
  row.left_value_type = 'path';
  row.right_value_type = class_name || this[left_value]._mgr.class_name;

  // для статусов отбор особый
  if(left_value === 'obj_delivery_state') {
    const tmp = [];
    for(const ref of objs) {
      if(ref === 'draft') {
        tmp.push('Черновик');
        tmp.push('Отозван');
      }
      else if(ref === 'sent') {
        tmp.push('Отправлен');
      }
      else if(ref === 'confirmed') {
        tmp.push('Подтвержден');
      }
      else if(ref === 'declined') {
        tmp.push('Отклонен');
      }
      else if(ref === 'template') {
        tmp.push('Шаблон');
      }
    }
    objs = tmp;
  }

  if(objs.length > 1) {
    row.comparison_type = 'in';
    row.right_value = objs.join();
  }
  else {
    row.comparison_type = 'eq';
    row.right_value = objs[0];
  }
}
