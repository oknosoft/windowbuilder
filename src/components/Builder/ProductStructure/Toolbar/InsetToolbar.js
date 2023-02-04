
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles';

function InsetToolbar({editor, current, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters variant="dense">
    Пара элементов
  </Toolbar>;
}

export default useStyles(InsetToolbar);
