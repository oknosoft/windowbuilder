import React, {Component} from "react";
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {ConnectedRouter as Router} from 'react-router-redux';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';

import configureStore, {history} from './redux';

import AppContainer from './components/App/AppContainer';

// собственно, metaengine и скрипт инициализации структуры метаданных и модификаторы
import {init} from './metadata';

const store = configureStore();


const theme = createMuiTheme({

  dialog: {
    titleFontSize: 18,
  },

  MuiToolbar: {
    root: {
      height: 48,
      titleFontSize: 18,
    }
  },

});

class RootProvider extends Component {

  componentDidMount() {
    init(store)
      .catch((err) => {
        //console.log(err)
    });
  }

  render() {
    return <Provider store={store}>
      <MuiThemeProvider muiTheme={theme}>
        <Router history={history}>
          <AppContainer />
        </Router>
      </MuiThemeProvider>
    </Provider>;
  }
}

render(
  <RootProvider />,
  document.getElementById('root'),
);
