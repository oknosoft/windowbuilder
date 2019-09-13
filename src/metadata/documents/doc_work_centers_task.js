/**
 * ### Модуль менеджера и документа Задание на производство
 *
 * @module work_centers_task
 */

import FrmObj from '../../components/WorkCentersTask';

export default function ({
                           DocWork_centers_task,
                           DocWork_centers_taskCutsRow,
                           cat: {characteristics},
                           enm: {cutting_optimization_types, debit_credit_kinds},
                           doc: {work_centers_task, calc_order},
                           utils,
                         }) {

  // подключаем особую форму объекта
  work_centers_task.FrmObj = FrmObj;

  // модифицируем класс документа
  Object.assign(DocWork_centers_task.prototype, {

    // значения по умолчанию при создании документа
    after_create() {
      this.date = new Date();
      this.responsible = $p.current_user;
      return this;
    },

    // значения по умолчанию при добавлении строки
    add_row(row, attr) {
      if(row instanceof DocWork_centers_taskCutsRow) {
        if(!row.stick && (!attr || !attr.stick)) {
          const {_obj} = row._owner;
          row._obj.stick = 1 + (_obj.length ? Math.max.apply(null, _obj.map(({stick}) => stick)) : 0);
        }
      }
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
      return characteristics.adapter.load_array(characteristics, refs)
        .then(() => {
          refs.length = 0;
          this.planning.forEach(({obj}) => {
            const {calc_order} = obj;
            calc_order.is_new() && refs.indexOf(calc_order.ref) === -1 && refs.push(calc_order.ref);
          });
          return calc_order.adapter.load_array(calc_order, refs);
        });
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
     * Возвращает свёрнутую структуру номенклатур и характеристик раскроя
     */
    fragments() {
      const res = new Map();
      this.cutting.forEach((row) => {
        if(!res.has(row.nom)) {
          res.set(row.nom, new Map());
        }
        const nom = res.get(row.nom);
        if(!nom.has(row.characteristic)) {
          nom.set(row.characteristic, []);
        }
        const characteristic = nom.get(row.characteristic);
        characteristic.push(row);
      });
      return res;
    },

    /**
     * Выполняет оптимизацию раскроя
     * @param opts
     * @return {Promise<void>}
     */
    optimize(opts) {
      return import('genetic-cutting')
        .then((Cutting) => {
          const fragments = this.fragments();

          let queue = Promise.resolve();
          fragments.forEach((characteristics) => {
            /* eslint-disable no-unused-vars */
            for(const [characteristic, rows] of characteristics) {
              queue = queue.then(() => this.optimize_fragment(new Cutting('1D'), rows, opts.onStep));
            }
          });
          return queue;
        });
    },

    /**
     * Выполняет оптимизацию фрагмента (номенклатура+характеристика+тип)
     * @param opts
     * @return {Promise<void>}
     */
    optimize_fragment(cutting, rows, onStep) {

      return new Promise((resolve) => {

        const doc = this;
        const workpieces = [];
        const cut_row = rows[0];
        if(cut_row) {
          // ищем запись в расходе - её туда могли положить руками, либо подтянулось из остатков
          this.cuts.find_rows({
            record_kind: debit_credit_kinds.credit,
            nom: cut_row.nom,
            characteristic: cut_row.characteristic,
          }, (row) => {
            workpieces.push(row);
          });
        }

        const config = {
          iterations: 3000,
          size: 200,
          crossover: 0.2,
          mutation: 0.3,
          random: 0.1,
          skip: 60,
          webWorkers: true,
        };
        const userData = {
          products: rows.map((row) => row.len),
          workpieces: workpieces.map((row) => row.len),
          overmeasure: 0,
          wrongsnipmin: 0,
          wrongsnipmax: 0,
          sticklength: cut_row.nom.len || 6000,
          knifewidth: cut_row.nom.knifewidth || 7,
          usefulscrap: cut_row.nom.usefulscrap || 600,
        };
        cutting.genetic.notification = function(pop, generation, stats, isFinished) {

          if(!generation) {
            return;
          }

          // текущий результат
          const decision = Object.assign({
            cut_row,
            userData,
            cuts: workpieces,
            rows,
            progress: isFinished ? 1 : generation / this.configuration.iterations
          }, this.fitness(pop[0].entity, true));

          // обновляем интерфейс
          onStep(decision);

          if(isFinished) {
            // обновляем документ
            doc.push_cut_result(decision);
            resolve();
          }

        };

        cutting.evolve(config, userData);

      });
    },

    /**
     * помещает результат раскроя в документ
     */
    push_cut_result(decision) {
      // сначала добавляем заготовки
      for(let i = 0; i < decision.workpieces.length; i++) {
        let workpiece = decision.cuts[i];
        if(!workpiece) {
          workpiece = this.cuts.add({
            record_kind: debit_credit_kinds.credit,
            nom: decision.cut_row.nom,
            characteristic: decision.cut_row.characteristic,
            len: decision.userData.sticklength,
            quantity: decision.userData.sticklength / 1000,
          });
          decision.cuts.push(workpiece);
        }
        if(decision.workpieces[i] > decision.userData.usefulscrap) {
          this.cuts.add({
            record_kind: debit_credit_kinds.debit,
            nom: decision.cut_row.nom,
            characteristic: decision.cut_row.characteristic,
            len: decision.workpieces[i],
            quantity: decision.workpieces[i] / 1000,
            stick: workpiece.stick,
          });
        }
      }

      // проставляем номера палок в раскрое
      for(let i = 0; i < decision.res.length; i++) {
        decision.rows[i].stick = decision.cuts[decision.res[i]].stick;
      }

    }

  });

}
