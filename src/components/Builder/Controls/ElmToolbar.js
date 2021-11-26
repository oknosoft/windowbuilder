import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'wb-forms/dist/Common/Tip';
import {useStyles} from '../Toolbar/styles';

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
  // case 'glass_spec':
  //   return () => editor.glass_inserts();
  //
  // }
};

function ElmToolbar({editor, elm, classes}) {
  const {msg} = $p;
  const {ProfileItem, Filling} = editor.constructor;
  const show_divider = elm instanceof ProfileItem || elm instanceof Filling;
  const disabled = elm ? '' : 'gl disabled';
  return <Toolbar disableGutters variant="dense">
    <Tip title={msg.align_node_left}>
      <IconButton onClick={btnClick(editor, 'left')} className={disabled}><i className="tb_align_left" /></IconButton>
    </Tip>
    <Tip title={msg.align_node_bottom}>
      <IconButton onClick={btnClick(editor, 'bottom')} className={disabled}><i className="tb_align_bottom" /></IconButton>
    </Tip>
    <Tip title={msg.align_node_top}>
      <IconButton onClick={btnClick(editor, 'top')} className={disabled}><i className="tb_align_top" /></IconButton>
    </Tip>
    <Tip title={msg.align_node_right}>
      <IconButton onClick={btnClick(editor, 'right')} className={disabled}><i className="tb_align_right" /></IconButton>
    </Tip>
    <Tip title={msg.align_all}>
      <IconButton onClick={btnClick(editor, 'all')}><i className="fa fa-arrows-alt" /></IconButton>
    </Tip>
    {show_divider && "|"}
    {elm instanceof ProfileItem && <Tip title={msg.bld_arc}>
      <IconButton onClick={btnClick(editor, 'arc')}><i className="tb_cursor-arc-r" /></IconButton>
    </Tip>}
    {elm instanceof Filling && <Tip title={msg.glass_spec}>
      <IconButton onClick={btnClick(editor, 'glass_spec')}><i className="fa fa-list-ul" /></IconButton>
    </Tip>}
    <div className={classes.title} />
    <Tip title={msg.elm_spec}>
      <IconButton onClick={btnClick(editor, 'spec')} className={disabled}><i className="fa fa-table" /></IconButton>
    </Tip>
    <Tip title={msg.del_elm}>
      <IconButton onClick={btnClick(editor, 'delete')} className={disabled}><i className="fa fa-trash-o" /></IconButton>
    </Tip>
  </Toolbar>;
}

ElmToolbar.propTypes = {
  editor: PropTypes.object,
  elm: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

export default  useStyles(ElmToolbar);
