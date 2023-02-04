import React from 'react';
import PropTypes from 'prop-types';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';

export default function (props) {
  const {classes, handleSelect} = props;
  return <Toolbar disableGutters className={classes?.toolbar}>
    <Button startIcon={<PlaylistAddCheckIcon/>} onClick={handleSelect}>Выбрать</Button>
  </Toolbar>;
}
