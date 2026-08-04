
export function patch($p) {

  // после загрузки данных, уточняем поведение договоров
  $p.adapters.pouch.once('pouch_doc_ram_loaded', () => {
    const {doc: {calc_order}, cat: {contracts}, job_prm: {divisions}, CatContracts, ui} = $p;
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
        const {field, grid, obj, on_select} = attr;
        const contract = obj[field];
        let query = Promise.resolve();
        if(!contract.empty() &&
          contract.owner === obj.partner &&
          contract.organization === obj.organization &&
          contract.department === obj.department) {
          query = ui.dialogs.confirm({
            title: 'Новый договор',
            text: `Для контрагента '${obj.partner.name}', уже есть договор по ключу
            '${obj.organization.name} + ${obj.department.name}'
            Создать новый?`,
          });
        }
        query.then(() => ui.dialogs.input_value({
          title: 'Уточните тип договора',
          list: [
            {value: '0', text: 'Для группировки заказов, подчинённый текущему'},
            {value: '1', text: 'Новый самостоятельный договор'},
          ]
        }))
          .then(async kind => {
            const {Contract, Actions} = await import('../../components/PartnerField/Contract');
            const raw = {
              owner: obj.partner.ref,
              organization: obj.organization.ref,
              department: obj.department.ref,
              date: new Date(),
              prepayment_percent: 100,
            };
            if(kind === '0') {
              raw.parent = contract.ref;
              raw.number_doc = obj.number_doc;
              raw.name = obj.number_doc;
            }
            const o = contracts.create(raw, false, true);
            o._modified = true;
            return ui.dialogs.alert({
              title: 'Новый договор',
              Component: Contract,
              Actions,
              props: {obj, o, kind, on_select},
              hide_btn: true,
              timeout: 200000,
            });
          })
          .catch(e => null);
      };

      contracts.form_selection = function form_selection(pwnd, attr) {
        const {initial_value, selection, _field: field, _obj: obj} = attr;
        this.constructor.prototype.form_selection.call(this, pwnd, attr);
        //pwnd?.on_select?.(attr.initial_value);
      };

      contracts.form_obj = async function form_obj(pwnd, attr) {
        const {o, _field: field, _obj: obj} = attr;
        //this.constructor.prototype.form_obj.call(this, pwnd, attr);
        const {Contract, Actions} = await import('../../components/PartnerField/Contract');
        return ui.dialogs.alert({
          title: `Договор: ${o.name}`,
          Component: Contract,
          Actions,
          props: {obj: o, o, kind: o.parent.empty() ? '1' : '0', mode: 'edit'},
          hide_btn: true,
          timeout: 200000,
        });
      };

      CatContracts.prototype.save = function save() {
        return ui.dialogs.alert({
          title: 'Ошибка записи',
          text: 'Запрещена непосредственная запись договоров и контрагентов',
        });
      };

    }
  });
}
