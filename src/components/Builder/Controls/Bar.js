
import React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  positionStatic: {
    boxShadow: 'none',
  },
}));

export default function Bar({children}) {
  return <AppBar position="static" classes={useStyles()}>{children}</AppBar>;
}

Bar.propTypes = {
  children: PropTypes.node,
};
