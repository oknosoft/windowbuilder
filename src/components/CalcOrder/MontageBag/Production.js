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

export default function Production({obj, prodRow, setProdRow}) {
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

  return <div style={{height: '20vh', minHeight: 160, minWidth: 820}}>
    <SimpleToolbar row={prodRow} add={add} title="Строки заказа"/>
    <ReactDataGrid
      minHeight={prodRows.length * 35 + 77}
      ref={gridElement.ref}
      columns={columns.production}
      rowGetter={i => prodRows[i]}
      rowsCount={prodRows.length}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      //onGridKeyDown={onKeyDown}
    />
  </div>;


}
