import $p from 'metadata'
import { LOCATION_CHANGE } from 'react-router-redux'

// ------------------------------------
// Actions
// ------------------------------------

function handleScan(s){

  return function (dispatch, getState) {

    dispatch({
      type: 'SCAN',
      payload: s
    })

    $p.doc.planning_event.create({number_doc: s})
      .then(doc => doc.save())
      .then(dispatch($p.rx_actions.POUCH_SYNC_DATA('doc', true)))
      .catch(err => console.log(err))
  }

}

function handleMarkDeleted(row){

  return function (dispatch, getState) {

    $p.doc.planning_event.get(row.ref, 'promise')
      .then(doc => doc.mark_deleted(true))
      .then(dispatch($p.rx_actions.POUCH_SYNC_DATA('doc', true)))
      .catch(err => console.log(err))
  }

}

/**
 * Генераторы действий
 */
export const actions = {

  handleEdit: (row) => ({
    type: LOCATION_CHANGE,
    payload: {pathname:'doc_calc_order/'+row.ref, search:'',hash:''}
  }),
  handleRevert: $p.rx_actions.OBJ_REVERT,
  handlePost: $p.rx_actions.obj_post,
  handleUnPost: $p.rx_actions.obj_unpost,
  handlePrint(){},
  handleAttachment(){},

  handleScan,
  handleMarkDeleted

}
