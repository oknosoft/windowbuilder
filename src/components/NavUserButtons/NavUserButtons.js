import React, {Component, PropTypes} from "react";

import FlatButton from 'material-ui/FlatButton';
import {white} from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import NotificationsIconActive from 'material-ui/svg-icons/social/notifications-active';
import NotificationsIconNone from 'material-ui/svg-icons/social/notifications-none';

import SyncIcon from 'material-ui/svg-icons/notification/sync';
import SyncIconProblem from 'material-ui/svg-icons/notification/sync-problem';
import SyncIconDisabled from 'material-ui/svg-icons/notification/sync-disabled';

import classes from './NavUserButtons.scss'


const refreshStyles = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none'
  },
};

export default class NavUserButtons extends Component{

  static propTypes = {

    sync_started: PropTypes.bool,
    sync_tooltip: PropTypes.string.isRequired,
    show_indicator: PropTypes.bool,

    logged_in: PropTypes.bool,

    show_notifications: PropTypes.bool,
    notifications_tooltip: PropTypes.string.isRequired,
    button_label: PropTypes.string.isRequired

  }

  static defaultProps = {
    show_notifications: true
  };

  static contextTypes = {
    handleLocationChange: React.PropTypes.func.isRequired
  }

  handleLogin = (e) => {
    this.context.handleLocationChange('/login')
  }

  render () {

    return (
      <div>

        { this.props.show_indicator

          ?
          <RefreshIndicator
            size={30}
            left={0}
            top={7}
            status="loading"
            loadingColor={"#FFFFFF"}
            style={refreshStyles.refresh}
          />
          :
          <IconButton tooltip={this.props.sync_tooltip} className={classes.barButton} touch={true}>
            {this.props.sync_started ?
              <SyncIcon color={white}/>
              :
              <SyncIconDisabled color={white}/>
            }
          </IconButton>
        }

        {
          this.props.show_notifications

            ?
            <IconButton tooltip={this.props.notifications_tooltip} className={classes.barButton} touch={true}>
              <NotificationsIconNone color={white} />
            </IconButton>
            :
            ''
        }

        <FlatButton
          label={this.props.button_label}
          onTouchTap={this.handleLogin}
          className={classes.barButton}
        />

      </div>
    )
  }
}


