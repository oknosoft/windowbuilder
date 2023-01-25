
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import LayerToolbar from './Toolbar/LayerToolbar';
import Bar from './Bar';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProps from 'wb-forms/dist/Common/LinkedProps';
import FieldFurn from 'wb-forms/dist/CatFurns/Editor';
import FieldFlipped from 'wb-forms/dist/CatClrs/FieldFlipped';

export default function LayerProps(props) {
  const {layer, ox} = props;
  const {utils: {blank}, job_prm: {builder}}  = $p;
  const cflipped = builder.hide_flipped ? null : <FieldFlipped _obj={layer} />;
  return <>
    <LayerToolbar {...props}/>
    <Bar>{layer.info}</Bar>
    {layer.own_sys ?
      <>
        <PropField _obj={layer} _fld="sys" />
        {cflipped}
        <LinkedProps ts={layer.prms} cnstr={layer.cnstr} inset={blank.guid} layer={layer}/>
      </>
      :
      (layer.layer ?
      <>
        <FieldFurn _obj={layer} _fld="furn" fullWidth />
        <PropField _obj={layer} _fld="direction" />
        <PropField _obj={layer} _fld="h_ruch" />
        {cflipped}
        <LinkedProps ts={ox.params} cnstr={layer.cnstr} inset={blank.guid} layer={layer}/>
      </>
          :
        <>
          {cflipped}
          <Typography>Рамный слой не имеет свойств фурнитуры</Typography>
        </>
      )
    }
  </>;
}

LayerProps.propTypes = {
  layer: PropTypes.object.isRequired,
  ox: PropTypes.object.isRequired,
};
