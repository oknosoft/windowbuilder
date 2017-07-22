import React, {Component} from 'react';
import PropTypes from 'prop-types';

import List, {ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Collapse from 'material-ui/transitions/Collapse';

import classnames from 'classnames';
import withStyles from '../../styles/menu';

import IconPerson from 'material-ui-icons/Person';
import IconExpandMore from 'material-ui-icons/ExpandMore';


class NavList extends Component {

  constructor(props) {

    super(props);

    this.state = {
      expanded: {
        orders: false,
      },
    };

    this.key = 0;
    this._list = [];
    for (let item of props.items) {
      this.addItem(item, this._list);
    }

  }

  addItem(item, recipient) {
    this.key += 1;
    if (item.items) {
      const items = [];
      item.items.forEach(item => {
        this.addItem(item, items);
      });
      recipient.push(this.menuGroup(item, items));
    }
    else {
      recipient.push(this.menuItem(item));
    }
  }

  menuItem(item) {
    return <ListItem button key={this.key} onClick={this.handleNavigate(item.navigate)}>
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText primary={item.text}/>
    </ListItem>;
  }

  menuGroup(item, items) {
    const {classes} = this.props;
    const expander = this.handleExpanded(item.id);
    const {expanded} = this.state;
    return <div className={classes.list}>
      <ListItem button key={this.key} onClick={expander}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text}/>
        <ListItemSecondaryAction>
          <IconButton className={classnames(classes.expand, {[classes.expandOpen]: expanded[item.id]})} onClick={expander}>
            <IconExpandMore/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={expanded[item.id]} transitionDuration="auto" unmountOnExit>
        {items}
      </Collapse>
    </div>;
  }

  handleNavigate(path) {

    if (typeof path == 'function') {
      return path.bind(this);
    }

    return () => {
      this.props.handleClose();
      this.props.handleNavigate(path);
    };
  }

  handleExpanded(name) {
    return (function () {
      const expanded = Object.assign({}, this.state.expanded);
      expanded[name] = !expanded[name];
      this.setState({expanded});
    }).bind(this);
  }

  render() {

    const {props} = this;
    const {classes} = props;

    const order_expand = this.handleExpanded('order');

    return (
      <List className={classes.list}>
        {this._list}
      </List>
    );
  }
}

NavList.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(NavList);

