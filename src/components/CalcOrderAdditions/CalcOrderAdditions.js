/**
 * ### Форма добавления услуг и комплектуюущих
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Items from './Items'
import connect from './connect';

class CalcOrderAdditions extends Component {

  constructor(props, context) {
    super(props, context);
    this.dp = $p.dp.buyers_order.create();
    this.dp.calc_order = $p.doc.calc_order.by_ref[props.dialog.ref];
  }

  render() {

    const {classes, fullScreen, handleCancel, handleOk } = this.props;

    return <Dialog
      open
      fullScreen={fullScreen}
      onRequestClose={handleCancel}
      classes={{paper: classes.dialog}}
    >
      <DialogTitle>Аксессуары и услуги</DialogTitle>
      <DialogContent>
        <Items />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="primary">Отмена</Button>
        <Button onClick={handleOk} color="primary">Ок</Button>
      </DialogActions>
    </Dialog>;

  }
}

CalcOrderAdditions.propTypes = {
  classes: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(CalcOrderAdditions);
