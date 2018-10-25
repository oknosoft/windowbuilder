/**
 * Список клиентов
 *
 * @module List
 *
 * Created by Evgeniy Malyarov on 21.08.2018.
 */

import React from 'react';
import PropTypes from 'prop-types';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';

export default function ClientList ({rows, classes, onClick}) {
  return <MenuList>
    {
      rows.length ?
        rows.map((row, key) =>
          <MenuItem key={key} className={classes.left} onClick={() => onClick(row)}>
            <ListItemText
              primary={row.name}
              secondary={row.orders.join(', ')}
            />
          </MenuItem>)
        :
        <MenuItem>Записи не найдены</MenuItem>
    }
  </MenuList>;
}

ClientList.propTypes = {
  classes: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};
