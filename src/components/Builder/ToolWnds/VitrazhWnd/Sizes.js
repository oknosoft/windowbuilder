import React from 'react';
import ReactDataGrid from 'react-data-grid';
import {columns} from './SzCell';
import Toolbar from './Toolbar';

export default function Sizes({obj, ts, selection}) {
  const [gridRef, setGridRef] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  const getRow = () => {
    const key = Array.from(selectedRows)[0];
    return rows.find((row) => row.uid === key);
  };

  React.useEffect(() => {
    const rows = $p.utils._find_rows(obj[ts], selection);
    setRows(rows);
  }, [obj, selection]);

  return <>
    <Toolbar
      tabular={obj[ts]}
      selection={selection}
      gridRef={gridRef}
      rows={rows}
      getRow={getRow}
      setRows={setRows}
      //setBackdrop={setBackdrop}
      //setModified={setModified}
      setSelectedRows={setSelectedRows}
    />
    <ReactDataGrid
      ref={(el) => el && setGridRef(el)}
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellSelect
    />
  </>;
}

