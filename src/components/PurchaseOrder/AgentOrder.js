import React from 'react';
import Grid from '@material-ui/core/Grid';
import Dialog from 'metadata-react/App/Dialog';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import PropField from 'metadata-react/DataField/PropField';


export default function AgentOrder({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];
  const {handleCancel, obj, row, orderRow, cmeta, pmeta} = React.useMemo(() => {
    const obj = calc_order.agent_order();
    const cmeta = $p.utils._clone(calc_order._metadata());
    const pmeta = $p.utils._clone(obj._metadata());
    cmeta.tabular_sections.orders.fields.rate.synonym = 'Процент агентских';
    cmeta.tabular_sections.orders.fields.amount.synonym = 'Сумма вознаграждения';
    cmeta.fields.doc_amount.synonym = 'Сумма заказа покупателя';
    cmeta.fields.partner.synonym = 'Контрагент-покупатель';
    pmeta.fields.organization.synonym = 'Плательщик агентских';
    pmeta.fields.partner.synonym = 'Агент-поставщик';
    pmeta.tabular_sections.goods.fields.nom.synonym = 'Номенклатура услуги';

    return {
      handleCancel() {
        handlers.handleIfaceState({
          component: dialog?.cmd?.area || 'DataObjPage',
          name: 'dialog',
          value: null,
        });
      },
      obj,
      row: obj.goods.find({}) || obj.goods.add(),
      orderRow: calc_order.orders.find({invoice: obj}),
      cmeta,
      pmeta,
    };
  }, [calc_order]);


  return <Dialog
    open
    initFullScreen
    large
    title={`Агентский к ${calc_order.presentation}`}
    onClose={handleCancel}
    >
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <PropField _obj={calc_order} _fld="organization" read_only />
        <PropField _obj={calc_order} _fld="partner" read_only _meta={cmeta.fields.partner} />
        <PropField _obj={calc_order} _fld="department" read_only />
        <PropField _obj={calc_order} _fld="branch" read_only />
        <PropField _obj={calc_order} _fld="doc_amount" read_only _meta={cmeta.fields.doc_amount}/>
      </Grid>
      <Grid item xs={12} sm={6}>
        <PropField _obj={obj} _fld="organization" _meta={pmeta.fields.organization}/>
        <PropField _obj={obj} _fld="partner" _meta={pmeta.fields.partner}/>
        <PropField _obj={obj} _fld="contract" />
        <PropField _obj={row} _fld="nom" _meta={pmeta.tabular_sections.goods.fields.nom}/>
        <PropField Component={FieldNumberNative} _obj={orderRow} _fld="rate" _meta={cmeta.tabular_sections.orders.fields.rate} />
        <PropField Component={FieldNumberNative} _obj={orderRow} _fld="amount" _meta={cmeta.tabular_sections.orders.fields.amount}/>
      </Grid>
    </Grid>
  </Dialog>;
}
