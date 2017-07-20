import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import {metaReducer as meta} from 'metadata-redux';
import iface from './iface';
import auth from './auth';

const reducer = combineReducers({
  meta,
  iface,
  auth,
  router,
});
export default reducer;