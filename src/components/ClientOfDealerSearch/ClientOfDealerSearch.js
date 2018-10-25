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
import List from './List';

class ClientOfDealerSearch extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleCancel = props.handleCancel.bind(this);
    this.handleCalck = props.handleCalck.bind(this);
    this.state = {search: '', rows: []};
    this._timer = 0;
  }

  doSearch = () => {
    this.props.searchOrders(this.state.search.toLowerCase())
      .then((rows) => this.setState({rows}))
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

    const {handleCancel, handleCalck, props, state} = this;
    const {classes} = props;

    return <Dialog
      open
      initFullScreen
      large
      title={<Input
        value={this.state.search}
        onChange={this.handleChange}
        placeholder="Введите текст для поиска"
        className={classes.search}
        endAdornment={
          <InputAdornment position="end">
            <IconButton>
              <IconSearch />
            </IconButton>
          </InputAdornment>
        }
      />}
      onClose={handleCancel}
      actions={[
        <Button key="cancel" onClick={handleCancel} color="primary">Закрыть</Button>
      ]}
    >
      <List classes={classes} rows={state.rows} onClick={handleCalck}/>
    </Dialog>;

  }
}

ClientOfDealerSearch.propTypes = {
  classes: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  handleCalck: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  searchOrders: PropTypes.func.isRequired,
};

export default connect(ClientOfDealerSearch);
