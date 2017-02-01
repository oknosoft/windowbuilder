/**
 * ### AppBar, Drawer с навигацией и UserButtons
 */

import React, {Component, PropTypes} from "react";
import AppBar from "material-ui/AppBar";
import NavUserButtons from "./NavUserButtons";
import NavList from "metadata-react-ui/NavList";

export default class Header extends Component {

  static propTypes = {

    title: PropTypes.string.isRequired,         // заголовок AppBar
    navlist_items: PropTypes.array.isRequired,  // массив элементов меню

    sync_started: PropTypes.bool,               // выполняется синхронизация
    show_indicator: PropTypes.bool,             // показывать ли индикатор синхронизации
    logged_in: PropTypes.bool,                  // пользователь залогинен
    sync_tooltip: PropTypes.string.isRequired,  // текст всплывающей подсказки синхронизации
    notifications_tooltip: PropTypes.string.isRequired, // текст всплывающей подсказки оповещений
    button_label: PropTypes.string.isRequired,  // текст кнопки текущего пользователя (правая)

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
