/**
 * Свойства слоя составного пакета
 *
 * @module GlassLayerProps
 *
 * Created by Evgeniy Malyarov on 20.10.2021.
 */

import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';

class GlassLayerProps extends React.Component {

  constructor(props, context) {
    super(props, context);
    this._refs = {};
  }

  ref_fn(fld) {
    return (el) => {
      this._refs[fld] = el;
    };
  }

  render() {
    const {elm, row} = this.props;
    if(!elm || !row) {
      return null;
    }

    const _obj = elm.region(row);
    const {fields} = _obj._metadata;
    const content = [<PropField fullWidth key={`aip-clr-${row.row}`} _obj={_obj} _fld="clr" _meta={fields.clr} empty_text="Авто"/>];
    for(const prm of row.inset.used_params()) {
      const {ref} = prm
      content.push(<PropField key={`${ref}-${row.row}`} fullWidth _obj={_obj} _fld={ref} _meta={fields[ref]} get_ref={this.ref_fn(ref)}/>);
    }
    return content;
  }
}

export default GlassLayerProps;

GlassLayerProps.propTypes = {
  elm: PropTypes.object, // элемент рисовалки
  row: PropTypes.object, // строка состава заполнения
};
