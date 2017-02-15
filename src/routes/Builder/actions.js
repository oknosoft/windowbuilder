import $p from "metadata";

function handleClose() {

	return function (dispatch, getState) {
		$p.UI.history.push('/')
	}
}

/**
 * Генераторы действий
 */
export const actions = {
	handleSave: $p.rx_actions.OBJ_SAVE,
	handleRevert: $p.rx_actions.OBJ_REVERT,
	handleMarkDeleted: $p.rx_actions.obj_mark_deleted,
	handlePost: $p.rx_actions.obj_post,
	handleUnPost: $p.rx_actions.obj_unpost,
	handlePrint(){
	},
	handleAttachment(){
	},
	handleValueChange: $p.rx_actions.OBJ_VALUE_CHANGE,
	handleAddRow: $p.rx_actions.OBJ_ADD_ROW,
	handleDelRow: $p.rx_actions.OBJ_DEL_ROW,

	handleClose
}

/**
 * Отображение свойств
 * @param state
 * @param props
 */
export const mapStateToProps = (state, props) => {

	const _mgr = $p.md.mgr_by_class_name(props.params.meta),
		_obj = _mgr.get(props.params.guid);

	return {
		meta: state.meta,
		_mgr: _mgr,
		_obj: _obj,
		_acl: 'e'
	}
}
