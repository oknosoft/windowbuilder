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
    const {handleCancel, handleCalck} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);
  }

  handleOk = () => {
    this.handleCalck().then(this.handleCancel);
  };

  render() {

    const {handleCancel, handleCalck, handleOk, props} = this;
    const {dialog} = props;

    return <Dialog
      open
      initFullScreen
      large
      title="Аксессуары и услуги"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Рассчитать и закрыть</Button>,
        <Button key="calck" onClick={handleCalck} color="primary">Рассчитать</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <AdditionsGroups ref={(el) => this.additions = el} dialog={dialog}/>
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
