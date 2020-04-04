import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(),
  },
  select: {
    display: 'contents',
  },
  img: {
    width: 120,
    margin: -theme.spacing(),
  }
}));

export default function SelectProduct({foroomApi, product, setProduct}) {

  const classes = useStyles();
  const [open, setOpen] = React.useState(!product);

  const handleChange = event => {
    setProduct(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const {init_data, foroom_pics_url} = foroomApi.params;

  return <FormControl className={classes.formControl} fullWidth>
    <InputLabel>Изделие</InputLabel>
    <Select
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      value={product}
      onChange={handleChange}
      classes={product ? {selectMenu: classes.select} : null}
    >
      {
        init_data.all_data.izd
          .filter((v) => v.enabled)
          .map((v, i) => <MenuItem key={`izd-${i}`} value={v} >
            <ListItemIcon>
              <img className={classes.img} src={`${foroom_pics_url}${v.icom || v.icon}`} />
            </ListItemIcon>
            <ListItemText primary={v.nameRu} secondary={`${v.name} ${v.ptype}`} />
          </MenuItem>)
      }
    </Select>
  </FormControl>;
}

SelectProduct.propTypes = {
  foroomApi: PropTypes.object,
  product: PropTypes.object,
  setProduct: PropTypes.func,
};

