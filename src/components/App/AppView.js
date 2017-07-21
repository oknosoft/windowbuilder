import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

// статусы "загружено и т.д." в ствойствах компонента
import withNavigateAndMeta from './withNavigateAndMeta';

// заставка "загрузка занных"
import DumbScreen from '../../metadata-ui/DumbLoader/DumbScreen';

import HeaderContainer from '../Header';
import AboutPage from '../About';
import Builder from '../Builder';
import DataRoute from '../DataRoute';
import MetaTreePage from '../MetaTreePage';
import NotFoundPage from '../NotFoundPage';
//import SchemeSettingsWrapper from '../../metadata-react-ui/SchemeSettings/SchemeSettingsWrapper';
//import AuthService from '../../utils/AuthService'


class AppRoot extends React.Component {

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

  shouldComponentUpdate(props) {
    const {user, data_empty, path_log_in, couch_direct, offline} = props;
    let res = true;

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
        <HeaderContainer authService={this.authService} />
        {
          (!props.data_loaded && props.fetch_local) ?
            <DumbScreen title="Загрузка данных из IndexedDB..." page={props.page} />
            :
            <Switch>
              <Route path="/about" component={AboutPage} />
              <Route path="/builder" component={Builder} />
              <Route path="/meta" component={MetaTreePage} />
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

