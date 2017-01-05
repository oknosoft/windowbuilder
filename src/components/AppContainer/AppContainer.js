/**
 * Самый верхний уровень - провайдер redux и router
 * Здесь же, подключаем индикатор состояния загрузки приложения
 * и обработчик роутинга на login при первом запуске
 */

import React, {Component, PropTypes} from "react";
import {Router} from "react-router";
import {Provider} from "react-redux";

import "metadata-react-ui/combined.css";
import "metadata-react-ui/react-data-grid.css";
import "metadata-react-ui/metadata-react-ui.css";
import "react-virtualized/styles.css";
import "styles/core.scss";
//import 'react-flex-layout/react-flex-layout-splitter.css'

// заставка "загрузка занных"
import DumbScreen from "components/DumbLoader/DumbScreen";

// стили MuiTheme для material-ui
import MuiThemeProvider, {styles, muiTheme} from "./AppMuiTheme";

// собственно, metaengine и скрипт инициализации структуры метаданных и модификаторы
import $p, {init} from "metadata";


export default class AppContainer extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  // эти свойства будут доступны в контексте детей
  static childContextTypes = {
    $p: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  getChildContext() {
    const {store, history} = this.props
    return {
      $p,
      store,
      history
    }
  }

  constructor(props) {
    super(props)
    $p.UI.history = props.history
  }

  // TODO: перенести генератор событий начальной загрузки в metadata-redux
  subscriber(store) {

    function select(state) {

      const {meta} = state,
        res = {};

      pnames.forEach(function (name) {
        res[name] = meta[name]
      })

      return res
    }

    let t = this,
      pnames = ['meta_loaded', 'data_empty', 'data_loaded', 'fetch_local', 'sync_started', 'page'],
      current_state = select(store.getState());

    function handleChange() {
      let previous_state = current_state
      current_state = select(store.getState())

      pnames.some(function (name) {
        if (current_state[name] != previous_state[name]) {
          t.setState(current_state)
          return true;
        }
      })
    }

    return handleChange

  }

  // вызывается один раз на клиенте и сервере при подготовке компонента
  componentWillMount() {

    const {store} = this.props

    init(store, this.subscriber(store))
      .catch(function (err) {
        console.log(err)
      })

  }

  render() {

    const {history, routes, store} = this.props

    const meta = store.getState().meta

    // при первом старте и при загрузке данных, минуя роутинг показываем заставку
    // если пустые данные, перебрасываем на страницу авторизации
    //
    // TODO: если гостевая зона и указан пользователь по умолчанию - делаем попытку входа в программу
    //
    // TODO: все строки сообщений переместить в i18.js
    //
    // if(!meta_loaded) - заглушка заставка
    // if(data_empty && route.path != '/login') - перебросить в login
    // if(fetch_local && !data_loaded)

    if (!meta.meta_loaded) {
      return (
        <DumbScreen />
      )
    }

    // если это первый запуск...
    if (meta.data_empty) {

      // если это гостевая зона и задан пользователь по умолчанию - пытаемся авторизоваться
      if ($p.job_prm.guests.length && $p.job_prm.zone_demo == $p.wsql.get_user_param('zone')) {
        if (!$p.wsql.get_user_param("user_name")) {
          store.dispatch($p.rx_actions.USER_TRY_LOG_IN(
            $p.adapters.pouch,
            $p.job_prm.guests[0].username,
            $p.aes.Ctr.decrypt($p.job_prm.guests[0].password)))
        }

        // если зона не гостевая, перемещаемся на страницу авторизации
      } else if (routes.path.indexOf('/login') == -1) {
        history.push('/login')
      }

    }

    return (
      <Provider store={store}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <div style={ styles.container }>
            {
              (!meta.data_loaded && meta.fetch_local) ?
                <DumbScreen
                  title="Загрузка данных из IndexedDB..."
                  page={meta.page}
                />
                :
                <Router history={history} children={routes}/>
            }
          </div>
        </MuiThemeProvider>
      </Provider>
    )
  }

}
