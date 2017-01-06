/** @flow */
import React, {Component, PropTypes} from "react";
import IconButton from 'material-ui/IconButton';
import IconWork from 'material-ui/svg-icons/action/work';
import Dialog from 'material-ui/Dialog';
import DataList from "../DataList"


export default class SelectOrder extends Component {

  static propTypes = {
    handleSelect: React.PropTypes.func.isRequired
  }

  static contextTypes = {
    $p: React.PropTypes.object.isRequired
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

        <IconButton touch={true} tooltip="Заполнить по заказу" onTouchTap={this.handleTouchTap}>
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
            width={700}
            height={400}
            _mgr={context.$p.doc.calc_order}
            selection_mode
            deny_add_del
            handleSelect={handleSelect}

          />

        </Dialog>
      </div>
      )
  }
}
