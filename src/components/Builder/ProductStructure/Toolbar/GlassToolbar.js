import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'metadata/react/dist/App/Tip';
import {useStyles} from '../../Toolbar/styles';

function addFlap(editor, furn) {
  const fillings = editor.project.getItems({class: $p.EditorInvisible.Filling, selected: true});
  if(fillings.length){
    fillings[0].create_leaf(furn);
  }
  else{
    $p.ui.dialogs.alert({text: 'Перед добавлением створки, укажите заполнение, в которое поместить створку', title: 'Добавить створку'});
  }
}

function GlassToolbar({editor, elm, classes}) {
  const {msg} = $p;
  const fa80 = {style: {fontSize: '80%'}};
  return <Toolbar disableGutters variant="dense">
    <Tip title={msg.bld_new_stv}>
      <IconButton onClick={() => addFlap(editor)}>
        <i className="fa fa-file-code-o" {...fa80}/>
      </IconButton>
    </Tip>
    <Tip title={msg.bld_new_shtulp}>
      <IconButton onClick={() => {
        elm.layer.activate();
        editor.tools.find(({options}) => options.name === 'stulp_flap').activate();
      }}>
        <i className="tb_stulp_flap" />
      </IconButton>
    </Tip>
    <Tip title={msg.bld_new_virtual}>
      <IconButton onClick={() => addFlap(editor, 'virtual')}>
        <i className="fa fa-file-excel-o" {...fa80}/>
      </IconButton>
    </Tip>
    {/*
      <Tip title={msg.bld_new_nested}>
        <IconButton onClick={() => addFlap(editor, 'nested')}>
          <i className="fa fa-file-image-o" {...fa80}/>
        </IconButton>
      </Tip>
     */}

  </Toolbar>;
}

export default useStyles(GlassToolbar);
