/**
 * ### Дополнительные методы справочника _Отделы абонентов_
 *
 * Created by Evgeniy Malyarov on 18.12.2017.
 */

exports.CatBranchesManager = class CatBranchesManager extends Object {

  constructor (owner, class_name) {
    super(owner, class_name);

    // после загрузки данных, надо настроить отборы в метаданных полей рисовалки
    $p.adapters.pouch.once("pouch_complete_loaded", () => {
      if($p.job_prm.properties && $p.current_user && !$p.current_user.branch.empty() && $p.job_prm.builder) {

        const {ПараметрВыбора} = $p.enm.parameters_keys_applying;
        const {furn, sys} = $p.job_prm.properties;

        // накапливаем
        $p.current_user.branch.load()
          .then(({keys}) => {
            const branch_filter = $p.job_prm.builder.branch_filter = {furn: [], sys: []};
            keys.forEach(({acl_obj}) => {
              if(acl_obj.applying == ПараметрВыбора) {
                acl_obj.params.forEach(({property, value}) => {
                  if(property === furn) {
                    branch_filter.furn.push(value);
                  }
                  else if(property === sys) {
                    branch_filter.sys.push(value);
                  }
                });
              }
            });
            return branch_filter;
          })
          .then((branch_filter) => {

            // применяем
            if(branch_filter.furn.length) {
              const mf = $p.cat.characteristics.metadata('constructions').fields.furn;
              mf.choice_params.push({
                name: "ref",
                path: {inh: branch_filter.furn}
              });
            }
            if(branch_filter.sys.length) {
              const mf = $p.dp.buyers_order.metadata().fields.sys;
              mf.choice_params = [{
                name: "ref",
                path: {inh: branch_filter.sys}
              }];
            }

          });

      }
    });
  }

}
