/**
 * Регистрируем данные расчета для статистики
 */

$p.doc.calc_order.aggregate_stat = $p.wsql.alasql.compile(
  `select state, department, doc, nom, sys, sum(quantity) quantity, sum(s) s, sum(amount) amount
   from ? group by state, department, doc, nom, sys`);

$p.doc.calc_order.on('after_save', function (doc) {
  const {production, obj_delivery_state, department, partner, _manager: {adapter, aggregate_stat}} = doc;
  const {current_user} = $p;
  if(obj_delivery_state == 'Шаблон' || !production.count() || !current_user || current_user.branch.empty()) {
    return;
  }
  const stat = [];
  const state = (['Отклонен', 'Черновик', 'Отозван'].includes(obj_delivery_state.valueOf())) ? 0 : 1;
  let sys;
  production.forEach(({characteristic}) => {
    if(!sys || !characteristic.sys.empty()) {
      sys = characteristic.sys;
    }
    if(!sys.empty()) {
      return false;
    }
  });
  production.forEach((row) => {
    if(!row.quantity) {
      return;
    }
    stat.push({
      state,
      department: department.ref,
      partner: partner.ref,
      doc: doc.ref,
      nom: row.nom.ref,
      sys: (row.characteristic.sys.empty() ? sys : row.characteristic.sys).ref,
      quantity: row.quantity,
      s: row.s,
      amount: row.amount,
    });
  });
  adapter.fetch(`/adm/api/stat/reg`, {
    method: 'post',
    body: JSON.stringify(aggregate_stat([stat])),
  })
    .catch((err) => err);
});
