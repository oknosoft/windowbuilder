// подгрузим стили асинхронно
import('font-awesome/css/font-awesome.min.css');
import './styles/roboto/font.css';
import './styles/root.css';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom/client';

import {Provider} from 'react-redux';
import configureStore, {history} from './redux';
import RootView from './components/App/RootView';

// sw для оффлайна и прочих дел
import * as serviceWorker from './serviceWorker';

export const store = configureStore();

class RootProvider extends React.Component {

  getChildContext() {
    return {store};
  }

  componentDidMount() {

    // скрипт инициализации структуры метаданных и модификаторы
    import('./metadata')
      .then((module) => module.init(store));

    // подгрузим стили асинхронно
    import('metadata-dhtmlx/dhx_terrace.css')
      .then(() => import('metadata-dhtmlx/metadata.css'))
      .then(() => import('./styles/windowbuilder.css'))
      .then(() => import('wb-cutting'))
      .then((module) => {
        $p.classes.Cutting = module.default;
      });

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootProvider />);

//serviceWorker.unregister();
serviceWorker.register({
  onUpdate() {
    if($p?.eve) {
      $p.eve.redirect = true;
    }
    alert('Код программы обновлён, необходимо перезагрузить страницу');
    location.reload();
  },
});

// https://pretagteam.com/question/how-to-focus-opener-window-in-chrome
window.name = `principal-${Date.now()}`;
window.addEventListener("message", handleMessage, false);
function handleMessage(event) {
  if(event.source === window.d3d_wnd) {
    const {action} = event.data;
    switch (action) {
    case 'focus':
      this.focus();
      document.body.classList.remove("disabled");
      break;
    default:
      console.log(event);
    }
  }
}
