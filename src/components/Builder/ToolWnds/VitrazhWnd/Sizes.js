import React from 'react';
import ReactDataGrid from 'react-data-grid';
import {columns} from './SzCell';
import Toolbar from './Toolbar';

const fkeys = ['F9', 'Insert'];

export default function Sizes({obj, ts, selection}) {
  const [gridRef, setGridRef] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState(new Set());

  const getRow = () => {
    const key = Array.from(selectedRows)[0];
    return rows.find((row) => row.uid === key);
  };

  const onCellSelected = (v) => {
    const row = rows[v.rowIdx];
    setSelectedRows(new Set([row.uid]));
  };

  const onRef = (el) => {
    if(el) {
      el.grid.tabIndex = 0;
      const onKeyDown = (ev) => {
        if(fkeys.includes(ev.key) && !ev.defaultPrevented) {
          ev.stopPropagation();
          ev.preventDefault();
          obj._manager.emit('fkey', ev);
        }
      };
      el.grid.addEventListener('keydown', onKeyDown);
      setGridRef(el);
    }
  };

  React.useEffect(() => {
    const rows = $p.utils._find_rows(obj[ts], selection);
    setRows(rows);
  }, [obj, selection]);

  return <div>
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
      ref={onRef}
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellSelect
      onCellSelected={onCellSelected}
    />
  </div>;
}

