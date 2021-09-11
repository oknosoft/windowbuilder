import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import items from './items';

const styles = {
  list: {
    width: 250,
  },
};


class MenuDrawer extends React.Component {

  state = {open: false};

  toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({open});
  };

  navigate = (item) => () => {
    const {handleNavigate} = this.context;
    handleNavigate(item.navigate);
  };

  menuItem = (item, index) => {
    const {divider, text, Icon} = item;
    if(divider) {
      return <Divider key={`menu-${index}`} />;
    }
    return <ListItem button key={`menu-${index}`} onClick={this.navigate(item)}>
      <ListItemIcon>{Icon ? <Icon /> : null}</ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>;
  };

  render() {
    const {props: {classes}, state: {open}, menuItem, toggleDrawer} = this;
    return <>
      <Button onClick={toggleDrawer(true)}>Меню</Button>
      <Drawer anchor={'left'} open={open} onClose={toggleDrawer(false)}>
        <div
          className={classes.list}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          {
            items.map(menuItem)
          }
        </div>
      </Drawer>
    </>;
  }
}

MenuDrawer.contextTypes = {
  handleNavigate: PropTypes.func,
};

export default withStyles(styles)(MenuDrawer);
