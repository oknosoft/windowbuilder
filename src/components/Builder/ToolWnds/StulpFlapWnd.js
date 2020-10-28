import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';

export default function StulpFlapWnd({editor}) {
  const {_obj} = editor.tool;
  return <div>
    <DataField _obj={_obj} _fld="inset" fullWidth/>
    <DataField _obj={_obj} _fld="furn1" fullWidth/>
    <DataField _obj={_obj} _fld="furn2" fullWidth/>
  </div>;
}

StulpFlapWnd.propTypes = {
  editor: PropTypes.object.isRequired,
};
