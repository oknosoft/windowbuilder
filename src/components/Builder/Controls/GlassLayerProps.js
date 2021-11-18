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
import LinkedProp from './LinkedProp';

class GlassLayerProps extends React.Component {

  render() {
    const {elm, row} = this.props;
    if(!elm || !row) {
      return null;
    }

    const _obj = elm.region(row);
    const {fields} = _obj._metadata;
    $p.cat.clrs.selection_exclude_service(fields.clr, row.inset);
    const content = [<PropField fullWidth key={`clr-${row.inset.ref}`} _obj={_obj} clr={_obj.clr} _fld="clr" _meta={fields.clr} empty_text="Авто"/>];
    for(const prm of row.inset.used_params()) {
      const {ref} = prm;
      //<PropField key={`${ref}-${row.row}`} fullWidth _obj={_obj} _fld={ref} _meta={fields[ref]} />
      content.push(<LinkedProp key={`${ref}-${row.row}`} param={prm} _obj={_obj} _fld={ref} fields={fields} />);
    }
    return content;
  }
}

export default GlassLayerProps;

GlassLayerProps.propTypes = {
  elm: PropTypes.object, // элемент рисовалки
  row: PropTypes.object, // строка состава заполнения
};
