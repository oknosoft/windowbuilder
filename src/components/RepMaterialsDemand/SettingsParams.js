import React, {Component, PropTypes} from "react";
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import AddIcon from "material-ui/svg-icons/content/add-circle-outline";
import RemoveIcon from "material-ui/svg-icons/action/delete";
import SelectOrder from "./SelectOrder";

import TabularSection from "../TabularSection";

class SettingsToolbar extends Component{

  static propTypes = {

    handleAdd: PropTypes.func,             // обработчик добавления объекта
    handleRemove: PropTypes.func,          // обработчик удаления строки
    handleCustom: PropTypes.func

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

export default class SettingsParams extends Component{

  static propTypes = {

    handleAdd: PropTypes.func,             // обработчик добавления объекта
    handleRemove: PropTypes.func,          // обработчик удаления строки
    handleCustom: PropTypes.func,
    _obj: PropTypes.object.isRequired,

  }

  render(){

    const {handleAdd, handleRemove, handleCustom, _obj} = this.props;

    return (

      <TabularSection
        _obj={_obj}
        _tabular="production"
        minHeight={308}
        Toolbar={SettingsToolbar}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleCustom={handleCustom}
      />
    )
  }

}

