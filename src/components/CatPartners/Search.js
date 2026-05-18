
function sort(a, b) {
  const va = this[a], vb = this[b];
  if(va.c > vb.c) {
    return -1;
  }
  else if(va.c < vb.c) {
    return 1;
  }
  else {
    if(va.t < vb.t) {
      return -1;
    }
    else if(va.t > vb.t) {
      return 1;
    }
    return 0;
  }
}

/**
 * @summary Сортирует структуру ссылок
 * @param refs
 */
function top(refs) {
  return Object.keys(refs).sort(sort.bind(refs));
}

export class CachedSearch {
  constructor({mgr, wsql, key, limit, predefined}) {
    this.mgr = mgr;
    this.wsql = wsql;
    this.key = key || mgr.class_name.replace('.', '_');
    this.limit = limit || 20;
    if(predefined) {
      const refs = wsql.get_user_param(this.key, 'object') || {};
      if(!Object.keys(refs).length) {
        for(const item of predefined) {
          refs[item.valueOf()] = {c: 1, t: Date.now()};
        }
        wsql.set_user_param(this.key, refs);
      }
    }
  }

  /**
   * @summary Читает до 100 последних использовавшихся элементов
   * @return {Promise<void>}
   */
  init() {
    const {mgr, wsql, key} = this;
    const refs = wsql.get_user_param(key, 'object') || {};
    return  mgr.adapter.load_array(mgr, Object.keys(refs));
  }

  /**
   * @summary Сортирует структуру ссылок
   */
  top() {
    const {mgr, wsql, key} = this;
    const refs = wsql.get_user_param(key, 'object') || {};
    return top(refs).map(ref => mgr.get(ref));
  }

  /**
   * @summary Регистрирует выбранный пользователем объект в localStorage
   * @param {uid|DataObj} v
   */
  async handleSelect(v) {
    const {mgr, wsql, key, limit} = this;
    const obj = mgr.get(v);
    if(obj.is_new()) {
      await obj.load();
    }
    const refs = wsql.get_user_param(key, 'object') || {};
    const count = refs[obj.ref]?.c || 0;
    if(!count && Object.keys(refs).length > limit) {
      const ordered = top(refs);
      const last = ordered[ordered.length - 1];
      delete refs[last];
    }
    refs[obj.ref] = {c: count + 1, t: Date.now()};
    wsql.set_user_param(key, refs);
    return obj;
  }

  /**
   * @summary Возвращает массив ссылок + представлений для выпадающего списка
   * @param selection
   * @return {Promise<void>}
   */
  async find(selection) {

  }
}

export function partnersSearch({cat: {partners}, dp, wsql, CatPartners}) {
  // case 'PartnersList':
  //   imodule = import('../../components/CatPartners/List');
  //   break;
  // case 'PartnerObj':
  //   imodule = import('../../components/CatPartners/Obj');
  //   break;
  // partners.form_selection = function (wnd, {_obj, _field, ...other}) {
  //   dp.buyers_order.open_component(wnd, {
  //     ref: _obj.ref,
  //     cmd: _field,
  //     _mgr: partners,
  //     ...other
  //   }, null, 'PartnersList');
  // };
  // CatPartners.prototype.form_obj = function (wnd, attr = {}) {
  //   const {_obj, _field, ...other} = attr;
  //   dp.buyers_order.open_component(wnd, {
  //     ref: _obj.ref,
  //     cmd: _field,
  //     _mgr: partners,
  //     ...other
  //   }, null, 'PartnerObj');
  // };
  partners.search = new CachedSearch({mgr: partners, wsql});
  return partners.search.init();
}
