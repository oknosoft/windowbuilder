import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import HtmlTooltip from 'metadata-react/App/Tip';

export function ToolbarMenu({title, icon, items}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return <>
    <HtmlTooltip title={title}>
      <IconButton onClick={openMenu}>{icon}</IconButton>
    </HtmlTooltip>
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={closeMenu}
      slotProps={{
        list: {
          'aria-labelledby': 'basic-button',
        },
      }}
    >
      {open && items.map(({text, action, divider}, index) => divider ?
        <Divider variant="middle" component="li" /> :
        <MenuItem key={`mi-${index}`} onClick={() => {
          closeMenu();
          action();
        }}>{text}</MenuItem>)}
    </Menu>
  </>;
}
