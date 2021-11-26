/**
 * Компактный вариант элементов усправления рисовалкой
 */

import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';

import ProductProps from './ProductProps';
import LayerProps from './LayerProps';
import ElmProps from './ElmProps';
import GrpProps from './GrpProps';
import PairProps from './PairProps';

const styles = (theme) => ({
  root: {
    paddingLeft: theme.spacing() / 2,
  },
});

class ControlsFrame extends React.Component {

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
    project && project._dp._manager.off('update', this.dp_listener);
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

  dp_listener = (/* obj, fields */) => {

  };

  render() {
    const {editor: {project}, type, elm, layer, classes} = this.props;
    const {_dp, ox} = project || {};
    let panel;
    switch (type) {
    case 'elm':
      panel = <ElmProps elm={elm} ox={ox}/>;
      break;
    case 'pair':
      panel = <PairProps elm={elm}/>;
      break;
    case 'grp':
      panel = <GrpProps elm={elm}/>;
      break;
    case 'layer':
      panel = <LayerProps ox={ox} layer={layer}/>;
      break;
    default:
      panel = <ProductProps _dp={_dp} ox={ox} project={project}/>;
    }
    return <div className={classes.root}>
       {panel}
     </div>;
  }
}

ControlsFrame.propTypes = {
  editor: PropTypes.object.isRequired,
  type: PropTypes.string,
  elm: PropTypes.object,
  layer: PropTypes.object,
  classes: PropTypes.object,
};

export default withStyles(styles)(ControlsFrame);

