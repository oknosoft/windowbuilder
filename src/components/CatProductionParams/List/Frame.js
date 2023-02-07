import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import MDNRComponent from 'metadata-react/common/MDNRComponent';
import {Resize, ResizeHorizon} from 'metadata-react/Resize';
import Toolbar from './Toolbar';
import Tree, {buildTree} from './Tree';
import List from './List';

let grey;
const styles = ({spacing, palette}) => {
  grey = palette.grey;
  return {
    toolbar: {
      backgroundColor: grey[200],
      paddingLeft: spacing(),
    },
  };
};

class ProductionParamsList extends MDNRComponent {

  constructor(props, context) {
    super(props, context);
    const {_owner, _mgr} = props;
    const value = _owner?.state?.value || _owner?.props?._obj[_owner?.props?._fld];
    const scheme = $p.cat.scheme_settings.get_scheme(_mgr.class_name, true);
    const columns = scheme.rx_columns({mode: 'ts', fields: _mgr.metadata().fields, _mgr});
    this.state = {value, parent: value.parent, scheme, columns};
    this.tree = buildTree({
      _mgr,
      _owner,
      selected: this.state.parent,
    });
  }

  setParent = (parent) => {
    this.setState({parent});
  };

  handleSelect = () => {
    const {_current, props: {handlers}} = this;
    if(_current?.is_folder) {
      return this.listDoubleClick();
    }
    _current && handlers.handleSelect && handlers.handleSelect(_current);
  };

  listDoubleClick = () => {
    const {_current} = this;
    if(_current?.is_folder) {
      const {tree} = this;
      tree.deselect();
      const node = tree.findNode(_current);
      if(node) {
        node.expand();
        node.active = true;
      }
      this.setState({parent: _current});
    }
    else if(_current) {
      this.handleSelect();
    }
  };

  listSetCurrent = (elm) => {
    this._current = elm;
  }

  render() {
    const {props, tree, context: {dnr: {frameRect}}, state: {parent, value, columns}} = this;
    const width = frameRect?.width || window.innerWidth * .5;
    const height = frameRect?.height || window.innerHeight * .6;
    const list = (tree.findNode(parent) || tree).list;
    return <>
      <Toolbar {...props} handleSelect={this.handleSelect}/>
      <div style={{position: 'relative', height: height-48, width}}>
        <Resize handleWidth="6px" handleColor={grey[200]}>
          <ResizeHorizon width={`${(width /3).toFixed()}px`} minWidth="200px">
            <Tree tree={tree} setParent={this.setParent} />
          </ResizeHorizon>
          <ResizeHorizon width={`${(width * 2/3).toFixed()}px`} minWidth="400px">
            <List
              list={list}
              columns={columns}
              value={value}
              onDoubleClick={this.listDoubleClick}
              setCurrent={this.listSetCurrent}
            />
          </ResizeHorizon>
        </Resize>
      </div>
    </>;
  }
}

export default withStyles(styles)(ProductionParamsList)
