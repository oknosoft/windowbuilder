/**
 * Самый верхний уровень - провайдер redux и router
 * Здесь же, подключаем индикатор состояния загрузки приложения
 * и обработчик роутинга на login при первом запуске
 */

import React, {Component, PropTypes} from "react";
import {Router} from "react-router";
import {Provider} from "react-redux";
import {LOCATION_CHANGE} from "react-router-redux";


import "metadata-react-ui/combined.css";
import "metadata-react-ui/react-data-grid.css";
import "react-virtualized/styles.css";
import "react-virtualized-select/styles.css";
//import 'react-flex-layout/react-flex-layout-splitter.css'

import DumbScreen from 'components/DumbLoader/DumbScreen';


// стили MuiTheme для material-ui
import MuiThemeProvider, {styles, muiTheme} from "./AppMuiTheme";

// функция установки параметров сеанса
import settings from "../../../config/app.settings";

// функция инициализации структуры метаданных
import meta_init from "metadata/init";

// собственно, metaengine
import $p from "metadata";

// модификатор отчета materials_demand
import materials_demand from "metadata/reports/materials_demand";



class AppContainer extends Component {

  static propTypes = {
    history: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  }

  // эти свойства будут доступны в контексте детей
  static childContextTypes = {
    $p: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired,
    handleLocationChange: React.PropTypes.func.isRequired
  }

  static handleLocationChange(store, pathname, search = '', hash = ''){
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: {pathname, search, hash}
    })
  }

  getChildContext() {
    const { store } = this.props
    return {
      $p,
      store,
      handleLocationChange: this.handleLocationChange
    };
  }

  constructor (props) {

    super(props);

    const { store } = props

    this.handleLocationChange = function(pathname, search = '', hash = ''){
      AppContainer.handleLocationChange(store, pathname, search, hash)
    }

  }

  subscriber(store) {

    function select(state) {

      const {meta} = state,
        res = {};

      pnames.forEach(function (name) {
        res[name] = meta[name];
      })

      return res
    }

    let t = this,
      pnames = ['meta_loaded','data_empty','data_loaded','fetch_local','sync_started','page'],
      current_state = select(store.getState());

    function handleChange() {
      let previous_state = current_state
      current_state = select(store.getState())

      pnames.some(function (name) {
        if (current_state[name] != previous_state[name]) {
          t.setState(current_state);
          return true;
        }
      })
    }

    return handleChange

  }

  // вызывается один раз на клиенте и сервере при подготовке компонента
  componentWillMount() {

    const { store } = this.props

    setTimeout(() => {

      // инициализируем параметры сеанса и метаданные
      $p.wsql.init(settings, meta_init);

      // подключаем обработчики событий плагином metadata-redux
      $p.rx_events(store);

      // выполняем модификаторы
      materials_demand($p)

      // информируем хранилище о готовности MetaEngine
      store.dispatch($p.rx_actions.META_LOADED($p))

      // читаем локальные данные в ОЗУ
      $p.adapters.pouch.load_data();

      // подписываемся на события хранилища
      store.subscribe(this.subscriber(store))

    })

  }

  render () {

    const { history, routes, store } = this.props

    const meta = store.getState().meta

    // при первом старте и при загрузке данных, минуя роутинг показываем заставку
    // если пустые данные, перебрасываем на страницу авторизации
    //
    // if(!meta_loaded) - заглушка заставка
    // if(data_empty && route.path != '/login') - перебросить в login
    // if(fetch_local && !data_loaded)

    if(!meta.meta_loaded){
        return (
          <DumbScreen />
        )
    }

    if(meta.data_empty){
      if(routes.path != '/login'){
        AppContainer.handleLocationChange(store, '/login');
      }
    }else{

    }

    if(!meta.data_loaded && meta.fetch_local){
      return (
        <DumbScreen
          title = "Загрузка данных из IndexedDB..."
          page = {meta.page}
        />
      )
    }

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
