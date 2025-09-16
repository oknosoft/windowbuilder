/**
 * Сумма и процент агентских
 *
 */

import React from 'react';
import cn from 'classnames';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/InputBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import RefreshIcon from '@material-ui/icons/Refresh';
import withStyles from 'metadata-react/DataField/styles';

const handleMouseDownPassword = (event) => event.preventDefault();

function AgencyAmount(props) {
  let {_obj, _fld, _meta, read_only, classes, extClasses, className, fullWidth, InputProps, label_position, bar, isTabular,
    dyn_meta, handleValueChange, handleCalc, debounce, ...other} = props;

  const {amount, invoice: {contract}, rate} = _obj;
  const value = `${amount.toLocaleString()} (${rate.round(1)}%)`;

  const attr = {title: 'Сумма вознаграждения'};

  return <FormControl
    className={extClasses && extClasses.control ? '' : cn(classes.formControl, className)}
    classes={extClasses && extClasses.control ? extClasses.control : null}
    fullWidth
    {...attr}
  >
    <InputLabel classes={extClasses?.label}>{attr.title}</InputLabel>
    <Input
      value={value}
      classes={
        Object.assign({
          input: cn(classes.input, attr.required && !other.value && classes.required)
        }, extClasses && extClasses.input)
      }
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            title="Пересчитать"
            aria-label="Пересчитать"
            onClick={handleCalc}
            onMouseDown={handleMouseDownPassword}
          >
            <RefreshIcon />
          </IconButton>
        </InputAdornment>
      }
      inputProps={{...other}}
    />
  </FormControl>;
}

export default withStyles(AgencyAmount);
