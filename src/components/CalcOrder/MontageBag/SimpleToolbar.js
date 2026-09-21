import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBoxOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import MUIToolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import HtmlTooltip from 'metadata-react/App/Tip';

export default function SimpleToolbar({row, add, del, btns=null, title}) {

  return <MUIToolbar disableGutters>
    <HtmlTooltip title="Добавить строку {Insert}">
      <IconButton onClick={add}><AddIcon/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Удалить строку {Delete}">
      <IconButton disabled={!row} onClick={del}><DeleteOutlineIcon/></IconButton>
    </HtmlTooltip>

    {btns}

    <span style={{flex: 1}}></span>
    {title}

  </MUIToolbar>;
}
