import React from 'react';
import PropTypes from 'prop-types';
import StandardForms from './StandardForms';
import DataField from 'metadata-react/DataField';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';

function PenWnd({editor, classes}) {
  const {tool} = editor;
  const {profile} = tool;
  const ext = extClasses(classes);
  return <div>
    <DataField _obj={profile} _fld="elm_type" extClasses={ext} fullWidth/>
    <DataField _obj={profile} _fld="inset" extClasses={ext} fullWidth/>
    <DataField _obj={profile} _fld="clr" extClasses={ext} fullWidth/>
    <DataField _obj={profile} _fld="bind_generatrix" extClasses={ext} fullWidth ctrl_type="cb"/>
    <DataField _obj={profile} _fld="bind_node" extClasses={ext} fullWidth ctrl_type="cb"/>
    <DataField _obj={profile} _fld="grid" extClasses={ext} fullWidth/>
    <StandardForms editor={editor} />
  </div>;
}

PenWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(PenWnd);
