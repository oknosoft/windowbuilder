/**
 * Составной тип в поле trans документов оплаты и отгрузки
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module glob_value_mgr
 *
 * Created 10.10.2016
 */

(function ({classes: {DataManager, CatObj}, cat}) {
  const {value_mgr} = DataManager.prototype;
  DataManager.prototype.value_mgr = function(row, f, mf, array_enabled, v) {
		const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
		if(tmp){
      return tmp;
    }
		if(f == 'trans'){
      return $p.doc.calc_order;
    }
		else if(f == 'partner'){
      return $p.cat.partners;
    }
	}

  CatObj.prototype.repurge = function() {
    const {fields, tabular_sections} = this._metadata();
    if(this.empty() || this.is_new()){
      return;
    }
    const {_obj} = this;
    if(_obj.timestamp && _obj.timestamp.moment < '2019-03') {
      return;
    }
    for(const fld in fields) {
      const {type} = fields[fld];
      if(type.types.length === 1 && type.types[0] === 'number' && !_obj.hasOwnProperty(fld)) {
        this._manager._owner.repurge.store.add(this);
        _obj[fld] = 0;
      }
    }
    for(const ts in tabular_sections) {
      const {fields} = tabular_sections[ts];
      this[ts].forEach(({_obj}) => {
        for(const fld in fields) {
          const {type} = fields[fld];
          if(type.types.length === 1 && type.types[0] === 'number' && !_obj.hasOwnProperty(fld)) {
            this._manager._owner.repurge.store.add(this);
            _obj[fld] = 0;
          }
        }
      });
    }
  }

  cat.repurge = function () {
    for(const name in this) {
      if(name === 'users') {
        continue;
      }
      const mgr = this[name];
      if(mgr.cachable === 'ram') {
        for(const ref in mgr.by_ref) {
          mgr.by_ref[ref].repurge();
        }
      }
    }
    let queue = Promise.resolve();
    const {pouch} = this.$p.adapters;
    const attr = {db: pouch.remote.ram}
    cat.repurge.store.forEach((o) => {
      queue = queue.then(() => pouch.save_obj(o, attr));
    });

  }

  cat.repurge.store = new Set();

})($p);
