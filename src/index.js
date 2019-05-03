// подгрузим стили асинхронно
import('font-awesome/css/font-awesome.min.css');
import './styles/roboto/font.css';
import './styles/root.css';

import React from "react";
import PropTypes from 'prop-types';
import {render} from 'react-dom';


import {Provider} from 'react-redux';
import configureStore, {history} from './redux';
import RootView from './components/App/RootView';

const store = configureStore();

class RootProvider extends React.Component {

  getChildContext() {
    return {store};
  }

  componentDidMount() {

    // скрипт инициализации структуры метаданных и модификаторы
    import('./metadata')
      .then((module) => module.init(store));

    // подгрузим стили асинхронно
    import('metadata-react/styles/react-data-grid.css');
    import('metadata-dhtmlx/dhx_terrace.css')
      .then(() => import('metadata-dhtmlx/metadata.css'))
      .then(() => import('./styles/windowbuilder.css'));

  }

  render() {
    return <Provider store={store}>
      <RootView history={history} />
    </Provider>;
  }
}

RootProvider.childContextTypes = {
  store: PropTypes.object,
};

render(<RootProvider />, document.getElementById('root'));
