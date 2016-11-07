import React, {Component, PropTypes} from "react";
import { IndexLink, Link } from 'react-router'
import NavUserButtons from '../NavUserButtons'
import NavList from '../NavList'
import classes from './Header.scss'


import $p from 'metadata'

import AppBar from 'material-ui/AppBar';

export default class Header extends Component {

  static propTypes = {

    sync_started: PropTypes.bool,
    show_indicator: PropTypes.bool,
    logged_in: PropTypes.bool,

    title: PropTypes.string.isRequired,
    sync_tooltip: PropTypes.string.isRequired,
    notifications_tooltip: PropTypes.string.isRequired,
    button_label: PropTypes.string.isRequired

  }

  render () {

    const { props } = this

    return (
      <AppBar
        title={props.title}
        titleStyle={{fontSize: 18}}
        iconElementLeft={<NavList {...props} />}
        iconElementRight={<NavUserButtons {...props} />}

      />
    )
  }

}
