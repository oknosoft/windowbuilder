import React from 'react';
import Tip from 'metadata-react/App/Tip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import VerticalAlignCenterIcon from '@material-ui/icons/VerticalAlignCenter';

export default function LayerAlign({editor}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  const {consts} = editor;
  const [selectMode, setMode] = React.useState(consts.mode === 'select');
  const handleMode = () => {
    consts.mode = selectMode ? '' : 'select';
    setMode(!selectMode);
    editor.project.draw_selection();
    handleClose();
  };

  return <>
    <Tip title={'Выравнивание слоёв' + (selectMode ? ' включено' : '')}>
      <Badge color="secondary" variant="dot" overlap="circle" invisible={!selectMode}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}>
          <VerticalAlignCenterIcon />
        </IconButton>
      </Badge>
    </Tip>
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={handleMode}>{selectMode ? 'Перейти в стандартный режим' : 'Активировать'}</MenuItem>
      <MenuItem onClick={handleClose}>My account</MenuItem>
      <MenuItem onClick={handleClose}>Logout</MenuItem>
    </Menu>
  </>;
}
