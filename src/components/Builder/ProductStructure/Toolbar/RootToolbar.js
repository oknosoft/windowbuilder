
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Tip from 'metadata/react/dist/App/Tip';
import IconButton from '@material-ui/core/IconButton';
import {useStyles} from '../../Toolbar/styles';

// создаёт слой и оповещает мир о новых слоях
function addLayer(editor) {
  const {project} = editor;
  editor.cmd('deselect', [{elm: null}]);
  const l = editor.constructor.Contour.create({project});
  project.notify(project, 'scheme_changed');
  editor.cmd('select', [{elm: -l.cnstr}]);
  //editor.eve.emit_async('rows', editor.project.ox, {constructions: true});
}

function RootToolbar({editor, current, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters>
    <Tip title={msg.bld_new_layer}>
      <IconButton onClick={() => addLayer(editor)}><i className="fa fa-file-o" /></IconButton>
    </Tip>
    <div className={classes.title} />
  </Toolbar>;
}

export default useStyles(RootToolbar);
