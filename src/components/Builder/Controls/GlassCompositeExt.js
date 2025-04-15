import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinkIcon from '@material-ui/icons/Link';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Frame from './GlassRegionCnns/Frame';

export default function GlassCompositeExt({elm}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setAnchorEl(null);
  const {wsql} = $p;
  const [checked, rawSetChecked] = React.useState(wsql.get_user_param('glass_composit_ign_forcibly', 'boolean'));
  const setCheckedFin = () => {
    wsql.set_user_param('glass_composit_ign_forcibly', !checked);
    rawSetChecked(!checked);
    handleClose();
  };
  const setChecked = () => {
    if(checked) {
      setCheckedFin();
    }
    else {
      $p.ui.dialogs.confirm({
        title: 'Умолчания при изменении состава',
        text: 'Подтвердите отключение настроенных технологом правил\nВы принимаете на себя ответственность за значения параметров элементов сосава заполнений',
        timeout: 10000,
      })
        .then(setCheckedFin)
        .catch(handleClose);
    }
  };
  const closeFrame = () => {
    handleClose();
    setOpen(true);
  };
  return <>
    <div style={{flex: 1}}/>
    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} ><MoreVertIcon/></IconButton>
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <MenuItem onClick={closeFrame}>
        <ListItemIcon><LinkIcon/></ListItemIcon>
        <ListItemText>Соединения рёбер заполнения</ListItemText>
      </MenuItem>
      <MenuItem onClick={setChecked}>
        <ListItemIcon>{checked ? <CheckBoxOutlineBlankIcon/> : <CheckBoxIcon/>}</ListItemIcon>
        <ListItemText>Сброс умолчаний при изменении состава</ListItemText>
      </MenuItem>
    </Menu>
    <Frame open={open} elm={elm} handleClose={() => setOpen(false)} />
  </>;
}
