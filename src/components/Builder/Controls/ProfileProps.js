
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import ProfileToolbar from './Toolbar/ProfileToolbar';
import Bar from './Bar';
import ElmInsets from './ElmInsets';
import Coordinates from './Coordinates';
import LinkedProp from './LinkedProp';

export default function ProfileProps(props) {
  const {elm, fields} = props;
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
    <ProfileToolbar {...props} />
    <Bar>{`${elm.elm_type} ${elm.info}`}</Bar>
    <PropField _obj={elm} _fld="inset" _meta={fields.inset}/>
    <PropField _obj={elm} _fld="clr" _meta={fields.clr}/>
    <PropField _obj={elm} _fld="offset" _meta={fields.offset}/>

    <Bar>Свойства</Bar>
    <PropField _obj={elm} _fld="cnn1" _meta={fields.cnn1} onClick={select_b}/>
    <PropField _obj={elm} _fld="cnn2" _meta={fields.cnn2} onClick={select_e}/>
    {eprops.map((param, ind) => {
      return <LinkedProp key={`ap-${ind}`} _obj={elm} _fld={param.ref} param={param} cnstr={-elm.elm} fields={fields} />;
    })}

    <Coordinates elm={elm} fields={fields} select_b={select_b} select_e={select_e} />

    <ElmInsets elm={elm}/>
  </>;
}

ProfileProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
};
