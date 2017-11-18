/**
 * ### Форма добавления услуг и комплектуюущих
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog from 'metadata-react/App/Dialog';
import AdditionsGroups from './AdditionsGroups';
import connect from './connect';

class CalcOrderAdditions extends Component {

  render() {

    const {classes, handleCancel, handleCalck, handleOk, dialog } = this.props;

    return <Dialog
      open
      classes={{paper: classes.paper}}
      title="Аксессуары и услуги"
      onRequestClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Рассчитать и закрыть</Button>,
        <Button key="calck" onClick={handleCalck} color="primary">Рассчитать</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <AdditionsGroups dialog={dialog}/>
    </Dialog>;

  }
}

CalcOrderAdditions.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(CalcOrderAdditions);
