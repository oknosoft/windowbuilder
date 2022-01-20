
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PairToolbar from './Toolbar/PairToolbar';
import PropField from 'metadata-react/DataField/PropField';
import FieldEndConnection from '../../CatCnns/FieldEndConnection';

export default function PairProps(props) {
  const [elm1, elm2] = props.elm;
  const var_layers = elm1.layer !== elm2.layer;
  const has_b1 = !var_layers && elm1.has_cnn(elm2, elm1.b);
  const has_e1 = !var_layers && elm1.has_cnn(elm2, elm1.e);
  const has_b2 = !var_layers && elm2.has_cnn(elm1, elm2.b);
  const has_e2 = !var_layers && elm2.has_cnn(elm1, elm2.e);
  const nearest1 = var_layers && elm1.nearest() === elm2;
  const nearest2 = var_layers && elm2.nearest() === elm1;
  const {fields} = elm1.__metadata(false);
  const _meta1 = Object.assign({}, fields.inset, {synonym: <><span>{`Элем №${elm1.elm}\u00a0`}</span><small>{elm1.pos.name}</small></>});
  const _meta2 = Object.assign({}, fields.inset, {synonym: <><span>{`Элем №${elm2.elm}\u00a0`}</span><small>{elm2.pos.name}</small></>});
  return <>
    <PairToolbar {...props} />
    <PropField _obj={elm1} _fld="inset" _meta={_meta1}/>
    <PropField _obj={elm2} _fld="inset" _meta={_meta2}/>
    {has_b1 ? <FieldEndConnection elm1={elm1} elm2={elm2} node="b" fields={fields} /> : null}
    {has_e1 ? <FieldEndConnection elm1={elm1} elm2={elm2} node="e" fields={fields} /> : null}
    {has_b2 ? <FieldEndConnection elm1={elm2} elm2={elm1} node="b" fields={fields} /> : null}
    {has_e2 ? <FieldEndConnection elm1={elm2} elm2={elm1} node="e" fields={fields} /> : null}
  </>;
}

PairProps.propTypes = {
  elm: PropTypes.array.isRequired,
};
