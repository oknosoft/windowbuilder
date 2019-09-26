/**
 * ### Дополнительные методы справочника _Отделы абонентов_
 *
 * Created 18.12.2017.
 */

exports.CatBranchesManager = class CatBranchesManager extends Object {

  constructor (owner, class_name) {
    super(owner, class_name);

    const {adapters: {pouch}, job_prm, enm, cat, dp} = $p;

    // после загрузки данных, надо настроить отборы в метаданных полей рисовалки
    pouch.once('pouch_complete_loaded', () => {
      const {current_user} = $p;
      if(job_prm.properties && current_user && !current_user.branch.empty() && job_prm.builder) {

        const {ПараметрВыбора} = enm.parameters_keys_applying;
        const {furn, sys, client_of_dealer_mode} = job_prm.properties;

        // накапливаем
        current_user.branch.load()
          .then(({keys, divisions}) => {
            const branch_filter = job_prm.builder.branch_filter = {furn: [], sys: []};
            const add = ({acl_obj}) => {
              if(acl_obj.applying == ПараметрВыбора) {
                acl_obj.params.forEach(({property, value}) => {
                  if(property === furn) {
                    !branch_filter.furn.includes(value) && branch_filter.furn.push(value);
                  }
                  else if(property === sys) {
                    !branch_filter.sys.includes(value) && branch_filter.sys.push(value);
                  }
                });
              }
            };
            keys.forEach(add);
            divisions.forEach(({acl_obj}) => {
              acl_obj.keys.forEach(add);
              acl_obj.extra_fields.find_rows({property: client_of_dealer_mode}, ({value}) => {
                job_prm.builder.client_of_dealer_mode = value;
              });
            });
            return branch_filter;
          })
          .then((branch_filter) => {

            // применяем
            if(branch_filter.furn.length) {
              const mf = cat.characteristics.metadata('constructions').fields.furn;
              mf.choice_params.push({
                name: 'ref',
                path: {inh: branch_filter.furn}
              });
            }
            if(branch_filter.sys.length) {
              const mf = dp.buyers_order.metadata().fields.sys;
              mf.choice_params = [{
                name: 'ref',
                path: {inh: branch_filter.sys}
              }];
            }

          });

      }
    });
  }

}
