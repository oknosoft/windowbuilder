
import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(({spacing}) => ({
  root: {
    marginLeft: spacing(),
    marginRight: spacing(),
  },
  top: {
    marginTop: spacing(),
  }
}));

const articles = ['Нет', 'Номер', 'Вставка', 'Номенклатура', 'Номер + Вставка', 'Номер + Номенклатура'];

const bprops = {
  auto_lines: {
    name: "Авторазмерные линии",
  },
  custom_lines: {
    name: "Доп. размерные линии",
  },
  visualization: {
    name: "Визуализация элементов",
  },
  // cnns: {
  //   name: "Соединители",
  //   disabled: true,
  // },
  txts: {
    name: "Комментарии",
    disabled: true,
  },
  carcass: {
    name: "Скелетон",
    disabled: true,
    handler(project, value) {
      project.set_carcass(value);
    },
  },
  mirror: {
    name: "Зеркальный вид",
    handler(project, value) {
      project.mirror(value, true);
    },
  },
  grid: {
    name: "Шаг сетки",
    Component: function Grid({project, builder_props, setProps}) {

      function setGrid({target}) {
        builder_props.grid = parseFloat(target.value);
        project.ox.builder_props = {grid: builder_props.grid};
        setProps(Object.assign({}, builder_props));
      }

      return <>
        <InputLabel>{bprops.grid.name}</InputLabel>
        <input type="number" min="50" max="200" step="50" value={builder_props.grid} onChange={setGrid} />
      </>;
    },
  },
  articles: {
    name: "Артикулы элементов",
    Component: function Articles({project, builder_props, setProps, classes}) {

      function setArticles({target}) {
        builder_props.articles = parseFloat(target.value);
        project.ox.builder_props = {articles: builder_props.articles};
        project.register_change();
        setProps(Object.assign({}, builder_props));
      }

      return <>
        <InputLabel className={classes.top}>{bprops.articles.name}</InputLabel>
        <Select
          value={builder_props.articles}
          onChange={setArticles}
        >
          {articles.map((text, value) => <MenuItem key={`a-${value}`} value={value}>{text}</MenuItem>)}
        </Select>
      </>;
    },
  },
};


export default function BProps({editor}) {
  const {project} = editor;
  const [builder_props, setProps] = React.useState(project.builder_props);
  const classes = useStyles();

  function setChecked(key) {
    builder_props[key] = !builder_props[key];
    project.ox.builder_props = {[key]: builder_props[key]};
    project.register_change();
    const {handler} = bprops[key];

    if(handler) {
      handler(project, builder_props[key]);
    }
    else {
      project.redraw();
    }
    setProps(Object.assign({}, builder_props));
  }

  const aprops = {project, builder_props, setProps, classes};

  return <FormGroup className={classes.root}>
    {Object.keys(bprops).map((key) => {
      const {Component, disabled, name} = bprops[key];
      return Component ?
        <Component key={key} {...aprops}/>
      :
        <FormControlLabel
          key={key}
          control={<Checkbox color="primary" checked={Boolean(builder_props[key])} onChange={() => setChecked(key)} />}
          label={name}
          disabled={disabled}
        />;
    })}
  </FormGroup>;


}

BProps.propTypes = {
  editor: PropTypes.object.isRequired,
};
