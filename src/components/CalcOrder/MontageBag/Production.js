import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from './SimpleToolbar';
import {columns, product} from './columns';

const {cat: {characteristics}, utils} = $p;

class GridElement {
  constructor() {
    this.el = null;
    this.ref = (el) => {
      if(el) {
        this.el = el;
        el.grid.querySelector('.react-grid-Canvas').style.overflowX = 'hidden'
      }
    };
    this.select = (pos, editMode) => {
      const {el} = this;
      el?.grid?.focus();
      el?.scrollToColumn?.(pos);
      el?.selectCell?.(pos, editMode);
    }
  }
}

export function gridContext() {
  const [rows, setRows] = React.useState([]);
  const gridElement = React.useMemo(() => new GridElement(), []);
  return [rows, setRows, gridElement];
}

const style = {height: '20vh', minHeight: 160, minWidth: 820};

export default function Production({obj, prodRow, setProdRow, dialogRef}) {
  const [prodRows, setProdRows, gridElement] = gridContext();
  const selectedRows = React.useMemo(
    () => prodRow ? new Set([prodRow]) : new Set(), [prodRow]);
  const onCellSelected = (v) => {
    const row = prodRows[v.rowIdx] || null;
    if(row !== prodRow) {
      setProdRow(row);
    }
  };

  const select = (row, rowIdx) => {
    setProdRow(row);
    setTimeout(() => {
      gridElement.select({idx: 1, rowIdx});
    }, 66);
  };

  const add = () => {
    const row = obj.production.add({
      nom: product.ref,
      qty: 1,
      quantity: 1,
    });
    const cx = row.characteristic = characteristics.create({
      ref: utils.generate_guid(),
      owner: product,
      calc_order: obj.ref,
      product: row.row,
    }, false, true);
    cx.name = cx.prod_name();
    cx._data._loading = false;
    const newRows = [...prodRows, row];
    setProdRows(newRows);
    select(row, newRows.indexOf(row));
  };

  const del = () => {
    prodRows.splice(prodRows.indexOf(prodRow),1);
    obj.production.del(prodRow);
    setProdRows([...prodRows]);
    if(prodRows.length) {
      const last = prodRows.length - 1;
      select(prodRows[last], last);
    }
    else {
      setProdRow(null);
    }
  };

  React.useEffect(() => {
    if(!prodRows.length) {
      const rows = [];
      obj.production.find_rows({nom: product}, (row) => rows.push(row));
      if(rows.length) {
        setProdRows(rows);
        select(rows[rows.length - 1], rows.length - 1);
      }
      else {
        add();
      }
    }
  }, [obj]);

  const rowSelection = prodRow ? {
    selectBy: {
      indexes: [prodRows.indexOf(prodRow)]
    }
  } : undefined;

  return <div style={style}>
    <SimpleToolbar row={prodRow} add={add} del={del} title="Строки заказа"/>
    <ReactDataGrid
      minHeight={style.minHeight - 49}
      ref={gridElement.ref}
      columns={columns.production}
      rowGetter={i => prodRows[i]}
      rowsCount={prodRows.length}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      //onGridKeyDown={onKeyDown}
      editorPortalTarget={dialogRef?.portalTarget()}
    />
  </div>;


}
