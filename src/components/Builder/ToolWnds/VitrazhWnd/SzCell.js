import React from 'react';
import PropTypes from 'prop-types';
import DataGrid from 'react-data-grid';

function SzFormatter(attr) {
  const {row, value} = attr;
  const [text, setText] = React.useState(value?.toString());

  React.useEffect(() => {
    const {_manager} = row;
    function update(o) {
      if(o === row) {
        setText(row.sz.toString());
      }
    }
    _manager.on({update});
    if(row.sz.toString() !== text) {
      update(row);
    }
    return () => _manager.off({update});
  }, [row]);



  return <div>{text}</div>;
}

SzFormatter.propTypes = {
  value: PropTypes.any,
};

class SzEditor extends DataGrid.editors.SimpleTextEditor {

  commit() {
    const {props: {column, rowData, onCommit}, tree} = this;
    const keys = tree.keys.distinct();
    rowData[column.key] = {keys: Array.from(keys)};
    onCommit();
  }

  onKeyDown = (ev) => {
    if(ev.key === 'Enter' || ev.key === 'Tab') {
      const {column, rowData, onCommit, onCommitCancel} = this.props;
      rowData[column.key] = ev.target.value;
      onCommit();
    }
  };

  render() {
    const {props: {column, rowData}, onKeyDown} = this;
    return rowData ? <input
      type="number"
      defaultValue={rowData[column.key]}
      onKeyDown={onKeyDown}
    /> : null;
  }

}

export const columns = [
  {key: 'sz', name: 'Размер', editor: SzEditor, formatter: SzFormatter}
];

