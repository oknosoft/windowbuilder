import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import PropField from 'metadata-react/DataField/PropField';
import AgencySrc from './AgencySrc';


export default function AgentOrder({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];
  const {handleCancel, handleCommit, recalc, obj, row, orderRow, cmeta, pmeta, grouped: initGrouped} = React.useMemo(() => {
    const {utils, job_prm, cat: {nom_groups}} = $p;
    const obj = calc_order.agent_order();
    const row = obj.goods.find({}) || obj.goods.add();
    if(row.nom.empty()) {
      row.nom = job_prm.nom.agency;
    }
    const orderRow = calc_order.orders.find({invoice: obj});
    const cmeta = utils._clone(calc_order._metadata());
    const pmeta = utils._clone(obj._metadata());
    cmeta.tabular_sections.orders.fields.rate.synonym = 'Процент агентских';
    cmeta.tabular_sections.orders.fields.amount.synonym = 'Сумма вознаграждения';
    cmeta.fields.doc_amount.synonym = 'Сумма заказа покупателя';
    cmeta.fields.partner.synonym = 'Контрагент-покупатель';
    pmeta.fields.organization.synonym = 'Плательщик агентских';
    pmeta.fields.partner.synonym = 'Агент-поставщик';
    pmeta.tabular_sections.goods.fields.nom.synonym = 'Номенклатура услуги';
    const grouped = [];
    for(const prow of calc_order.production) {
      const grow = grouped.find(v => v.nom_group === prow.nom.nom_group);
      if(grow) {
        grow.amount += prow.amount;
      }
      else {
        grouped.push({nom_group: prow.nom.nom_group, amount: prow.amount});
      }
    }

    const handleCancel = () => {
      handlers.handleIfaceState({
        component: dialog?.cmd?.area || 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    };

    const recalc = (force) => {
      let agency = 0;
      for(const grow of grouped) {
        let rrow;
        for(const crow of obj.contract.condition) {
          if(grow.nom_group._hierarchy(crow.nom_group)) {
            rrow = crow;
            if(grow.nom_group === crow.nom_group) {
              break;
            }
          }
        }
        if(!rrow) {
          for(const key in job_prm.pricing.agency) {
            const nom_group = nom_groups.get(key);
            if(grow.nom_group._hierarchy(nom_group)) {
              rrow = {rate: job_prm.pricing.agency[key]};
              if(grow.nom_group === nom_group) {
                break;
              }
            }
          }
        }
        if(!grow.rate || force) {
          grow.rate = rrow ? rrow.rate : 0;
        }
        grow.agency = (grow.amount * grow.rate / 100).round();
        agency += grow.agency;
      }
      if(row.amount !== agency || orderRow.amount !== agency) {
        row.quantity = 1;
        row.price = agency;
        row.amount = agency;
        orderRow.amount = agency;
        orderRow.rate = 100 * orderRow.amount / calc_order.doc_amount;
      }
      return utils._clone(grouped);
    };
    recalc(true);

    return {
      handleCancel,
      handleCommit() {
        obj.save()
          .then(handleCancel)
          .catch(console.error);
      },
      recalc,
      obj,
      row,
      orderRow,
      cmeta,
      pmeta,
      grouped,
    };
  }, [calc_order]);

  const [grouped, setGrouped] = React.useState(initGrouped);

  React.useEffect(() => {
    const update = (o, flds) => {
      if(o === obj) {
        if('contract' in flds || 'rate' in flds) {
          setGrouped(recalc('contract' in flds));
        }
      }
    };
    obj._manager.on({update});
    return () => obj._manager.off({update});
  }, [obj]);


  return <Dialog
    open
    initFullScreen
    large
    title={`Агентский к ${calc_order.presentation}`}
    onClose={handleCancel}
    actions={[
      <Button key="ok" onClick={handleCommit} color="primary">Записать</Button>,
      <Button key="cancel" onClick={handleCancel} color="secondary">Отмена</Button>
    ]}
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
        <PropField _obj={obj} _fld="contract" onChange={recalc} />
        <PropField _obj={row} _fld="nom" _meta={pmeta.tabular_sections.goods.fields.nom}/>
        <PropField Component={FieldNumberNative} _obj={orderRow} _fld="amount" _meta={cmeta.tabular_sections.orders.fields.amount}/>
      </Grid>
    </Grid>
    <AgencySrc rows={grouped} obj={obj}/>
  </Dialog>;
}
