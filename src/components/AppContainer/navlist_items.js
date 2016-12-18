import React from "react";
import IconDrafts from "material-ui/svg-icons/content/drafts";
import IconInbox from "material-ui/svg-icons/content/inbox";
import IconList from "material-ui/svg-icons/action/list";
import IconInfo from "material-ui/svg-icons/action/info";
import IconPerson from "material-ui/svg-icons/social/person";
import IconThumbUp from "material-ui/svg-icons/action/thumb-up";
import IconThumbDown from "material-ui/svg-icons/action/thumb-down";
import IconMoodBad from "material-ui/svg-icons/social/mood-bad";
import IconLocalPharmacy from "material-ui/svg-icons/maps/local-pharmacy";
import IconSend from "material-ui/svg-icons/content/send";

export default [
  {
    text: 'Заказы',
    icon: <IconInbox />,
    open: true,
    items: [
      {
        text: 'Черновики',
        navigate: 'doc_calc_order/list/draft',
        icon: <IconDrafts />
      },
      {
        text: 'Отправлено',
        navigate: 'doc_calc_order/list/sent',
        icon: <IconSend />
      },
      {
        text: 'Согласовано',
        navigate: 'doc_calc_order/list/confirmed',
        icon: <IconThumbUp />
      },
      {
        text: 'Отклонено',
        navigate: 'doc_calc_order/list/declined',
        icon: <IconThumbDown />
      },
      {
        text: 'Сервис',
        navigate: 'doc_calc_order/list/service',
        icon: <IconLocalPharmacy />
      },
      {
        text: 'Рекламации',
        navigate: 'doc_calc_order/list/complaints',
        icon: <IconMoodBad />
      },
      {
        text: 'Шаблоны',
        navigate: 'doc_calc_order/list/template',
        icon: <IconDrafts />
      },
      {
        text: 'Архив',
        navigate: 'doc_calc_order/list/zarchive',
        icon: <IconDrafts />
      },
      {
        text: 'Все',
        navigate: 'doc_calc_order/list/all',
        icon: <IconDrafts />
      }
    ]
  },
  {
    text: 'Отчеты',
    icon: <IconInbox />,
    open: true,
    items: [
      {
        text: 'Потребность',
        navigate: 'rep_materials_demand/main',
        icon: <IconList />
      }
    ]
  },
  {
    text: 'Профиль',
    navigate: 'login',
    icon: <IconPerson />
  },
  {
    text: 'О программе',
    navigate: 'about',
    icon: <IconInfo />
  }
]
