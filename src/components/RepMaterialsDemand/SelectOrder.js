
import React, {PropTypes} from "react";
import MetaComponent from "metadata-ui/common/MetaComponent";

import IconButton from 'material-ui/IconButton';
import IconWork from 'material-ui/svg-icons/action/work';
import Dialog from 'material-ui/Dialog';
import DataList from "metadata-ui/DataList"


export default class SelectOrder extends MetaComponent {

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
            width={680}
            height={320}
            _mgr={context.$p.doc.calc_order}
            selection_mode
            deny_add_del
            show_variants
            show_search
            handleSelect={handleSelect}

          />

        </Dialog>
      </div>
      )
  }
}
