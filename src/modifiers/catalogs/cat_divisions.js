/**
 *
 *
 * @module cat_divisions
 *
 * Created by Evgeniy Malyarov on 27.05.2017.
 */


Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value: function (val, selection) {
      const list = [];
      $p.current_user.acl_objs.find_rows({type: "cat.divisions"}, (row) => {
        if(list.indexOf(row.acl_obj) == -1){
          list.push(row.acl_obj);
          row.acl_obj._children.forEach((o) => {
            if(list.indexOf(o) == -1){
              list.push(o);
            }
          })
        }
      });
      if(!list.length){
        return $p.CatManager.prototype.get_option_list.call(this, val, selection);
      }

      function check(v){
        if($p.utils.is_equal(v.value, val))
          v.selected = true;
        return v;
      }

      const l = [];
      $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

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
    }
  }
});
