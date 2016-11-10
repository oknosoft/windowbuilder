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

import ReportSettings from './Settings';


import classes from './RepMaterialsDemand.scss'

export default class DataObjToolbar extends Component{

  static propTypes = {

    handleSave: PropTypes.func.isRequired,        // обработчик формирования отчета
    handlePrint: PropTypes.func.isRequired,       // обработчик открытия диалога печати
    handleClose: PropTypes.func.isRequired,       // команда Закрыть форму

    _obj: PropTypes.object,

  }

  render(){

    const props = this.props;

    return (

      <Toolbar className={classes.toolbar}>
        <ToolbarGroup firstChild={true}>
          <FlatButton
            label="Сформировать"
            labelPosition="after"
            icon={<RunIcon />}
            className={classes.tbButton}
            onTouchTap={props.handleSave}
          >
          </FlatButton>

        </ToolbarGroup>

        <ToolbarGroup>

          <ReportSettings _obj={props._obj} />

          <IconButton touch={true} onTouchTap={props.handleClose}>
            <CloseIcon />
          </IconButton>

        </ToolbarGroup>

      </Toolbar>
    )
  }
}

