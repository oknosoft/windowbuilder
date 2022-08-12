import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import StandardForms from './StandardForms';
import PropField from 'metadata-react/DataField/PropField';
import Bar from '../Controls/Bar';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import FieldInsetProfile from '../../CatInserts/FieldInsetProfile';

function PenWnd({editor, layer, classes}) {
  const {tool, project} = editor;
  const {profile, options} = tool;
  const ext = extClasses(classes);
  if(!layer) {
    layer = project.activeLayer;
  }

  const [elm_type, set_elm_type] = React.useState(profile.elm_type);
  const elm_type_change = ({target}) => {
    profile.elm_type = target.value;
    profile.inset = project.default_inset({elm_type: profile.elm_type, elm: project});
    set_elm_type(profile.elm_type);
  };

  return <>
    <Bar>{options.wnd.caption}</Bar>
    <FormControl classes={ext.control} fullWidth readOnly>
      <InputLabel classes={ext.label}>Текущий слой</InputLabel>
      <Input classes={ext.input} value={layer?.presentation ? layer.presentation() : '-'}/>
    </FormControl>
    <PropField _obj={profile} _fld="elm_type" onChange={elm_type_change}/>
    <FieldInsetProfile elm={profile} project={project} elm_type={profile.elm_type}/>
    <PropField _obj={profile} _fld="clr"/>
    <PropField _obj={profile} _fld="bind_generatrix" ctrl_type="cb"/>
    <PropField _obj={profile} _fld="bind_node" ctrl_type="cb"/>
    <PropField _obj={profile} _fld="bind_sys" ctrl_type="cb"/>
    <PropField _obj={profile} _fld="grid"/>
    <StandardForms editor={editor} layer={layer} elm_type={elm_type}/>
  </>;
}

PenWnd.propTypes = {
  editor: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  layer: PropTypes.object,
};

export default withStyles(PenWnd);
