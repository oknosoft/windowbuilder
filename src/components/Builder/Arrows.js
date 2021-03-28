/**
 * ### Клавиши  ←→↑↓ в рисовалке
 * Чтобы на мобильном устройстве элементы двигать
 *
 * @module Arrows
 *
 * Created by Evgeniy Malyarov on 26.01.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Fab from '@material-ui/core/Fab';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { makeStyles } from '@material-ui/core/styles';
import cn from 'classnames';

const useStyles = makeStyles(theme => ({
  btn: {
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  left: {
    bottom: theme.spacing(),
    left: theme.spacing(),
  },
  right: {
    bottom: theme.spacing(),
    right: theme.spacing(6),
  },
  up: {
    top: theme.spacing(),
    right: theme.spacing(2),
  },
  down: {
    bottom: theme.spacing(6),
    right: theme.spacing(2),
  },
  // fabGreen: {
  //   color: theme.palette.common.white,
  //   backgroundColor: green[500],
  //   '&:hover': {
  //     backgroundColor: green[600],
  //   },
  // },
}));

const btns = [['left', ArrowBackIcon], ['right', ArrowForwardIcon], ['up', ArrowUpwardIcon], ['down', ArrowDownwardIcon]];
const interval = 800;
let timer = 0;
let shift = 0;
let last = 0;

export default function Arrows({handleClick}) {
  const classes = useStyles();

  const handleTick = (name, interval) => {
    if(interval > 50) {
      interval /= 2;
    }
    shift = 1;
    handleClick(name)();
    if(interval && timer) {
      timer = setTimeout(handleTick.bind(null, name, interval), interval);
    }
  };

  const mouseDown = (name) => () => {
    const delta = Date.now() - last;
    if(delta < 200) {
      return;
    }
    last = Date.now();
    shift = 0;
    timer && clearTimeout(timer);
    timer = setTimeout(handleTick.bind(null, name, interval), interval);
  };

  const mouseUp = (name) => (evt) => {
    evt.target.blur();
    if(!timer) {
      return;
    }
    clearTimeout(timer);
    timer = 0;
    if(!shift) {
      handleTick(name, 0);
    }
  };

  return btns.map(([name, Icon]) => <Fab
    key={name}
    size="small"
    title="Сдвиг выделенного элемента"
    tabIndex={-1}
    className={cn(classes.btn, classes[name])}
    onMouseDown={mouseDown(name)}
    onTouchStart={mouseDown(name)}
    onMouseUp={mouseUp(name)}
    onTouchCancel={mouseUp(name)}
    onTouchEnd={mouseUp(name)}
  ><Icon/></Fab>);
}

Arrows.propTypes = {
  handleClick: PropTypes.func.isRequired,
};
