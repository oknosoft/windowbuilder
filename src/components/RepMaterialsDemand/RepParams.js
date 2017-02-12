import React, {Component, PropTypes} from "react";
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import AddIcon from "material-ui/svg-icons/content/add-circle-outline";
import RemoveIcon from "material-ui/svg-icons/action/delete";
import TabularSection from "metadata-ui/TabularSection";
import SelectOrder from "./SelectOrder";


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

export default class RepParams extends Component{

  static propTypes = {

    handleAdd: PropTypes.func,             // обработчик добавления объекта
    handleRemove: PropTypes.func,          // обработчик удаления строки
    _obj: PropTypes.object.isRequired,

  }

  handleCustom = (row, _mgr) => {
    this.props._obj.fill_by_order(row, _mgr)
      .then((objs) => {
        this.refs.production.forceUpdate()
      })
  }

  render(){

    const {handleAdd, handleRemove, _obj} = this.props;

    return (

      <TabularSection
        _obj={_obj}
        _tabular="production"
        ref="production"
        minHeight={308}
        Toolbar={SettingsToolbar}
        handleAdd={handleAdd}
        handleRemove={handleRemove}
        handleCustom={this.handleCustom}
      />
    )
  }

}

