import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import IconButton from '../../Toolbar/IconButton';
import {useStyles} from '../../Toolbar/styles';
import GoLayer from './GoLayer';
import LayerKind from './LayerKind';

function LayerToolbar({editor, layer, classes}) {
  const {furn, project} = layer;
  const contours = project.getItems({class: editor.constructor.Contour});
  return <Toolbar disableGutters>
    <Tip title="Поднять на передний план">
      <IconButton disabled={contours.length < 2} onClick={() => {
        layer.bring('up');
        layer.activate(true);
      }}><FlipToFrontIcon/></IconButton>
    </Tip>
    <Tip title="Опустить на задний план">
      <IconButton disabled={contours.length < 2} onClick={() => {
        layer.bring('down');
        layer.activate(true);
      }}><FlipToBackIcon/></IconButton>
    </Tip>
    <LayerKind layer={layer} />
    <div className={classes.title}/>
    <Tip title="Обновить параметры">
      <IconButton disabled={!layer.layer} onClick={() => furn.refill_prm(layer)}><i className="fa fa-retweet" /></IconButton>
    </Tip>
    <GoLayer elm={layer} editor={editor}/>
    <Tip title={$p.msg.layer_spec}>
      <IconButton onClick={() => editor.layer_spec(layer)}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
    {furn?.note &&
      <Tip title='Информация' >
        <InfoButton text={furn.note} />
      </Tip>
    }
  </Toolbar>;
}

LayerToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

export default useStyles(LayerToolbar);
