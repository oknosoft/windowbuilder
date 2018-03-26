/**
 * ### Карточка покупателя
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import compose from 'recompose/compose';


function mapStateToProps(state, props) {
  return {
    handleCalck() {
      //dp.calc_order.production.sync_grid(props.dialog.wnd.elmnts.grids.production);
      return Promise.resolve();
    },
    handleCancel() {
      props.handlers.handleIfaceState({
        component: 'CalcOrderList',
        name: 'dialog',
        value: null,
      });
      if(props.dialog.cmd === 'btn_share') {
        props.handlers.handleIfaceState({
          component: 'DataObjPage',
          name: 'dialog',
          value: null,
        });
      }
    }
  };
}

// function mapDispatchToProps(dispatch) {
//   return {};
// }

export default compose(
  withStyles,
  connect(mapStateToProps /*, mapDispatchToProps */),
);
