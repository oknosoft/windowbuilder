import React from 'react';
import ReactDataGrid from 'react-data-grid';
import columns from './columns';
import cnnsData from './data';

export default function CnnsGrid ({elm}) {

  const {rows, rowGetter} = React.useMemo(() => cnnsData(elm), [elm]);


  return <ReactDataGrid
    columns={columns}
    rowGetter={rowGetter}
    rowsCount={rows.length}
    minHeight={320}
    //minWidth={width}
    //minColumnWidth={100}
  />;

}
