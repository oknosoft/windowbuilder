import React, {Component} from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import IconWork from '@material-ui/icons/Work';
//import Dialog from 'metadata-react/DnR/Dialog';
import Dialog from 'metadata-react/App/Dialog';
import DataList from 'metadata-react/DynList/DynList';

class SelectOrder extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {open: false};
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({open: true});
  };

  handleRequestClose = () => {
    this.setState({open: false});
  };

  handleSelect = (row, _mgr) => {
    this.handleRequestClose();
    this.props.handleSelect(row, _mgr);
  };

  find_rows = (selector) => {
    const {remote, props} = $p.adapters.pouch;
    const {username, password} = remote.doc.__opts.auth;

    selector.sort = [{date: 'desc'}];

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(username + ':' + password))));
    headers.append('suffix', props._suffix || '0');
    const opts = {
      method: 'post',
      credentials: 'include',
      headers,
      body: JSON.stringify(selector)
    };

    return fetch('/r/_find', opts)
      .then((res) => {
        if(res.status <= 201) {
          return res.json();
        }
        else {
          return res.text()
            .then((text) => {
              throw new Error(`${res.statusText}: ${text}`);
            });
        }
      })
      .then((data) => {
        data.docs.forEach((doc) => {
          doc.ref = doc._id.split('|')[1];
          delete doc._id;
        });
        return data;
      });
  };

  render() {

    const {handleSelect, props, state} = this;

    return (
      <div>
        <IconButton title="Добавить из заказа" onClick={this.handleTouchTap}>
          <IconWork/>
        </IconButton>
        {state.open && <Dialog
          open
          noSpace
          large
          //initFullScreen
          title="Добавить из заказа"
          onClose={this.handleRequestClose}
        >
          <DataList
            height={480}
            _mgr={$p.doc.calc_order}
            _acl={props._acl}
            handlers={{handleSelect}}
            //find_rows={this.find_rows}
            selectionMode
            denyAddDel
            //show_variants
            show_search
          />
        </Dialog>}
      </div>
    );
  }
}

SelectOrder.propTypes = {
  handleSelect: PropTypes.func.isRequired,
  _acl: PropTypes.object
};
export default SelectOrder;
