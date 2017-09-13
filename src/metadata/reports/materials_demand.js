/**
 * ### Отчет _Потребность в материалах_
 * он же - анализ спецификации прдукций
 *
 * Created 07.11.2016
 */

import RepParams from '../../components/RepMaterialsDemand/RepParams';

export default function ($p) {

  const {characteristics, nom, nom_kinds, clrs} = $p.cat;

  /**
   * Класс-компонент формы отчета
   * в отчете materials_demand используется типовая форма
   */
  //$p.rep.materials_demand.FrmObj = class Report extends Component{};

  /**
   * Класс-компонент панели параметров отчета
   * @type {RepParams}
   */
  $p.rep.materials_demand.RepParams = RepParams;

  /**
   * Имя табчасти, в которой живут данные отчета
   */
  $p.rep.materials_demand._tabular = 'specification';

  /**
   * Рассчитывает данные отчета
   *
   * @method calculate
   * @for RepMaterials_demand
   * @param scheme
   * @return {Promise.<TResult>}
   */
  $p.RepMaterials_demand.prototype.calculate = function () {
    const {specification, production, constructor, scheme, _manager} = this;

    const _columns = scheme.rx_columns({
      mode: 'ts',
      fields: _manager.metadata(_manager._tabular).fields,
      _obj: this
    });

    const arefs = [], aobjs = [],
      spec_flds = Object.keys(characteristics.metadata('specification').fields),
      rspec_flds = Object.keys(_manager.metadata('specification').fields);

    function material(row) {

      let res = row.nom.presentation;

      if(!row.characteristic.empty()) {
        res += ' ' + row.characteristic.presentation;
      }

      if(row.len && row.width) {
        res += ' ' + (1000 * row.len).toFixed(0) + 'x' + (1000 * row.width).toFixed(0);
      }
      else if(row.len) {
        res += ' ' + (1000 * row.len).toFixed(0);
      }
      else if(row.width) {
        res += ' ' + (1000 * row.width).toFixed(0);
      }

      return res;
    }

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
      .then((ares) => {

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
        production.each(function (row) {
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
              resrow.nom_kind = resrow.nom.nom_kind;
              resrow.material = material(resrow);
              //resrow.grouping = resrow.nom.grouping;

            });
          }
        });

        // сворачиваем результат и сохраняем его в specification._rows

        const dimentions = [], resources = [];
        _columns.forEach(fld => {
          const {key} = fld;
          if(constructor.resources.indexOf(key) != -1) {
            resources.push(key);
          }
          else {
            dimentions.push(key);
          }
        });
        specification.group_by(dimentions, resources);
        specification.forEach((row) => {

          // округление
          row.qty = row.qty.round(3);
          row.totqty = row.totqty.round(3);
          row.totqty1 = row.totqty1.round(3);
          row.price = row.price.round(3);
          row.amount = row.amount.round(3);
          row.amount_marged = row.amount_marged.round(3);

          specification._rows.push(row);
        });

      });
  };

}




