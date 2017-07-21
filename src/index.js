import React, {Component} from "react";
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import configureStore, {history} from './redux';

import RootView from './components/App/RootView';

// скрипт инициализации структуры метаданных и модификаторы
import {init} from './metadata';

const store = configureStore();

class RootProvider extends Component {

  componentWillMount() {
    init(store)
      .catch((err) => {
        //console.log(err)
    });
  }

  render() {
    return <Provider store={store}>
      <RootView history={history} />
    </Provider>;
  }
}

render(
  <RootProvider />,
  document.getElementById('root'),
);
