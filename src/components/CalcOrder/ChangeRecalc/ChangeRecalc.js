/**
 *
 *
 * @module ChangeRecalc
 *
 * Created by Evgeniy Malyarov on 05.05.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';

class ChangeRecalc extends React.Component {

  handleCalck = () => {
    const {dialog: {ref, cmd, _mgr}} = this.props;
    this.handleCancel();
  }

  handleCancel = () => {
    this.props.handlers.handleIfaceState({
      component: 'DataObjPage',
      name: 'dialog',
      value: null,
    });
  }

  render() {
    return <Dialog
      open
      initFullScreen
      large
      title="Пересчет с заменой параметров"
      onClose={this.handleCancel}
      actions={[
        <Button key="ok" onClick={this.handleCalck} color="primary">Выполнить</Button>,
        <Button key="cancel" onClick={this.handleCancel} color="primary">Отмена</Button>
      ]}
    >
      Элементы управления
    </Dialog>;
  }
}

export default ChangeRecalc;
