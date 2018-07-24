/**
 * ### Карточка покупателя
 * каркас компонента - визуальная глупая часть
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import IconSearch from '@material-ui/icons/Search';
import connect from './connect';

class ClientOfDealerSearch extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleCancel = props.handleCancel.bind(this);
    this.handleCalck = props.handleCalck.bind(this);
    this.state = {search: '', rows: []};
    this._timer = 0;
  }

  handleOk = () => {
    this.handleCalck().then(this.handleCancel);
  };

  doSearch = () => {
    const search = this.state.search.toLowerCase();
    if(search.length < 2) {
      return this.setState({rows: []});
    }
    $p.adapters.pouch.local.doc.query('client_of_dealer', {
      startkey: search,
      endkey: search + '\u0fff',
      limit: 200,
    })
      .then(({rows}) => {
        rows = 0;
      })
      .catch((err) => {
        $p.msg.show_msg({
          type: "alert-warning",
          text: `${err.name}<br/>${err.message}`,
          title: $p.msg.main_title
        });
      });
  }

  handleChange = (event) => {
    this.setState({search: event.target.value});
    clearTimeout(this._timer);
    this._timer = setTimeout(this.doSearch, 750);
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
        onChange={this.handleChange}
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
