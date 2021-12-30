import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import InfoButton from 'metadata-react/App/InfoButton';
import {useStyles} from '../../Toolbar/styles';

function LayerToolbar({editor, layer, classes}) {
  const {furn} = layer;
  return <Toolbar disableGutters variant="dense">
    <div className={classes.title}/>
    <Tip title="Обновить параметры">
      <IconButton onClick={() => layer.furn.refill_prm(layer)}><i className="fa fa-retweet" /></IconButton>
    </Tip>
    <Tip title={$p.msg.layer_spec}>
      <IconButton onClick={() => editor.fragment_spec(-layer.cnstr, layer.furn.toString())}>
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
