import React from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';

const columns = [
  {key: 'sz', name: 'Размер'}
];

export default function Sizes({_obj, elm}) {
  const rows = [];
  for(const row of _obj.sizes) {
    if(row.elm === elm) {
      rows.push(row);
    }
  }
  return <ReactDataGrid
    columns={columns}
    rowGetter={i => rows[i]}
    rowsCount={rows.length}
  />;
}
