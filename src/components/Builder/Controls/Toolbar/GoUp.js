import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../../Toolbar/IconButton';
import Tip from 'metadata-react/App/Tip';
import SubdirectoryArrowLeftIcon from '@material-ui/icons/SubdirectoryArrowLeft';

export default function GoUp({editor, elm}) {
  if(!elm.nearest) {
    return null;
  }
  const nearest = elm.nearest();
  return <Tip title="К внешнему профилю">
    <IconButton disabled={!nearest} onClick={() => {
      if(nearest) {
        if(!editor.Key.modifiers.shift) {
          elm.selected = false;
        }
        nearest.selected = true;
      }
      editor.eve.emit('elm_activated', nearest);
    }}>
      <SubdirectoryArrowLeftIcon style={{transform: 'rotate(0.25turn)'}} />
    </IconButton>
  </Tip>;
}

GoUp.propTypes = {
  elm: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
};
