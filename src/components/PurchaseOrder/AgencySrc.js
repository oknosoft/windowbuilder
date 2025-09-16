import React from 'react';
import ReactDataGrid from 'react-data-grid';

function RefFormatter(attr) {
  const {row, value} = attr;
  return <div>{value.toString()}</div>;
}

class RateEditor extends ReactDataGrid.editors.SimpleTextEditor {


  onKeyDown = (ev) => {
    if(ev.key === 'Enter' || ev.key === 'Tab') {
      const {column, rowData, onCommit, onCommitCancel} = this.props;
      rowData[column.key] = parseFloat(ev.target.value);
      rowData.force = rowData[column.key];
      onCommit();
      rowData.refresh();
    }
  };


  render() {
    const {props: {column, rowData}, onKeyDown} = this;
    return <input
      ref={(el) => {
        if(el) {
          Object.assign(el.parentNode.style, {fontSize: 'smaller'});
          el.select();
        }
      }}
      type="number"
      defaultValue={rowData[column.key]}
      onKeyDown={onKeyDown}
    />;
  }
}

const columns = [
  {key: 'nom_group', name: 'Ном группа', formatter: RefFormatter},
  {key: 'amount', name: 'Сумма', width: 100, formatter: RefFormatter},
  {key: 'rate', name: 'Процент', width: 100, editor: RateEditor, editable: true, formatter: RefFormatter},
  {key: 'agency', name: 'Агентские', width: 100, formatter: RefFormatter},
];

export default function AgencySrc({rows, dialogRef}) {
  return <div style={{marginRight: 8, marginTop: 8, fontSize: 'small'}}>
    <ReactDataGrid
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellSelect
      editorPortalTarget={dialogRef?.portalTarget()}
    />
  </div>;
}
