import React from 'react';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import baseStyles from 'metadata-react/DataField/styles';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import {renderOptions} from './columns';

const {utils} = $p;

function GroupedSelect({obj, rows, extClasses, classes}) {

  let compoundRow = React.useMemo(() => rows[0].compoundRow(), [obj.calc_order, obj.folder]);
  const [value, setValue] = React.useState(compoundRow ? (compoundRow.value.all || '') : '');

  const onChange = ({target: {value}}) => {
    if(utils.is_empty_guid(value)) {
      if(compoundRow) {
        obj.composition.splice(obj.composition.indexOf(compoundRow), 1);
        compoundRow = null;
      }
      setValue(utils.blank.guid);
    }
    else {
      compoundRow = rows[0].compoundRow(true);
      compoundRow.value.all = utils.is_guid(value, true) ? value.valueOf() : false;
      Object.keys(compoundRow.value).forEach(key => {
        key !== 'all' && delete compoundRow.value[key];
      });
      setValue(compoundRow.value.all);
    }
    for(const row of rows) {
      row.onUpdate?.();
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
      value={value}
      onChange={onChange}
      input={<Input classes={
        Object.assign({input: classes.input}, extClasses?.input)
      }/>}
    >
      {value === '' ? <option disabled value="">Выберите из списка...</option> : null}
      {renderOptions(obj)}
    </Select>
  </FormControl>;
}

const StyledSelect = baseStyles(GroupedSelect);

function PropStyledSelect({classes, ...props}) {
  return <StyledSelect extClasses={extClasses(classes)} {...props}/>;
}

export default withStyles(PropStyledSelect);
