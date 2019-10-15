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
import {ThemeProvider} from '@material-ui/styles';
import theme from '../../styles/muiTheme';

class RootView extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.browser_compatible = browser_compatible();
  }

  render() {

    const {props, browser_compatible} = this;
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

    return <ThemeProvider theme={theme}>
      {
        second_instance ?
        (
          <SecondInstance/>
        )
          :
        (
            browser_compatible ?
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
    </ThemeProvider>;
  }
}

RootView.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
  repl: PropTypes.object,
  data_empty: PropTypes.bool,
  couch_direct: PropTypes.bool,
  meta_loaded: PropTypes.bool,
  data_loaded: PropTypes.bool,
  offline: PropTypes.bool,
  second_instance: PropTypes.bool,
};

export default withMeta(RootView);
