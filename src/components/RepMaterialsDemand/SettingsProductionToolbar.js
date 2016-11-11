import React, { Component, PropTypes } from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui/svg-icons/content/add-circle-outline';
import RemoveIcon from 'material-ui/svg-icons/action/delete';
import OrderIcon from 'material-ui/svg-icons/action/work';

import classes from './RepMaterialsDemand.scss'

export default class SettingsProductionToolbar extends Component{

  static propTypes = {

    handleAdd: PropTypes.func.isRequired,             // обработчик добавления объекта
    handleRemove: PropTypes.func.isRequired,          // обработчик удаления строки

    handleCustom: PropTypes.func.isRequired

  }

  render(){
    const props = this.props;
    return (

      <Toolbar className={classes.toolbar}>
        <ToolbarGroup firstChild={true}>
          <IconButton touch={true} tooltip="Добавить строку" tooltipPosition="bottom-right" onTouchTap={props.handleAdd}>
            <AddIcon />
          </IconButton>
          <IconButton touch={true} tooltip="Удалить строку" onTouchTap={props.handleRemove}>
            <RemoveIcon />
          </IconButton>
          <ToolbarSeparator />
          <IconButton touch={true} tooltip="Заполнить по заказу" onTouchTap={props.handleCustom}>
            <OrderIcon />
          </IconButton>
        </ToolbarGroup>
      </Toolbar>
    )
  }
}

