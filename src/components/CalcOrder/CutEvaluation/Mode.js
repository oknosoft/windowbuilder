import React from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

export default function SelectMode({mode, setMode}) {

  const handleChange = event => {
    setMode(event.target.value);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Материалы к оптимизации</FormLabel>
      <RadioGroup value={mode} onChange={handleChange}>
        <FormControlLabel value="all" control={<Radio />} label="Все профили" />
        <FormControlLabel value="clrs" control={<Radio />} label="Только цветные" />
      </RadioGroup>
    </FormControl>
  );
}
