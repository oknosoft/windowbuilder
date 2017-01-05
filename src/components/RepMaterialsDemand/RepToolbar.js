import React, { Component, PropTypes } from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import RunIcon from 'material-ui/svg-icons/av/play-arrow';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/MenuItem';
import PrintIcon from 'material-ui/svg-icons/action/print';


import SchemeSettings from "../SchemeSettings";
import TabularSection from '../TabularSection'
import SettingsProductionToolbar from './SettingsProductionToolbar';


import classes from './RepMaterialsDemand.scss'

export default class RepToolbar extends Component{

  static propTypes = {

    handleSave: PropTypes.func.isRequired,        // обработчик формирования отчета
    handlePrint: PropTypes.func.isRequired,       // обработчик открытия диалога печати
    handleClose: PropTypes.func.isRequired,       // команда Закрыть форму

    handleSchemeChange: PropTypes.func.isRequired,    // обработчик при изменении настроек компоновки
    scheme: PropTypes.object.isRequired,              // значение настроек компоновки

    _obj: PropTypes.object,

  }

  render(){

    const {handleSave, handleClose, handleSchemeChange, scheme, _obj} = this.props;

    return (

      <Toolbar>
        <ToolbarGroup className={"meta-toolbar-group"} firstChild={true}>
          <FlatButton
            label="Сформировать"
            labelPosition="after"
            icon={<RunIcon />}
            className={classes.tbButton}
            onTouchTap={handleSave}
          >
          </FlatButton>

        </ToolbarGroup>

        <ToolbarGroup className={"meta-toolbar-group"}>

          <SchemeSettings
            handleSchemeChange={handleSchemeChange}
            scheme={scheme}
            tabParams={<TabularSection
              _obj={_obj}
              _tabular="production"
              minHeight={140}
              Toolbar={SettingsProductionToolbar}
              handleCustom={() => { console.log('handleCustom') }}
            />}
          />

          <IconButton touch={true} onTouchTap={handleClose}>
            <CloseIcon />
          </IconButton>

        </ToolbarGroup>

      </Toolbar>
    )
  }
}

