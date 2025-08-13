import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBoxOutlined';
import CopyIcon from '@material-ui/icons/PostAdd';
import ArrowDown from '@material-ui/icons/ArrowDownward';
import ArrowUp from '@material-ui/icons/ArrowUpward';
import FlipCameraAndroid from '@material-ui/icons/FlipCameraAndroid';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import HtmlTooltip from 'metadata-react/App/Tip';
import {handlers, select} from './handlers';

export default function TabularToolbar({tabular, selection, rows, getRow, setRows, setSelectedRows, gridRef}) {

  const row = getRow();
  const index = rows.indexOf(row);

  const {add, delRow, clear} = handlers({tabular, selection, rows, setRows, setSelectedRows, gridRef});

  React.useEffect(() => {
    if(row) {
      const {_manager} = row;
      const fkey = (ev) => {
        if(ev.key === 'F9') {
          add(ev, row);
        }
      };
      _manager.on({fkey});
      return () => _manager.off({fkey});
    }
  }, [row]);

  const clone = (ev) => {
    add(ev, row);
  };

  const del = () => delRow(row);

  const handleUp = () => {
    tabular.swap(row.row-1, rows[index-1].row-1);
    const newRows = $p.utils._find_rows(tabular, selection);
    setRows(newRows);
    select(gridRef,{idx: 0, rowIdx: newRows.indexOf(row)});
  };

  const handleDown = () => {
    tabular.swap(row.row-1, rows[index+1].row-1);
    const newRows = $p.utils._find_rows(tabular, selection);
    setRows(newRows);
    select(gridRef, {idx: 0, rowIdx: newRows.indexOf(row)});
  };

  const handleRebuild = () => {
    const {_owner} = tabular;
    _owner._manager.emit('rows', _owner, {sizes: null});
  };

  const disabled = selection.elm === 3;

  return <Toolbar disableGutters>
    <HtmlTooltip title="Добавить строку {Insert}">
      <IconButton disabled={disabled} onClick={add}><AddIcon/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Добавить строку копированием текущей {F9}">
      <IconButton disabled={!row} onClick={clone}><CopyIcon/></IconButton>
    </HtmlTooltip>

    <Divider orientation="vertical" flexItem sx={{m: 1}} />

    <HtmlTooltip title="Удалить строку {Delete}">
      <IconButton disabled={!row} onClick={del}><DeleteOutlineIcon/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Очистить (Удалить все строки)">
      <IconButton onClick={clear}><DeleteForeverIcon/></IconButton>
    </HtmlTooltip>

    <Divider orientation="vertical" flexItem sx={{m: 1}} />

    <HtmlTooltip title="Переместить вверх">
      <IconButton disabled={!row || index===0} onClick={handleUp}><ArrowUp/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Переместить вниз">
      <IconButton disabled={!row || index===(rows.length-1)} onClick={handleDown}><ArrowDown/></IconButton>
    </HtmlTooltip>

    <Divider orientation="vertical" flexItem sx={{m: 1}} />

    <HtmlTooltip title="Перестроить сетку витража">
      <IconButton onClick={handleRebuild}><DoneAllIcon/></IconButton>
    </HtmlTooltip>


  </Toolbar>;
}
