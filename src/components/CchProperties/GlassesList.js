/**
 * Редактор свойства _Список заполнений_
 *
 * @module GlassesList
 *
 * Created 29.11.2021.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Dialog from 'metadata-react/App/Dialog';
import useStyles from 'wb-forms/dist/Common/stylesAccordion';
import Editor from './Editor';

export default function GlassesList({_meta, _obj, _fld, ...other}) {

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(_obj[_fld]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const {synonym} = _meta;
  const setSelect = (elm) => {
    const index = value.indexOf(elm);
    if(index < 0) {
      value.push(elm);
    }
    else {
      value.splice(index, 1);
    }
    _obj[_fld] = value;
    setValue([...value]);
  };

  return <>
    <FormControl classes={{root: classes.control}} fullWidth onClick={handleOpen} >
      <InputLabel classes={{shrink: classes.lshrink, formControl: classes.lformControl}}>
        {synonym}
      </InputLabel>
      <Input
        classes={{root: classes.iroot, input: classes.input}}
        readOnly
        value={value.join(', ')}
        endAdornment={<InputAdornment position="end" classes={{root: classes.input}}>
          <ArrowDropDownIcon />
        </InputAdornment>}
      />
    </FormControl>
    <Dialog
      open={open}
      large
      noSpace
      disableFullScreen
      title={synonym}
      onClose={handleClose}
    >
      <Editor ox={_obj.ox} value={value} setSelect={setSelect} />
    </Dialog>
  </>;
}
