import React, {Component} from "react";
import {render} from 'react-dom';

import 'metadata-dhtmlx/dhx_terrace.css';
import 'metadata-dhtmlx/metadata.css';
import './styles/windowbuilder.css';

// скрипт инициализации структуры метаданных и модификаторы
import {init} from './metadata';

import {Provider} from 'react-redux';
import configureStore, {history} from './redux';
import RootView from './components/App/RootView';

const store = configureStore();

class RootProvider extends Component {

  componentWillMount() {
    init(store)
      .catch(() => {
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
