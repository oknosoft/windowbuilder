import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBoxOutlined';
import CopyIcon from '@material-ui/icons/PostAdd';
import ArrowDown from '@material-ui/icons/ArrowDownward';
import ArrowUp from '@material-ui/icons/ArrowUpward';
import FlipCameraAndroid from '@material-ui/icons/FlipCameraAndroid';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import HtmlTooltip from 'metadata-react/App/Tip';
import {handlers} from './handlers';

export default function TabularToolbar({tabular, selection, rows, getRow, setRows, setSelectedRows, gridRef}) {

  const row = getRow();

  const {add, delRow, clear} = handlers({tabular, selection, rows, setRows, setSelectedRows, gridRef});

  const clone = (ev) => {
    add(ev, row);
  };

  const del = () => delRow(row);

  const handleUp = () => {

  };

  const handleDown = () => {

  };

  const handleReverse = () => {

  };

  return <Toolbar disableGutters>
    <HtmlTooltip title="Добавить строку {Insert}">
      <IconButton onClick={add}><AddIcon/></IconButton>
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
      <IconButton disabled onClick={handleUp}><ArrowUp/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Переместить вниз">
      <IconButton disabled onClick={handleDown}><ArrowDown/></IconButton>
    </HtmlTooltip>

    <HtmlTooltip title="Перевернуть состав">
      <IconButton disabled onClick={handleReverse}><FlipCameraAndroid/></IconButton>
    </HtmlTooltip>


  </Toolbar>;
}
