// подгрузим стили асинхронно
import('font-awesome/css/font-awesome.min.css');
import('metadata-react/styles/react-data-grid.css');
import('metadata-dhtmlx/dhx_terrace.css')
  .then(() => import('metadata-dhtmlx/metadata.css'))
  .then(() => import('./styles/windowbuilder.css'));

import React, {Component} from "react";
import {render} from 'react-dom';

// скрипт инициализации структуры метаданных и модификаторы
import {init} from './metadata';

import {Provider} from 'react-redux';
import configureStore, {history} from './redux';
import RootView from './components/App/RootView';

const store = configureStore();

class RootProvider extends Component {

  componentWillMount() {
    init(store.dispatch).catch($p && $p.record_log);
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
