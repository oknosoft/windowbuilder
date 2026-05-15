import React from 'react';
import Production from './Production';
import Materials from './Materials';
import '../../Cmdk/linear.scss';

function MontageBag({obj, wnd, dialogRef}) {

  const [prodRow, setProdRow] = React.useState(null);

  return <>
    <Production obj={obj} prodRow={prodRow} setProdRow={setProdRow} dialogRef={dialogRef}/>
    <Materials prodRow={prodRow} dialogRef={dialogRef}/>
  </>;
}

export default MontageBag;
