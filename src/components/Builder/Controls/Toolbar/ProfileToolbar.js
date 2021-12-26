import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import Tip from 'metadata-react/App/Tip';
import {useStyles} from '../../Toolbar/styles'
import GoLayer from './GoLayer';

const btnClick = (editor, name) => {

  if(name === 'delete') {
    return () => editor.project.selectedItems.forEach(({parent}) => {
      if(parent instanceof editor.constructor.ProfileItem){
        if(parent.elm_type == 'Створка') {
          $p.ui.dialogs.alert({
            text: `Нельзя удалять сегменты створок. Используйте вместо этого, служебный цвет "Не включать в спецификацию"`,
            title: 'Сегмент створки'
          });
        }
        else {
          parent.removeChildren();
          parent.remove();
        }
      }
    });
  }
  else if(name === 'spec') {
    return () => {
      const {selected_elm: elm} = editor.project;
      editor.fragment_spec(elm ? elm.elm : 0, elm && elm.inset.toString());
    }
  }

  if(['left', 'right', 'top', 'bottom', 'all'].includes(name)) {
    return () => editor.profile_align(name);
  }

  return () => $p.msg.show_not_implemented();

  // switch (name) {
  // case 'arc':
  //   return () => editor.profile_radius();
  //
  //
  // }
};

function ProfileToolbar({editor, elm, tree_select, classes}) {
  const {msg} = $p;
  return <Toolbar disableGutters variant="dense">
    <Tip title={msg.align_node_left}>
      <IconButton onClick={btnClick(editor, 'left')}><VerticalAlignTopIcon style={{transform: 'rotate(0.75turn)'}} /></IconButton>
    </Tip>
    <Tip title={msg.align_node_bottom}>
      <IconButton onClick={btnClick(editor, 'bottom')}><VerticalAlignTopIcon style={{transform: 'rotate(0.5turn)'}} /></IconButton>
    </Tip>
    <Tip title={msg.align_node_top}>
      <IconButton onClick={btnClick(editor, 'top')}><VerticalAlignTopIcon /></IconButton>
    </Tip>
    <Tip title={msg.align_node_right}>
      <IconButton onClick={btnClick(editor, 'right')}><VerticalAlignTopIcon style={{transform: 'rotate(0.25turn)'}} /></IconButton>
    </Tip>
    <Tip title={msg.align_all}>
      <IconButton onClick={btnClick(editor, 'all')}><ZoomOutMapIcon /></IconButton>
    </Tip>
    <div className={classes.title}/>
    <GoLayer elm={elm} tree_select={tree_select}/>
    <Tip title={msg.elm_spec}>
      <IconButton onClick={btnClick(editor, 'spec')}>
        <i className="fa fa-table" />
      </IconButton>
    </Tip>
  </Toolbar>;
}

export default useStyles(ProfileToolbar);
