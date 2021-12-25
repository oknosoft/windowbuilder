import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import {useStyles} from '../../Toolbar/styles'

function PairToolbar({editor, current, classes}) {
  return <Toolbar disableGutters variant="dense">
    Пара элементов
  </Toolbar>;
}

export default useStyles(PairToolbar);
