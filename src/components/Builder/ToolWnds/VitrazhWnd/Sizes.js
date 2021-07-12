import React from 'react';
import PropTypes from 'prop-types';
import ReactDataGrid from 'react-data-grid';
import {SzEditor, SzFormatter} from './SzCell';

const columns = [
  {key: 'sz', name: 'Размер', editor: SzEditor, formatter: SzFormatter}
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
    enableCellSelect
  />;
}

Sizes.propTypes = {
  _obj: PropTypes.object.isRequired,
  elm: PropTypes.number,
};
