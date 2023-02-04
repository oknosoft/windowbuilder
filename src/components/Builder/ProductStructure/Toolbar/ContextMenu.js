import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function ContextMenu({item, anchorEl, handleClick, handleClose}) {

  return (
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem dense onClick={handleClick}>act 1</MenuItem>
      <MenuItem dense onClick={handleClick}>act 2</MenuItem>
    </Menu>
  );
}
