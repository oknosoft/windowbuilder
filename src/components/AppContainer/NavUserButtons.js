/**
 * ### Кнопки в правом верхнем углу AppBar
 * войти-выйти, имя пользователя, состояние репликации, индикатор оповещений
 */

import React, {PropTypes} from "react";
import MetaComponent from "metadata-ui/common/MetaComponent";

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


const refreshStyles = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    backgroundColor: 'transparent',
    boxShadow: 'none'
  },
};

export default class NavUserButtons extends MetaComponent{

  static propTypes = {

    sync_started: PropTypes.bool,
    sync_tooltip: PropTypes.string.isRequired,
    show_indicator: PropTypes.bool,

    logged_in: PropTypes.bool,

    show_notifications: PropTypes.bool,
    notifications_tooltip: PropTypes.string.isRequired,
    button_label: PropTypes.string.isRequired

  }

  handleLogin = (e) => {
    this.context.$p.UI.history.push('/login')
  }

  render () {

    const {show_indicator, show_notifications, sync_started, sync_tooltip, notifications_tooltip, button_label} = this.props

    return (
      <div>

        { show_indicator

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
          <IconButton tooltip={sync_tooltip} className="meta-appbar-button" tooltipPosition="bottom-left" touch={true}>
            {sync_started ?
              <SyncIcon color={white}/>
              :
              <SyncIconDisabled color={white}/>
            }
          </IconButton>
        }

        {
          show_notifications

            ?
            <IconButton tooltip={notifications_tooltip} className="meta-appbar-button" touch={true}>
              <NotificationsIconNone color={white} />
            </IconButton>
            :
            ''
        }

        <FlatButton
          label={button_label}
          onTouchTap={this.handleLogin}
          className="meta-appbar-button"
        />

      </div>
    )
  }
}


