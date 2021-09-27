
import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  positionStatic: {
    boxShadow: 'none',
  },
}));

export default function Bar({children}) {
  return <AppBar position="static" classes={useStyles()}>{children}</AppBar>
}
