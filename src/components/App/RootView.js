import React, {Component} from 'react';

import {ConnectedRouter as Router} from 'react-router-redux';
import {Route, Switch} from 'react-router';

// статусы "загружено и т.д." в ствойствах компонента
import withMeta from 'metadata-redux/src/withMeta';

// заставка "загрузка занных"
import DumbScreen from '../../metadata-ui/DumbLoader/DumbScreen';

// корневые контейнеры
import AppRoot from './AppView';
import DhtmlxRoot from '../DhtmlxRoot';

// тема для material-ui
import {MuiThemeProvider} from 'material-ui/styles';
import theme from '../../styles/muiTheme';

class RootView extends Component {

  shouldComponentUpdate(props) {
    const {user, data_empty, couch_direct, offline, history} = props;
    const path_log_in = !!history.location.pathname.match(/\/login$/)
    let res = true;

    // если есть сохранённый пароль и online, пытаемся авторизоваться
    if(!user.logged_in && user.has_login && !user.try_log_in && !offline){
      props.handleLogin();
      res = false;
    }

    // если это первый запуск или couch_direct и offline, переходим на страницу login
    if ((data_empty === true && !path_log_in && !user.try_log_in) || (couch_direct && offline)) {
      history.push('/login');
      res = false;
    }


    return res;
  }

  render() {

    const {props} = this;
    const {meta_loaded, data_empty, data_loaded, sync_started, user, couch_direct, offline, history} = props;
    const show_dumb = !meta_loaded ||
      (data_empty === undefined) ||
      (sync_started && !data_loaded);

    return <MuiThemeProvider muiTheme={theme}>
      {
        show_dumb ?
          <DumbScreen {...props} />
          :
          <Router history={history}>
            <Switch>
              <Route exact path="/" component={DhtmlxRoot}/>
              <Route component={AppRoot}/>
            </Switch>
          </Router>
      }
    </MuiThemeProvider>;
  }
}

export default withMeta(RootView);
