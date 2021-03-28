import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {Link} from 'react-router-dom';

import {useStyles} from './Loading';

function Dumb() {
  const classes = useStyles();
  return <header className={classes.header}>
    <div className={classes.root}>
      <h3>В url отсутствует ссылка на изделие или шаблон</h3>
      <p>Используйте для отладки:</p>
      <nav>
        <ul>
          <li>
            <Link to="/builder/451cbad0-56a7-11eb-9514-9ba96818525f">Изделие №1</Link>
          </li>
          <li>
            <Link to="/builder/40789300-616f-11eb-9222-1d45fd01bf54">Изделие №2</Link>
          </li>
          <li>
            <Link to="/templates">Выбор шаблона</Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>;
}

export default Dumb;
