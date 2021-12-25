
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import LayerToolbar from './Toolbar/LayerToolbar';
import Bar from './Bar';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';

export default function LayerProps(props) {
  const {layer, ox} = props;
  const {blank} = $p.utils;
  return <>
    <LayerToolbar {...props}/>
    <Bar>{layer.info}</Bar>
    {layer.layer ?
      <>
        <PropField _obj={layer} _fld="furn" />
        <PropField _obj={layer} _fld="direction" />
        <PropField _obj={layer} _fld="h_ruch" />
        <LinkedProps ts={ox.params} cnstr={layer.cnstr} inset={blank.guid}/>
      </>
      :
      <Typography>Рамный слой не имеет свойств фурнитуры</Typography>
    }
  </>;
}

LayerProps.propTypes = {
  layer: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
