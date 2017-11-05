import {combineReducers} from 'redux';
import {routerReducer as router} from 'react-router-redux';

import iface from './iface';

// дополнительные события pouchdb, с подключенными основными событиями
import {customPouchReducer as meta} from './pouchdb';

const reducer = combineReducers({
  meta,
  iface,
  router,
});
export default reducer;
