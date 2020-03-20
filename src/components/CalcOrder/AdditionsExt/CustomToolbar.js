import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import RemoveIcon from '@material-ui/icons/Delete';

export default function CustomToolbar({handleAdd, handleRemove, count}) {
  return <Toolbar disableGutters>
    <IconButton title="Добавить строку" onClick={handleAdd}><AddIcon/></IconButton>
    <IconButton title="Удалить строку" disabled={!count} onClick={handleRemove}><RemoveIcon/></IconButton>
  </Toolbar>;
}

CustomToolbar.propTypes = {
  handleAdd: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
};
