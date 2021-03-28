import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import grey from '@material-ui/core/colors/grey';
import {makeStyles} from '@material-ui/core/styles';

import Tip from 'wb-forms/dist/Common/Tip';
import Notifications from '../Notifications';
import Menu from '../Menu';


export const useStyles = makeStyles({
  title: {
    flexGrow: 1,
  },
  toolbar: {
    backgroundColor: grey[200],
  },
});


export default function BuilderToolbar() {

  const classes = useStyles();

  return <Toolbar disableGutters className={classes.toolbar}>
    <Menu />
    <div className={classes.title} />
    <Notifications />
  </Toolbar>;
}

BuilderToolbar.propTypes = {
};
