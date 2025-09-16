import React from 'react';
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

export function renderOptions({manager, inserts}) {
  return <>
    <option value={manager.get()}>Авто</option>
    <option value={false}>Нет</option>
    {inserts.map((value, index) => <option key={index + 2} value={value}>{value.toString()}</option>)}
  </>;
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
      {renderOptions(rowData)}
    </select>;
  }
}

export const columns = [
  {key: 'ox', name: 'Продукция', formatter({row, value}) {return value?.toString()}},
  {key: 'use', name: 'Использование', formatter: UseFormatter, editor: UseEditor, editable: true},
];
