import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FindIcon from '@material-ui/icons/FindInPage';
import Tip from '../Builder/Tip';

const useStyles = makeStyles((theme) => ({
  root: {
    marginLeft: theme.spacing(1),
  },
}));



export default function BtnOrigin(props) {
  const classes = useStyles();
  return <Tip title="Показать элемент технологического справочника">
    <Button
      classes={classes}
      variant="contained"
      //color="primary"
      startIcon={<FindIcon />}
      onClick={props.handleOpen}
    >
      Происхождение
    </Button>
  </Tip>;
}

BtnOrigin.propTypes = {
  handleOpen: PropTypes.func.isRequired,
};
