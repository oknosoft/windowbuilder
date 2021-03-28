
import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const bprops = {
  auto_lines: "Авторазмерные линии",
  custom_lines: "Доп. размерные линии",
  cnns: "Соединители",
  visualization: "Визуализация",
  txts: "Комментарии",
  grid: "Сетка",
  carcass: "Скелетон",
};

export default function BProps({editor}) {
  const {project} = editor;
  const [builder_props, setProps] = React.useState(project.builder_props);

  function setChecked(key) {
    builder_props[key] = !builder_props[key];
    project.ox.builder_props = {[key]: builder_props[key]};
    project.register_change();
    if(key === 'carcass') {
      project.set_carcass(builder_props[key]);
    }
    else {
      project.redraw();
    }
    setProps(Object.assign({}, builder_props));
  }

  function setGrid({target}) {
    builder_props.grid = parseFloat(target.value);
    project.ox.builder_props = {grid: builder_props.grid};
    //project.register_change();
    setProps(Object.assign({}, builder_props));
  }

  return <FormGroup>
    {Object.keys(bprops).map((key) => {
      return key === 'grid' ?
        <input key={key} type="number" min="50" max="500" step="50" value={builder_props[key]} onChange={setGrid} /> :
        <FormControlLabel
          key={key}
          control={<Checkbox checked={builder_props[key]} onChange={() => setChecked(key)} />}
          label={bprops[key]}
        />;
    })}
  </FormGroup>;


}

BProps.propTypes = {
  editor: PropTypes.object.isRequired,
};
