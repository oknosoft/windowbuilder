import $p from 'metadata'

// ------------------------------------
// Actions
// ------------------------------------
function handleLogin (login, password) {
  return $p.rx_actions.USER_TRY_LOG_IN($p.adapters.pouch, login, password)
}

function handleLogOut () {
  return $p.rx_actions.USER_LOG_OUT($p.adapters.pouch)
}

function handleSetPrm (attr) {
  for(var key in attr){
    $p.wsql.set_user_param(key, attr[key]);
  }
  return $p.rx_actions.PRM_CHANGE(attr)
}

export const actions = {

  handleLogin,
  handleLogOut,
  handleSetPrm,

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

}

export const mapStateToProps = (state, props) => ({

  login: $p.wsql.get_user_param("user_name"),
  password: $p.aes.Ctr.decrypt($p.wsql.get_user_param("user_pwd")),

  state_user: state.meta.user,

  _obj: $p.current_user,
  _mgr: $p.cat.users,
  _acl: 'e',

  zone: $p.wsql.get_user_param("zone"),
  couch_path: $p.wsql.get_user_param("couch_path"),
  couch_suffix: $p.wsql.get_user_param("couch_suffix"),
  enable_save_pwd: !!$p.wsql.get_user_param("enable_save_pwd"),

})
