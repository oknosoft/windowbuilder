//import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'login',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
     and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
       dependencies for bundling   */
      const LoginContainer = require('./containers/LoginContainer').default

      /*  Add the reducer to the store on key 'counter'  */
      // const reducer = require('./modules/login').default
      // injectReducer(store, { key: 'login', reducer })

      /*  Return getComponent   */
      cb(null, LoginContainer)

      /* Webpack named bundle   */
    }, 'app')
  }
})
