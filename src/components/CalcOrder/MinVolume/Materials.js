import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from '../MontageBag/SimpleToolbar';
import {expandContext} from './data';
import '../../Cmdk/linear.scss';

export default function Materials({calc_order, tunnel, dialogRef}) {
  const {rows, setRows, gridElement, row, setRow, selectedRows, onCellSelected, select, obj, columns} = expandContext(calc_order, tunnel);

  const add = () => {
    const row = obj.production.add({quantity: 1});
    const newRows = [...rows, row];
    setRows(newRows);
    select(row, newRows.length - 1, true);
  };

  const del = () => {
    rows.splice(rows.indexOf(row), 1);
    obj.production.del(row);
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


  return <div style={{height: 380}}>
    <SimpleToolbar row={row} add={add} del={del} title="Материалы" />
    <ReactDataGrid
      minHeight={291}
      ref={gridElement.ref}
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={row ? rows.length : 0}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      //onGridKeyDown={onKeyDown}
      onRowClick={gridElement.onRowClick}
      editorPortalTarget={dialogRef?.portalTarget()}
    />
  </div>;
}
