import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import LinkIcon from '@material-ui/icons/Link';
import Frame from './Frame';

export default function GlassRegionCnns({elm}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return <>
    <Tip title="Соединения рёбер заполнения">
      <IconButton onClick={handleOpen}><LinkIcon/></IconButton>
    </Tip>
    <Frame open={open} elm={elm} handleClose={handleClose} />
  </>;
}
