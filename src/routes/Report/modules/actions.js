import $p from "metadata";
const {rx_actions} = $p;

/**
 * Генераторы действий
 */
export const actions = {
	handleSave: rx_actions.OBJ_SAVE,
	handleRevert: rx_actions.OBJ_REVERT,
	handleMarkDeleted: rx_actions.obj_mark_deleted,
	handlePost: rx_actions.obj_post,
	handleUnPost: rx_actions.obj_unpost,
	handlePrint(){
	},
	handleAttachment(){
	},
	handleValueChange: rx_actions.OBJ_VALUE_CHANGE,
	handleAddRow: rx_actions.OBJ_ADD_ROW,
	handleDelRow: rx_actions.OBJ_DEL_ROW,

	handleClose: () => (dispatch, getState) => $p.UI.history.push('/')
}

/**
 * Отображение свойств
 * @param state
 * @param props
 */
export const mapStateToProps = (state, props) => {

	const _mgr = $p.md.mgr_by_class_name(props.params.meta);
  const _obj = _mgr.get();

	return {
		meta: state.meta,
		_mgr: _mgr,
		_obj: _obj,
		_acl: 'e'
	}
}
