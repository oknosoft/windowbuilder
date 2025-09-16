import {connect} from 'react-redux';
import withStyles from './styles';
import {compose} from 'redux';


function mapStateToProps(state, props) {
  return {
    handleCalck() {
      //dp.calc_order.production.sync_grid(props.dialog.wnd.elmnts.grids.production);
      return Promise.resolve();
    },
    handleCancel() {
      props.handlers.handleIfaceState({
        component: props.dialog?.cmd?.area || 'DataObjPage',
        name: 'dialog',
        value: null,
      });
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
