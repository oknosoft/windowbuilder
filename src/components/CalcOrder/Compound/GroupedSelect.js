import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import baseStyles from 'metadata-react/DataField/styles';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import {renderOptions} from './columns';

function GroupedSelect({obj, rows, extClasses, classes, value}) {

  const onChange = ({target: {value}}) => {
    for(const row of rows) {
      row.use = value;
    }
  };

  return <FormControl
    className={extClasses && extClasses.control ? '' : classes.formControl}
    classes={extClasses && extClasses.control ? extClasses.control : null}
    fullWidth
    style={{width: '48%'}}
  >
    <InputLabel classes={extClasses && extClasses.label ? extClasses.label : null}>Установить для всех</InputLabel>
    <Select
      native
      value=""
      onChange={onChange}
      input={<Input classes={
        Object.assign({input: classes.input}, extClasses?.input)
      }/>}
      inputProps={{title: value?.toString()}}
    >
      <option disabled value="">Выбор из списка</option>
      {renderOptions(obj)}
    </Select>
  </FormControl>;
}

const StyledSelect = baseStyles(GroupedSelect);

function PropStyledSelect({classes, ...props}) {
  return <StyledSelect extClasses={extClasses(classes)} {...props}/>;
}

export default withStyles(PropStyledSelect);
