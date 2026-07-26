
/**
 * @module cat_divisions
 *
 * Created by Evgeniy Malyarov on 27.05.2017.
 */


Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value(selection, val) {
      const list = new Set(), pre = new Set(), ex = new Set();
      const {acl_objs, branch} = $p.current_user;
      if(!branch.empty()) {
        for(const {acl_obj} of branch.divisions) {
          pre.add(acl_obj);
          acl_obj._children().forEach((o) => pre.add(o));
        }
      }
      acl_objs.find_rows({type: "cat.divisions"}, ({acl_obj, exclude}) => {
        if(acl_obj){
          if(exclude) {
            ex.add(acl_obj);
            acl_obj._children().forEach((o) => ex.add(o));
          }
          else {
            list.add(acl_obj);
            acl_obj._children().forEach((o) => list.add(o));
          }
        }
      });
      for(const o of pre) {
        if(!ex.has(o)) {
          list.add(o);
        }
      }
      if(!list.size){
        return this.constructor.prototype.get_option_list.call(this, selection, val);
      }

      function check(v){
        if($p.utils.is_equal(v.value, val))
          v.selected = true;
        return v;
      }

      const l = [];
      $p.utils._find_rows.call(this, Array.from(list), selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

      l.sort(function(a, b) {
        if (a.text < b.text){
          return -1;
        }
        else if (a.text > b.text){
          return 1;
        }
        return 0;
      })
      return Promise.resolve(l);
    },
    writable: true
  }
});
