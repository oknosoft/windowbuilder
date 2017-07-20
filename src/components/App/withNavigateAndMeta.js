import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {push} from 'react-router-redux';

import withMeta from 'metadata-redux/src/withMeta';

// Redux action creator
const mapDispatchToProps = (dispatch) => ({
  navigate: (path) => dispatch(push(path)),
});

const mapStateToProps = (state, props) => ({
  path_log_in: !!props.location.pathname.match(/\/login$/)
});


export default (View) => {
  const withNavigate = connect(mapStateToProps, mapDispatchToProps)(withRouter(View));
  return withMeta(withNavigate);
};
