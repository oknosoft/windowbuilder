import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'

// редюсер metadata.js
import $p from '../metadata'

// редюсер событий интерфейса
import ifaceReducer from './ifaceReducer'

export const makeRootReducer = (asyncReducers = {}) => {

  return combineReducers({
    // Add sync reducers here
    meta: $p.rx_reducer,
    iface: ifaceReducer,
    router,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
