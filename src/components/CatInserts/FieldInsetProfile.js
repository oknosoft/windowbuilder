/**
 *
 *
 * @module FieldInsetProfile
 *
 * Created by Evgeniy Malyarov on 06.03.2022.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Autocomplete from '@material-ui/lab/Autocomplete';

import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';

const _fld = 'inset';

const onKeyDown = (evt) => {
  const {key} = evt;
  if(['ArrowUp', 'ArrowDown'].includes(key)) {
    $p.ui.prevent(evt);
  }
};

function FieldInsetProfile({elm, classes, project, elm_type, onClick, disabled, ...props}) {

  const ext = extClasses(classes);

  // получим список доступных
  const layer = elm?.layer || project?.activeLayer;
  if(!layer) {
    return null;
  }

  const {sys} = layer;
  const list = sys.inserts(elm_type || elm.elm_type, false, elm);

  const value = elm[_fld];
  let error = !list.includes(value);
  if(error) {
    list.push(value);
  }
  if(error && disabled) {
    error = false;
  }

  const synonym = `Вставка`;

  const onChange = (e, value) => {
    elm[_fld] = value;
  };

  return <Autocomplete
    blurOnSelect
    disableListWrap
    disableClearable
    disabled={disabled}
    options={list}
    value={value}
    getOptionLabel={(v) => v?.name || ''}
    renderInput={({inputProps, InputProps, InputLabelProps, id, ...other}) => (
      <FormControl classes={ext.control} error={error} onClick={onClick} fullWidth {...other}>
        <InputLabel classes={ext.label} {...InputLabelProps}>{synonym}</InputLabel>
        <Input classes={ext.input} inputProps={inputProps} {...InputProps} />
      </FormControl>
    )}
    renderOption={(option) => <Typography noWrap>{option.name}</Typography>}
    onChange={onChange}
    onKeyDown={onKeyDown}
  />;
}

export default withStyles(FieldInsetProfile);

FieldInsetProfile.propTypes = {
  elm: PropTypes.object.isRequired,
  elm_type: PropTypes.object,
  onClick: PropTypes.func,
  classes: PropTypes.object.isRequired,
};
