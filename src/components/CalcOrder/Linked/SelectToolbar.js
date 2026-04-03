import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/PlaylistAddCheck';
import Toolbar from '@material-ui/core/Toolbar';
import HtmlTooltip from 'metadata-react/App/Tip';

import SearchBox from 'metadata-react/SchemeSettings/SearchBox';

export function SelectToolbar({row, handleSelect, scheme, handleFilterChange}) {

  return <Toolbar disableGutters>
    <HtmlTooltip title="Выбрать">
      <IconButton disabled={!row} onClick={handleSelect}><AddIcon/></IconButton>
    </HtmlTooltip>
    <span style={{flex: 1}}/>
    <SearchBox scheme={scheme} handleFilterChange={handleFilterChange} isWidthUp/>
  </Toolbar>;
}
