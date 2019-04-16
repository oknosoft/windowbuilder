/**
 * Action types - имена типов действий - это просто константы
 */

export const IFACE_STATE = 'IFACE_STATE';         // Устанавливает состояние интерфейса


/**
 * Actions - функции - генераторы действий
 * с их помощью инициируется изменение состояния, они могут быть асинхронными
 */

/**
 *
 * @param state {Object}
 * @param state.component {String} - раздел состояния, для которого будет установлено свойство (как правило, имя класса компонента)
 * @param state.name {String} - имя поля в состоянии раздела
 * @param state.value {String} - значение
 * @return {{type: string, payload: *}}
 */
export function iface_state(state) {
  return {
    type: IFACE_STATE,
    payload: state,
  };
}

/**
 * Action Handlers - обработчики событий - их задача изменить state
 */

const ACTION_HANDLERS = {
  [IFACE_STATE]: (state, action) => {
    const {component, name, value} = action.payload;
    const area = component || 'common';
    const previous = Object.assign({}, state[area]);
    if (value == 'invert') {
      previous[name] = !previous[name];
    }
    else {
      previous[name] = value;
    }
    return Object.assign({}, state, {[area]: previous});
  },
};

/**
 * Reducer
 */
const initialState = {
  'common': {
    title: 'Заказ дилера',
  },
  CalcOrderList: {
    //state_filter: '',
  },
  NavDrawer: {
    open: false,
  },
  NavList: {
    orders: true,
  },
  LogDrawer: {
    open: false,
  },
};

export default function ifaceReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
