/**
 * Самый верхний уровень
 */

import React, { Component, PropTypes } from 'react'
import { Router } from 'react-router'
import { Provider } from 'react-redux'
import { LOCATION_CHANGE } from 'react-router-redux'

// стили для react-data-grid
import 'metadata-react-ui/react-data-grid.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'

// стили MuiTheme для material-ui
import MuiThemeProvider, { styles, muiTheme } from './MuiTheme';

// функция установки параметров сеанса
import settings from '../metadata/settings'

// функция инициализации структуры метаданных
import meta_init from '../metadata/init'

import $p from 'metadata'

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

    // меняем подписки на события pouchdb
    $p.adapters.pouch.removeAllListeners('pouch_no_data');
    $p.adapters.pouch.on('pouch_no_data', () => {

      const {username, password} = $p.job_prm.guests[0]

      // информируем систему о первом запуске
      store.dispatch(
        $p.rx_actions.POUCH_NO_DATA($p.adapters.pouch, username, $p.aes.Ctr.decrypt(password))
      )

      setTimeout(function () {
        // попытка авторизации под гостевым пользователем
        store.dispatch(
          $p.rx_actions.USER_TRY_LOG_IN($p.adapters.pouch, username, $p.aes.Ctr.decrypt(password))
        )
      })

    });

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
