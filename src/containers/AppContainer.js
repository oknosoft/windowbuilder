/**
 * Самый верхний уровень
 */

import React, { Component, PropTypes } from 'react'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import { LOCATION_CHANGE } from 'react-router-redux'

// стили для react-data-grid
import 'metadata-react-ui/react-data-grid.css'
import 'react-flex-layout/react-flex-layout-splitter.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'

// стили MuiTheme для material-ui
import MuiThemeProvider, { styles, muiTheme } from './MuiTheme';

// функция установки параметров сеанса
import settings from '../metadata/settings'

// функция инициализации структуры метаданных
import meta_init from '../metadata/init'

// собственно, metaengine
import $p from 'metadata'

// модификатор отчета materials_demand
import materials_demand from '../metadata/reports/materials_demand'


export function handleLocationChange(store, pathname, search = '', hash = ''){
  store.dispatch({
    type: LOCATION_CHANGE,
    payload: {pathname, search, hash}
  })
}

class AppContainer extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  static childContextTypes = {
    $p: React.PropTypes.object.isRequired,
    handleLocationChange: React.PropTypes.func.isRequired
  };

  getChildContext() {
    return {
      $p,
      handleLocationChange: this.handleLocationChange
    };
  }

  constructor (props) {

    super(props);

    const { store } = props

    this.handleLocationChange = function(pathname, search = '', hash = ''){
      handleLocationChange(store, pathname, search, hash)
    }

  }

  // вызывается один раз на клиенте и сервере при подготовке компонента
  componentWillMount() {

    const { store } = this.props

    // инициализируем параметры сеанса и метаданные
    $p.wsql.init(settings, meta_init);

    // подключаем обработчики событий плагином metadata-redux
    $p.rx_events(store);

    // выполняем модификаторы
    materials_demand($p)

    // информируем хранилище о готовности MetaEngine
    store.dispatch($p.rx_actions.META_LOADED($p))

    // читаем локальные данные в ОЗУ
    return $p.adapters.pouch.load_data();

  }

  render () {

    const { history, routes, store } = this.props

    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={ styles.container }>
            <Router history={history} children={routes} />
          </div>
        </MuiThemeProvider>
      </Provider>
    )
  }
}

export default AppContainer
