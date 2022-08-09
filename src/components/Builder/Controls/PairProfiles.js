
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PairToolbar from './Toolbar/PairToolbar';
import PropField from 'metadata-react/DataField/PropField';
import FieldEndConnection from 'wb-forms/dist/CatCnns/FieldEndConnection';

function nearest(elm1, elm2, ProfileVirtual) {
  const nelm = elm1.nearest();
  if(nelm === elm2) {
    return true;
  }
  return nelm instanceof ProfileVirtual ? nearest(nelm, elm2, ProfileVirtual) : false;
}

export default function PairProps(props) {
  const {elm: [elm1, elm2], editor} = props;
  const {ProfileItem, ProfileVirtual, Filling} = editor.constructor;
  const var_layers = elm1.layer !== elm2.layer;
  const elm1_profile = elm1 instanceof ProfileItem;
  const elm2_profile = elm2 instanceof ProfileItem;
  const elm1_filling = elm1 instanceof Filling;
  const elm2_filling = elm2 instanceof Filling;
  const has_b1 = elm1_profile && elm2_profile && !var_layers && elm1.has_cnn(elm2, elm1.b);
  const has_e1 = elm1_profile && elm2_profile && !var_layers && elm1.has_cnn(elm2, elm1.e);
  const has_b2 = elm1_profile && elm2_profile && !var_layers && elm2.has_cnn(elm1, elm2.b);
  const has_e2 = elm1_profile && elm2_profile && !var_layers && elm2.has_cnn(elm1, elm2.e);
  const nearest1 = elm1_profile && elm2_profile && nearest(elm1, elm2, ProfileVirtual);
  const nearest2 = elm1_profile && elm2_profile && nearest(elm2, elm1, ProfileVirtual);
  const {fields} = elm1.__metadata(false);
  const _meta1 = Object.assign({}, fields.inset, {synonym: <><span>{`Элем №${elm1.elm}\u00a0`}</span>
      <small>{elm1_profile ? elm1.pos.name : (elm1_filling ? elm1.formula() : '?')}</small></>});
  const _meta2 = Object.assign({}, fields.inset, {synonym: <><span>{`Элем №${elm2.elm}\u00a0`}</span>
      <small>{elm2_profile ? elm2.pos.name : (elm2_filling ? elm2.formula() : '?')}</small></>});
  // а есть ли вообще соединение между этими элементами?
  const has_cnn = has_b1 || has_e1 || has_b2 || has_e2 || (elm1_profile && elm2_filling || nearest1) || (elm2_profile && elm1_filling || nearest2);
  // для примыкающих, проверяем применимость
  const err1 = nearest1 && elm1.cnn3?.empty?.();
  const err2 = nearest2 && elm2.cnn3?.empty?.();
  return <>
    <PairToolbar {...props} />
    <PropField _obj={elm1} _fld="inset" _meta={_meta1} read_only={elm1_filling}/>
    <PropField _obj={elm2} _fld="inset" _meta={_meta2} read_only={elm2_filling}/>
    {has_b1 ? <FieldEndConnection elm1={elm1} elm2={elm2} node="b" fields={fields} /> : null}
    {has_e1 ? <FieldEndConnection elm1={elm1} elm2={elm2} node="e" fields={fields} /> : null}
    {has_b2 ? <FieldEndConnection elm1={elm2} elm2={elm1} node="b" fields={fields} /> : null}
    {has_e2 ? <FieldEndConnection elm1={elm2} elm2={elm1} node="e" fields={fields} /> : null}
    {(elm1_profile && elm2_filling || nearest1) ? <PropField _obj={elm1} _fld="cnn3" _meta={fields.cnn3} error={err1}/> : null}
    {(elm2_profile && elm1_filling || nearest2) ? <PropField _obj={elm2} _fld="cnn3" _meta={fields.cnn3} error={err2}/> : null}
    {has_cnn ? null : <>
      <br/>
      <Typography color="error">Нет соединений между элементами</Typography>
    </>}
  </>;
}

PairProps.propTypes = {
  elm: PropTypes.array.isRequired,
  editor: PropTypes.object.isRequired,
};
