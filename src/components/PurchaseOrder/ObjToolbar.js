import React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import SaveIcon from '@material-ui/icons/Save';
import SaveAsIcon from '@material-ui/icons/SaveAlt';
import SettingsIcon from '@material-ui/icons/SettingsCell';
import CloseIcon from '@material-ui/icons/Close';
import Tip from 'metadata-react/App/Tip';

export default function ObjToolbar({obj, _mgr, handlers}) {
  const {close, save, saveClose} = React.useMemo(() => {
    const close = () => {
      handlers.handleNavigate(`/${_mgr.class_name}/list${obj?.ref ? `?ref=${obj.ref}` : ''}`);
    };
    const save = () => obj.save();
    const saveClose = () => obj.save().then(close);
    return {close, save, saveClose};
  }, [obj]);

  return <Toolbar disableGutters>
    <Tip title="Записать и закрыть">
      <IconButton onClick={saveClose}><SaveIcon/></IconButton>
    </Tip>
    <Tip title="Записать">
      <IconButton onClick={save}><SaveAsIcon/></IconButton>
    </Tip>
    <Typography style={{flex: 1}}></Typography>
    <Tip title="Настроить форму">
      <IconButton onClick={() => null}><SettingsIcon/></IconButton>
    </Tip>
    <Tip title="Закрыть форму документа">
      <IconButton onClick={close}><CloseIcon/></IconButton>
    </Tip>
  </Toolbar>;
}
