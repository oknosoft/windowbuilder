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
  img: {
    width: 92,
    height: 92,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    marginRight: theme.spacing(),
  },
  select: {
    display: 'contents',
  }
}));

export default function SelectMaterial({foroomApi, product, value, setProp}) {

  const classes = useStyles();

  const handleChange = event => {
    setProp(event.target.value);
  };

  const {foroom_pics_url} = foroomApi.params;

  return <FormControl className={classes.formControl} fullWidth>
    <InputLabel>Материал</InputLabel>
    <Select
      value={value}
      onChange={handleChange}
      classes={value ? {selectMenu: classes.select} : null}
    >
      {
        product.materials
          .filter((v) => v.ost > 0)
          .map((v, i) => <MenuItem key={`mt-${i}`} value={v.tid}>
            <ListItemIcon>
              <span className={classes.img} style={{backgroundImage: `url(${foroom_pics_url}${v.icos || v.icon})`}} />
            </ListItemIcon>
            <ListItemText primary={v.name} />
          </MenuItem>)
      }
    </Select>
  </FormControl>;
}

SelectMaterial.propTypes = {
  foroomApi: PropTypes.object,
  product: PropTypes.object,
  value: PropTypes.string,
  setProp: PropTypes.func,
};
