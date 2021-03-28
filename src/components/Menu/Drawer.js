import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles({
  list: {
    width: 250,
  },
});

const menuItem = ({divider, text, Icon}, index) => {
  if(divider) {
    return <Divider key={`menu-${index}`} />;
  }
  return <ListItem button key={`menu-${index}`}>
    <ListItemIcon>{Icon ? <Icon /> : null}</ListItemIcon>
    <ListItemText primary={text} />
  </ListItem>;
}

export default function MenuDrawer() {
  const classes = useStyles();
  const [state, setState] = React.useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(open);
  };


  return <>
    <Button onClick={toggleDrawer(true)}>Меню</Button>
    <Drawer anchor={'left'} open={state} onClose={toggleDrawer(false)}>
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
