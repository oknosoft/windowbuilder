import React from 'react';
import PropTypes from 'prop-types';
import TreeView from '@material-ui/lab/TreeView';
import Divider from '@material-ui/core/Divider';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import CustomTreeItem from './CustomTreeItem';
import LayersToolbar from './LayersToolbar';
import DopInsets from './DopInsets';

function addLayers(contours, activeLayer) {
  return contours.length ?
    contours.map((contour) => {
      const key = `l-${contour.cnstr}`;
      return <CustomTreeItem
        key={key}
        nodeId={key}
        labelText={`${contour.layer ? 'Створка' : 'Рама'} №${contour.cnstr}`}
        contour={contour}
        selected={contour === activeLayer}
      >
        {addLayers(contour.contours, activeLayer)}
      </CustomTreeItem>;
    })
    :
    null;
}

export default function LayersTree({editor, classes}) {
  const {project} = editor;
  const {contours, ox, activeLayer} = project;
  const defaultExpanded = ['root'];

  const handleRoot = () => {
    editor.eve.emit('layer_activated', project.layers[0]);
  };

  contours.forEach((contour) => {
    defaultExpanded.push(`l-${contour.cnstr}`);
    contour.contours.forEach((contour) => {
      defaultExpanded.push(`l-${contour.cnstr}`);
    });
  });

  return [
    <LayersToolbar key="toolbar" editor={editor} classes={classes}/>,
    <TreeView
      key="tree"
      expanded={defaultExpanded}
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      defaultEndIcon={<div style={{ width: 24 }} />}
      //onNodeToggle={onNodeToggle}
    >
      <CustomTreeItem
        nodeId="root"
        labelText={ox.prod_name(true)}
        LabelIcon={AccountTreeIcon}
        handleRoot={handleRoot}
        selected={project.layers[0] === activeLayer}
      >
        {addLayers(contours, activeLayer)}
      </CustomTreeItem>

    </TreeView>,
    <Divider key="divider"/>,
    <DopInsets
      key="insets"
      editor={editor}
      ox={ox}
      cnstr={activeLayer.cnstr || 0}
      kind={activeLayer.cnstr ? (activeLayer.layer ? 'Створку' : 'Раму') : 'Изделие'}
    />
  ];
}

LayersTree.propTypes = {
  editor: PropTypes.object.isRequired,
};

