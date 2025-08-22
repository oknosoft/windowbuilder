import React from 'react';
import Typography from '@material-ui/core/Typography';
import ReactDataGrid from 'react-data-grid';
import {Editors} from 'react-data-grid-addons';

function UseFormatter({row}) {
  const [index, setIndex] = React.useState(0);
  const value = row.use;
  const text = value ? (value.empty() ? 'Авто' : value.toString()) : 'Нет';
  React.useEffect(() => {
    row.onUpdate = () => setIndex((index) => index + 1);
    return () => row.onUpdate = null;
  }, [row]);
  return <div title={text}>{text}</div>;
}

class UseEditor extends Editors.SimpleTextEditor {

  // props.column.key, props.rowData(._row)

  getValue() {
    const {column, rowData} = this.props;
    return {[column.key]: rowData[column.key]};
  }

  render() {

    const {rowData, column, onCommit, options} = this.props;

    return <select value={rowData[column.key]} onChange={(e) => {
      const {value} = e.target;
      rowData[column.key] = value;
      onCommit(value);
    }}>
      {options.map((v, index) => <option key={`o-${index}`} value={v.value}>{v.text}</option>)}
    </select>;
  }
}

export const baseColumns = [
  {key: 'ox', name: 'Продукция', formatter({row, value}) {return value?.toString()}},
  {key: 'use', name: 'Использование', formatter: UseFormatter, editable: true},
];


class CompositionRow {
  constructor(attr) {
    Object.assign(this, attr);
  }

  get manager() {
    return this.inserts[0]._manager;
  }

  get utils() {
    return this.manager._owner.$p.utils;
  }

  get use() {
    const {_v} = this;
    return (_v || typeof _v === 'boolean') ? _v : this.manager.get();
  }
  set use(v) {
    const {utils, manager} = this;
    this._v = utils.is_guid(v) ? manager.get(v) : false;
    this.onUpdate?.();
  }
}

export default function CompositionFragment({obj, composition, compoundable, folder, dialogRef}) {

  const [rows, columns] = React.useMemo(() => {
    const rows = [];
    const compoundRow = composition.find(v => v.insert_type == folder.valueOf());
    const {param, inserts} = compoundable.get(folder);
    for(const row of obj.production) {
      if(row.characteristic.calc_order === obj) {
        rows.push(new CompositionRow({ox: row.characteristic, param, inserts}));
      }
    }
    const columns = baseColumns.map(v => ({...v}));
    const {DropDownEditor} = Editors;
    const options = [
      {
        id: 0,
        value: inserts[0]._manager.get(),
        text: 'Авто',
        title: 'Авто',
      },
      {
        id: 1,
        value: false,
        text: 'Нет',
        title: 'Нет',
      },
      ...inserts.map((value, index) => ({id: index + 2, value, text: value.toString(), title: value.toString()})),
    ];
    columns[1].editor = <UseEditor options={options}/>;
    return [rows, columns];
  }, [obj, folder]);

  return <>
    <Typography variant="h6">{folder.name}</Typography>
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
