
import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles'

function ProfileToolbar({editor, elm, classes}) {
  const {msg} = $p;
  const {constructor: {ProfileSegment}, tools} = editor;
  const splitted = (elm instanceof ProfileSegment) || elm?.segms.length > 0;
  return <Toolbar disableGutters variant="dense">
    <Tip title={msg.elm_split}>
      <IconButton
        onClick={() => tools.find(t => t.options.name === 'select_node').keydown({event: {code: 'NumpadAdd'}, modifiers: {}})}
        disabled={splitted}
      >
        <i className={'tb_add_segment' + (splitted ? ' gl disabled' : '')}/>
      </IconButton>
    </Tip>
    <div className={classes.title} />
    <Tip title={msg.del_elm}>
      <IconButton onClick={() => {
        elm.removeChildren();
        elm.remove();
      }}><i className="fa fa-trash-o" /></IconButton>
    </Tip>
  </Toolbar>;
}

export default useStyles(ProfileToolbar);
