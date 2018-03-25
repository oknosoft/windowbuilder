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
import Input, { InputAdornment } from 'material-ui/Input';
import IconButton from 'material-ui/IconButton';
import IconSearch from 'material-ui-icons/Search';
import connect from './connect';

class ClientOfDealerSearch extends Component {

  constructor(props, context) {
    super(props, context);
    const {handleCancel, handleCalck} = props;
    this.handleCancel = handleCancel.bind(this);
    this.handleCalck = handleCalck.bind(this);
    this.state = {search: ''};
  }

  handleOk = () => {
    this.handleCalck().then(this.handleCancel);
  };

  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value });
  };

  render() {

    const {handleCancel, handleOk, props} = this;
    const {classes} = props;

    return <Dialog
      open
      initFullScreen
      classes={{paper: classes.paper}}
      title="Поиск клиента"
      onClose={handleCancel}
      actions={[
        <Button key="ok" onClick={handleOk} color="primary">Выбрать</Button>,
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <Input
        value={this.state.search}
        onChange={this.handleChange('search')}
        endAdornment={
          <InputAdornment position="end">
            <IconButton>
              <IconSearch />
            </IconButton>
          </InputAdornment>
        }
      />
      <div>Не реализовано в текущей версии</div>
    </Dialog>;

  }
}

ClientOfDealerSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
};

export default connect(ClientOfDealerSearch);
