import React from 'react';
import PropTypes from 'prop-types';
import GlassToolbar from './GlassToolbar';
import InsetToolbar from './InsetToolbar';
import LayerToolbar from './LayerToolbar';
import PairToolbar from './PairToolbar';
import ProfileToolbar from './ProfileToolbar';
import RootToolbar from './RootToolbar';
import OrderToolbar from './OrderToolbar';

export default function Toolbar(props) {
  const {editor: {project}, type, elm, layer} = props;
  switch (type) {
  case 'elm':
    const {Filling} = $p.EditorInvisible;
    const CToolbar = elm instanceof Filling ? GlassToolbar : ProfileToolbar;
    return <CToolbar {...props}/>;
  case 'pair':
    return <PairToolbar {...props}/>;
  case 'grp':
    return <PairToolbar {...props}/>;
  case 'layer':
    return <LayerToolbar {...props}/>;
  case 'order':
    return <OrderToolbar {...props}/>;
  default:
    return <RootToolbar {...props}/>;
  }
}

Toolbar.propTypes = {
  editor: PropTypes.object,
  current: PropTypes.object,
};
