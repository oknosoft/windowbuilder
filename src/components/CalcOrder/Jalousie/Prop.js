import React from 'react';
import PropTypes from 'prop-types';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import withStyles, {extClasses} from 'metadata-react/DataField/stylesPropertyGrid';
import FieldNumber from 'metadata-react/DataField/FieldNumber';

function Prop({classes, prop, props, setProp}) {
  const ext = extClasses(classes);
  if(prop.typ.startsWith('radio')) {
    return <FormControl classes={ext.control} fullWidth disabled={prop.typ.includes('disabled')}>
      <InputLabel classes={ext.label}>{prop.name}</InputLabel>
      <Select
        native
        value={props[prop.alias]}
        onChange={setProp}
        input={<Input classes={ext.input}/>}
      >
        {prop.options.map((v, key) => <option key={key} value={v.val}>{v.name}</option>)}
      </Select>
    </FormControl>;
  }
  else {
    const _meta = {synonym: prop.name};
    return <FieldNumber _obj={props} _fld={prop.alias} _meta={_meta} handleValueChange={setProp} extClasses={ext} fullWidth/>;
  }
}

Prop.propTypes = {
  classes: PropTypes.object,
  prop: PropTypes.object,
  props: PropTypes.object,
  setProp: PropTypes.func,
};

export default withStyles(Prop);
