
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import Bar from './Bar';
import ElmInsets from './ElmInsets';
import Coordinates from './Coordinates';

export default function ProfileProps({elm, fields}) {
  const {info, elm_type} = elm;
  const eprops = elm.elm_props();
  const select_b = () => {
    elm.b.selected = true;
    elm.e.selected = false;
  };
  const select_e = () => {
    elm.e.selected = true;
    elm.b.selected = false;
  };
  return <>
    <Bar>{`${elm_type} ${info}`}</Bar>
    <PropField _obj={elm} _fld="inset" _meta={fields.inset}/>
    <PropField _obj={elm} _fld="clr" _meta={fields.clr}/>
    <PropField _obj={elm} _fld="offset" _meta={fields.offset}/>
    <PropField _obj={elm} _fld="cnn1" _meta={fields.cnn1} onClick={select_b}/>
    <PropField _obj={elm} _fld="cnn2" _meta={fields.cnn2} onClick={select_e}/>

    <Coordinates elm={elm} fields={fields} select_b={select_b} select_e={select_e} />

    {eprops.length ? <>
      <Bar>Свойства</Bar>
      {eprops.map(({ref}, ind) => <PropField key={`ap-${ind}`} fullWidth _obj={elm} _fld={ref} _meta={fields[ref]}/>)}
    </> : null}
    <ElmInsets elm={elm}/>
  </>;
}

ProfileProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
