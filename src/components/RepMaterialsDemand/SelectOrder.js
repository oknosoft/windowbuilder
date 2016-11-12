/** @flow */
import React, {Component, PropTypes} from "react";

import IconButton from 'material-ui/IconButton';
import OrderIcon from 'material-ui/svg-icons/action/work';

import Dialog from 'material-ui/Dialog';

import EventsList from "../EventsList"

import classes from "./RepMaterialsDemand.scss";

const columns = ['date','number_doc']
const columnWidths = [50,50]

export default class SelectOrder extends Component {

  static propTypes = {
    handleSelect: React.PropTypes.func.isRequired
  }

  constructor(props) {

    super(props);

    this.state = {
      open: false
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };


  render () {

    const { fetch_remote, handleSelect } = this.props

    return (
      <div>

        <IconButton touch={true} tooltip="Заполнить по заказу" onTouchTap={this.handleTouchTap}>
          <OrderIcon />
        </IconButton>

        <Dialog
          title="Заполнить по заказу"
          //actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
          autoScrollBodyContent={true}
        >

          <EventsList
            width={600}
            height={350}
            //fetch_remote={fetch_remote}
            columns={columns}
            columnWidths={columnWidths}
          />

        </Dialog>
      </div>
      )
  }
}
