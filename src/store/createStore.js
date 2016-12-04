import {applyMiddleware, compose, createStore} from "redux";
import {routerMiddleware} from "react-router-redux";
import thunk from "redux-thunk";
import makeRootReducer from "./reducers";
/* global __DEBUG__ */

// функция, создающая store для redux
export default (initialState = {}, history) => {

	// ======================================================
	// Middleware Configuration
	// ======================================================
	const middleware = [thunk, routerMiddleware(history)]

	// ======================================================
	// Store Enhancers
	// ======================================================
	const enhancers = []
	if (__DEBUG__) {
		const devToolsExtension = window.devToolsExtension
		if (typeof devToolsExtension === 'function') {
			enhancers.push(devToolsExtension())
		}
	}

	// ======================================================
	// Store Instantiation and HMR Setup
	// ======================================================
	const store = createStore(
		makeRootReducer(),
		initialState,
		compose(
			applyMiddleware(...middleware),
			...enhancers
		)
	)
	store.asyncReducers = {}

	if (module.hot) {
		module.hot.accept('./reducers', () => {
			const reducers = require('./reducers').default
			store.replaceReducer(reducers(store.asyncReducers))
		})
	}

	/**
	 * Отобразить последние действие в консоли.
	 * Display last action in console.
	 */
	if (__DEBUG__) {
		store.subscribe(function () {
			const lastAction = store.getState().lastAction;
			console.log(lastAction);
		});
	}

	return store
}
