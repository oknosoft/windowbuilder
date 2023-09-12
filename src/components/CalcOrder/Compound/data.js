
class BaseItem {
  constructor({name, key, icon, parent, owner}) {
    this.key = key || owner.valueOf();
    this.name = name || owner.toString();
    this.parent = parent;
    this.owner = owner;
    this.icon = icon;
    this.children = [];
    Object.defineProperty(this, 'checked', {
      get: this.getChecked.bind(this),
      set: this.setChecked.bind(this),
    });
  }

  getChecked() {
    return Boolean(this._checked);
  }

  setChecked(v) {
    this._checked = Boolean(v);
    for(const node of this.children) {
      node.checked = v;
    }
    const {keys} = this.findRoot();
    if(this._checked) {
      keys.add(this.key);
    }
    else {
      keys.delete(this.key);
    }
  }

  findRoot() {
    return this.key === 'root' ? this : this.parent.findRoot();
  }

  findNode(key) {
    let finded;
    if(this.key === key) {
      finded = this;
    }
    else {
      for(const node of this.children) {
        finded = node.findNode(key);
        if(finded) {
          break;
        }
      }
    }
    return finded;
  }

  expand() {
    if(this.parent) {
      this.parent.expand();
    }
    this.toggled = true;
  }

  collaps() {
    this.toggled = false;
    for(const chld of this.children) {
      chld.collaps();
    }
  }

  deselect() {
    this.active = false;
    for(const chld of this.children) {
      chld.deselect();
    }
  }
}

class Layer extends BaseItem {
  constructor({name, owner, parent, cnstr=0}) {
    super({
      parent,
      owner,
      name,
      key: cnstr ? `${owner.valueOf()}:${cnstr}` : owner.valueOf(),
    });
    this.toggled = true;


    owner.constructions.find_rows({parent: cnstr}, (row) => {
      this.children.push(new Layer({
        parent: this,
        owner: owner,
        cnstr: row.cnstr,
        name: row.parent ? `Створка №${row.cnstr}` : `Рама №${row.cnstr}`,
      }));
    });
  }
}


export function get_tree(calc_order, selected) {

  const tree = new BaseItem({
    key: 'root',
    name: `Расчёт №${calc_order.number_doc}`,
    owner: calc_order,
    icon: 'icon_order'
  });
  tree.toggled = true;

  for(const {characteristic} of calc_order.production) {
    if(characteristic.constructions.count()) {
      const curr = new Layer({
        parent: tree,
        owner: characteristic,
        name: characteristic.prod_name(true),
      });
      tree.children.push(curr);
    }
  }

  tree.keys = new Set();
  tree.keys.distinct = function () {
    const rm = ['root'];
    for(const key of this) {
      const parts = key.split(':');
      if(parts.length > 1 && this.has(parts[0])) {
        rm.push(key);
      }
    }
    for(const key of rm) {
      this.delete(key);
    }
    return this;
  };

  selected?.keys?.forEach((key) => {
    const node = tree.findNode(key);
    if(node) {
      tree.keys.add(key);
      node._checked = true;
    }
  });

  return tree;
}
