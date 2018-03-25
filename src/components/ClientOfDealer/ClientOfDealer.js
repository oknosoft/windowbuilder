/**
 * ### Карточка покупателя
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog from 'metadata-react/App/Dialog';
import connect from './connect';

class ClientOfDealer extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);
  }

  handleOk = () => {
    this.handleCalck().then(this.handleCancel);
  };

  render() {

    const {handleCancel, handleOk, props} = this;
    const {classes} = props;

    return <Dialog
      open
      initFullScreen
      classes={{paper: classes.paper}}
      title="Реквизиты клиента"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Записать и закрыть</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <div>Не реализовано в текущей версии</div>
    </Dialog>;

  }
}

ClientOfDealer.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(ClientOfDealer);
