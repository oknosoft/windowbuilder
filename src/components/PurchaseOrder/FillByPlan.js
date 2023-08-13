
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ListAltIcon from '@material-ui/icons/ListAlt';
import Dialog from 'metadata-react/App/Dialog';

export default function FillByPlan(props) {
  const [open, rawSetOpen] = React.useState(false);
  const setClose = () => rawSetOpen(false);
  const setOpen = () => rawSetOpen(true);
  return <>
    <IconButton disabled>|</IconButton>
    <IconButton title="Заполнить остатками потребности" onClick={setOpen}><ListAltIcon/></IconButton>
    <Dialog
      open={open}
      title="Параметры остатков потребности"
      onClose={setClose}
      actions={<>
        <Button onClick={setClose}>Заполнить</Button>
        <Button onClick={setClose} color="primary">Отмена</Button>
      </>}
    >
      {123}
    </Dialog>
  </>;
}
