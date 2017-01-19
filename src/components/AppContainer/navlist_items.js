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
import IconUndo from "material-ui/svg-icons/content/undo";
import IconWork from "material-ui/svg-icons/action/work";

export default [
  {
    text: 'Заказы',
    navigate: 'doc_calc_order/list/draft',
    icon: <IconWork />
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
    text: 'Версия 0.12',
    navigate: () => {location.replace("/")},
    icon: <IconUndo />
  },
  {
    text: 'О программе',
    navigate: 'about',
    icon: <IconInfo />
  }
]
