import React from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';

function TextField({classes, className, label, fullWidth, InputLabelProps, InputProps, inputProps, ...other}) {
  const ext = extClasses(classes);
  return <FormControl
    classes={ext.control}
    fullWidth={fullWidth}
    {...other}
  >
    <InputLabel classes={ext.label} {...InputLabelProps}>{label}</InputLabel>
    <Input
      {...InputProps}
      inputProps={inputProps}
      {...other}
      classes={
        Object.assign({
          input: classes.input
        }, ext.input)
      }
    />
  </FormControl>;
}

export default withStyles(TextField);
