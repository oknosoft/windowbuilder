import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import logo from '../../styles/imgs/logo.svg';

export const useStyles = makeStyles({
  root: {
    width: '50vw',
  },
  loading: {
    textAlign: 'center',
  },
  header: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'left',
    marginTop: 16,
  },
});

function Text({classes, meta_loaded, common_loaded, complete_loaded, user}) {
  let text;
  if(!meta_loaded) {
    text = 'Загрузка модулей...';
  }
  else if(!common_loaded) {
    text = 'Чтение общих данных...';
  }
  else if(!user.logged_in) {
    text = 'Проверка подлинности пользователя...';
  }
  else if(!complete_loaded) {
    text = 'Чтение справочников...';
  }
  return <Typography className={classes.text}>{text}</Typography>;
}
Text.propTypes = {
  classes: PropTypes.object.isRequired,
  meta_loaded: PropTypes.bool,
  common_loaded: PropTypes.bool,
  complete_loaded: PropTypes.bool,
  user: PropTypes.object,
};

function progress({meta_loaded, common_loaded, complete_loaded, page}) {
  let value = 5;
  if(meta_loaded) {
    value = 10;
  }
  if(common_loaded) {
    value = 10;
  }
  if(complete_loaded) {
    value = 100;
  }
  else if(page.docs_written) {
    value = 100 * page.docs_written / page.total_rows;
  }
  let valueBuffer = value + Math.random() * 13;
  if(valueBuffer > 100) {
    valueBuffer = 100;
  }
  return {value, valueBuffer};
}

function Loading(props) {
  const classes = useStyles();
  return (
    <div className={classes.loading}>
      <header className={classes.header}>
        <div className={classes.root}>
          <div className={classes.text} >
            <img src={logo} />
          </div>
          <LinearProgress variant="buffer" {...progress(props)}/>
          <Text classes={classes} {...props} />
        </div>
      </header>
    </div>
  );
}



export default Loading;
