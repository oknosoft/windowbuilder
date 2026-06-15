
export function patch($p) {

  // после загрузки данных, уточняем поведение договоров
  $p.adapters.pouch.once('pouch_doc_ram_loaded', () => {
    const {doc: {calc_order}, cat: {contracts}, job_prm: {divisions}} = $p;
    if(divisions?.in_contracts) {

      // отбор по подразделению договора
      const {choice_links} = calc_order.metadata('contract');
      if(!choice_links.find(v => v.name.includes('department'))) {
        choice_links.push({
          name: ['selection', 'department'],
          path: [function (o, fld, selection) {
            const {department} = o;
            if(!department || department.empty()) {
              return true;
            }
            const doc = selection?._attr?.obj;
            return !doc || doc.department.empty() || doc.department == department;
          }],
        });
      }

      // форма создания договора
      contracts.force_add = function force_add(attr) {
        console.log(attr);
      };

      contracts.form_selection = function form_selection(pwnd, attr) {
        //pwnd?.on_select?.(attr.initial_value);
      }
    }
  });
}
