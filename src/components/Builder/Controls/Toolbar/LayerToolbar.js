import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import { useStyles } from '../../Toolbar/styles';
import PropTypes from 'prop-types';
import InfoButton from 'metadata-react/App/InfoButton';

function LayerToolbar({ editor, layer, classes }) {
  const { furn } = layer;
  return <Toolbar disableGutters variant="dense">
    <div className={classes.title} />
    {furn?.note && furn.note.length &&
      <Tip title='Информация' >
        <InfoButton text={furn.note} />
      </Tip>
    }
    <Tip title="Обновить параметры">
      <IconButton onClick={() => layer.furn.refill_prm(layer)}><i className="fa fa-retweet" /></IconButton>
    </Tip>
    <Tip title={$p.msg.layer_spec}>
      <IconButton onClick={() => editor.fragment_spec(-layer.cnstr, layer.furn.toString())}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
  </Toolbar>;
}


export default useStyles(LayerToolbar);

LayerToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  layer: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};
