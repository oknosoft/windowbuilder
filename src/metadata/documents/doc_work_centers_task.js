/**
 * ### Модуль менеджера и документа Задание на производство
 *
 * @module work_centers_task
 */

import FrmObj from '../../components/WorkCentersTask/FrmObj';

export default function ({doc, DocWork_centers_task}) {

  // подключаем особую форму объекта
  doc.work_centers_task.FrmObj = FrmObj;

  // модифицируем класс документа
  const {prototype} = DocWork_centers_task;

  // заполняет план по заказу
  prototype.fill_by_orders = function (refs) {
    const {doc: {calc_order}, cat: {characteristics}, enm: {cutting_optimization_types}, utils} = $p;
    const orders = [];
    return refs.reduce((sum, ref) => {
      return sum.then(() => {
        if(utils.is_data_obj(ref)){
          orders.push(ref);
        }
        else {
          return calc_order.get(ref, 'promise')
            .then((ref) => orders.push(ref));
        }
      });
    }, Promise.resolve())
      .then(() => {
        return orders.reduce((sum, order) => {
          return sum.then(() => {
            return order.load_production()
              .then((prod) => {
                order.production.forEach((row) => {
                  // нас интересуют только продукции
                  if(!prod.indexOf(row.characteristic)) {
                    return;
                  }
                  // и только те продукции, у которых в спецификации есть материалы к раскрою
                  row.characteristic.specification.forEach((srow) => {
                    if(!srow.nom.cutting_optimization_type.empty() && srow.nom.cutting_optimization_type !== cutting_optimization_types.Нет){
                      for(let i = 1; i <= row.quantity; i++) {
                        this.planning.add({obj: row.characteristic, specimen: i});
                      }
                      return false;
                    }
                  });
                })
              });
          });
        }, Promise.resolve());
      });
  };

}
