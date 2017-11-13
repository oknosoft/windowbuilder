/**
 * ### Форма добавления услуг и комплектуюущих
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import {withMobileDialog} from 'material-ui/Dialog';
import compose from 'recompose/compose';


const mapStateToProps = (state, props) => {
  return {
    handleOk() {

    },
    handleCancel() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    }
  };
};

function mapDispatchToProps(dispatch) {
  return {

  };
}

export default compose(
  withStyles,
  withMobileDialog(),
  connect(mapStateToProps, mapDispatchToProps),
);
