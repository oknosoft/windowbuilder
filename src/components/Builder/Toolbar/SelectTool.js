/**
 * Выбор инструмента в панели инструментов
 *
 * @module SelectTool
 *
 * Created by Evgeniy Malyarov on 13.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'wb-forms/dist/Common/Tip';

const useIndicator = makeStyles(({palette}) => ({
  indicator: {
    width: 48,
    bottom: 4,
    height: 2,
    position: 'absolute',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    backgroundColor: palette.text.secondary,// palette.grey[400],
  }
}));

export const IBtn = ({children, css}) => {
  return css ?
    <ListItemIcon><i className={css}/></ListItemIcon> :
    <ListItemIcon>{children}</ListItemIcon>;
};

IBtn.propTypes = {
  css: PropTypes.string,
  children: PropTypes.node,
};

export const select_tool = (editor, id, set_select_node) => {
  switch (id) {
  case 'm1':
    editor.project.magnetism.m1();
    break;

  default:
    editor.tools.some((tool) => {
      if(tool.options.name == id){
        tool.activate();
        return true;
      }
    });
  }
  set_select_node(id === 'select_node');
};

const actions = [
  //{css: 'tb_icon-arrow-white', name: 'Элемент и узел', id: 'select_node'},
  {css: 'tb_icon-hand', name: 'Панорама', id: 'pan'},
  {css: 'tb_cursor-pen-freehand', name: 'Добавить профиль', id: 'pen'},
  {css: 'tb_stulp_flap', name: 'Добавить штульп-створки', id: 'stulp_flap'},
  {css: 'tb_cursor-lay-impost', name: 'Раскладка, импосты', id: 'lay_impost'},
  {css: 'tb_cursor-arc-r', name: 'Арка', id: 'arc'},
  {css: 'tb_cursor-cut', name: 'Тип соединения', id: 'cut'},
  {css: 'tb_ruler_ui', name: 'Позиция и сдвиг'},
  {css: 'tb_grid', name: 'Координаты'},
  {css: 'tb_text', name: 'Текст', id: 'text'},
];

export default function SelectTool({editor}) {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const cid = editor.tool && editor.tool.options.name;
  const [is_select_node, set_select_node] = React.useState(cid === 'select_node');

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  let ibtn = <i className="fa fa-cogs fa-fw"/>;
  let title = 'Выбор инструмента';
  cid && actions.some(({id, css, children, name}) => {
    if(id === cid) {
      ibtn = children || <i className={css}/>;
      title += ` (${name})`;
      return true;
    }
  });

  const classes = useIndicator();

  return (
    <div>
      <IconButton
        title="Элемент и узел"
        onClick={() => select_tool(editor, 'select_node', set_select_node)}
      >
        <i className="tb_icon-arrow-white"/>
        {is_select_node && <span className={classes.indicator}/>}
      </IconButton>

      <Tip title={title}>
        <IconButton
          aria-label="more"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {ibtn}
          {!is_select_node && <span className={classes.indicator}/>}
        </IconButton>
      </Tip>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={`act-${index}`}
            selected={action.id === cid}
            onClick={() => {
              select_tool(editor, action.id, set_select_node);
              handleClose();
            }}>
            {<IBtn css={action.css}>{action.children}</IBtn>}
            {action.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );

}

SelectTool.propTypes = {
  editor: PropTypes.object.isRequired,
};

