import React from 'react';
import PropTypes from 'prop-types';

import {ConnectedRouter as Router} from 'react-router-redux';

// статусы "загружено и т.д." в ствойствах компонента
import {withMeta} from 'metadata-redux';

// заставка "загрузка занных"
import DumbScreen from '../DumbScreen/DumbScreen';

// корневые контейнеры
import AppView from './AppView';

import BrowserCompatibility, {browser_compatible} from 'metadata-react/App/BrowserCompatibility';
import SecondInstance from 'metadata-react/App/SecondInstance';

// тема для material-ui
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from '../../styles/muiTheme';

class RootView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      path_log_in: this.isPathLogIn(),
      browser_compatible: browser_compatible()
    };
  }

  shouldComponentUpdate(props, state) {
    const {user, data_empty, couch_direct, offline, history} = props;
    const {path_log_in} = state;
    let res = true;

    if (path_log_in != this.isPathLogIn()) {
      this.setState({path_log_in: this.isPathLogIn()});
      res = false;
    }

    // если это первый запуск или couch_direct и offline, переходим на страницу login
    if(!path_log_in && ((data_empty === true && !user.try_log_in && !user.logged_in) || (couch_direct && offline))) {
      history.push('/login');
      res = false;
    }

    return res;
  }

  isPathLogIn() {
    return !!location.pathname.match(/\/(login|about)$/);
  }

  render() {

    const {props, state} = this;
    const {meta_loaded, data_empty, data_loaded, history, repl, second_instance} = props;
    let show_dumb = !meta_loaded ||
      (data_empty === undefined) ||
      (data_empty === false && !data_loaded);

    if(!show_dumb && repl) {
      for(const dbs in repl) {
        const info = repl[dbs];
        if(info.ok && !info.end_time) {
          show_dumb = true;
        }
      }
    }

    return <MuiThemeProvider theme={theme}>
      {
        second_instance ?
        (
          <SecondInstance/>
        )
          :
        (
            state.browser_compatible ?
          (show_dumb ?
            <DumbScreen {...props} />
            :
            <Router history={history}>
              <AppView history={history} location={history.location} />
            </Router>)
          :
          <BrowserCompatibility/>
        )
      }
    </MuiThemeProvider>;
  }
}

RootView.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
  data_empty: PropTypes.bool,
  couch_direct: PropTypes.bool,
  offline: PropTypes.bool,
};

export default withMeta(RootView);
