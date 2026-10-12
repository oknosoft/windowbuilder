import React from 'react';
import {gridContext} from '../MontageBag/Production';
import {formatters, SzEditor} from '../../Builder/ToolWnds/VitrazhWnd/SzCell';
import {componentWrapper} from '../MontageBag/RecentCell';

const {cat, job_prm, utils, dp} = $p;


export function expandContext(calc_order, tunnel) {

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

  const {obj, columns} = React.useMemo(() => {
    const obj = dp.buyers_order.create();
    tunnel.obj = obj;

    const min_order_volume = calc_order.extra.min_order_volume || {};

    const set = new Set();
    const pre = new Set();
    const newRows = [];
    for(const {characteristic} of calc_order.production) {
      for(const {nom} of characteristic.specification) {
        if(!set.has(nom)) {
          set.add(nom);
          if(nom?.cached_prop('min_order_volume')) {
            pre.add(nom);
          }
          if(min_order_volume[nom.ref]) {
            pre.add(nom);
            const row = obj.production.add({
              nom: nom.ref,
              quantity: min_order_volume[nom.ref],
            });
            newRows.push(row);
          }
        }
      }
    }
    if(newRows.length) {
      setTimeout(() => {
        const index = newRows.length - 1;
        setRows(newRows);
        select(newRows[index], index);
      }, 100);
    }
    const all = Array.from(set);
    all.sort(utils.sort('name'));

    const RecentCell = componentWrapper(Array.from(pre), all, 'min_volume');

    const columns = [
      {key: 'nom', name: 'Материал', formatter: formatters.get('nom'), editor: RecentCell},
      {key: 'quantity', name: 'Колич.', width: 100, editor: SzEditor, formatter: formatters.get('quantity')}
    ];

    return {obj, columns};
  }, [calc_order]);

  return {rows, setRows, gridElement, row, setRow, selectedRows, onCellSelected, select, obj, columns};
}

