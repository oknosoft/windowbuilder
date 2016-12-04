/* Динамическая подгрузка компонента без редюсера  */

export default (store) => ({
	path: '/about',
	/*  Async getComponent is only invoked when route matches   */
	getComponent (nextState, cb) {
		/*  Webpack - use 'require.ensure' to create a split point
		 and embed an async module loader (jsonp) when bundling   */
		require.ensure([], (require) => {
			/*  Webpack - use require callback to define
			 dependencies for bundling   */
			const FrmAbout = require('components/About').default

			/*  Return getComponent   */
			cb(null, FrmAbout)

			/* Webpack named bundle   */
		}, 'about')
	}
})
