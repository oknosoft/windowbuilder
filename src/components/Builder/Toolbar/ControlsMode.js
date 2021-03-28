import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import LayersIcon from '@material-ui/icons/Layers';
import Tip from 'wb-forms/dist/Common/Tip';

export default function ControlsMode({controls_ext, setExt}) {
  return <Tip title={`${controls_ext ? 'Продвинутый' : 'Упрощенный'} режим управления рисовалкой`}>
    <IconButton onClick={() => setExt(!controls_ext)}>
      {controls_ext ? <LayersIcon /> : <LayersClearIcon />}
    </IconButton>
  </Tip>;
}
