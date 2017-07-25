import React from 'react';

import IconInbox from 'material-ui-icons/Inbox';
import IconList from 'material-ui-icons/List';
import IconInfo from 'material-ui-icons/Info';
import IconPerson from 'material-ui-icons/Person';
import IconSettings from 'material-ui-icons/Settings';
import IconBusinessCenter from 'material-ui-icons/BusinessCenter';

import IconDrafts from 'material-ui-icons/Edit';
import IconSend from 'material-ui-icons/Send';
import IconConfitmed from 'material-ui-icons/ThumbUp';
import IconDeclined from 'material-ui-icons/ThumbDown';
import IconService from 'material-ui-icons/Build';
import IconComplaints from 'material-ui-icons/BugReport';
import IconPuzzle from 'material-ui-icons/Extension';
import IconFileDownload from 'material-ui-icons/FileDownload';
import IconFileShuffle from 'material-ui-icons/Shuffle';

export function set_state_and_title(id, handleIfaceState) {
  handleIfaceState({
    component: 'CalcOrderList',
    name: 'state_filter',
    value: id,
  });
  for(const item of items[0].items){
    if(item.id == id){
      handleIfaceState({
        component: '',
        name: 'title',
        value: `Заказы (${item.text})`,
      });
      break;
    }
  }
}

function state_filter(id) {
  const {handleIfaceState, handleClose, handleNavigate} = this.props;
  handleClose();
  handleNavigate('/');
  set_state_and_title(id, handleIfaceState)
}

const items = [
  {
    text: 'Заказы',
    icon: <IconBusinessCenter />,
    open: true,
    id: 'orders',
    items: [
      {
        text: 'Черновики',
        navigate: state_filter,
        icon: <IconDrafts />,
        id: 'draft',
        title: 'Предварительные расчеты'
      },
      {
        text: 'Отправлено',
        navigate: state_filter,
        icon: <IconSend />,
        id: 'sent',
        title: 'Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в \'черновики\')'
      },
      {
        text: 'Согласовано',
        navigate: state_filter,
        icon: <IconConfitmed />,
        id: 'confirmed',
        title: 'Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером'
      },
      {
        text: 'Отклонено',
        navigate: state_filter,
        icon: <IconDeclined />,
        id: 'declined',
        title: 'Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации'
      },
      {
        text: 'Сервис',
        navigate: state_filter,
        icon: <IconService />,
        id: 'service',
        title: 'Заказы на сервисное обслуживание'
      },
      {
        text: 'Рекламации',
        navigate: state_filter,
        icon: <IconComplaints />,
        id: 'complaints',
        title: 'Жалобы и рекламации'
      },
      {
        text: 'Шаблоны',
        navigate: state_filter,
        icon: <IconPuzzle />,
        id: 'template',
        title: 'Типовые блоки'
      },
      {
        text: 'Архив',
        navigate: state_filter,
        icon: <IconFileDownload />,
        id: 'zarchive',
        title: 'Старые заказы'
      },
      {
        text: 'Все',
        navigate: state_filter,
        icon: <IconFileShuffle />,
        id: 'all',
        title: 'Отключить фильтр по статусам заказов'
      },
    ],
  },
  {
    text: 'Отчеты',
    icon: <IconInbox />,
    open: false,
    id: 'reports',
    items: [
      {
        text: 'Движение денег',
        navigate: '/rep.cash_moving/main',
        icon: <IconList />,
      },
    ],
  },
  {
    text: 'Профиль',
    navigate: '/login',
    icon: <IconPerson />,
  },
  {
    text: 'Настройки',
    navigate: '/settings',
    icon: <IconSettings />,
  },
  {
    text: 'О программе',
    navigate: '/about',
    icon: <IconInfo />,
  },
]

export default items;
