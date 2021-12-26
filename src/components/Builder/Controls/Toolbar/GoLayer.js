import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import SubdirectoryArrowLeftIcon from '@material-ui/icons/SubdirectoryArrowLeft';

export default function GoLayer({elm, tree_select}) {
  return <Tip title="Перейти к слою">
    <IconButton onClick={() => tree_select({type: 'layer', layer: elm.layer, elm: null})}>
      <SubdirectoryArrowLeftIcon style={{transform: 'rotate(0.25turn)'}} />
    </IconButton>
  </Tip>;
}
