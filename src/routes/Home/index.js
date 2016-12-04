import HomeViewContainer from "./containers/HomeViewContainer";

// Sync route definition
export default {
	component: HomeViewContainer
}

export function HomeRoute(store) {
	return {
		path: '/',
		/*  Async getComponent is only invoked when route matches   */
		getComponent (nextState, cb) {

			/*  Return getComponent   */
			cb(null, HomeViewContainer)
		}
	}
}