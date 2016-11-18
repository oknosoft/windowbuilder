import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import CircularProgress from 'material-ui/CircularProgress';

import classes from './DumbLoader.scss'


export default class DumbScreen extends Component {

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

    let { title, img } = this.props;

    if(!title)
      title = "Заставка загрузка модулей...";

    return (
    <div>

      <div className={classes.progress} style={{position: 'relative', width: 300}}>{title}</div>

      { img }

    </div>

    );
  }
}
