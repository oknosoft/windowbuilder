
import React from 'react';
import PropTypes from 'prop-types';
import DataField from 'metadata-react/DataField';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';

function VitrazhWnd({editor, classes}) {
  const {tool} = editor;
  const {profile} = tool;
  const ext = extClasses(classes);
  return <div>
    <DataField _obj={profile} _fld="elm_type" extClasses={ext} fullWidth/>
  </div>;
}

VitrazhWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(VitrazhWnd);
