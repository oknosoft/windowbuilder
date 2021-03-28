import React from 'react';

import IconInfo from '@material-ui/icons/InfoOutlined';
import IconSettings from '@material-ui/icons/SettingsOutlined';
import IconHelp from '@material-ui/icons/HelpOutlineOutlined';
import IconBusinessCenter from '@material-ui/icons/BusinessCenterOutlined';
import IconBusiness from '@material-ui/icons/Business';
import IconContactPhone from '@material-ui/icons/ContactPhoneOutlined';
import IconAlarm from '@material-ui/icons/AccessAlarmOutlined';

// import IconPerson from '@material-ui/icons/Person';
// import IconDrafts from '@material-ui/icons/Drafts';
// import IconChart from '@material-ui/icons/InsertChart';
// import IconDoc from '@material-ui/icons/EventNote';
// import IconList from '@material-ui/icons/List';



const items = [
  {
    text: 'Проекты',
    navigate: 'projects/list',
    need_user: true,
    Icon: IconBusiness,
  },
  {
    text: 'Лиды',
    navigate: 'leads/list',
    need_user: true,
    Icon: IconContactPhone,
  },
  {
    text: 'Заказы',
    navigate: 'order/list',
    need_user: true,
    Icon: IconBusinessCenter,
  },
  {
    text: 'Планирование',
    navigate: 'plan',
    need_user: true,
    Icon: IconAlarm,
  },
  {
    divider: true,
  },
  {
    text: 'Настройки',
    navigate: 'settings',
    need_meta: true,
    Icon: IconSettings,
  },
  {
    text: 'Справка',
    navigate: 'help',
    Icon: IconHelp
  },
  {
    text: 'О программе',
    navigate: 'about',
    Icon: IconInfo
  }
];

export default items;
