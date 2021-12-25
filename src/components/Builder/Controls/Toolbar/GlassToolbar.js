import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata-react/App/Tip';
import {useStyles} from '../../Toolbar/styles'


function GlassToolbar({editor, elm, classes}) {
  return <Toolbar disableGutters variant="dense">
    <div className={classes.title}/>
    <Tip title={$p.msg.elm_spec}>
      <IconButton onClick={() => editor.fragment_spec(elm.elm, elm.inset.toString())}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
  </Toolbar>;
}

export default useStyles(GlassToolbar);
