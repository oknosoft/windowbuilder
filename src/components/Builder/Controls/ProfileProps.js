
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import Bar from './Bar';
import ElmInsets from './ElmInsets';
import Grid from '@material-ui/core/Grid';

export default function ProfileProps({elm, fields}) {
  const {info, elm_type, project: {_scope}} = elm;
  const props = elm.elm_props();
  return <>
    <Bar>{`${elm_type} ${info}`}</Bar>
    <PropField fullWidth _obj={elm} _fld="inset" _meta={fields.inset}/>
    <PropField fullWidth _obj={elm} _fld="clr" _meta={fields.clr}/>
    <PropField fullWidth _obj={elm} _fld="offset" _meta={fields.offset}/>
    <div onClick={() => {
      _scope.cmd('deselect', [{elm: elm.elm, node: 'e'}]);
      _scope.cmd('select', [{elm: elm.elm, node: 'b'}]);
    }}>
      <Bar>Начало</Bar>
      <Grid container spacing={1}>
        <Grid item>
          <PropField fullWidth _obj={elm} _fld="x1" _meta={fields.x1}/>
        </Grid>
        <Grid item>
          <PropField fullWidth _obj={elm} _fld="y1" _meta={fields.y1}/>
        </Grid>
      </Grid>
      <PropField fullWidth _obj={elm} _fld="cnn1" _meta={fields.cnn1}/>
    </div>
    <div onClick={() => {
      _scope.cmd('deselect', [{elm: elm.elm, node: 'b'}]);
      _scope.cmd('select', [{elm: elm.elm, node: 'e'}]);
    }}>
      <Bar>Конец</Bar>
      <Grid container spacing={1}>
        <Grid item>
          <PropField fullWidth _obj={elm} _fld="x2" _meta={fields.x2}/>
        </Grid>
        <Grid item>
          <PropField fullWidth _obj={elm} _fld="y2" _meta={fields.y2}/>
        </Grid>
      </Grid>
      <PropField fullWidth _obj={elm} _fld="cnn2" _meta={fields.cnn2}/>
    </div>
    {props.length ? <>
      <Bar>Свойства</Bar>
      {props.map(({ref}, ind) => <PropField key={`ap-${ind}`} fullWidth _obj={elm} _fld={ref} _meta={fields[ref]}/>)}
    </> : null}
    <ElmInsets elm={elm}/>
  </>;
}

ProfileProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
