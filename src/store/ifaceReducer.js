
import $p from '../metadata'

// ------------------------------------
// Action types - имена типов действий
// ------------------------------------

export const NAVLIST_OPEN        = 'NAVLIST_OPEN'         // Видимость панели навигации


// ------------------------------------
// Actions - функции - генераторы действий. Они передаются в диспетчер redux
// ------------------------------------

export function navlist_open(open) {
  return {
    type: NAVLIST_OPEN,
    payload: open
  }
}

// ------------------------------------
// Action Handlers - обработчики событий - вызываются из корневого редюсера
// ------------------------------------
const ACTION_HANDLERS = {
  [NAVLIST_OPEN]:          (state, action) => Object.assign({}, state, {navlist_open: action.payload})
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navlist_open: false
}
export default function ifaceReducer (state = initialState, action) {

  const handler = ACTION_HANDLERS[action.type]

  if(handler){
    console.log(action)
    return handler(state, action)
  }else
    return state
}
