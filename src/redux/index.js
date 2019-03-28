import {compose, createStore, applyMiddleware} from 'redux';
import rootReducer from './reducers';

// middleware для асинхронного добавления middlewares
import dynamicMiddlewares from 'redux-dynamic-middlewares';

// маршрутизация url
import {createBrowserHistory} from 'history';
import {routerMiddleware} from 'react-router-redux';

// асинхронные действия
import thunk from 'redux-thunk';

// Create a history of your choosing (we're using a browser history in this case)
export const history = createBrowserHistory();

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer,
    preloadedState,
    compose(
      // add middleware for intercepting and dispatching async and navigation actions
      applyMiddleware(thunk, routerMiddleware(history), dynamicMiddlewares),

      /**
       * Conditionally add the Redux DevTools extension enhancer
       * if it is installed.
       */
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
  );
}
