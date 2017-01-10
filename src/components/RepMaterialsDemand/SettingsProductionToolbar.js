import React, {Component, PropTypes} from "react";
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import AddIcon from "material-ui/svg-icons/content/add-circle-outline";
import RemoveIcon from "material-ui/svg-icons/action/delete";
import SelectOrder from "./SelectOrder";

export default class SettingsProductionToolbar extends Component{

  static propTypes = {

    handleAdd: PropTypes.func.isRequired,             // обработчик добавления объекта
    handleRemove: PropTypes.func.isRequired,          // обработчик удаления строки
    handleCustom: PropTypes.func.isRequired

  }

  render(){

    const {handleAdd, handleRemove, handleCustom} = this.props;

    return (

      <Toolbar>
        <ToolbarGroup className={"meta-toolbar-group"} firstChild={true}>
          <IconButton touch={true} tooltip="Добавить строку" tooltipPosition="bottom-right" onTouchTap={handleAdd}>
            <AddIcon />
          </IconButton>
          <IconButton touch={true} tooltip="Удалить строку" onTouchTap={handleRemove}>
            <RemoveIcon />
          </IconButton>
          <ToolbarSeparator />

          <SelectOrder
            handleSelect={handleCustom}
          />

        </ToolbarGroup>
      </Toolbar>
    )
  }
}

