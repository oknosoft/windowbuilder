
import React from 'react';
import PropTypes from 'prop-types';
import PropField from './PropField';

class SubProps extends React.Component{

  constructor(props, context) {
    super(props, context);
    const {production, product_params} = props.dp;
    const params = new Map();
    const aparams = [];
    production.forEach((row) => {
      if(!row.use) {
        return;
      }
      row.characteristic.params.find_rows(({hide: false}), ({param, value}) => {
        if(!param.caption || (!param.show_calculated && param.is_calculated)) {
          return;
        }
        if(!params.get(param)) {
          params.set(param, new Set());
        }
        params.get(param).add(value);
      });
    });

    for(const [param, value] of params) {
      if(value.size === 1) {
        aparams.push({param, value: Array.from(value)[0]});
      }
    }
    aparams.sort((a, b) => {
      if(a.sorting_field > b.sorting_field) {
        return 1;
      }
      if(a.sorting_field < b.sorting_field) {
        return -1;
      }
      if(a.name > b.name) {
        return 1;
      }
      if(a.name < b.name) {
        return -1;
      }
      return 0;
    });
    product_params.load(aparams);
  }

  render() {
    const {product_params} = this.props.dp;
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

}

export default SubProps;
