
import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';

export default function Dimensions({_obj, ext}) {

  return <div>
    <DataField _obj={_obj} _fld="w" extClasses={ext} fullWidth/>
    <DataField _obj={_obj} _fld="h" extClasses={ext} fullWidth/>
    <DataField _obj={_obj} _fld="elm_by_x" extClasses={ext} fullWidth/>
    <DataField _obj={_obj} _fld="elm_by_y" extClasses={ext} fullWidth/>
  </div>;

}
