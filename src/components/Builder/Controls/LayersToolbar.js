import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'wb-forms/dist/Common/Tip';

export const useStyles = withStyles({
  title: {
    flexGrow: 1,
  },
  sp: {
    paddingLeft: 8,
  },
});

// создаёт слой и оповещает мир о новых слоях
function addLayer(/*editor*/) {
  const l = new $p.EditorInvisible.Contour({parent: undefined});
  l.activate();
  //editor.eve.emit_async('rows', editor.project.ox, {constructions: true});
}

function addFlap(editor, furn) {
  const fillings = editor.project.getItems({class: $p.EditorInvisible.Filling, selected: true});
  if(fillings.length){
    fillings[0].create_leaf(furn);
  }
  else{
    $p.ui.dialogs.alert({text: 'Перед добавлением створки, укажите заполнение, в которое поместить створку', title: 'Добавить створку'});
  }
}

function dropLayer(editor) {
  const {project, eve} = editor;
  const l = project.activeLayer;
  if(l) {
    l.remove();
    project.zoom_fit();
    const {contours} = project;
    if(contours.length) {
      contours[0].activate();
    }
  }
}

function LayersToolbar({editor, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters variant="dense">
    <Tip title={msg.bld_new_layer}>
      <IconButton onClick={() => addLayer(editor)}><i className="fa fa-file-o" /></IconButton>
    </Tip>
    <Tip title={msg.bld_new_stv}>
      <IconButton onClick={() => addFlap(editor)}><i className="fa fa-file-code-o" /></IconButton>
    </Tip>
    <Tip title={msg.bld_new_nested}>
      <IconButton onClick={() => addFlap(editor, 'nested')}><i className="fa fa-file-image-o" /></IconButton>
    </Tip>
    <Tip title={msg.bld_new_virtual}>
      <IconButton onClick={() => addFlap(editor, 'virtual')}><i className="fa fa-file-excel-o" /></IconButton>
    </Tip>
    <div className={classes.title} />
    <Tip title={msg.del_layer}>
      <IconButton onClick={() => dropLayer(editor)}><i className="fa fa-trash-o" /></IconButton>
    </Tip>
  </Toolbar>;
}

LayersToolbar.propTypes = {
  editor: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

export default useStyles(LayersToolbar);
