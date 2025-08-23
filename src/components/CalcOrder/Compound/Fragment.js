import React from 'react';
import ReactDataGrid from 'react-data-grid';
import {columns} from './columns';
import GroupedSelect from './GroupedSelect';

const {utils, cat: {inserts: manager}} = $p;

class CompositionRow {
  constructor(attr) {
    Object.assign(this, attr);
  }

  get manager() {
    return manager;
  }

  compoundRow(force) {
    const {composition, folder} = this;
    let row = composition.find(v => v.insert_type == folder.valueOf());
    if(!row && force) {
      row = {insert_type: folder.valueOf(), value: {}};
      composition.push(row);
    }
    return row;
  }

  get use() {
    const {ox} = this;
    const row = this.compoundRow();
    const ref = ox.valueOf();
    const v = row ? (ref in row.value ? row.value[ref] : row.value.all) : undefined;
    return typeof v === 'boolean' ? v : manager.get(v);
  }
  set use(v) {
    const {ox, onUpdate} = this;
    const row = this.compoundRow(true);
    const ref = ox.valueOf();
    if(utils.is_empty_guid(v)) {
      if(!row.value.hasOwnProperty('all') || row.value.all == v) {
        delete row.value[ref];
      }
      else {
        row.value[ref] = v.valueOf();
      }
    }
    else if(utils.is_guid(v)) {
      if(row.value.all == v) {
        delete row.value[ref];
      }
      else {
        row.value[ref] = v.valueOf();
      }
    }
    else {
      if(row.value.all === false) {
        delete row.value[ref];
      }
      else {
        row.value[ref] = false;
      }
    }
    onUpdate?.();
  }
}

export default function CompositionFragment({calc_order, composition, compoundable, folder, dialogRef}) {

  const [rows, proto] = React.useMemo(() => {
    const rows = [];
    const proto = {...compoundable.get(folder), composition, folder};
    for(const row of calc_order.production) {
      if(row.characteristic.calc_order === calc_order) {
        rows.push(new CompositionRow({ox: row.characteristic, ...proto}));
      }
    }
    return [rows, proto];
  }, [calc_order, folder]);

  return <>
    <GroupedSelect obj={{manager, ...proto}} rows={rows} />
    <div style={{width: 'calc(100% - 8px)'}}>
      <ReactDataGrid
        columns={columns}
        rowGetter={i => rows[i]}
        rowsCount={rows.length}
        enableCellSelect
        editorPortalTarget={dialogRef?.portalTarget()}
      />
    </div>
  </>;
}
