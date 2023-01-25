
import React from 'react';
import PropTypes from 'prop-types';
import ProfileToolbar from './Toolbar/ProfileToolbar';
import Bar from './Bar';
import ElmInsets from './ElmInsets';
import Coordinates from './Coordinates';
import LinkedProp from 'wb-forms/dist/Common/LinkedProp';
import FieldEndConnection from 'wb-forms/dist/CatCnns/FieldEndConnection';
import FieldClr from 'wb-forms/dist/CatClrs/FieldClr';
import FieldInsetProfile from 'wb-forms/dist/CatInserts/FieldInsetProfile';

export default function ProfileProps(props) {
  const {elm, fields, editor} = props;
  const {ProfileSegment} = editor.constructor;

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
      {eprops.map((param, ind) => {
        return <LinkedProp key={`ap-${ind}`} _obj={elm} _fld={param.ref} param={param} cnstr={-elm.elm} fields={fields} />;
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
