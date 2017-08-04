import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import {metaReducer as meta} from 'metadata-redux';
import iface from './iface';

const reducer = combineReducers({
  meta,
  iface,
  router,
});
export default reducer;
