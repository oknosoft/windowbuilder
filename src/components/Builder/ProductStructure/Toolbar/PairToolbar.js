
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles';

function PairToolbar({editor, elm, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters variant="dense">
    {elm.length > 2 ? `Группа элементов (${elm.length} шт)` : 'Пара элементов'}
    <div className={classes.title} />
    <Tip title={msg.del_elm}>
      <IconButton onClick={() => {
        for(const el of elm) {
          el.removeChildren();
          el.remove();
        }
      }}><i className="fa fa-trash-o" /></IconButton>
    </Tip>
  </Toolbar>;
}

export default useStyles(PairToolbar);
