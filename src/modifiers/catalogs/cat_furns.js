
/**
 * Методы менеджера фурнитуры
 */
Object.defineProperties($p.cat.furns, {

  sql_selection_list_flds: {
    value(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
    }
  },

  get_option_list: {
    value(selection, val) {

      if(window.paper && paper.project) {
        const {characteristic, sys} = paper.project._dp;
        const {furn} = $p.job_prm.properties;

        if(furn && sys && !sys.empty()){

          const links = furn.params_links({
            grid: {selection: {cnstr: 0}},
            obj: {_owner: {_owner: characteristic}}
          });

          if(links.length){
            // собираем все доступные значения в одном массиве
            const list = [];
            links.forEach((link) => link.values.forEach((row) => list.push(this.get(row._obj.value))));

            function check(v){
              if($p.utils.is_equal(v.value, val))
                v.selected = true;
              return v;
            }

            const l = [];
            $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

            l.sort((a, b) => {
              if (a.text < b.text){
                return -1;
              }
              else if (a.text > b.text){
                return 1;
              }
              return 0;
            });
            return Promise.resolve(l);
          }
        }
      }

      return this.constructor.prototype.get_option_list.call(this, selection, val);
    },
    configurable: true
  }

});
