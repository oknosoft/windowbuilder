
import React from 'react';
import PropTypes from "prop-types";
import Typography from '@material-ui/core/Typography';
import Bar from './Bar';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';

export default function LayerProps({layer, ox}) {
  const {blank} = $p.utils;
  return <>
    <Bar>{layer.info}</Bar>
    {layer.layer ?
      <>
        <PropField _obj={layer} _fld="furn" />
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
