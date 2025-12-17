import React from 'react';
import Tip from 'metadata-react/App/Tip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import VerticalAlignCenterIcon from '@material-ui/icons/VerticalAlignCenter';
import SubdirectoryArrowLeftIcon from '@material-ui/icons/SubdirectoryArrowLeft';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';

function execJoin(smap, handleClose, editor, dir) {
  handleClose();
  const {order} = smap;
  const l1 = smap.get(order[1]);
  const l2 = smap.get(order[0]);
  switch (dir) {
    case 'rt':
      l2.move([l1.bounds.right - l2.bounds.left, l1.bounds.top - l2.bounds.top]);
      break;
    case 'rb':
      l2.move([l1.bounds.right - l2.bounds.left, l1.bounds.bottom - l2.bounds.bottom]);
      break;
    case 'br':
      l2.move([l1.bounds.right - l2.bounds.right, l1.bounds.bottom - l2.bounds.top]);
      break;
    case 'bl':
      l2.move([l1.bounds.left - l2.bounds.left, l1.bounds.bottom - l2.bounds.top]);
      break;
    case 'lt':
      l2.move([l1.bounds.left - l2.bounds.right, l1.bounds.top - l2.bounds.top]);
      break;
    case 'lb':
      l2.move([l1.bounds.left - l2.bounds.right, l1.bounds.bottom - l2.bounds.bottom]);
      break;
    case 'tr':
      l2.move([l1.bounds.right - l2.bounds.right, l1.bounds.top - l2.bounds.bottom]);
      break;
    case 'tl':
      l2.move([l1.bounds.left - l2.bounds.left, l1.bounds.top - l2.bounds.bottom]);
      break;
  }
  editor.eve.once('coordinates_calculated', (project) => {
    project.zoom_fit();
    project.draw_selection();
  });
}

export default function LayerAlign({editor}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);
  const {consts, project} = editor;
  const {smap} = project._attr;
  const [selectMode, setMode] = React.useState(consts.mode === 'select');
  const handleMode = () => {
    consts.mode = selectMode ? '' : 'select';
    setMode(!selectMode);
    project.draw_selection();
    handleClose();
  };
  const disabled = !smap || smap.size < 2;
  const join = (dir) => execJoin(smap, handleClose, editor, dir);

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
      <MenuItem onClick={handleMode}>
        <ListItemIcon>
          {selectMode ? <SettingsBackupRestoreIcon fontSize="small"/> : <CheckBoxOutlineBlankIcon fontSize="small"/>}
        </ListItemIcon>
        <ListItemText primary={selectMode ? 'Перейти в стандартный режим' : 'Активировать'} />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => join('rt')}>
        <ListItemIcon>
          <SubdirectoryArrowRightIcon fontSize="small" style={{transform: 'rotate(0.5turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Справа вверх" />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => join('rb')}>
        <ListItemIcon>
          <SubdirectoryArrowLeftIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Справа вниз" />
      </MenuItem>

      <MenuItem disabled={disabled} onClick={() => join('br')}>
        <ListItemIcon>
          <SubdirectoryArrowRightIcon fontSize="small" style={{transform: 'rotate(0.75turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Снизу вправо" />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => join('bl')}>
        <ListItemIcon>
          <SubdirectoryArrowLeftIcon fontSize="small" style={{transform: 'rotate(0.25turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Снизу влево" />
      </MenuItem>

      <MenuItem disabled={disabled} onClick={() => join('lt')}>
        <ListItemIcon>
          <SubdirectoryArrowLeftIcon fontSize="small" style={{transform: 'rotate(0.5turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Слева вверх" />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => join('lb')}>
        <ListItemIcon>
          <SubdirectoryArrowRightIcon fontSize="small"/>
        </ListItemIcon>
        <ListItemText primary="Слева вниз" />
      </MenuItem>

      <MenuItem disabled={disabled} onClick={() => join('tr')}>
        <ListItemIcon>
          <SubdirectoryArrowLeftIcon fontSize="small" style={{transform: 'rotate(0.75turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Сверху вправо" />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => join('tl')}>
        <ListItemIcon>
          <SubdirectoryArrowRightIcon fontSize="small" style={{transform: 'rotate(0.25turn)'}}/>
        </ListItemIcon>
        <ListItemText primary="Сверху влево" />
      </MenuItem>
    </Menu>
  </>;
}
