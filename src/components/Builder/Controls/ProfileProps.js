
import React from 'react';
import PropTypes from 'prop-types';
import PropField from 'metadata-react/DataField/PropField';
import LinkedProp from 'wb-forms/dist/Common/LinkedProp';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';
import FieldInsetProfile from 'wb-forms/dist/CatInserts/FieldInsetProfile';
import ProfileToolbar from './Toolbar/ProfileToolbar';
import FieldEndConnection from './FieldEndConnection';
import Bar from './Bar';
import CnnProps from './ProfileCnnProps';
import ElmInsets from './ElmInsets';
import Coordinates from './Coordinates';

export default function ProfileProps(props) {
  const {elm, fields, editor} = props;
  const {ProfileSegment, Onlay} = editor.constructor;

  if(!elm.isInserted()) {
    return 'Элемент удалён';
  }

  const eprops = elm.elm_props();
  const select_b = () => {
    elm.b.selected = true;
    elm.e.selected = false;
  };
  const select_e = () => {
    elm.e.selected = true;
    elm.b.selected = false;
  };

  const locked = Boolean(elm.locked);

  const clr_group = $p.cat.clrs.selection_exclude_service(fields.clr, elm, elm.ox);

  return <>
    <ProfileToolbar {...props} />
    <Bar>{`${elm.elm_type} ${elm.info}`}</Bar>
    <FieldInsetProfile elm={elm} disabled={locked || elm instanceof ProfileSegment}/>
    {locked ? null : <>
      <FieldClr _obj={elm} _fld="clr" _meta={fields.clr} clr_group={clr_group}/>

      <Bar>Свойства</Bar>
      <FieldEndConnection elm1={elm} node="b" _fld="cnn1" onClick={select_b}/>
      <FieldEndConnection elm1={elm} node="e" _fld="cnn2" onClick={select_e}/>
      {elm instanceof Onlay ? <PropField _obj={elm} _fld="region" _meta={elm._metadata.fields.region} ctrl_type="oselect" /> : null}
      <CnnProps elm={elm} sb={elm.b.selected} se={elm.e.selected}/>
      {eprops.map((param, ind) => {
        return <LinkedProp
          key={`ap-${ind}`}
          _obj={elm}
          _fld={param.ref}
          param={param}
          cnstr={-elm.elm}
          inset={elm.inset}
          fields={fields}
        />;
      })}
      <Coordinates elm={elm} fields={fields} select_b={select_b} select_e={select_e} />
      <ElmInsets elm={elm}/>
    </>}

  </>;
}

ProfileProps.propTypes = {
  elm: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
};
