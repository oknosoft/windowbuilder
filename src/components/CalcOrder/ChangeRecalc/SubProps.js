
import React from 'react';
import PropTypes from 'prop-types';
import PropField from './PropField';

export default function SubProps({dp}) {

  const {product_params} = dp;
  const {fields} = product_params._owner._metadata(product_params._name);
  const res = [];
  const grid = {selection: {}};
  let notify;

  product_params.forEach((prow) => {
    const {param} = prow;
    let links;
    let hide = false;
    try {
      links = param.params_links({grid, obj: prow});
    }
    catch (e) {
      links = [];
    }

    // если для параметра есть связи - сокрытие по связям
    if(!hide){
      if(links.length) {
        hide = links.some((link) => link.hide);
      }
      else {
        hide = prow.hide;
      }
    }

    const _meta = Object.assign({}, fields.value);
    _meta.synonym = param.caption || param.name;

    const {types} = param.type;
    let oselect = types.length === 1 && types[0] === 'cat.property_values';

    // проверим вхождение значения в доступные и при необходимости изменим
    if (links.length) {
      const values = [];
      if(param.linked_values(links, prow, values)) {
        notify = true;
      }
      if(values.length) {
        if(values.length < 50) {
          oselect = true;
        }
        if(!_meta.choice_params) {
          _meta.choice_params = [];
        }
        // дополняем отбор
        _meta.choice_params.push({
          name: 'ref',
          path: {in: values.map((v) => v.value)}
        });
      }
    }
    if (prow.hide !== hide) {
      prow.hide = hide;
      notify = true;
    }

    if(hide) {
      return;
    }

    res.push(<PropField
      key={`prm-${prow.row}`}
      _obj={prow}
      _fld="value"
      _meta={_meta}
      ctrl_type={oselect ? 'oselect' : void 0}
    />);
  });
  return res;

}
