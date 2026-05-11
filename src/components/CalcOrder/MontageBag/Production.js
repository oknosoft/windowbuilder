import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from './SimpleToolbar';
import {columns} from './columns';

export default function Production({obj, prodRow, setProdRow}) {
  const [prodRows, setProdRows] = React.useState([]);
  const selectedRows = React.useMemo(
    () => prodRow ? new Set([prodRow]) : new Set(), [prodRow]);
  const setSelectedRows = (set) => {
    const key = prodRows.length && Array.from(set)[0];
    const row = (key && prodRows.find((row) => row.characteristic == key)) || null;
    if(row !== prodRow) {
      setProdRow(row || null);
    }
  };

  return <div style={{
    height: '20vh',
    minHeight: 180,
  }}>
    <SimpleToolbar row={prodRow} title="Строки заказа"/>
  </div>;


}
