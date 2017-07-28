import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

// статусы "загружено и т.д." в ствойствах компонента
import withNavigateAndMeta from './withNavigateAndMeta';

// заставка "загрузка занных"
import DumbScreen from '../DumbLoader/DumbScreen';

import Header from '../Header';
import AboutPage from '../About';
import Builder from '../Builder';
import DataRoute from '../DataRoute';
import MetaTreePage from '../MetaTreePage';
import NotFoundPage from '../NotFoundPage';
import FrmLogin from '../../metadata-ui/FrmLogin';
//import SchemeSettingsWrapper from '../../metadata-react-ui/SchemeSettings/SchemeSettingsWrapper';


import DhtmlxRoot from '../CalcOrderList';


class AppRoot extends React.Component {

  shouldComponentUpdate(props) {
    const {user, data_empty, couch_direct, offline, history, path_log_in} = props;
    let res = true;

    // если есть сохранённый пароль и online, пытаемся авторизоваться
    if (!user.logged_in && user.has_login && !user.try_log_in && !offline) {
      props.handleLogin();
      res = false;
    }

    // если это первый запуск или couch_direct и offline, переходим на страницу login
    if (!path_log_in && ((data_empty === true && !user.try_log_in) || (couch_direct && offline))) {
      history.push('/login');
      res = false;
    }

    return res;
  }

  render() {

    const {props} = this;

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

    return (
      <div>
        <Header />
        {
          (!props.path_log_in && !props.doc_ram_loaded) ?
            <DumbScreen title="Загрузка данных из IndexedDB..." page={props.page} top={92} />
            :
            <Switch>
              <Route exact path="/" component={DhtmlxRoot}/>
              <Route path="/about" component={AboutPage} />
              <Route path="/builder/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" component={Builder} />
              <Route path="/meta" component={MetaTreePage} />
              <Route path="/login" component={FrmLogin} />
              <Route path="/:area(doc|cat|ireg|cch).:name" component={DataRoute} />
              <Route component={NotFoundPage} />
            </Switch>
        }
      </div>
    );
  }
}
AppRoot.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withNavigateAndMeta(AppRoot);

