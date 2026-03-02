import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/PlaylistAddCheck';
import Toolbar from '@material-ui/core/Toolbar';
import HtmlTooltip from 'metadata-react/App/Tip';

export function SelectToolbar({row, handleSelect, gridRef}) {

  return <Toolbar disableGutters>
    <HtmlTooltip title="Выбрать">
      <IconButton disabled={!row} onClick={handleSelect}><AddIcon/></IconButton>
    </HtmlTooltip>
  </Toolbar>;
}
