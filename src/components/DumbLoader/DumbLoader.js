import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import CircularProgress from 'material-ui/CircularProgress';

import classes from './DumbLoader.scss'


export default class DumbLoader extends Component {

  static propTypes = {
    step: PropTypes.number,
    step_size: PropTypes.number,
    count_all: PropTypes.number,

    text_title: PropTypes.string,
    text_processed: PropTypes.string,
    text_current: PropTypes.string,
    text_bottom: PropTypes.string
  }

  render() {
    return (
      <CircularProgress size={120} thickness={5} className={classes.progress} />
    );
  }
}
