import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

export default function ContextMenu({mouseX, mouseY, editor, handleClose, Component, ...other}) {

  const open = mouseY !== null && mouseX !== null;
  return (
    <Menu
      keepMounted
      open={open}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={open ? { top: mouseY, left: mouseX } : undefined}
    >
      {open ? (
        Component ?
          <Component editor={editor} {...other} />
          :
          <>
            <MenuItem dense onClick={handleClose}>act 1</MenuItem>
            <MenuItem dense onClick={handleClose}>act 2</MenuItem>
          </>
      ) : null}
    </Menu>
  );
}


