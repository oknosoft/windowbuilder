import $p from "metadata";

function handleEdit(row, _mgr) {
	$p.UI.history.push(_mgr.class_name.replace('.', '_') + '/' + row.ref)
}

function handleAdd(_mgr) {
	_mgr.create()
		.then(_obj => {
			_obj._set_loaded()
			$p.UI.history.push(_obj._manager.class_name.replace('.', '_') + '/' + _obj.ref)
		})
}

/**
 * Отображение свойств на связанные генараторы действий.
 */
export function mapDispatchToProps(dispatch) {

	const {rx_actions} = $p;

	return {
		handleEdit,
		handleAdd,
		handleRevert: () => dispatch(rx_actions.OBJ_REVERT),
		handleMarkDeleted: () => dispatch(rx_actions.obj_mark_deleted),
		handlePost: () => dispatch(rx_actions.obj_post),
		handleUnPost: () => dispatch(rx_actions.obj_unpost),
		handlePrint: () => {
		},
		handleAttachment: () => {
		}
	}
}

export function mapStateToProps(state, props) {
  let _mgr = $p.md.mgr_by_class_name(props.params.meta)
  if(!_mgr){
    _mgr = $p.doc.calc_order;
    props.params.options = 'draft'
  }
	return {
		meta: state.meta,
		_mgr: _mgr,
		_acl: 'e',
    show_search: true,
    show_variants: true,
	}
}
