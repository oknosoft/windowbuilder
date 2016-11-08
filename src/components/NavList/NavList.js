import React, {Component, PropTypes} from "react";

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import AppBar from 'material-ui/AppBar';
import {white} from 'material-ui/styles/colors';

import {List, ListItem} from 'material-ui/List';

import IconInfo from 'material-ui/svg-icons/action/info';
import IconList from 'material-ui/svg-icons/action/list';
import IconPerson from 'material-ui/svg-icons/social/person';

import IconInbox from 'material-ui/svg-icons/content/inbox';
import IconDrafts from 'material-ui/svg-icons/content/drafts';
import IconSend from 'material-ui/svg-icons/content/send';
import IconThumbUp from 'material-ui/svg-icons/action/thumb-up';
import IconThumbDown from 'material-ui/svg-icons/action/thumb-down';
import IconMoodBad from 'material-ui/svg-icons/social/mood-bad';
import IconLocalPharmacy from 'material-ui/svg-icons/maps/local-pharmacy';


export default class NavList extends Component {

  static propTypes = {
    navlist_open: PropTypes.bool,
    handleNavlistOpen: PropTypes.func.isRequired
  }

  static contextTypes = {
    handleLocationChange: React.PropTypes.func.isRequired
  }

  handleClose = () => {
    this.props.handleNavlistOpen(false)
  }

  handleToggle = () => {
    this.props.handleNavlistOpen(!this.props.navlist_open)
  }

  handleNavigate = (path) => {

    return () => {
      this.handleClose()
      this.context.handleLocationChange(path)
    }
  }

  render() {
    return (
      <div>
        <IconButton onTouchTap={this.handleToggle} ><NavigationMenu color={white} /></IconButton>
        <Drawer
          docked={false}
          width={300}
          open={this.props.navlist_open}
          onRequestChange={(open) => this.props.handleNavlistOpen(open)}
        >

          <AppBar
            onLeftIconButtonTouchTap={this.handleClose}
            title={this.props.title}
            titleStyle={{fontSize: 18}}
          />

          <List>

            <ListItem
              primaryText="Заказы"
              leftIcon={<IconInbox />}
              initiallyOpen={false}
              primaryTogglesNestedList={true}
              nestedItems={[

                <MenuItem primaryText="Черновики" onTouchTap={this.handleNavigate('/doc_calc_order/list/draft')} leftIcon={<IconDrafts />} />,
                <MenuItem primaryText="Отправлено" onTouchTap={this.handleNavigate('/doc_calc_order/list/sent')} leftIcon={<IconSend />} />,
                <MenuItem primaryText="Согласовано" onTouchTap={this.handleNavigate('/doc_calc_order/list/confirmed')} leftIcon={<IconThumbUp />} />,
                <MenuItem primaryText="Отклонено" onTouchTap={this.handleNavigate('/doc_calc_order/list/declined')} leftIcon={<IconThumbDown />} />,
                <MenuItem primaryText="Сервис" onTouchTap={this.handleNavigate('/doc_calc_order/list/service')} leftIcon={<IconLocalPharmacy />} />,
                <MenuItem primaryText="Рекламации" onTouchTap={this.handleNavigate('/doc_calc_order/list/complaints')} leftIcon={<IconMoodBad />} />,
                <MenuItem primaryText="Шаблоны" onTouchTap={this.handleNavigate('/doc_calc_order/list/template')} leftIcon={<IconDrafts />} />,
                <MenuItem primaryText="Архив" onTouchTap={this.handleNavigate('/doc_calc_order/list/zarchive')} leftIcon={<IconDrafts />} />,
                <MenuItem primaryText="Все" onTouchTap={this.handleNavigate('/doc_calc_order/list/all')} leftIcon={<IconDrafts />} />,

              ]}
            />

          </List>

          <List>

            <ListItem
              primaryText="Отчеты"
              leftIcon={<IconInbox />}
              initiallyOpen={true}
              primaryTogglesNestedList={true}
              nestedItems={[

                <MenuItem primaryText="Потребность" onTouchTap={this.handleNavigate('/rep_materials_demand/main')} leftIcon={<IconList />} />,

              ]}
            />

          </List>


          <MenuItem primaryText="Профиль" onTouchTap={this.handleNavigate('login')} leftIcon={<IconPerson />} />
          <MenuItem primaryText="О программе" onTouchTap={this.handleNavigate('about')} leftIcon={<IconInfo />} />

        </Drawer>
      </div>
    );
  }
}

