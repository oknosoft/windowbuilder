/**
 * Выбор заказа шаблонов вложенного изделия
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


export default function SelectOrder({onChange, _obj, templates_nested}) {
  if(!templates_nested || !templates_nested.length) {
    return <>
      <Typography>Не заполнена константа <b>templates_nested</b></Typography>
    </>;
  }
  if(templates_nested.length === 1) {
    if(_obj.calc_order != templates_nested[0]) {
      _obj.calc_order = templates_nested[0];
      Promise.resolve().then(() => onChange(_obj.calc_order));
    }
    return null;
  }
  return <FormControl fullWidth title="Укажите заказ">
    <InputLabel>Расчет-заказ шаблонов</InputLabel>
    <Select
      value={templates_nested.includes(_obj.calc_order.ref) ? _obj.calc_order.ref : ''}
      onChange={({target}) => {
        _obj.calc_order = target.value;
        onChange(_obj.calc_order);
      }}
    >
      {templates_nested.map((order, index) => <MenuItem key={`o-${index}`} value={order.ref}>
        <Typography component="span">{`${order.note} \u00A0`}</Typography>
        <Typography component="span" variant="caption">{` ${order.number_doc}`}</Typography>
      </MenuItem>)}
    </Select>
  </FormControl>;
}

SelectOrder.propTypes = {
  _obj: PropTypes.object.isRequired,
  templates_nested: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
