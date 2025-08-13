import React from 'react';
import ReactDataGrid from 'react-data-grid';
import {columns} from './SzCell';
import Toolbar from './Toolbar';
import {select} from './handlers';

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

  const onKeyDown = (ev) => {
    if(fkeys.includes(ev.key) && !ev.defaultPrevented) {
      ev.stopPropagation();
      ev.preventDefault();
      obj._manager.emit('fkey', ev);
    }
  };

  React.useEffect(() => {
    const rows = $p.utils._find_rows(obj[ts], selection);
    setRows(rows);
    if(rows.length && gridRef) {
      const pos = {idx: 1, rowIdx: 0};
      gridRef.selectCell(pos);
      pos.idx = 0;
      onCellSelected(pos);
      select(gridRef, pos);
    }
  }, [obj, selection]);

  let rowSelection;
  if(selectedRows.size) {
    const row = getRow();
    if(row) {
      rowSelection = {
        selectBy: {
          indexes: [rows.indexOf(row)]
        }
      };
    }
  }

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
      ref={(el) => el && setGridRef(el)}
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      onGridKeyDown={onKeyDown}
    />
  </div>;
}

