import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LinkIcon from '@material-ui/icons/Link';
import AccessibilityNewIcon from '@material-ui/icons/AccessibilityNew';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import RegionCnns from '../GlassRegionCnns/Frame';
import Spread from '../GlassSpread/Frame';

export default function GlassCompositeExt({elm}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [cnnsOpen, setCnnsOpen] = React.useState(false);
  const [spreadOpen, setSpreadOpen] = React.useState(false);
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
  const openCnns = () => {
    handleClose();
    setCnnsOpen(true);
  };
  const openSpread = () => {
    handleClose();
    setSpreadOpen(true);
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
      <MenuItem onClick={openCnns}>
        <ListItemIcon><LinkIcon/></ListItemIcon>
        <ListItemText>Соединения рёбер заполнения</ListItemText>
      </MenuItem>
      <MenuItem onClick={setChecked}>
        <ListItemIcon>{checked ? <CheckBoxOutlineBlankIcon/> : <CheckBoxIcon/>}</ListItemIcon>
        <ListItemText>Сброс умолчаний при изменении состава</ListItemText>
      </MenuItem>
      <MenuItem onClick={openSpread}>
        <ListItemIcon><AccessibilityNewIcon/></ListItemIcon>
        <ListItemText>Распространить...</ListItemText>
      </MenuItem>

    </Menu>
    {cnnsOpen && <RegionCnns open elm={elm} handleClose={() => setCnnsOpen(false)} />}
    {spreadOpen && <Spread open elm={elm} handleClose={() => setSpreadOpen(false)} />}
  </>;
}
