import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ReactDataGrid from 'react-data-grid';
import {SelectToolbar} from './SelectToolbar';

const columns = [
  {key: 'date', name: 'Дата', width: 100},
  {key: 'number_doc', name: 'Номер'},
  {key: 'number_internal', name: 'Номер внутр'},
  {key: 'amount', name: 'Сумма', width: 120},
  {key: 'count', name: 'Строк', width: 100},
];

const {ui, adapters: {pouch}, doc: {calc_order}, utils} = $p;

function CalcOrderLinkedSelect({obj, handleOk}) {

  const [gridRef, setGridRef] = React.useState(null);
  const [rows, setRows] = React.useState(null);
  const [selectedRows, setSelectedRows] = React.useState(new Set());
  const scheme = React.useMemo(() => ({_search: ''}), [obj]);

  const onCellSelected = (v) => {
    const key = Array.from(selectedRows)[0];
    if(v.rowIdx !== key) {
      const row = rows[v.rowIdx];
      setSelectedRows(new Set(row ? [v.rowIdx] : undefined));
    }
  };

  React.useEffect(() => {
    pouch.local.doc.query('partner_dep', {
      startkey: [obj.partner.ref, obj.department.ref, '\u0fff'],
      endkey: [obj.partner.ref, obj.department.ref, moment(obj.date).subtract(6, 'month').format('YYYY-MM-DD')],
      limit: 1000,
      descending: true,
    })
      .then(({rows}) => {
        scheme.rows = rows.map(({id, key, value}) => ({
          ref: id.substring(15),
          date: key[2],
          number_doc: value[0],
          number_internal: value[1],
          amount: value[2],
          count: value[3],
        })).filter(v => v.ref != obj);
        setRows(scheme.rows);
      });
  }, [obj]);

  const key = Array.from(selectedRows)[0];
  const row = rows?.[key];
  const rowSelection = row ? {
    selectBy: {
      indexes: [key]
    }
  } : undefined;

  const handleSelect = () => {
    let res = Promise.resolve();
    if(row) {
      const has = obj.links.find({calc_order: row.ref});
      if(!has) {
        const doc = calc_order.get(row.ref, false, false);
        if(doc.is_new()) {
          res = doc.load()
            .then((doc) => obj.links.add({calc_order: doc}));
        }
        else {
          obj.links.add({calc_order: doc});
        }
      }
    }
    res
      .catch(() => null)
      .then(handleOk);
  };

  const handleFilterChange = () => {
    const {_search, rows} = scheme;
    if(rows) {
      if(_search) {
        setRows(rows.filter(({number_doc, number_internal}) => utils._like(number_doc, _search) || number_internal && utils._like(number_internal, _search)));
      }
      else {
        setRows(rows);
      }
    }
  };

  return rows ? <div style={{minWidth: 640}}>
    <SelectToolbar row={row} handleSelect={handleSelect} scheme={scheme} handleFilterChange={handleFilterChange}/>
    <ReactDataGrid
      ref={(el) => el && setGridRef(el)}
      columns={columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellSelect
      rowSelection={rowSelection}
      onCellSelected={onCellSelected}
      onRowDoubleClick={handleSelect}
    />
  </div>  : `Запрос к серверу...`;
}

$p.ui.CalcOrderLinkedSelect = CalcOrderLinkedSelect;
