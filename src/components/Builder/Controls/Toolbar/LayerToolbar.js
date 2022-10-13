import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import IconButton from '@material-ui/core/IconButton';
import SmallButton from '../../Toolbar/IconButton';
import {useStyles} from '../../Toolbar/styles';
import GoLayer from './GoLayer';
import LayerKind from './LayerKind';

function LayerToolbar({editor, layer, classes}) {
  if(!layer.hasChildren()) {
    return '';
  }
  const {furn, project, direction} = layer;
  const contours = project.getItems({class: editor.constructor.Contour});
  return <Toolbar disableGutters>
    <Tip title="Поднять на передний план">
      <SmallButton disabled={contours.length < 2} onClick={() => {
        layer.bring('up');
        layer.activate(true);
      }}><FlipToFrontIcon/></SmallButton>
    </Tip>
    <Tip title="Опустить на задний план">
      <SmallButton disabled={contours.length < 2} onClick={() => {
        layer.bring('down');
        layer.activate(true);
      }}><FlipToBackIcon/></SmallButton>
    </Tip>
    <LayerKind layer={layer} />
    <SmallButton disabled>|</SmallButton>
    <Tip title="Направление открывания: Левое">
      <SmallButton disabled={!furn || furn.empty()} onClick={() => {
        layer.direction = direction._manager.left;
      }}>L</SmallButton>
    </Tip>
    <Tip title="Направление открывания: Правое">
      <SmallButton disabled={!furn || furn.empty()} onClick={() => {
        layer.direction = direction._manager.right;
      }}>R</SmallButton>
    </Tip>
    <div className={classes.title}/>
    <Tip title="Обновить параметры">
      <IconButton
        disabled={!layer.layer}
        onClick={() => layer.own_sys ? layer.refill_prm() : furn.refill_prm(layer)}>
        <i className="fa fa-retweet" />
      </IconButton>
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
