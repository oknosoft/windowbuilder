import React from 'react';
import PropTypes from 'prop-types';
import {decorators, Treebeard} from 'wb-forms/dist/Treebeard';
import '../../Builder/ProductStructure/styles/designer.css';
import './styles/designer.css';

function useForceUpdate(){
  const [value, setValue] = React.useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
}

class BaseItem {

  constructor(elm, parent) {
    this.elm = elm;
    this.parent = parent;
    this.children = [];
  }

  get icon() {
    if(this.key === 'root') {
      return 'icon_root';
    }
    else if(this.toggled) {
      return 'tree_folder_open';
    }
    return 'tree_folder';
  }

  get key() {
    const {elm} = this;
    return elm.empty() ? 'root' : elm.valueOf();
  }

  get name() {
    const {elm} = this;
    return elm.empty() ? elm._manager.metadata().synonym : elm.toString();
  }

  get parents() {
    return this._parents || this.parent.parents;
  }

  get elmnts() {
    return this._elmnts || this.parent.elmnts;
  }

  get list() {
    const {elmnts, parents, elm} = this;
    const list = [];
    for(const item of parents) {
      if(item.parent === elm) {
        list.push(item);
      }
    }
    for(const item of elmnts) {
      if(item.parent === elm && !list.includes(item)) {
        list.push(item);
      }
    }
    return list;
  }

  findActive() {
    const {children, active} = this;
    if(active) {
      return this;
    }
    if(children) {
      for(const chld of children) {
        const active = chld.findActive();
        if(active) {
          return active;
        }
      }
    }
  }

  findNode(elm) {
    if(this.elm === elm) {
      return this;
    }
    for(const node of this.children) {
      const res = node.findNode(elm);
      if(res) {
        return res;
      }
    }
  }

  expand() {
    if(this.parent) {
      this.parent.expand();
    }
    this.toggled = true;
  }

  collaps() {
    if(this.children.length) {
      this.toggled = false;
      for(const chld of this.children) {
        chld.collaps();
      }
    }
  }

  deselect() {
    this.active = false;
    const {children} = this;
    if(children) {
      for(const chld of children) {
        chld.deselect();
      }
    }
  }

  static addRecursive(children, parent, parents) {
    for(const elm of parents.filter(elm => elm.parent === parent.elm && !elm.empty())) {
      const curr = new BaseItem(elm, parent);
      children.push(curr);
      BaseItem.addRecursive(curr.children, curr, parents);
      if(!curr.children.length) {
        curr.toggled = true;
      }
    }
  }
}

export function buildTree({_mgr, _owner, selected}) {
  const {utils} = $p;
  const _meta = _owner._meta;
  const tree = new BaseItem(_mgr.get(), null);
  tree.toggled = true;

  // получаем доступные элементы
  const selection = _mgr.get_search_selector({
    _obj: _owner._obj,
    _meta: _meta,
    _fld: _owner.props._fld,
    source_mode: 'ram',
  });
  delete selection._skip;
  delete selection._top;
  const _selection = utils._selection.bind(_mgr);
  const elmnts = [];
  for (const o of _mgr) {
    // выполняем колбэк с элементом и пополняем итоговый массив
    if (_selection(o, selection)) {
      elmnts.push(o);
    }
  }
  const sort = utils.sort('name');
  elmnts.sort(sort);
  tree._elmnts = elmnts;

  // получаем родителей доступных элементов
  const flat = new Set();
  for(const elm of elmnts) {
    flat.add(elm.parent);
  }
  for(const elm of Array.from(flat)) {
    let {parent} = elm;
    while (parent) {
      if(parent.empty()) {
        break;
      }
      if(!flat.has(parent)) {
        flat.add(parent);
      }
      parent = parent.parent;
    }
  }
  const parents = Array.from(flat);
  parents.sort(sort);
  tree._parents = parents;

  // строим дерево
  BaseItem.addRecursive(tree.children, tree, parents);
  if(selected && !selected.empty()) {
    const node = tree.findNode(selected);
    node.expand();
    node.active = true;
  }
  return tree;
}

export default function Tree({tree, setParent}) {

  const forceUpdate = useForceUpdate();

  return <div className="dsn-tree">
    <Treebeard
      data={tree}
      decorators={decorators}
      separateToggleEvent={true}
      onToggle={(node, toggled) => {
        if (node.key !== 'root' && node.children.length) {
          node.toggled = toggled;
          forceUpdate();
        }
      }}
      onClickHeader={(node) => {
        tree.deselect();
        node.active = true;
        setParent(node.elm);
      }}
    />
  </div>;
}
