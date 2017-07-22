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



export default [
  {
    text: 'Заказы',
    icon: <IconBusinessCenter />,
    open: true,
    id: 'orders',
    items: [
      {
        text: 'Черновики',
        navigate: '/rep.cash_moving/main',
        icon: <IconDrafts />,
        id: 'draft',
        title: 'Предварительные расчеты'
      },
      {
        text: 'Отправлено',
        navigate: '/rep.cash_moving/main',
        icon: <IconSend />,
        id: 'sent',
        title: 'Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в \'черновики\')'
      },
      {
        text: 'Согласовано',
        navigate: '/rep.cash_moving/main',
        icon: <IconConfitmed />,
        id: 'confirmed',
        title: 'Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером'
      },
      {
        text: 'Отклонено',
        navigate: '/rep.cash_moving/main',
        icon: <IconDeclined />,
        id: 'declined',
        title: 'Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации'
      },
      {
        text: 'Сервис',
        navigate: '/rep.cash_moving/main',
        icon: <IconService />,
        id: 'service',
        title: 'Заказы на сервисное обслуживание'
      },
      {
        text: 'Рекламации',
        navigate: '/rep.cash_moving/main',
        icon: <IconComplaints />,
        id: 'complaints',
        title: 'Жалобы и рекламации'
      },
      {
        text: 'Шаблоны',
        navigate: '/rep.cash_moving/main',
        icon: <IconPuzzle />,
        id: 'template',
        title: 'Типовые блоки'
      },
      {
        text: 'Архив',
        navigate: '/rep.cash_moving/main',
        icon: <IconFileDownload />,
        id: 'zarchive',
        title: 'Старые заказы'
      },
      {
        text: 'Все',
        navigate: '/rep.cash_moving/main',
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
];
