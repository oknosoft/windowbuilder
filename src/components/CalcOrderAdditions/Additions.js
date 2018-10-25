/**
 * ### Форма добавления услуг и комплектуюущих
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import AdditionsGroups from './AdditionsGroups';
import connect from './connect';

class CalcOrderAdditions extends Component {

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

    const {handleCancel, handleErrClose, props: {dialog}, state: {msg, queryClose}} = this;

    return <Dialog
      open
      initFullScreen
      large
      title="Аксессуары и услуги"
      onClose={this.queryClose}
      actions={[
        <Button key="ok" onClick={this.handleOk} color="primary">Рассчитать и закрыть</Button>,
        <Button key="calck" onClick={this.handleCalck} color="primary">Рассчитать</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <AdditionsGroups ref={(el) => this.additions = el} dialog={dialog}/>
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
        title="Закрыть аксессуары и услуги?"
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

CalcOrderAdditions.propTypes = {
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(CalcOrderAdditions);
