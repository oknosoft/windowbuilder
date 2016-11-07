/**
 * Уровень под провайдером и роутингом
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { AutoSizer } from "react-virtualized"

import Header from "components/Header";

import classes from "./CoreLayout.scss";
import "../../styles/core.scss";


import { navlist_open } from '../../store/ifaceReducer'

let data_empty_timer

class CoreLayout extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {data_empty: false};
  }

  render() {

    const { props } = this

    if(props.data_empty){
      this.state.data_empty = true;
      if(data_empty_timer){
        clearTimeout(data_empty_timer)
      }
      data_empty_timer = setTimeout( () => {
        data_empty_timer = 0
        this.setState({
          data_empty: false
        })
      }, 4000)
    }

    return (
      <AutoSizer >
        {({width, height}) => {
          return (
            <div style={{width: width}}>
              <Header {...props} />
              <div className={classes.mainContainer}>
                {React.cloneElement(props.children, { height, width, data_empty: this.state.data_empty })}
              </div>
            </div>
          )
        }}
      </AutoSizer>
    )
  }

}

const mapDispatchToProps = {

  handleNavlistOpen: navlist_open

}

// здесь state - это состояние хранилища, а не состояние компонента
function mapStateToProps(state, props) {

  const { meta, iface } = state

  return {

    state_user: meta.user,

    sync_started: meta.sync_started,
    show_indicator: meta.fetch_remote || meta.fetch_local,
    logged_in: meta.user.logged_in,
    data_empty: meta.data_empty,
    navlist_open: iface.navlist_open,
    show_notifications: false,

    title: "Штрихкоды",
    sync_tooltip: meta.sync_started ? "Синхронизация выполняется" : "Синхронизация отключена",
    notifications_tooltip: "Сообщений нет",
    button_label: (state.meta.user.logged_in || state.meta.user.defined) ? state.meta.user.name : "Вход / регистрация",

  }

}

export default connect(mapStateToProps, mapDispatchToProps)(CoreLayout)
