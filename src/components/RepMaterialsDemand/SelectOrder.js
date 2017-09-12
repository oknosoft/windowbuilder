import React, {Component} from 'react';
import PropTypes from 'prop-types';

import IconButton from 'material-ui/IconButton';
import IconWork from 'material-ui-icons/Work';
import DnR from 'metadata-react/DnR/Dialog';
import DataList from 'metadata-react/DataList';

export default class SelectOrder extends Component {

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

    const {handleSelect, handleRequestClose, props, state} = this;

    return (
      <div>
        <IconButton touch={true} tooltip="Заполнить по заказу" onClick={this.handleTouchTap}>
          <IconWork/>
        </IconButton>
        {state.open && <DnR title="Заполнить по заказу" onClose={handleRequestClose}>
          <DataList
            _mgr={$p.doc.calc_order}
            _acl={props._acl}
            handlers={props.handlers}
            handleSelect={handleSelect}
            selection_mode
            denyAddDel
            show_variants
            show_search
          />
        </DnR>}
      </div>
    );
  }
}
