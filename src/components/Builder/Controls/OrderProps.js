
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import OrderToolbar from './Toolbar/OrderToolbar';

export default function OrderProps(props) {
  const {calc_order} = props.ox;
  const {fields} = calc_order._metadata('extra_fields');
  const panel = [
    <OrderToolbar key={'tb'} calc_order={calc_order} {...props} />,
    <PropField key={'organization'} _obj={calc_order} _fld="organization" />,
    <PropField key={'partner'} _obj={calc_order} _fld="partner" />,
    <PropField key={'contract'} _obj={calc_order} _fld="contract" />,
    <PropField key={'department'} _obj={calc_order} _fld="department" />,
    <PropField key={'client_of_dealer'} _obj={calc_order} _fld="client_of_dealer" />,
  ];
  for(const row of calc_order.extra_fields) {

    const {property} = row;
    const _meta = Object.assign({}, fields.value);
    _meta.synonym = property.caption || property.name;

    const {types} = property.type;
    let oselect = types.length === 1 && ['cat.property_values', 'cat.characteristics'].includes(types[0]);
    const bool = types.includes('boolean') && (typeof row.value === 'boolean' || types.length === 1);

    panel.push(<PropField
      key={`prm-${property.valueOf()}`}
      _obj={row}
      _fld="value"
      _meta={_meta}
      ctrl_type={oselect ? 'oselect' : (bool ? 'ch' : void 0)}
    />);
  }
  return panel;
}

OrderProps.propTypes = {
  ox: PropTypes.object.isRequired,
};
