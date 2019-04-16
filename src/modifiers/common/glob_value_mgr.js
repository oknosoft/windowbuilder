/**
 * Составной тип в поле trans документов оплаты и отгрузки
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module glob_value_mgr
 *
 * Created 10.10.2016
 */

(function ({classes: {DataManager, CatObj, RefDataManager, DataObj}, cat}) {
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

  DataObj.prototype.broken_links = function(){
    const res = [];
    const {fields, tabular_sections} = this._metadata();
    const {md} = $p;

    if(this.empty() || this.is_new()){
      return res;
    }

    const {_obj} = this;

    for (const fld in fields) {
      const {type} = fields[fld];
      if (type.is_ref && _obj.hasOwnProperty(fld) && _obj[fld] && !$p.utils.is_empty_guid(_obj[fld])) {
        let finded = false;
        type.types.forEach((m_type) => {
          const _mgr = md.mgr_by_class_name(m_type);
          finded = finded || !_mgr.get(_obj[fld], false, false).is_new();
        })
        if (!finded) {
          res.push({'obj': _obj, fld, 'ts': '', 'row': 0, 'value': _obj[fld], type});
        }
      }
    }

    for(const ts in tabular_sections) {
      const ts_fields = tabular_sections[ts].fields;
      if (_obj.hasOwnProperty(ts)) {
        _obj[ts].forEach((row) => {
          for(const fld in ts_fields) {
            const {type} = ts_fields[fld];
            if (type.is_ref && row.hasOwnProperty(fld) && row[fld] && !$p.utils.is_empty_guid(row[fld])) {
              let finded = false;
              type.types.forEach((m_type) => {
                const _mgr = md.mgr_by_class_name(m_type);
                finded = finded || !_mgr.get(row[fld], false, false).is_new();
              })
              if (!finded) {
                res.push({'obj': _obj, fld, ts, 'row': row.row, 'value': row[fld], type});
              }
            }
          }
        })
      }
    }

    return res;
  }

  RefDataManager.prototype.broken_links = function () {
    const res = [];
    if (this.metadata().cachable == 'ram'){
      for(const ref in this.by_ref) {
        this.by_ref[ref].broken_links().forEach((item)=>{
          res.push(item);
        });
      }
    }
    return res;
  }

  cat.repurge.store = new Set();

})($p);
