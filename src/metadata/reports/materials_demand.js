/**
 * ### Отчет _Потребность в материалах_
 * он же - анализ спецификации прдукций
 *
 * Created 07.11.2016
 */

import {Report, RepParams} from '../../components/RepMaterialsDemand';

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

        if(len && width) {
          row.sz = (1000 * len).toFixed(0) + 'x' + (1000 * width).toFixed(0);
        }
        else if(len) {
          row.sz = +(1000 * len).toFixed(0);
        }
        else if(width) {
          row.sz = +(1000 * width).toFixed(0);
        }

        row.nom_kind = nom.nom_kind;
        row.grouping = nom.grouping;
        row.article = nom.article;
        row.nom_group = nom.nom_group;
        row.price_group = nom.price_group;
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
        const spec_flds = Object.keys(characteristics.metadata('specification').fields);
        const rspec_flds = Object.keys(_manager.metadata('specification').fields);
        const prows = {};

        // чистим таблицу результата
        specification.clear();
        if(!specification._rows) {
          specification._rows = [];
        }
        else {
          specification._rows.length = 0;
        }

        const add_sprow = (sprow, row, plain) => {
          let resrow = {};
          if(plain) {
            resrow.nom = row.nom;
            resrow.characteristic = row.characteristic;
            resrow.clr = row.characteristic.clr;
            resrow.qty = 1;
            resrow.len = row.qty;
            resrow.totqty = row.qty;
            resrow.totqty1 = row.qty;
          }
          else {
            spec_flds.forEach(fld => {
              if(rspec_flds.indexOf(fld) != -1) {
                resrow[fld] = sprow[fld];
              }
            });
          }
          resrow = specification.add(resrow);

          // учтём количество
          if(!plain) {
            resrow.qty = resrow.qty * row.qty;
            resrow.totqty = resrow.totqty * row.qty;
            resrow.totqty1 = resrow.totqty1 * row.qty;
            resrow.amount = resrow.amount * row.qty;
            resrow.amount_marged = resrow.amount_marged * row.qty;
          }

          // рассчитаем недостающие поля

          // если номер элемента < 0, интерпретируем его, как номер конструкции
          if(resrow.elm > 0) {
            resrow.cnstr = row.characteristic.coordinates.find({elm: resrow.elm})?.cnstr || 0;
          }
          else if(resrow.elm < 0) {
            resrow.cnstr = -resrow.elm;
          }

          // ссылка на заказ
          resrow.calc_order = plain ? this.calc_order : row.characteristic.calc_order;

          // номер строки изделия в исходном заказе
          if(plain) {
            resrow.product = 0;
          }
          else {
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
          }

          // свойства номенклатуры и группировки
          this.material(resrow);

        };

        return Promise.resolve()
          .then(() => {

            // бежим по продукции и заполняем результат
            production.each((row) => {
              if(!row.characteristic.calc_order.empty()) {
                for(const sprow of row.characteristic.specification) {
                  add_sprow(sprow, row);
                }
              }
              else {
                add_sprow(row, row, true);
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

        if(!row._id && !row.ref) {
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
          let {ref} = row;
          if(!ref) {
            const ids = row._id.split('|');
            if(ids.length < 2) {
              pdoc = Promise.resolve(this.calc_order);
            }
            ref = ids[1];
          }
          pdoc = $p.doc.calc_order.get(ref, 'promise');
        }

        return pdoc
          .then((doc) => doc.load_linked_refs())
          .then((doc) => {
            this.calc_order = doc;
            const rows = [];
            for(const row of doc.production) {
              if(row.characteristic.calc_order === doc || row.nom.cutting_optimization_type.is('РасчетНарезки')) {
                rows.push({
                  use: true,
                  nom: row.nom,
                  characteristic: row.characteristic,
                  qty: row.quantity,
                });
              }
            }
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




