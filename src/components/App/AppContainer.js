import {connect} from 'react-redux';
import {loginSuccess, loginError} from '../../redux/actions/index';
import {withRouter} from 'react-router';
import {push} from 'react-router-redux';

import AppView from './AppView';

/* global $p */

// Redux action creator
const mapDispatchToProps = (dispatch) => {
  return {
    loginSuccess: (profile) => dispatch(loginSuccess(profile)),
    loginError: (error) => dispatch(loginError(error)),
    navigate: (path) => dispatch(push(path)),
    try_log_in: () => dispatch($p.rx_actions.USER_TRY_LOG_IN(
      $p.adapters.pouch, $p.job_prm.guests[0].username, $p.aes.Ctr.decrypt($p.job_prm.guests[0].password))),
  };
};

// subscribe component to Redux store updates
const pnames = ['meta_loaded', 'data_empty', 'data_loaded', 'fetch_local', 'sync_started', 'page'];
const select = ({meta}) => {
  const res = {};
  for (const name of pnames) {
    res[name] = meta[name];
  }
  return res;
};
const mapStateToProps = (state, props) => {
  return select(state);
};

const AppContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(AppView));

export default AppContainer;
