/* Динамическая подгрузка компонента без редюсера  */
//import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: ':meta/list(/:options)(/:form)',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
     and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {

      /*  Webpack - use require callback to define
       dependencies for bundling   */
      const DataListContainer = require('./containers/DataListContainer').default

      /*  Add the reducer to the store on key 'dynlist'  */
      // const reducer = require('./modules/dynlist').default
      // injectReducer(store, { key: 'dynlist', reducer })

      /*  Return getComponent   */
      cb(null, DataListContainer)

      /* Webpack named bundle   */
    }, 'app')
  }
})
