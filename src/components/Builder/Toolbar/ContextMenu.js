import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function ContextMenu({mouseX, mouseY, editor, handleClose}) {

  return (
    <Menu
      keepMounted
      open={mouseY !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        mouseY !== null && mouseX !== null
          ? { top: mouseY, left: mouseX }
          : undefined
      }
    >
      <MenuItem dense onClick={handleClose}>act 1</MenuItem>
      <MenuItem dense onClick={handleClose}>act 2</MenuItem>
    </Menu>
  );
}


