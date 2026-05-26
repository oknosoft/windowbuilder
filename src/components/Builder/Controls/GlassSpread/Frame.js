import React from 'react';
import Dialog from 'metadata-react/App/Dialog';
import Toolbar from './Toolbar';

export default function GlassSpreadFrame ({elm, open, handleClose}) {
  return <Dialog
    open={open}
    //initFullScreen
    large
    title={`Распространить формулу '${elm.formula()}'`}
    onClose={handleClose}
  >
    <Toolbar elm={elm}/>
    Режим
  </Dialog>;
}
