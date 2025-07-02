import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from 'metadata-react/App/Dialog';
import FieldNumberNative from 'metadata-react/DataField/FieldNumberNative';
import PropField from 'metadata-react/DataField/PropField';
import AgencySrc from './AgencySrc';
import AgencyAmount from './AgencyAmount';

const {utils, job_prm, cat: {nom_groups, nom}} = $p;

function nomByGrp(grp) {
  let curr;
  for(const key in job_prm.nom.agency) {
    const nom_group = nom_groups.get(key);
    if(grp._hierarchy(nom_group)) {
      curr = nom.get(job_prm.nom.agency[key]);
    }
  }
  return curr;
}

export default function AgentOrder({dialog, handlers}) {

  const {ref, _mgr} = dialog;
  const calc_order = _mgr.by_ref[ref];
  let [grouped, setGrouped] = React.useState([]);
  const [dialogRef, registerDialod] = React.useState(null);

  const {handleCancel, handleCommit, obj, orderRow, cmeta, pmeta} = React.useMemo(() => {
    const obj = calc_order.agent_order();
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

    const handleCancel = () => {
      handlers.handleIfaceState({
        component: dialog?.cmd?.area || 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    };

    return {
      handleCancel,
      handleCommit() {
        obj.save()
          .then(handleCancel)
          .catch(console.error);
      },
      obj,
      orderRow,
      cmeta,
      pmeta,
    };
  }, [calc_order]);

  const recalc = (force) => {
    if(Array.isArray(force)) {
      grouped = force;
      force = false;
    }
    else {
      grouped = [];
      for(const prow of calc_order.production) {
        const grow = grouped.find(v => v.nom_group === prow.nom.nom_group);
        if(grow) {
          grow.amount += prow.amount;
        }
        else {
          grouped.push({nom_group: prow.nom.nom_group, amount: prow.amount});
        }
      }
    }
    const agency = new Map();
    let sum = 0;
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
      grow.max = rrow ? rrow.rate : 0;
      if('force' in grow) {
        delete grow.force;
      }
      else if(force) {
        grow.rate = rrow ? rrow.rate : 0;
      }
      if(grow.rate > grow.max) {
        if(grow.max === 0) {
          const max = grouped.reduce((sum, curr) => Math.max(sum, curr.max), 0);
          if(grow.rate > max) {
            grow.rate = max;
          }
        }
        else {
          grow.rate = grow.max;
        }
      }
      grow.agency = (grow.amount * grow.rate / 100).round();
      const curr = nomByGrp(grow.nom_group);
      if(!agency.has(curr)) {
        ;
      }
      agency.set(curr, (agency.get(curr) || 0) + grow.agency);
      sum += grow.agency;
    }
    if(orderRow.amount !== sum) {
      orderRow.amount = sum;
      orderRow.rate = 100 * orderRow.amount / calc_order.doc_amount;
    }
    obj.goods.clear();
    for(const [nom, price] of agency) {
      obj.goods.add({nom, quantity: 1, price, amount: price});
    }
    const res = grouped.map(v => ({...v}));
    orderRow.dop = {rates: res.map(({nom_group, ...other}) => ({...other, nom_group: nom_group.valueOf()}))};
    const refresh = recalc.bind(null, res);
    for(const row of res) {
      Object.defineProperty(row, 'refresh', {value: refresh, enumerable: false});
    }
    setGrouped(res);
  };

  React.useEffect(() => {
    const {rates} = orderRow.dop;
    if(Array.isArray(rates)) {
      for(const row of rates) {
        row.nom_group = nom_groups.get(row.nom_group);
      }
    }
    recalc(rates);
  }, [calc_order]);


  return <Dialog
    ref={registerDialod}
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
        <PropField Component={FieldNumberNative} _obj={calc_order} _fld="doc_amount" read_only _meta={cmeta.fields.doc_amount}/>
      </Grid>
      <Grid item xs={12} sm={6}>
        <PropField _obj={obj} _fld="organization" _meta={pmeta.fields.organization}/>
        <PropField _obj={obj} _fld="partner" _meta={pmeta.fields.partner}/>
        <PropField _obj={obj} _fld="contract" handleValueChange={recalc} />
        <PropField Component={AgencyAmount} _obj={orderRow} _fld="amount" handleCalc={recalc} _meta={cmeta.tabular_sections.orders.fields.amount}/>
      </Grid>
    </Grid>
    <AgencySrc dialogRef={dialogRef} rows={grouped} obj={obj}/>
  </Dialog>;
}
