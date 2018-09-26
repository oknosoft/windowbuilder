/**
 * ### Модуль менеджера и документа Задание на производство
 *
 * @module work_centers_task
 */

import FrmObj from '../../components/WorkCentersTask/FrmObj';

export default function ({
                           DocWork_centers_task,
                           cat: {characteristics},
                           enm: {cutting_optimization_types},
                           doc: {work_centers_task, calc_order},
                           utils,
                         }) {

  // подключаем особую форму объекта
  work_centers_task.FrmObj = FrmObj;

  // модифицируем класс документа
  Object.assign(DocWork_centers_task.prototype, {

    after_create() {
      this.date = new Date();
      this.responsible = $p.current_user;
      return this;
    },

    /**
     * Заполняет план по заказу
     * @param refs {Array<ref|DataObj>}
     * @return {Promise<void>}
     */
    fill_by_orders(refs) {
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
                    if(prod.indexOf(row.characteristic) === -1) {
                      return;
                    }
                    // и только те продукции, у которых в спецификации есть материалы к раскрою
                    row.characteristic.specification.forEach((srow) => {
                      if(srow.len && !srow.nom.cutting_optimization_type.empty() &&
                          srow.nom.cutting_optimization_type !== cutting_optimization_types.Нет){
                        for(let i = 1; i <= row.quantity; i++) {
                          this.planning.add({obj: row.characteristic, specimen: i});
                        }
                        return false;
                      }
                    });
                  });
                });
            });
          }, Promise.resolve());
        });
    },

    /**
     * Загружает в озу продукции задания
     */
    load_production() {
      const refs = [];
      this.planning.forEach(({obj}) => {
        obj.is_new() && refs.indexOf(obj.ref) === -1 && refs.push(obj.ref);
      });
      return characteristics.adapter.load_array(characteristics, refs);
    },

    /**
     * Заполняет табчасть раскрой по плану
     * @param opts {Object}
     * @param opts.clear {Boolean}
     * @param opts.linear {Boolean}
     * @param opts.bilinear {Boolean}
     * @param opts.clr_only {Boolean}
     * @return {Promise<void>}
     */
    fill_cutting(opts) {
      const {planning, cutting} = this;
      if(opts.clear) {
        cutting.clear();
      }
      // получаем спецификации продукций
      return this.load_production()
        .then(() => {
          planning.forEach(({obj, specimen, elm}) => {
            obj.specification.forEach((row) => {
              // только строки подлежащие раскрою
              if(!row.len || row.nom.cutting_optimization_type.empty() || row.nom.cutting_optimization_type === cutting_optimization_types.Нет) {
                return;
              }
              // если планирование до элемента...
              if(elm && row.elm !== elm) {
                return;
              }
              // по типам оптимизации
              if(!opts.bilinear && row.width) {
                return;
              }
              // должен существовать элемент
              const coord = obj.coordinates.find({elm: row.elm});
              if(!coord) {
                return;
              }
              // только для цветных
              if(opts.clr_only) {
                if(row.clr.empty() || /Белый|БезЦвета/.test(row.clr.predefined_name) ) {
                  return;
                }
              }
              cutting.add({
                production: obj,
                specimen,
                elm: row.elm,
                nom: row.nom,
                characteristic: row.characteristic,
                len: (row.len * 1000).round(0),
                width: (row.width * 1000).round(0),
                orientation: coord.orientation,
                elm_type: coord.elm_type,
                alp1: row.alp1,
                alp2: row.alp2,
              });
            });
          });
        });
    },

    /**
     * Выполняет оптимизацию раскроя
     * @param opts
     * @return {Promise<void>}
     */
    optimize(opts) {
      return Promise.resolve();
    }

  });

}
