import React from 'react';
import ReactDataGrid from 'react-data-grid';

function RefFormatter(attr) {
  const {row, value} = attr;
  return value.toString();
}

const columns = [
  {key: 'nom_group', name: 'Ном группа', formatter: RefFormatter},
  {key: 'amount', name: 'Сумма', width: 100, formatter: RefFormatter},
  {key: 'rate', name: 'Процент', width: 100, formatter: RefFormatter},
  {key: 'agency', name: 'Агентские', width: 100, formatter: RefFormatter},
];

export default function AgencySrc({rows}) {
  return <div style={{marginRight: 8, marginTop: 8, fontSize: 'small'}}>
    <ReactDataGrid
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
    />
  </div>;
}
