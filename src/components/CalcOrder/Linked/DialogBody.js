import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DataGrid from 'react-data-grid';

function stop(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  return false;
}

export const columns = [
  {key: 'order', name: 'Заказ', width: '*', formatter({row, value}) {return value?.toString()}}
];

export function DialogBody({obj, handleOk, handleIfaceState, handleNavigate}) {
  const {basis} = obj;
  if(basis.empty()) {
    return <Typography>Связанные заказы</Typography>;
  }
  else {
    return <>
      <Typography>Текущий заказ подчинён <a onClick={stop}>{basis.presentation}</a></Typography>
    </>;
  }
}
