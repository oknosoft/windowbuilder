import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from './SimpleToolbar';
import {columns} from './columns';
import {gridContext} from './Production';
import RecentField from './RecentField';

export default function Materials({prodRow, dialogRef}) {
  const [rows, setRows, gridElement] = gridContext();
  const [row, setRow] = React.useState(null);

  const selectedRows = React.useMemo(
    () => row ? new Set([row]) : new Set(), [row]);
  const onCellSelected = (v) => {
    const current = rows[v.rowIdx] || null;
    if(row !== current) {
      setRow(current);
    }
  };

  const select = (row, rowIdx, editMode) => {
    setRow(row);
    setTimeout(() => {
      gridElement.select({idx: 0, rowIdx}, editMode);
    }, 66);
  };

  const add = () => {
    const row = prodRow.characteristic.specification.add({qty: 1});
    const newRows = [...rows, row];
    setRows(newRows);
    select(row, newRows.length - 1, true);
  };

  const del = () => {
    rows.splice(rows.indexOf(row), 1);
    prodRow.characteristic.specification.del(row);
    setRows([...rows]);
    if(rows.length) {
      const last = rows.length - 1;
      select(rows[last], last);
    }
    else {
      setRow(null);
    }
  };

  const rowSelection = row ? {
    selectBy: {
      indexes: [rows.indexOf(row)]
    }
  } : undefined;

  React.useEffect(() => {
    if(prodRow) {
      const newRows = Array.from(prodRow.characteristic.specification);
      setRows(newRows);
      if(newRows.length) {
        select(newRows[newRows.length - 1], newRows.length - 1);
      }
      else {
        setRow(null);
      }
    }
    else {
      if(rows.length) {
        setRows([]);
      }
      if(row) {
        setRow(null);
      }
    }
  }, [prodRow]);


  return <div style={{height: '30vh', minHeight: 340}}>
    <SimpleToolbar row={row} add={add} del={del} title="Материалы"/>
    <ReactDataGrid
      minHeight={290}
      ref={gridElement.ref}
      columns={columns.materials}
      rowGetter={i => rows[i]}
      rowsCount={row ? rows.length : 0}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      //onGridKeyDown={onKeyDown}
      editorPortalTarget={dialogRef?.portalTarget()}
    />
  </div>;
}
