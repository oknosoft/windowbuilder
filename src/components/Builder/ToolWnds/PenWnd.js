import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import StandardForms from './StandardForms';
import PropField from 'metadata-react/DataField/PropField';
import Bar from '../Controls/Bar';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';

function PenWnd({editor, layer, classes}) {
  const {tool, project} = editor;
  const {profile, options} = tool;
  const ext = extClasses(classes);
  if(!layer) {
    layer = project.activeLayer;
  }
  return <>
    <Bar>{options.title || options.wnd?.caption}</Bar>
    <FormControl classes={ext.control} fullWidth readOnly>
      <InputLabel classes={ext.label}>Текущий слой</InputLabel>
      <Input classes={ext.input} value={layer?.presentation ? layer.presentation() : '-'}/>
    </FormControl>
    <PropField _obj={profile} _fld="elm_type"/>
    <PropField _obj={profile} _fld="inset"/>
    <PropField _obj={profile} _fld="clr"/>
    <PropField _obj={profile} _fld="bind_generatrix" ctrl_type="cb"/>
    <PropField _obj={profile} _fld="bind_node" ctrl_type="cb"/>
    <PropField _obj={profile} _fld="grid"/>
    <StandardForms editor={editor} />
  </>;
}

PenWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(PenWnd);
