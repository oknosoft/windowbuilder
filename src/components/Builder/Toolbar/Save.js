/**
 * Меню
 *
 * @module Save
 *
 * Created by Evgeniy Malyarov on 25.02.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tip from 'wb-forms/dist/Common/Tip';

const title = 'Отмена редактирования';
function revert({editor, closeMenu}) {
  closeMenu();
  const {project} = editor;
  if(!project.ox._modified) {
    return $p.ui.dialogs.alert({title, text: 'Изделие не изменено - нет смысла перечитывать его из базы данных'});
  }
  $p.ui.dialogs.confirm({
    title,
    html: 'Изменения будут потеряны, а изделие замещено последней сохраненной версией<br/><b>Продолжить?</b>'
  })
    .then(() => project.ox.load())
    .then((ox) => {
      return project.load(ox);
    })
    .catch(console.log);
}

export default function Save({editor, handleClose}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const openMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return <div>
    <Tip title="Запись изделия">
      <IconButton
        aria-label="more"
        aria-haspopup="true"
        onClick={openMenu}
      >
        <i className="fa fa-floppy-o"/>
      </IconButton>
    </Tip>
    <Menu
      anchorEl={anchorEl}
      keepMounted
      open={open}
      onClose={closeMenu}
    >
      <MenuItem onClick={() => {
        editor.project && editor.project.save_coordinates({save: true, _from_service: true})
          .then(closeMenu)
          .then(handleClose)
          .catch(console.log);
      }}>
        <ListItemIcon><i className="fa fa-floppy-o" /></ListItemIcon>
        Рассчитать, записать и закрыть редактор
      </MenuItem>
      <MenuItem onClick={() => {
        editor.project && editor.project.save_coordinates({save: true, _from_service: true})
          .catch(console.log);
      }}>
        <ListItemIcon><i className="fa fa-calculator" /></ListItemIcon>
        Рассчитать и записать изделие
      </MenuItem>
      <MenuItem onClick={() => revert({editor, closeMenu})}>
        <ListItemIcon><i className="fa fa-folder-open-o" /></ListItemIcon>
        Прочитать последнюю сохраненную версию
      </MenuItem>
    </Menu>
  </div>;
}

Save.propTypes = {
  editor: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
};
