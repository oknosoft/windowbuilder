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

  get use() {
    const {_v} = this;
    return (_v || typeof _v === 'boolean') ? _v : manager.get();
  }
  set use(v) {
    if(utils.is_empty_guid(v)) {
      delete this._v;
    }
    else if(utils.is_guid(v)) {
      this._v = manager.get(v);
    }
    else {
      this._v = false;
    }
    this.onUpdate?.();
  }
}

export default function CompositionFragment({obj, composition, compoundable, folder, dialogRef}) {

  const [rows, proto] = React.useMemo(() => {
    const rows = [];
    const compoundRow = composition.find(v => v.insert_type == folder.valueOf());
    const proto = {...compoundable.get(folder), composition, folder};
    for(const row of obj.production) {
      if(row.characteristic.calc_order === obj) {
        rows.push(new CompositionRow({ox: row.characteristic, ...proto}));
      }
    }
    return [rows, proto];
  }, [obj, folder]);

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
