import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Tip from 'metadata-react/App/Tip';
import SmallButton from '../../Toolbar/IconButton';


export default function SpreadToolbar({elm}) {
  const {inset, reflect_grp} = elm;

  return <Toolbar disableGutters>
    <Tip title="Выбрать все">
      <SmallButton onClick={() => null}>
        <CheckBoxIcon/>
      </SmallButton>
    </Tip>
    <Tip title="Снять все">
      <SmallButton onClick={() => null}>
        <CheckBoxOutlineBlankIcon/>
      </SmallButton>
    </Tip>
  </Toolbar>;
}
