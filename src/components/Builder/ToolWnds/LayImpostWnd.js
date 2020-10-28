import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';

export default function LayImpostWnd({editor}) {
  const {_obj} = editor.tool;
  return <div>
    <DataField _obj={_obj} _fld="elm_type"/>
    <DataField _obj={_obj} _fld="clr"/>
    <DataField _obj={_obj} _fld="split"/>
    <DataField _obj={_obj} _fld="inset_by_y"/>
    <DataField _obj={_obj} _fld="elm_by_y"/>
    <DataField _obj={_obj} _fld="step_by_y"/>
    <DataField _obj={_obj} _fld="align_by_y"/>
    <DataField _obj={_obj} _fld="inset_by_x"/>
    <DataField _obj={_obj} _fld="elm_by_x"/>
    <DataField _obj={_obj} _fld="step_by_x"/>
    <DataField _obj={_obj} _fld="align_by_x"/>
    <DataField _obj={_obj} _fld="w"/>
    <DataField _obj={_obj} _fld="h"/>
  </div>;
}

LayImpostWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};
