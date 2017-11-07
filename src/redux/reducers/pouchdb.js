/**
 * ### Обработчик дополнительных событий pouchdb
 * не путать со стандартными событиями, обработанными metsReducer-ом
 *
 * Created by Evgeniy Malyarov on 05.11.2017.
 */

// стандартный обработчик
import {metaReducer} from 'metadata-redux';

// имя события
const NOM_PRICES = 'NOM_PRICES';

// структура обработчиков
const handlers = {
  [NOM_PRICES]: (state, action) => Object.assign({}, state, {nom_prices_step: action.payload}),
};

/**
 * Изменяет state в ответ на события
 * @param state
 * @param action
 * @return {*}
 */
export function customPouchReducer(state, action) {
  const handler = handlers[action.type];
  return handler ? handler(state, action) : metaReducer(state, action);
}


let attached;

/**
 * Подключает диспетчеризацию событий redux к pouchdb
 */
export function customPouchMiddleware({adapters}) {
  return ({dispatch}) => {
    return next => action => {
      if(!attached) {
        attached = true;
        adapters.pouch.on({
          nom_prices: (step) => dispatch({
            type: NOM_PRICES,
            payload: step,
          }),
        });

        // TODO: здесь можно подписаться на online-offline, rotate и т.д.

      }
      return next(action);
    };
  };
}

