import React, {Component, PropTypes} from "react";
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import FlatButton from "material-ui/FlatButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";

import Dialog from 'material-ui/Dialog';

import {Tabs, Tab} from 'material-ui/Tabs';


import SettingsProduction from './SettingsProduction';
import SettingsColumns from './SettingsColumns';


import classes from './RepMaterialsDemand.scss'


export default class ReportSettings extends Component{

  static propTypes = {
    _obj: PropTypes.object
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      tab_value: 'a'
    };
  }

  handleTabChange = (tab_value) => {
    if(tab_value === 'a' || tab_value === 'b'){
      this.setState({
        tab_value: tab_value,
      });
    }
  };

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {

    const flds = [], ids = this.refs.clmns.state.selectedIds
    this.refs.clmns.state.rows.forEach(row => {
      if(ids.indexOf(row.id) != -1){
        flds.push(row.id)
      }
    })
    this.props._obj.column_flds = flds

    this.setState({
      open: false,
    });
  };

  render(){

    const { _obj } = this.props

    const actions = [
      <FlatButton
        label="Ок"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleRequestClose}
      />
    ];

    return (

      <div>
        <FlatButton
          label="Параметры"
          labelPosition="after"
          icon={<MoreVertIcon />}
          className={classes.tbButton}
          onTouchTap={this.handleTouchTap}
        />

        <Dialog
          title="Параметры отчета"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleRequestClose}
          autoScrollBodyContent={true}
        >

          <Tabs
            value={this.state.tab_value}
            onChange={this.handleTabChange}
          >
            <Tab label="Изделия" value="a">

              <SettingsProduction _obj={_obj} />

            </Tab>

            <Tab label="Колонки" value="b">

              <SettingsColumns ref="clmns" _obj={_obj} rowKey="id" />

            </Tab>

          </Tabs>

        </Dialog>

      </div>
    )
  }
}

