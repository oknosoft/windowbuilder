import React from 'react';
import Dialog from 'metadata-react/App/Dialog';
import CnnsGrid from './Grid';

export default function GlassCnnsFrame ({elm, open, handleClose}) {
  return <Dialog
    open={open}
    initFullScreen
    large
    title={`Соединения заполнения №${elm.elm}`}
    onClose={handleClose}
  >
    <CnnsGrid elm={elm} />
  </Dialog>;
}
