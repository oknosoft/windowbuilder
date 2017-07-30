/**
 * ### Дополнительные методы справочника _Права внешних пользователей_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module cat_users_acl
 */


$p.cat.users.__define({

  // при загрузке пользователей, морозим объект, чтобы его невозможно было изменить из интерфейса
	load_array: {
		value: function(aattr, forse){
			const res = [];
			for(let aobj of aattr){
			  if(!aobj.acl_objs){
          aobj.acl_objs = [];
        }
        const {acl} = aobj;
			  delete aobj.acl;
        const obj = new $p.CatUsers(aobj, this, true);
        const {_obj} = obj;
        if(_obj){
          _obj._acl = acl;
          obj._set_loaded();
          Object.freeze(obj);
          Object.freeze(_obj);
          for(let j in _obj){
            if(typeof _obj[j] == "object"){
              Object.freeze(_obj[j]);
              for(let k in _obj[j]){
                typeof _obj[j][k] == "object" && Object.freeze(_obj[j][k]);
              }
            }
          }
          res.push(obj);
        }
			}
			return res;
		},
    configurable: false
	}

});

$p.CatUsers = class CatUsers extends $p.CatUsers {

  /**
   * ### Роль доступна
   *
   * @param name {String}
   * @returns {Boolean}
   */
  role_available(name) {
    return this.acl_objs._obj.some((row) => row.type == name);
  }

  get_acl(class_name) {
    const acn = class_name.split(".");
    const {_acl} = this._obj;
    return _acl && _acl[acn[0]] && _acl[acn[0]][acn[1]] ? _acl[acn[0]][acn[1]] : "e";
  }

  /**
   * ### Идентификаторы доступных контрагентов
   * Для пользователей с ограниченным доступом
   *
   * @returns {Array}
   */
  partners_uids() {
    const res = [];
    this.acl_objs.each((row) => {
      if(row.acl_obj instanceof $p.CatPartners){
        res.push(row.acl_obj.ref)
      }
    });
    return res;
  }
};

