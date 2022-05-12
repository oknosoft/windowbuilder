
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import LayerToolbar from './Toolbar/LayerToolbar';
import Bar from './Bar';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import FieldFurn from 'wb-forms/dist/CatFurns/Editor';

export default function LayerProps(props) {
  const {layer, ox} = props;
  const {blank} = $p.utils;
  return <>
    <LayerToolbar {...props}/>
    <Bar>{layer.info}</Bar>
    {layer.own_sys ?
      <>
        <PropField _obj={layer} _fld="sys" read_only={[10, 11].includes(layer.kind)} />
        <LinkedProps ts={layer.prms} cnstr={layer.cnstr} inset={blank.guid} layer={layer}/>
      </>
      :
      <>
        <FieldFurn _obj={layer} _fld="furn" fullWidth />
        <PropField _obj={layer} _fld="direction" />
        <PropField _obj={layer} _fld="h_ruch" />
        <LinkedProps ts={ox.params} cnstr={layer.cnstr} inset={blank.guid}/>
      </>
    }
  </>;
}

LayerProps.propTypes = {
  layer: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
