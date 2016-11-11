
import { LOCATION_CHANGE } from 'react-router-redux'

import $p from 'metadata'


/**
 * Генераторы действий
 */
export const actions = {
  handleSave: $p.rx_actions.OBJ_SAVE,
  handleRevert: $p.rx_actions.OBJ_REVERT,
  handleMarkDeleted: $p.rx_actions.obj_mark_deleted,
  handlePost: $p.rx_actions.obj_post,
  handleUnPost: $p.rx_actions.obj_unpost,
  handlePrint(){},
  handleAttachment(){},
  handleValueChange: $p.rx_actions.OBJ_VALUE_CHANGE,
  handleAddRow: $p.rx_actions.OBJ_ADD_ROW,
  handleDelRow: $p.rx_actions.OBJ_DEL_ROW,
  handleClose: () => ({
    type: LOCATION_CHANGE,
    payload: {pathname:'/', search:'',hash:''}
  }),
}

/**
 * Отображение свойств
 * @param state
 * @param props
 */
export const mapStateToProps = (state, props) => {

  const _mgr = $p.md.mgr_by_class_name(props.params.meta),
    _obj = _mgr.get(props.params.guid);

  if(props.params.meta == 'rep_materials_demand' && !_obj.production.count()){
    _obj.production.add({qty: 1})
    _obj.specification.add({qty: 1})
  }

  return {
    meta: state.meta,
    _mgr: _mgr,
    _obj: _obj,
    _acl: 'e'
  }
}
