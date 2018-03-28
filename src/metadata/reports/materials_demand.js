/**
 * ### Отчет _Потребность в материалах_
 * он же - анализ спецификации прдукций
 *
 * Created 07.11.2016
 */

import RepParams from '../../components/RepMaterialsDemand/RepParams';
import Report from '../../components/RepMaterialsDemand/Report';

export default function ($p) {

  const {characteristics} = $p.cat;

  /**
   * Класс-компонент формы отчета
   * в отчете materials_demand используется типовая форма
   */
  $p.rep.materials_demand.FrmObj = Report;

  /**
   * Класс-компонент панели параметров отчета
   * @type {RepParams}
   */
  $p.rep.materials_demand.RepParams = RepParams;

  /**
   * Имя табчасти, в которой живут данные отчета
   */
  $p.rep.materials_demand._tabular = 'specification';

  Object.defineProperties($p.RepMaterials_demand.prototype, {

    // подмешивает в наименование материала характеристику и размеры
    material: {
      value(row) {

        const {nom, characteristic, len, width} = row;

        let res = nom.name;

        if (!characteristic.empty()) {
          res += ' ' + characteristic.presentation;
        }

        if (len && width)
          row.sz = (1000 * len).toFixed(0) + "x" + (1000 * width).toFixed(0);
        else if (len)
          row.sz = + (1000 * len).toFixed(0);
        else if (width)
          row.sz = + (1000 * width).toFixed(0);

        row.nom_kind = nom.nom_kind;
        row.grouping = nom.grouping;
        row.article = nom.article;
        row.material = res;

        return res;
      }
    },

    /**
     * Рассчитывает данные отчета
     *
     * @method calculate
     * @for RepMaterials_demand
     * @param scheme
     * @return {Promise.<TResult>}
     */
    calculate: {
      value() {

        const {specification, production, scheme, _manager} = this;
        const arefs = [], aobjs = [],
          spec_flds = Object.keys(characteristics.metadata('specification').fields),
          rspec_flds = Object.keys(_manager.metadata('specification').fields);

        // получаем массив объектов продукций
        production.forEach((row) => {
          if(!row.characteristic.empty() && row.characteristic.is_new() && arefs.indexOf(row.characteristic.ref) == -1) {
            arefs.push(row.characteristic.ref);
            aobjs.push(row.characteristic.load());
          }
        });

        // чистим таблицу результата
        specification.clear();
        if(!specification._rows) {
          specification._rows = [];
        }
        else {
          specification._rows.length = 0;
        }

        return Promise.all(aobjs)

        // получаем массив объектов заказов и вложенных характеристик
          .then(() => {

            arefs.length = 0;
            aobjs.length = 0;

            production.each((row) => {

              if(!row.characteristic.empty() && !row.characteristic.calc_order.empty()
                && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
                arefs.push(row.characteristic.calc_order.ref);
                aobjs.push(row.characteristic.calc_order.load());
              }

              row.characteristic.specification.each(function (sprow) {
                if(!sprow.characteristic.empty() && sprow.characteristic.is_new() && arefs.indexOf(sprow.characteristic.ref) == -1) {
                  arefs.push(sprow.characteristic.ref);
                  aobjs.push(sprow.characteristic.load());
                }
              });

            });

            return Promise.all(aobjs);

          })

          .then(() => {

            const prows = {};

            // бежим по продукции и заполняем результат
            production.each((row) => {
              if(!row.characteristic.empty()) {
                row.characteristic.specification.each((sprow) => {
                  let resrow = {};
                  spec_flds.forEach(fld => {
                    if(rspec_flds.indexOf(fld) != -1) {
                      resrow[fld] = sprow[fld];
                    }
                  });
                  resrow = specification.add(resrow);

                  // учтём количество
                  resrow.qty = resrow.qty * row.qty;
                  resrow.totqty = resrow.totqty * row.qty;
                  resrow.totqty1 = resrow.totqty1 * row.qty;
                  resrow.amount = resrow.amount * row.qty;
                  resrow.amount_marged = resrow.amount_marged * row.qty;

                  // рассчитаем недостающие поля

                  // если номер элемента < 0, интерпретируем его, как номер конструкции
                  if(resrow.elm > 0) {
                    resrow.cnstr = row.characteristic.coordinates.find_rows({elm: resrow.elm})[0].cnstr;
                  }
                  else if(resrow.elm < 0) {
                    resrow.cnstr = -resrow.elm;
                  }

                  // ссылка на заказ
                  resrow.calc_order = row.characteristic;

                  // номер строки изделия в исходном заказе
                  if(!prows[row.characteristic.ref]) {
                    prows[row.characteristic.ref] = row.characteristic.calc_order.production.find_rows({characteristic: row.characteristic});
                    if(prows[row.characteristic.ref].length) {
                      prows[row.characteristic.ref] = prows[row.characteristic.ref][0].row;
                    }
                    else {
                      prows[row.characteristic.ref] = 1;
                    }
                  }
                  resrow.product = prows[row.characteristic.ref];

                  // свойства номенклатуры и группировки
                  this.material(resrow);

                });
              }
            });

            // фильтруем результат с учетом разыменования и видов сравнения
            scheme.filter(specification, '', true);

            // группируем по схеме - сворачиваем результат и сохраняем его в ._rows
            scheme.group_by(specification);

        });
      }
    },

    /**
     * Дополняет табчасть продукциями выбранного заказа
     * @param row
     * @return {Promise.<TResult>}
     */
    fill_by_order: {
      value(row) {

        let pdoc;

        if(!row || !row._id) {
          if(this.calc_order.empty()) {
            return;
          }
          if(this.calc_order.is_new()) {
            pdoc = this.calc_order.load();
          }
          else {
            pdoc = Promise.resolve(this.calc_order);
          }
        }
        else {
          const ids = row._id.split('|');
          if(ids.length < 2) {
            return;
          }
          pdoc = $p.doc.calc_order.get(ids[1], 'promise');
        }

        return pdoc
          .then((doc) => {
            //this.production.clear()
            const rows = [];
            const refs = [];
            doc.production.forEach((row) => {
              if(!row.characteristic.empty()) {
                rows.push({
                  use: true,
                  characteristic: row.characteristic,
                  qty: row.quantity,
                });
                if(row.characteristic.is_new()) {
                  refs.push(row.characteristic.ref);
                }
              }
            });

            return $p.adapters.pouch.load_array($p.cat.characteristics, refs).then(() => rows);
          })
          .then((rows) => {
            this.production.load(rows);
            return rows;
          });
      }
    },

    // ресурсы по умолчанию
    // TODO: сделать признак в метаданных
    resources: {
      get() {
        return ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged'];
      }
    }

  });

}




