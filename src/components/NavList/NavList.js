import React, {Component, PropTypes} from "react";

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import AppBar from 'material-ui/AppBar';
import {white} from 'material-ui/styles/colors';

import Info from 'material-ui/svg-icons/action/info';
import List from 'material-ui/svg-icons/action/list';
import Person from 'material-ui/svg-icons/social/person';



export default class NavList extends Component {

  static propTypes = {
    navlist_open: PropTypes.bool,
    handleNavlistOpen: PropTypes.func.isRequired
  }

  static contextTypes = {
    handleLocationChange: React.PropTypes.func.isRequired
  }

  handleClose = () => {
    this.props.handleNavlistOpen(false)
  }

  handleToggle = () => {
    this.props.handleNavlistOpen(!this.props.navlist_open)
  }

  handleNavigate = (path) => {

    return () => {
      this.handleClose()
      this.context.handleLocationChange(path)
    }
  }

  render() {
    return (
      <div>
        <IconButton onTouchTap={this.handleToggle} ><NavigationMenu color={white} /></IconButton>
        <Drawer
          docked={false}
          width={300}
          open={this.props.navlist_open}
          onRequestChange={(open) => this.props.handleNavlistOpen(open)}
        >

          <AppBar
            onLeftIconButtonTouchTap={this.handleClose}
            title={this.props.title}
            titleStyle={{fontSize: 18}}
          />

          <MenuItem primaryText="Список" onTouchTap={this.handleNavigate('/')} leftIcon={<List />} />
          <MenuItem primaryText="Профиль" onTouchTap={this.handleNavigate('login')} leftIcon={<Person />} />
          <MenuItem primaryText="О программе" onTouchTap={this.handleNavigate('about')} leftIcon={<Info />} />

        </Drawer>
      </div>
    );
  }
}

