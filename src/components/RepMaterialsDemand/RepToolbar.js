
import React, {PropTypes} from "react";
import MetaComponent from "../common/MetaComponent";

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import SettingsProductionToolbar from "./SettingsProductionToolbar";
import MenuItem from "material-ui/MenuItem";

import RunIcon from "material-ui/svg-icons/av/play-arrow";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PrintIcon from "material-ui/svg-icons/action/print";
import CopyIcon from "material-ui/svg-icons/content/content-copy";
import CloudDownloadIcon from "material-ui/svg-icons/file/cloud-download";
import FileDownloadIcon from "material-ui/svg-icons/file/file-download";

import SchemeSettings from "../SchemeSettings";
import TabularSection from "../TabularSection";

export default class RepToolbar extends MetaComponent {

  static propTypes = {

    handleSave: PropTypes.func.isRequired,        // обработчик формирования отчета
    handlePrint: PropTypes.func.isRequired,       // обработчик открытия диалога печати
    handleClose: PropTypes.func.isRequired,       // команда Закрыть форму

    handleSchemeChange: PropTypes.func.isRequired,    // обработчик при изменении настроек компоновки
    scheme: PropTypes.object.isRequired,              // значение настроек компоновки

    _obj: PropTypes.object,
    _tabular: PropTypes.string.isRequired,
    _columns: PropTypes.array.isRequired,   // колонки

  }

  handleCustom = (row, _mgr) => {
    this.props._obj.fill_by_order(row, _mgr)
      .then((objs) => {
        this.refs.production.forceUpdate()
      })
  }

  constructor (props, context) {

    super(props, context);

    context.$p.UI.export_handlers.call(this);

  }

  render() {

    const {handleCustom, handleExportXLS, handleExportJSON, handleExportCSV, props} = this;
    const {handleSave, handleClose, handleSchemeChange, handlePrint, scheme, _obj, _tabular} = props;

    return (

      <Toolbar>
        <ToolbarGroup className={"meta-toolbar-group"} firstChild={true}>
          <IconButton touch={true} tooltip="Сформировать отчет" tooltipPosition="bottom-right" onTouchTap={handleSave}>
            <RunIcon />
          </IconButton>
        </ToolbarGroup>

        <ToolbarGroup className={"meta-toolbar-group"}>

          <SchemeSettings
            handleSchemeChange={handleSchemeChange}
            scheme={scheme}

            tabParams={<TabularSection
              ref="production"
              _obj={_obj}
              _tabular="production"
              minHeight={308}
              Toolbar={SettingsProductionToolbar}
              handleCustom={handleCustom}
            />}
          />

          <IconMenu
            iconButtonElement={
              <IconButton touch={true} tooltip="Дополнительно" tooltipPosition="bottom-left">
                <MoreVertIcon />
              </IconButton>
            }
          >
            <MenuItem primaryText="Печать" leftIcon={<PrintIcon />} disabled onTouchTap={handlePrint}/>
            <MenuItem primaryText="Копировать CSV" leftIcon={<CopyIcon />} onTouchTap={handleExportCSV}/>
            <MenuItem primaryText="Копировать JSON" leftIcon={<CloudDownloadIcon />} onTouchTap={handleExportJSON}/>
            <MenuItem primaryText="Экспорт в XLS" leftIcon={<FileDownloadIcon />} onTouchTap={handleExportXLS}/>

          </IconMenu>

        </ToolbarGroup>

      </Toolbar>
    )
  }
}

