import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {push} from 'react-router-redux';

import HeaderView from './HeaderView';



// subscribe component to Redux store updates
const mapStateToProps = (state, props) => {

  const {meta, iface} = state;

  return Object.assign({}, {
    sync_started: meta.sync_started,
    items,
    show_indicator: true,
    sync_tooltip: 'sync_tooltip',
    notifications_tooltip: 'notifications_tooltip',
    button_label: 'user',
  });
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleNavigate: (path) => dispatch(push(path)),
  };
};

const HeaderContainer = withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderView));

export default HeaderContainer;
