import React from 'react';
import Dialog from 'metadata-react/App/Dialog';
import Toolbar from './Toolbar';
import Treebeard from './Treebeard';
import {fake, getStruct, treebeardHandlers} from './data';

export default function GlassSpreadFrame ({elm, open, handleClose}) {

  const [mode, rawMode] = React.useState(fake.mode);
  const [struct, setStruct] = React.useState(getStruct());

  const setMode = (v) => {
    rawMode(parseInt(v));
  };

  React.useEffect(() => {
    setStruct(getStruct(elm));
  }, [mode]);

  const [forceUpdate, onToggle] = treebeardHandlers();


  return <Dialog
    open={open}
    //initFullScreen
    large
    title={`Распространить формулу '${elm.formula()}'`}
    onClose={handleClose}
  >
    <Toolbar fake={fake} struct={struct} setMode={setMode} forceUpdate={forceUpdate} handleClose={handleClose}/>
    <Treebeard data={struct} forceUpdate={forceUpdate} onToggle={onToggle} />
  </Dialog>;
}
