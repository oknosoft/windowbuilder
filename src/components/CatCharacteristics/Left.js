import React from 'react';
import PropTypes from 'prop-types';
import DataGrid from 'react-data-grid';
import {DateFormatter, NomFormatter} from '../CalcOrder/RevsDetales';

const columns_doc = [
  {key: 'date', name: 'Дата', width: 140, resizable: true, formatter: DateFormatter},
  {key: 'user', name: 'Автор', resizable: true},
  {key: 'owner', name: 'Номенклатура', resizable: true, formatter: NomFormatter},
  {key: 'x', name: 'X', width: 70, resizable: true},
  {key: 'y', name: 'Y', width: 70, resizable: true},
  {key: 's', name: 'S', width: 70, resizable: true},
];

export default function Left({rows, svg, set_params}) {
  const __html = svg ? $p.utils.scale_svg(svg, 240, 0) : '';
  return <div style={{textAlign: 'center'}}>
    <DataGrid
      columns={columns_doc}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      onCellSelected={set_params}
    />
    <div style={{marginTop: 8}} dangerouslySetInnerHTML={{__html}}></div>
  </div>
}

Left.propTypes = {
  rows: PropTypes.array.isRequired,
  set_params: PropTypes.func.isRequired,
};
