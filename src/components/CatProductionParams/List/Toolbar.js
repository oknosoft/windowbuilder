import React from 'react';
import PropTypes from 'prop-types';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import BackspaceIcon from '@material-ui/icons/Backspace';
import Divider from '@material-ui/core/Divider';

export default function (props) {
  const {classes, handleSelect, resetTemplate} = props;
  return <Toolbar disableGutters className={classes?.toolbar}>
    <Button startIcon={<PlaylistAddCheckIcon/>} onClick={handleSelect}>Выбрать</Button>
    <Divider orientation="vertical" flexItem light className={classes?.divider}/>
    <Button startIcon={<BackspaceIcon/>} onClick={resetTemplate}>Сброс шаблона</Button>
  </Toolbar>;
}
