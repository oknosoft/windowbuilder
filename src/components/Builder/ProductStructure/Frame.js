/**
 * Дерево слоёв, элементов и вставок
 * https://github.com/oknosoft/windowbuilder/issues/575
 *
 */


import React from 'react';
import PropTypes from 'prop-types';
import {Treebeard, decorators, filters} from 'wb-core/dist/forms/Treebeard';
import ContextMenu from './Toolbar/ContextMenu';
import get_struct from './get_struct';
import StructToolbar from './Toolbar';
import Search from './Search';
import './styles/designer.css';

const shiftKeys = ['Control', 'Shift'];

export default class FrameTree extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      struct: {},
      current: null,
      anchorEl: null,
      menuItem: null,
    };
    this.ctrlKeyDown = false;
    this.scheme_changed = $p.utils.debounce((scheme) => this.setState({struct: get_struct(scheme)}));
  }

  componentDidMount() {
    const {eve, project} = this.props.editor;
    eve.on({
      // layer_activated: this.layer_activated,
      // tool_activated: this.tool_activated,
      // furn_changed: this.furn_changed,
      // refresh_prm_links: this.refresh_prm_links,
      // contour_redrawed: this.contour_redrawed,
      scheme_changed: this.scheme_changed,
      loaded: this.scheme_changed,
      elm_removed: this.elm_removed,
      select_elm: this.select_elm,
      // set_inset: this.set_inset,
      coordinates_calculated: this.scheme_changed,
    });
    project._dp._manager.on('update', this.dp_listener);
    window.addEventListener('keydown', this.onKeyDown, {passive: true});
    window.addEventListener('keyup', this.onKeyUp, {passive: true});
  }

  componentWillUnmount() {
    const {eve, project} = this.props.editor;
    eve.off({
      // layer_activated: this.layer_activated,
      // tool_activated: this.tool_activated,
      // furn_changed: this.furn_changed,
      // refresh_prm_links: this.refresh_prm_links,
      // contour_redrawed: this.contour_redrawed,
      scheme_changed: this.scheme_changed,
      loaded: this.scheme_changed,
      elm_removed: this.elm_removed,
      select_elm: this.select_elm,
      // set_inset: this.set_inset,
      // coordinates_calculated: this.coordinates_calculated,
    });
    project._dp._manager.off('update', this.dp_listener);
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    const {elm, type, layer} = nextProps;
    const {current, struct} = nextState;

    if (type === 'pair' || type === 'grp') {
      struct.deselect();
      for(const sub of elm) {
        const node = struct.find_node(sub);
        if (node) {
          node.active = true;
        }
      }
    }
    else if (type === 'layer') {
      const node = struct.find_node(layer);
      if (node && !node.active) {
        struct.deselect();
        node.active = true;
        node.expand();
        if(current !== node) {
          this.setState({current: node});
          return false;
        }
      }
    }
    else if (type === 'elm') {
      if (!elm) {
        return false;
      }
      const node = struct.find_node(elm);
      if (!node) {
        struct.deselect();
        this.setState({current: null});
        return false;
      }
      if(elm.selected && !node.active) {
        struct.deselect();
        node.active = true;
        node.expand();
        if(current !== node) {
          this.setState({current: node});
          return false;
        }
      }
      else if (node.active && !elm.selected) {
        node.deselect();
        if(current !== node) {
          this.setState({current: node});
          return false;
        }
      }
    }

    return true;
  }

  elm_removed = (elm) => {
    const {props: {editor}, state: {struct, current}} = this;
    const node = struct.find_node?.(elm);
    if(node && current && elm === current._owner) {
      if(elm.layer) {
        const node = struct.find_node(elm.layer);
        node && this.onClickHeader(node);
      }
      else if(node._parent) {
        this.onClickHeader(node._parent);
      }
      else {
        node.deselect();
      }
    }
  };

  select_elm = (elm) => {
    const node = this.state.struct.find_node(elm);
    node && this.onClickHeader(node);
  };

  handleMenuOpen = (node, {currentTarget}) => {
    this.setState({menuItem: node, anchorEl: currentTarget});
  };

  handleMenuClose = () => {
    this.handleMenuOpen(null, {currentTarget: null});
  };

  onToggle = (node, toggled) => {
    if (node.children) {
      node.toggled = toggled;
    }
    this.forceUpdate();
  };

  onClickHeader = (node) => {
    const {props: {editor}, state: {struct}, ctrlKeyDown} = this;
    const deselect = () => {
      editor.cmd('deselect', [{elm: null, node: null}]);
      struct.deselect();
    };

    const {BuilderElement, Contour, ConnectiveLayer} = $p.Editor;
    const event = {node, layer: null, elm: null, inset: null};
    if(node.key === 'root') {
      event.type = node.key;
      deselect();
      node.active = true;
    }
    else if(node._owner instanceof BuilderElement) {
      event.type = 'elm';
      event.elm = node._owner;
      if(ctrlKeyDown) {
        if(node._owner.selected) {
          editor.cmd('deselect', [{elm: node._owner.elm, node: null, shift: ctrlKeyDown}]);
        }
        else {
          editor.cmd('select', [{elm: node._owner.elm, node: null, shift: ctrlKeyDown}]);
        }
        node.active = node._owner.selected;
      }
      else {
        deselect();
        editor.cmd('select', [{elm: node._owner.elm, node: null, shift: ctrlKeyDown}]);
      }
    }
    else if(node.key.startsWith('ins-')) {
      event.type = 'ins';
      event.layer = node._owner;
      deselect();
      node.active = true;
    }
    else if(node._owner instanceof Contour) {
      deselect();
      if(node.select) {
        node.select(event);
      }
      else {
        event.type = 'layer';
        event.layer = node._owner;
        editor.cmd('select', [{elm: -event.layer.cnstr}]);
        node.active = true;
      }
    }
    else if(node._owner instanceof ConnectiveLayer) {
      deselect();
      if(node.select) {
        node.select(event);
      }
      else {
        event.type = 'l_connective';
        event.layer = node._owner;
        node.active = true;
      }
    }
    else if(node.key === 'order') {
      event.type = node.key;
      event.layer = node._owner;
      deselect();
      node.active = true;
    }
    else if(node.key === 'settings') {
      event.type = node.key;
      event.layer = node._owner;
      deselect();
      node.active = true;
    }

    this.setState({current: node});
    this.props.onSelect(event);
  };

  applyFilter = (v) => {
    if (v !== undefined) {
      if (this._timout) clearTimeout(this._timout);
      this._filter = v;
      this._timout = setTimeout(this.applyFilter, 600);
    } else {
      const {_filter, props: {editor}} = this;
      const struct = get_struct(editor.project);
      if (!_filter) {
        return this.setState({struct});
      }
      Promise.resolve()
        .then(() => filters.filterTree(struct, _filter))
        .then((filtered) => filters.expandFilteredNodes(filtered, _filter))
        .then((filtered) => this.setState({struct: filtered}));
    }
  };

  onFilterMouseUp = ({target}) => {
    this.applyFilter(target.value.trim());
  };

  onKeyDown = ({key}) => {
    if(shiftKeys.includes(key)) {
      this.ctrlKeyDown = true;
    }
  };

  onKeyUp = ({key}) => {
    if(shiftKeys.includes(key)) {
      this.ctrlKeyDown = false;
    }
  };

  collaps = (l2) => {
    this.state.struct.collaps(l2);
    this.forceUpdate();
  };

  render() {
    const {state: {anchorEl, menuItem, struct, current}, props}  = this;

    return (
      <>
        <StructToolbar {...props}/>
        <Search collaps={this.collaps} onFilter={this.onFilterMouseUp}/>
        <div className="dsn-tree" ref={node => this.node = node}>
          <Treebeard
            data={struct}
            decorators={decorators}
            separateToggleEvent={true}
            onToggle={this.onToggle}
            onClickHeader={this.onClickHeader}
            onRightClickHeader={this.handleMenuOpen}
          />
        </div>
        <ContextMenu item={menuItem} anchorEl={anchorEl} handleClick={this.handleMenuClose} handleClose={this.handleMenuClose}/>
      </>
    );
  }
}
