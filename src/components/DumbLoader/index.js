import React from 'react';
import CircularProgress from 'material-ui/CircularProgress'
import classes from './DumbLoader.scss'

export default () => <CircularProgress size={120} thickness={5} className={classes.progress} />
