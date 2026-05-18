import React from 'react';
import ReactDataGrid from 'react-data-grid';
import SimpleToolbar from './SimpleToolbar';
import {columns} from './columns';
import {gridContext} from './Production';

const {calc_count_area_mass} = $p.ProductsBuilding;

export default function Materials({prodRow, dialogRef}) {
  const [rows, setRows, gridElement] = gridContext();
  const [row, setRow] = React.useState(null);

  const selectedRows = React.useMemo(
    () => row ? new Set([row]) : new Set(), [row]);
  const onCellSelected = ({idx, rowIdx}) => {
    const current = rows[rowIdx] || null;
    if(row !== current) {
      setRow(current);
    }
    gridElement.lastCell = {idx, rowIdx};
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
    const {quantity, characteristic} = prodRow;
    characteristic.specification.del(row);
    prodRow.value_change('quantity', null, quantity);
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

  React.useEffect(() => {
    if(row) {
      const {_manager} = row;
      const update = (o, flds) => {
        if(o === row && ('qty' in flds || 'nom' in flds)) {
          const {_obj, _owner} = row;
          _obj.totqty = 0;
          _obj.totqty1 = 0;
          calc_count_area_mass(row, row._owner);
          const {quantity} = prodRow;
          prodRow.value_change('quantity', null, quantity);
        }
      };
      _manager.on({update});
      return () => _manager.off({update});
    }
  }, [row]);


  return <div style={{height: '44vh', minHeight: 340}} className={prodRow ? undefined : 'gl disabled'}>
    <SimpleToolbar row={row} add={add} del={del} title="Материалы"/>
    <ReactDataGrid
      minHeight={291}
      ref={gridElement.ref}
      columns={columns.materials}
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
