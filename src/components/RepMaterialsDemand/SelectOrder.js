import React, {Component} from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import IconWork from '@material-ui/icons/Work';
//import Dialog from 'metadata-react/DnR/Dialog';
import Dialog from 'metadata-react/App/Dialog';
import DataList from 'metadata-react/DataList';

class SelectOrder extends Component {

  static propTypes = {
    handleSelect: PropTypes.func.isRequired,
  };

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


  render() {

    const {handleSelect, props, state} = this;

    return (
      <div>
        <IconButton title="Заполнить по заказу" onClick={this.handleTouchTap}>
          <IconWork/>
        </IconButton>
        {state.open && <Dialog
          open
          noSpace
          large
          //initFullScreen
          title="Заполнить по заказу"
          onClose={this.handleRequestClose}
        >
          <DataList
            height={480}
            _mgr={$p.doc.calc_order}
            _acl={props._acl}
            handlers={{handleSelect}}
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

export default SelectOrder;
