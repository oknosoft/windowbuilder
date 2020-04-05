/**
 * ### Диалог редактирования параметрических изделий
 *
 * @module Frame
 *
 * Created by Evgeniy Malyarov on 22.07.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';

import connect from './connect';

class ParametricFrame extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel} = props;
    this.handleCancel = handleCancel.bind(this);
    this.state = {msg: null, queryClose: false};
  }

  handleOk = () => {
    this.props.handleCalck.call(this)
      .then(this.handleCancel)
      .catch((err) => {
        this.setState({msg: err.msg || err.message});
      });
  };

  handleCalck = () => {
    this.props.handleCalck.call(this)
      .catch((err) => {
        this.setState({msg: err.msg});
      });
  };

  handleErrClose = () => {
    this.setState({msg: null, queryClose: false});
  };

  queryClose = () => {
    this.setState({queryClose: true});
  };

  render() {

    const {handleCancel, handleErrClose, props: {dialog, title, actions, Content}, state: {msg, queryClose}} = this;

    return <Dialog
      open
      initFullScreen
      large
      title={title}
      onClose={this.queryClose}
      actions={[
        !actions && <Button key="ok" onClick={this.handleOk} color="primary">Рассчитать и закрыть</Button>,
        actions && actions.ok && <Button key="ok" onClick={this.handleOk} color="primary">{actions.ok}</Button>,
        !actions && <Button key="calck" onClick={this.handleCalck} color="primary">Рассчитать</Button>,
        actions && actions.calck && <Button key="calck" onClick={this.handleCalck} color="primary">{actions.calck}</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <Content ref={(el) => this.additions = el} dialog={dialog}/>
      {msg && <Dialog
        open
        title={msg.title || 'Ошибка при записи'}
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleErrClose} color="primary">Ок</Button>,
        ]}
      >
        {msg.obj && <div>{msg.obj.name}</div>}
        {msg.text || msg}
      </Dialog>}
      {queryClose && <Dialog
        open
        title={`Закрыть ${title.toLowerCase()}?`}
        onClose={handleErrClose}
        actions={[
          <Button key="ok" onClick={handleCancel} color="primary">Ок</Button>,
          <Button key="cancel" onClick={handleErrClose} color="primary">Отмена</Button>
        ]}
      >
        Внесённые изменения будут потеряны
      </Dialog>}
    </Dialog>;

  }
}

ParametricFrame.propTypes = {
  Content: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  title: PropTypes.string.isRequired,
  dialog: PropTypes.object.isRequired,
  actions: PropTypes.object,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(ParametricFrame);
