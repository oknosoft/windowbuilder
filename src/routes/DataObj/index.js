// import { injectReducer } from '../../store/reducers'
import $p from 'metadata'

import AppContainer from 'components/AppContainer'

import DumbLoader from 'components/DumbLoader'

export default (store) => ({

  path: ':meta/:guid(/:form)(/:options)',

  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {

      /*  Add the reducer to the store on key 'counter'  */
      // const reducer = require('./modules/dataobjReducer').default
      // injectReducer(store, { key: 'counter', reducer })

      const _mgr = $p.md.mgr_by_class_name(nextState.params.meta);

      if(_mgr && store.getState().meta.data_loaded){

        const _obj = _mgr.get(nextState.params.guid)

        /*  Webpack - use require callback to define
         dependencies for bundling   */
        const DataObjContainer = nextState.params.meta == 'rep_materials_demand' ?
          require('./containers/ReportContainer').default : require('./containers/DataObjContainer').default

        if(_obj instanceof Promise){
          _obj.then(function (_obj) {
            if(_obj.is_new()){

              setTimeout(function () {
                AppContainer.handleLocationChange(store, '/')
              })

            }else{
              /*  Return getComponent   */
              cb(null, DataObjContainer)
            }
          })
        }else{
          /*  Return getComponent   */
          cb(null, DataObjContainer)
        }

      }else{
        /*  Return getComponent   */
        cb(null, DumbLoader)
        setTimeout(function () {
          AppContainer.handleLocationChange(store, nextState.location.pathname)
        }, 3000)
      }


    /* Webpack named bundle   */
    }, 'app')
  }
})
