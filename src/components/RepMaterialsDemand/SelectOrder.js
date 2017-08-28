
import React, {Component} from "react";
import PropTypes from "prop-types";

import IconButton from 'material-ui/IconButton';
import IconWork from 'material-ui/svg-icons/action/work';
import Dialog from 'material-ui/Dialog';
import DataList from "metadata-react/DataList"


export default class SelectOrder extends Component {

  static propTypes = {
    handleSelect: React.PropTypes.func.isRequired
  }

  constructor(props) {

    super(props);

    this.state = {
      open: false
    }
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true
    })
  }

  handleRequestClose = () => {
    this.setState({
      open: false,
    })
  }

  handleSelect = (row, _mgr) => {
    this.handleRequestClose()
    this.props.handleSelect(row, _mgr)
  }


  render () {

    const {handleSelect, handleRequestClose, context, state} = this

    return (
      <div>

        <IconButton touch={true} tooltip="Заполнить по заказу" onClick={this.handleTouchTap}>
          <IconWork />
        </IconButton>

        <Dialog
          title="Заполнить по заказу"
          //actions={actions}
          modal={false}
          open={state.open}
          onRequestClose={handleRequestClose}
          autoScrollBodyContent={true}
        >

          <DataList
            _mgr={$p.doc.calc_order}
            width={680}
            height={320}
            selection_mode
            denyAddDel
            show_variants
            show_search
            handleSelect={handleSelect}
          />

        </Dialog>
      </div>
      )
  }
}
