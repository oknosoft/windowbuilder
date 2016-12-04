import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'

// редюсер metadata.js
import $p from '../metadata'

// редюсер событий интерфейса
import ifaceReducer from './ifaceReducer'

// логирование последнего действия
import lastActionReducer from './lastActionReducer';

export const makeRootReducer = (asyncReducers = {}) => {

	return combineReducers({
		// Add sync reducers here
		meta: $p.rx_reducer,
		iface: ifaceReducer,
		lastAction: lastActionReducer,
		router,
		...asyncReducers
	})
}

export const injectReducer = (store, { key, reducer }) => {
	store.asyncReducers[key] = reducer
	store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
