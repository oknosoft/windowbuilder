/**
 * ### AppBar, Drawer с навигацией и UserButtons
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import RightButtons from '../HeaderRightButtons';
import LeftMenuDrawer from '../HeaderLeftMenu';

import withStyles from '../../styles/toolbar';
import withIface from '../../redux/withIface';

import items from './navlist_items'; // массив элементов меню

class Header extends Component {

  render() {

    const {props} = this;
    const {classes, title, handleNavigate} = props;

    return (<AppBar position="static" className={classes.appbar}>
      <Toolbar className={classes.bar}>
        <LeftMenuDrawer items={items} />
        <Typography type="title" color="inherit" className={classes.flex}>{title}</Typography>
        <RightButtons handleNavigate={handleNavigate}/>
      </Toolbar>
    </AppBar>);
  }

}
Header.propTypes = {
  title: PropTypes.string.isRequired, // заголовок AppBar
  handleNavigate: PropTypes.func.isRequired,
};

export default withStyles(withIface(Header));
