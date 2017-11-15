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
  DialogTitle,
} from 'material-ui/Dialog';
import AdditionsGroups from './AdditionsGroups';
import connect from './connect';

class CalcOrderAdditions extends Component {

  render() {

    const {classes, fullScreen, handleCancel, handleCalck, handleOk, dialog } = this.props;

    return <Dialog
      open
      fullScreen={fullScreen}
      onRequestClose={handleCancel}
      classes={{paper: classes.dialog}}
    >
      <DialogTitle>Аксессуары и услуги</DialogTitle>
      <DialogContent>
        <AdditionsGroups dialog={dialog}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} color="primary">Рассчитать и закрыть</Button>
        <Button onClick={handleCalck} color="primary">Рассчитать</Button>
        <Button onClick={handleCancel} color="primary">Закрыть</Button>

      </DialogActions>
    </Dialog>;

  }
}

CalcOrderAdditions.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  fullScreen: PropTypes.bool.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(CalcOrderAdditions);
