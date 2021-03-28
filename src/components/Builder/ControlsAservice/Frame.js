/**
 * Компактный вариант элементов усправления рисовалкой
 */

import React from 'react';
import DataField from 'metadata-react/DataField';

class Frame extends React.Component {

  componentDidMount() {
    const {eve, project} = this.props.editor;
    eve.on({
      layer_activated: this.layer_activated,
      tool_activated: this.tool_activated,
      furn_changed: this.furn_changed,
      refresh_prm_links: this.refresh_prm_links,
      contour_redrawed: this.contour_redrawed,
      scheme_changed: this.scheme_changed,
      loaded: this.scheme_changed,
      set_inset: this.set_inset,
      coordinates_calculated: this.coordinates_calculated,
    });
    project._dp._manager.on('update', this.dp_listener);
  }

  componentWillUnmount() {
    const {eve, project} = this.props.editor;
    eve.off({
      layer_activated: this.layer_activated,
      tool_activated: this.tool_activated,
      furn_changed: this.furn_changed,
      refresh_prm_links: this.refresh_prm_links,
      contour_redrawed: this.contour_redrawed,
      scheme_changed: this.scheme_changed,
      loaded: this.scheme_changed,
      set_inset: this.set_inset,
      coordinates_calculated: this.coordinates_calculated,
    });
    project._dp._manager.off('update', this.dp_listener);
  }

  // при активации слоя
  layer_activated = () => {

  };

  // при активации инструмента
  tool_activated = () => {

  };

  // при смене фурнитуры
  furn_changed = () => {

  };

  // при смене вставки элемента
  set_inset = () => {

  };

  // при пересчете связей параметров
  refresh_prm_links = () => {

  };

  // следим за изменениями размеров при перерисовке контуров
  contour_redrawed = () => {

  };

  // при пересчете координат
  coordinates_calculated = () => {

  };

  // при готовности снапшота, обновляем суммы и цены
  scheme_changed = () => {
    this.forceUpdate();
  };

  dp_listener = (obj, fields) => {

  };



  render() {
    const {editor} = this.props;
    return <DataField fullWidth _obj={editor.project._dp} _fld="sys"/>;
  }
}

export default Frame;


