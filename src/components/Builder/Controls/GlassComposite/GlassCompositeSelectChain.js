// дерево выбора цепочки

import React from 'react';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import {decorators, Treebeard} from 'wb-forms/dist/Treebeard';

const {job_prm: {builder: {glass_chains}}, cat: {property_values_hierarchy}, cch: {properties}, utils: {blank}} = $p;

class BaseItem {

  constructor(parent) {
    this.key = parent.valueOf();
    this.name = parent.toString();
    this.children = [];
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

  find_active() {
    const {children, active} = this;
    if(active) {
      return this;
    }
    if(children) {
      for(const chld of children) {
        const active = chld.find_active();
        if(active) {
          return active;
        }
      }
    }
  }
}

function add_recursive(children, parent) {
  const owner = properties.predefined('glass_chains');
  property_values_hierarchy.find_rows({owner, parent}, (parent) => {
    const curr = new BaseItem(parent);
    children.push(curr);
    add_recursive(curr.children, parent);
    if(!curr.children.length) {
      delete curr.children;
    }
    else if(parent.parent.empty()) {
      curr.toggled = true;
    }
  });
}

function get_tree(chains) {
  const tree = {
    key: 'root',
    name: 'Цепочки',
    toggled: true,
    children: [],
    deselect() {
      for(const chld of this.children) {
        chld.deselect();
      }
    },
    find_active() {
      for(const chld of this.children) {
        const active = chld.find_active();
        if(active) {
          return $p.job_prm.builder.glass_chains.find((elm) => {
            return elm.name == active.key;
          });
        }
      }
    }
  };
  add_recursive(tree.children, blank.guid);
  return tree;
}

export default class GlassCompositeSelectChain extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.tree = get_tree(props.glass_chains);
  }

  fill = () => {
    const {props, tree} = this;
    const active = tree.find_active();
    if(active) {
      props.handleOk();
    }
  };

  render() {
    const {fill, tree} = this;
    return <>
      <Toolbar disableGutters>
        <Button key="ok" onClick={fill} color="primary">Выбрать</Button>
      </Toolbar>
      <div onDoubleClick={fill}>
        <Treebeard
          data={tree}
          decorators={decorators}
          separateToggleEvent={true}
          onToggle={(node, toggled) => {
            if (node.children) {
              node.toggled = toggled;
              this.forceUpdate();
            }
          }}
          onClickHeader={(node) => {
            tree.deselect();
            node.active = true;
            this.forceUpdate();
          }}
        />
      </div>
    </>;
  }
}
