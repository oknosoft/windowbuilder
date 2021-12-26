import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import BorderHorizontalIcon from '@material-ui/icons/BorderHorizontal';
import BorderVerticalIcon from '@material-ui/icons/BorderVertical';
import Tip from 'metadata-react/App/Tip';
import GoLayer from './GoLayer';
import {useStyles} from '../../Toolbar/styles'


function GlassToolbar({editor, elm, tree_select, classes}) {
  return <Toolbar disableGutters variant="dense">
    <Tip title="Вставить вертикальный импост">
      <IconButton onClick={null}>
        <BorderVerticalIcon/>
      </IconButton>
    </Tip>
    <Tip title="Вставить горизонтальный импост">
      <IconButton onClick={null}>
        <BorderHorizontalIcon/>
      </IconButton>
    </Tip>
    <div className={classes.title}/>
    <GoLayer elm={elm} tree_select={tree_select}/>
    <Tip title={$p.msg.elm_spec}>
      <IconButton onClick={() => editor.fragment_spec(elm.elm, elm.inset.toString())}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
  </Toolbar>;
}

export default useStyles(GlassToolbar);
