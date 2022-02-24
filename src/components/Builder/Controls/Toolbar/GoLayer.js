import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '../../Toolbar/IconButton';
import Tip from 'metadata-react/App/Tip';
import SubdirectoryArrowLeftIcon from '@material-ui/icons/SubdirectoryArrowLeft';

export default function GoLayer({editor, elm}) {
  return <Tip title="На уровень выше">
    <IconButton onClick={() => editor.eve.emit('elm_activated', elm.layer || elm.project)}>
      <SubdirectoryArrowLeftIcon style={{transform: 'rotate(0.25turn)'}} />
    </IconButton>
  </Tip>;
}

GoLayer.propTypes = {
  elm: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired,
};
