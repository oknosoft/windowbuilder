
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import DataField from 'metadata-react/DataField';

const useStyles = makeStyles((theme) => ({
  group: {
    alignItems: 'flex-end',
    paddingBottom: theme.spacing(),
  },
  synonim: {
    paddingBottom: theme.spacing(),
    width: 180,
  },
  switch: {
    width: 170,
  }
}));

function PropFld({classes, checked, handleChange, dp, fld, title}) {
  return <FormGroup row className={classes.group}>
    <Typography className={classes.synonim}>{title}</Typography>
    <FormControlLabel
      className={classes.switch}
      control={<Switch checked={checked} onChange={handleChange} name={fld} />}
      label={checked ? 'Установить' : 'Не изменять'}
    />
    <DataField _obj={dp} _fld={fld} read_only={!checked} />
  </FormGroup>;
}

export default function MainProps({dp}) {

  const classes = useStyles();

  const [state, setState] = React.useState({
    sys: dp.use_sys,
    furn: dp.use_furn,
    inset: dp.use_inset,
    clr: dp.use_clr,
  });

  const handleChange = ({target}) => {
    setState({...state, [target.name]: target.checked});
    dp[`use_${target.name}`] = target.checked;
  };

  return <FormGroup>
    <PropFld classes={classes} checked={state.sys} handleChange={handleChange} dp={dp} fld="sys" title="Система профилей:"/>
    <PropFld classes={classes} checked={state.clr} handleChange={handleChange} dp={dp} fld="clr" title="Цвет:"/>
    <PropFld classes={classes} checked={state.furn} handleChange={handleChange} dp={dp} fld="furn" title="Фурнитура:"/>
    <PropFld classes={classes} checked={state.inset} handleChange={handleChange} dp={dp} fld="inset" title="Заполнения:"/>
  </FormGroup>;
}
