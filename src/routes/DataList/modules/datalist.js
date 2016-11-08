import $p from 'metadata'
import { LOCATION_CHANGE } from 'react-router-redux'

/**
 * Генераторы действий
 */
export const actions = {
  handleEdit: (row) => ({
    type: LOCATION_CHANGE,
    payload: {pathname:'doc_calc_order/'+row.ref, search:'',hash:''}
  }),
  handleAdd: () => (
    (dispatch, getState) => {
      $p.doc.calc_order.create()
        .then(_obj => {
          _obj._set_loaded()
          dispatch({
            type: LOCATION_CHANGE,
            payload: {pathname:'doc_calc_order/'+_obj.ref, search:'',hash:''}
          })
        })
    }),
  handleRevert: $p.rx_actions.OBJ_REVERT,
  handleMarkDeleted: $p.rx_actions.obj_mark_deleted,
  handlePost: $p.rx_actions.obj_post,
  handleUnPost: $p.rx_actions.obj_unpost,
  handlePrint(){},
  handleAttachment(){}
}

export const mapStateToProps = (state, props) => ({

  state_user: state.meta.user,
  user: $p.current_user,

})
