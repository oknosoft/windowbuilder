
import React from 'react';

export const fake = {
  mode: $p.wsql.get_user_param('glass_spread', 'number') || 0,
  list: [
    {toString(){return 'Текущее изделие'}, valueOf(){return 0}},
    {toString(){return 'Текущий заказ'}, valueOf(){return 1}},
  ],
  meta: {
    synonym: 'Режим',
  },
  get value() {
    const {list, mode} = this;
    return list.find((v) => v.valueOf() === mode);
  },
  set value(v) {
    this.mode = parseInt(v);
    $p.wsql.set_user_param('glass_spread', this.mode);
  }
};

const {job_prm: {builder: {glass_chains}}, cat: {property_values_hierarchy}, cch: {properties}, utils: {blank}} = $p;

class BaseItem {

  constructor(key, name) {
    this.key = name ? key : `${key._owner._owner.ref}:${key.elm}`;
    this.name = name || `${key.elm.pad(2)}: ${key.formula} ${key.width.round()}x${key.height.round()}`;
    if(name) {
      this.children = [];
      this.toggled = true;
    }
    else {
      this.glRow = key;
      if(name === null) {
        this.name = <b>{this.name}</b>;
      }
    }
    let checked = false;
    Object.defineProperty(this, 'checked', {
      get() {
        return checked;
      },
      set(v) {
        if(name) {
          for(const child of this.children) {
            child.checked = v;
          }
        }
        if(name !== null) {
          checked = v;
        }
      }
    });
  }

  apply(elm, set) {
    const {ox, elm: eid} = elm;
    const cx = this.glRow._owner._owner;
    const cid = this.glRow.elm;
    if(ox === cx && eid === cid) {
      return;
    }
    cx.glass_specification.clear({elm: cid});
    ox.glass_specification.find_rows({elm: eid}, ({_obj}) => {
      cx.glass_specification.add({
        elm: cid,
        inset: _obj.inset,
        clr: _obj.clr,
        dop: $p.utils._clone(_obj.dop),
      });
    });
    set.add(cx.leading_product.empty() ? cx : cx.leading_product);
  }
}


function byProd(children, cx, ox, eid) {
  const {glass_specification: gs} = cx;
  for(const glRow of cx.glasses) {
    if(gs.find({elm: glRow.elm})) {
      children.push(new BaseItem(glRow, (cx === ox && glRow.elm === eid) ? null : ''));
    }
  }
}

function byOrder(children, ox, eid) {
  for(const {ordn, characteristic} of ox.calc_order.production) {
    if(ordn.empty() && characteristic.glasses.count()) {
      const prod = new BaseItem(characteristic.ref, characteristic.name);
      children.push(prod);
      byProd(prod.children, characteristic, ox, eid);
    }
  }
}

async function apply(handleClose) {
  const {elm, children} = this;
  const set = new Set();
  for(const chld of this.children) {
    if(chld.children) {
      for(const sub of chld.children) {
        if(sub.checked) {
          sub.apply(elm, set);
        }
      }
    }
    else if(chld.checked) {
      chld.apply(elm, set);
    }
  }
  const {ox, project} = elm;
  let query;
  for(const cx of set) {
    if(cx === ox) {
      project.register_change(true);
    }
    else {
      await cx.recalc({save: false, svg: true});
      query = true;
    }
  }
  if(query) {
    $p.ui.dialogs.confirm({
      title: 'Формулы заполнений',
      text: 'Записать изменённый заказ?',
      timeout: 10000,
    })
      .then(() => project.save_coordinates({save: true}))
      .catch(e => null)
      .then(handleClose);
  }
  else {
    handleClose();
  }
}


function deselect() {
  for(const chld of this.children) {
    chld.checked = false;
  }
}

function select() {
  for(const chld of this.children) {
    chld.checked = true;
  }
}

export function getStruct(elm) {
  const tree = {
    key: 'root',
    name: 'Заполнения',
    toggled: true,
    children: [],
    select,
    deselect,
    apply,
  };
  if(elm) {
    const {ox, elm: eid} = elm;
    if(ox.glass_specification.find({elm: eid})) {
      tree.elm = elm;
      if(fake.mode) {
        byOrder(tree.children, ox, eid);
      }
      else {
        byProd(tree.children, ox, ox, eid);
      }
    }
  }
  return tree;
}

export function treebeardHandlers() {
  const [index, setIndex] = React.useState(0);
  return React.useMemo(() => {
    const forceUpdate = () => setIndex((index) => index + 1);
    const onToggle = (node, toggled) => {
      if (node.children) {
        node.toggled = toggled;
        forceUpdate();
      }
    };
    return [forceUpdate, onToggle];
  }, []);
}


