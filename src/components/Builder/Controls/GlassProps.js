import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import Bar from './Bar';
import GlassComposite from './GlassComposite';
import Grid from '@material-ui/core/Grid';


export default function GlassProps({elm, fields}) {
  const {info, inset: {insert_type}} = elm;
  const props = elm.elm_props();

  return <>
    <Bar>{`Заполнение ${info}`}</Bar>
    <PropField fullWidth _obj={elm} _fld="inset" _meta={fields.inset}/>
    <PropField fullWidth _obj={elm} _fld="clr" _meta={fields.clr}/>

    {props.length ? <>
      <Bar>Свойства</Bar>
      {props.map(({ref}, ind) => <PropField key={`ap-${ind}`} fullWidth _obj={elm} _fld={ref} _meta={fields[ref]}/>)}
    </> : null}

    {insert_type === insert_type._manager.Стеклопакет ? <GlassComposite elm={elm}/> : null}

    <Bar position="static">Координаты</Bar>
    <Grid container spacing={1}>
      <Grid item>
        <PropField fullWidth _obj={elm} _fld="x1" _meta={fields.x1} read_only/>
      </Grid>
      <Grid item>
        <PropField fullWidth _obj={elm} _fld="y1" _meta={fields.y1} read_only/>
      </Grid>
    </Grid>
    <Grid container spacing={1}>
      <Grid item>
        <PropField fullWidth _obj={elm} _fld="x2" _meta={fields.x2} read_only/>
      </Grid>
      <Grid item>
        <PropField fullWidth _obj={elm} _fld="y2" _meta={fields.y2} read_only/>
      </Grid>
    </Grid>
  </>;
}

GlassProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
