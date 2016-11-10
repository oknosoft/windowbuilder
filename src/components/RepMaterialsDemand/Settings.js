import React, {Component, PropTypes} from "react";
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import FlatButton from "material-ui/FlatButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import Popover from 'material-ui/Popover';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import TabularSection from '../TabularSection'

import RefEditor from '../DataFieldCell/RefEditor'

import classes from './RepMaterialsDemand.scss'

//options for priorities autocomplete editor
var CharacteristicEditor = <RefEditor />

export default class ReportSettings extends Component{

  static propTypes = {
    _obj: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render(){

    const { _obj } = this.props

    return (

      <div>
        <FlatButton
          label="Параметры"
          labelPosition="after"
          icon={<MoreVertIcon />}
          className={classes.tbButton}
          onTouchTap={this.handleTouchTap}
        />

        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >

          <List className={classes.list} >

            <Subheader>Продукция</Subheader>

            <TabularSection
              _obj={_obj}
              _tabular="production"
              _columns={[
                {
                  key: 'characteristic',
                  name: 'Продукция',
                  resizable : true,
                  formatter: _obj.formatters.characteristic,
                  editor: CharacteristicEditor
                },
                {
                  key: 'qty',
                  name: 'Штук',
                  width : 90,
                  resizable : true,
                  editable : true
                }]}
            />

          </List>

        </Popover>
      </div>
    )
  }
}

