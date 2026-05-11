import React from 'react';
import Production from './Production';

export function MontageBag({obj, wnd}) {

  const [prodRow, setProdRow] = React.useState(null);

  return <>
    <Production obj={obj} prodRow={prodRow} setProdRow={setProdRow}/>
    <div style={{
      height: '26vh',
      minHeight: 260,
    }}>
      Материалы
    </div>
  </>;
}
