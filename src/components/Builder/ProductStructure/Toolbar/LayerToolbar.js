import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles';


function dropLayer(layer) {
  const {project} = layer;
  if(layer) {
    layer.remove();
    project.zoom_fit();
    project.notify(project, 'scheme_changed');
    const {contours} = project;
    if(contours.length) {
      project._scope.cmd('select', [{elm: -contours[0].cnstr}]);
    }
  }
}

function LayerToolbar({layer, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters>
    <div className={classes.title} />
    <Tip title={msg.del_layer}>
      <IconButton onClick={() => dropLayer(layer)}><i className="fa fa-trash-o" /></IconButton>
    </Tip>
  </Toolbar>;
}

LayerToolbar.propTypes = {
  layer: PropTypes.object,
  classes: PropTypes.object,
};

export default useStyles(LayerToolbar);
