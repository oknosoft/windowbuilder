import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import HeaderContainer from '../Header';
import HomePage from '../HomePage';
import AboutPage from '../About';
import Builder from '../Builder';
import DataRoute from '../DataRoute';
import MetaTreePage from '../MetaTreePage';
import NotFoundPage from '../NotFoundPage';
//import SchemeSettingsWrapper from '../../metadata-react-ui/SchemeSettings/SchemeSettingsWrapper';
//import AuthService from '../../utils/AuthService'

/* global $p */

// заставка "загрузка занных"
import DumbScreen from '../../metadata-ui/DumbLoader/DumbScreen';


class App extends React.Component {

  //authService = new AuthService()

  componentWillMount() {

    this.authService = {};

    // Add callback for lock's `authenticated` event
    // this.authService.lock.on('authenticated', (authResult) => {
    //   this.authService.lock.getProfile(authResult.idToken, (error, profile) => {
    //     if (error)
    //       return this.props.loginError(error)
    //     AuthService.setToken(authResult.idToken) // static method
    //     AuthService.setProfile(profile) // static method
    //     this.props.loginSuccess(profile)
    //     return this.props.history.push({ pathname: '/' })
    //   })
    // })
    // // Add callback for lock's `authorization_error` event
    // this.authService.lock.on('authorization_error', (error) => {
    //   this.props.loginError(error)
    //   return this.props.history.push({ pathname: '/' })
    // })
  }

  componentWillReceiveProps(props) {
    // если это первый запуск...
    if (props.data_empty && !props.location.pathname.match(/[\/login|\/builder]$/)) {

      // если это гостевая зона и задан пользователь по умолчанию - пытаемся авторизоваться
      if ($p.job_prm.guests.length && $p.job_prm.zone_demo == $p.wsql.get_user_param('zone')) {
        if (!$p.wsql.get_user_param('user_name')) {
          props.try_log_in();
        }
      }
      // если зона не гостевая, перемещаемся на страницу авторизации
      else if (props.match.path.indexOf('/login') == -1) {
        props.navigate('/login');
      }
    }
  }

  componentDidUpdate(params) {

    const {props} = this;


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

    if (!props.meta_loaded) {
      return (
        <DumbScreen />
      );
    }

    return (
      <div>
        <HeaderContainer authService={this.authService}/>
        {
          (!props.data_loaded && props.fetch_local) ?
            <DumbScreen title="Загрузка данных из IndexedDB..." page={props.page}/>
            :
            <Switch>
              <Route exact path="/" component={HomePage}/>
              <Route path="/about" component={AboutPage}/>
              <Route path="/builder" component={Builder}/>
              <Route path="/meta" component={MetaTreePage}/>
              <Route path="/:area(doc|cat|ireg|cch).:name" component={DataRoute}/>
              <Route component={NotFoundPage}/>
            </Switch>
        }
      </div>
    );
  }
}

App.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  loginSuccess: PropTypes.func.isRequired,
  loginError: PropTypes.func.isRequired,
};

export default App;

