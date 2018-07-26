import React from 'react';

import IconInbox from '@material-ui/icons/Inbox';
//import IconList from '@material-ui/icons/List';
import IconHelp from '@material-ui/icons/Help';
import IconInfo from '@material-ui/icons/Info';
import IconPerson from '@material-ui/icons/Person';
import IconSettings from '@material-ui/icons/PermDataSetting';
import IconBusinessCenter from '@material-ui/icons/BusinessCenter';
import IconReceipt from '@material-ui/icons/Receipt';

import IconDrafts from '@material-ui/icons/Edit';
import IconSend from '@material-ui/icons/Send';
import IconConfitmed from '@material-ui/icons/ThumbUp';
import IconDeclined from '@material-ui/icons/ThumbDown';
import IconService from '@material-ui/icons/Build';
import IconComplaints from '@material-ui/icons/BugReport';
import IconPuzzle from '@material-ui/icons/Extension';
import IconFileDownload from '@material-ui/icons/CloudDownload';
import IconFileShuffle from '@material-ui/icons/Shuffle';

const items = [
  {
    text: 'Заказы',
    icon: <IconBusinessCenter/>,
    open: true,
    id: 'orders',
    items: [
      {
        text: 'Черновики',
        navigate: state_filter,
        icon: <IconDrafts/>,
        id: 'draft',
        title: 'Предварительные расчеты',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Отправлено',
        navigate: state_filter,
        icon: <IconSend/>,
        id: 'sent',
        title: 'Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в \'черновики\')',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Согласовано',
        navigate: state_filter,
        icon: <IconConfitmed/>,
        id: 'confirmed',
        title: 'Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Отклонено',
        navigate: state_filter,
        icon: <IconDeclined/>,
        id: 'declined',
        title: 'Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Сервис',
        navigate: state_filter,
        icon: <IconService/>,
        id: 'service',
        title: 'Заказы на сервисное обслуживание',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Рекламации',
        navigate: state_filter,
        icon: <IconComplaints/>,
        id: 'complaints',
        title: 'Жалобы и рекламации',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Шаблоны',
        navigate: state_filter,
        icon: <IconPuzzle/>,
        id: 'template',
        title: 'Типовые блоки',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Архив',
        navigate: state_filter,
        icon: <IconFileDownload/>,
        id: 'zarchive',
        title: 'Старые заказы',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Все',
        navigate: state_filter,
        icon: <IconFileShuffle/>,
        id: 'all',
        title: 'Отключить фильтр по статусам заказов',
        need_meta: true,
        need_user: true,
      },
    ],
  },
  {
    text: 'Документы',
    icon: <IconReceipt/>,
    open: true,
    id: 'docs',
    items: [
      {
        text: 'Касса приход',
        navigate: '/doc.debit_cash_order/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Касса расход',
        navigate: '/doc.credit_cash_order/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Оплата картой',
        navigate: '/doc.credit_card_order/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Банк приход',
        navigate: '/doc.debit_bank_order/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Банк расход',
        navigate: '/doc.credit_bank_order/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Поступление товаров услуг',
        navigate: '/doc.purchase/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Реализация товаров услуг',
        navigate: '/doc.selling/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Событие планирования',
        navigate: '/doc.planning_event/list',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Задание на производство',
        navigate: '/doc.work_centers_task/list',
        need_meta: true,
        need_user: true,
      },
    ],
  },
  {
    text: 'Отчеты',
    icon: <IconInbox/>,
    open: false,
    id: 'reports',
    items: [
      {
        text: 'Анализ спецификации',
        navigate: '/rep.materials_demand/main',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Исполнение заказов',
        navigate: '/rep.invoice_execution/main',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Денежные средства',
        navigate: '/rep.cash/main',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Товары на складах',
        navigate: '/rep.goods/main',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Продажи',
        navigate: '/rep.selling/main',
        need_meta: true,
        need_user: true,
      },
      {
        text: 'Взаиморасчеты',
        navigate: '/rep.mutual_settlements/main',
        need_meta: true,
        need_user: true,
      },
    ],
  },
  {
    text: 'Профиль',
    navigate: '/login',
    icon: <IconPerson/>,
  },
  {
    text: 'Настройки',
    navigate: '/settings',
    icon: <IconSettings/>,
    need_meta: true,
  },
  {
    text: 'Справка',
    navigate: function () {
      this.props.handleClose();
      window.open('https://github.com/oknosoft/windowbuilder/wiki');
    },
    icon: <IconHelp/>
  },
  {
    text: 'О программе',
    navigate: '/about',
    icon: <IconInfo/>,
  },
];

function path_ok(path, item) {
  let pos;
  if(typeof item.navigate == 'function'){
    pos = path == '/';
  }
  else{
    pos = item.navigate && item.navigate.indexOf(path);
  }
  return pos === 0 || pos === 1;
}

function with_recursion(path, parent) {
  if(path && path != '/'){
    for(const item of parent){
      const props = item.items ? with_recursion(path, item.items) : path_ok(path, item) && item;
      if(props){
        return props;
      }
    }
  }
}

function state_filter(id) {
  const {handleIfaceState, handleClose, handleNavigate} = this.props;
  handleClose();
  handleNavigate('/');
  set_state_and_title(id, handleIfaceState);
}

export function set_state_and_title(id, handleIfaceState) {
  handleIfaceState({
    component: 'CalcOrderList',
    name: 'state_filter',
    value: id,
  });
  for (const item of items[0].items) {
    if (item.id == id) {
      handleIfaceState({
        component: '',
        name: 'title',
        value: `Заказы (${item.text})`,
      });
      break;
    }
  }
}

export function item_props(path) {
  if(!path){
    path = location.pathname;
  }
  // здесь можно переопределить нужность meta и авторизованности для корневой страницы
  let res = with_recursion(path, items);
  if(!res && (path === '/' || path.match(/\/(doc|cat|ireg|cch|rep)\./) || path.match(/\/builder\//))){
    res = {need_meta: true, need_user: true};
  }
  return res || {};
}

export default items;
