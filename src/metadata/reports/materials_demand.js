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
      value: function(row) {

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
      value: function () {

        const {specification, production, constructor, scheme, resources, _manager} = this;

        const _columns = scheme.rx_columns({
          mode: 'ts',
          fields: _manager.metadata(_manager._tabular).fields,
          _obj: this
        });

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

            // фильтруем результат
            scheme.filter(specification, '', true);

            // округляем числовые поля
            const nflds = 'qty,totqty,totqty1,price,amount,amount_marged'.split(',');
            specification.forEach((row) => {
              for(const fld of nflds){
                row[fld] = row[fld].round(3);
              }
            });

            // сворачиваем результат и сохраняем его в specification._rows
            const dims = scheme.dims();
            const ress = [];
            _columns.forEach(({key}) => {
              if(dims.indexOf(key) == -1 && resources.indexOf(key) != -1) {
                ress.push(key);
              }
              else {
                // для базовой группировки, подмешиваем в измерения всё, что не ресурс
                dims.indexOf(key) == -1 && dims.push(key);
              }
            });

            // группируем по схеме

            // TODO сейчас поддержана только первая запись иерархии

            // TODO сейчас нет понятия детальных записей - всё сворачивается по измерениям

            // TODO сейчас набор полей не поддержан в интерфейсе, но решаем сразу для группировки по нескольким полям
            const grouping = scheme.dims();
            if(grouping.length) {
              // строка полей группировки без пустых полей
              const dflds = dims.filter(v => v).map(v => '`' + v + '`').join(', ');

              // TODO в группировке может потребоваться разыменовать поля

              // TODO итоги надо считать не по всем русурсам

              // TODO итоги надо считать с учетом формулы

              const sql = `select ${ress.map(res => `sum(${res}) as ${res}`).join(', ')
                } ${dflds ? ((ress.length ? ', ' : '') + dflds) : ''} from ? ${dflds ? 'group by ROLLUP(' + dflds + ')' : ''}`;

              // TODO еще, в alasql есть ROLLUP, CUBE и GROUPING SETS (аналог 1С-ного ИТОГИ) - можно задействовать
              const res = $p.wsql.alasql(sql, [specification._obj]);

              // складываем результат в иерархическую структуру
              const levels = [];
              let index = 0;
              for (const row of res) {

                row.row = (index++).toString();

                // является ли строка группировкой?
                const is_group = dims.some(v => row[v] === null);
                const parent_group = {};
                const parent_dims = [];
                is_group && dims.forEach(v => {
                  if(row[v] !== null) {
                    parent_dims.push(v);
                    parent_group[v] = row[v];
                  }
                });

                // ищем подходящего родителя
                let parent;
                for (const level of levels) {
                  if(is_group) {
                    const lim = parent_dims.length - 1;
                    if(parent_dims.every((v, i) => (level[v] instanceof Date && row[v] instanceof Date ?
                        level[v].valueOf() === row[v].valueOf() : level[v] === row[v]) || i === lim)) {
                      parent = level;
                    }
                    // если мы группировка, добавляем себя в levels
                    row.children = [];
                    levels.push(row);
                    break;
                  }
                  else {
                    const lim = dims.length - 1;
                    if(dims.every((v, i) => level[v] === row[v] || i === lim)) {
                      parent = level;
                      break;
                    }
                  }
                }
                if(parent) {
                  parent.children.push(row);
                }
                else {
                  if(!levels.length) {
                    row.children = [];
                    levels.push(row);
                  }
                }
              }

              specification._rows.push(levels[0]);
              specification._rows._count = index;

              // TODO для ссылочных полей надо выполнить приведение типов, т.к в alasql возвращает guid`s вместо объектов
              this.cast(specification._rows, 0, dims);

            }
            else {
              // или заполняем без группировки
              specification.group_by(dims, ress);
              specification.forEach((row) => {
                specification._rows.push(row);
              });
              specification._rows._count = specification._rows.length;
            }

          });
      }
    },

    /**
     * Выполняет приведение типов в группировках и ссылочных полях после alasql
     * TODO: переместить в компоновку
     */
    cast: {
      value: function(rows, level, dims, dim, meta) {
        if(!meta){
          meta = this._metadata(this._manager._tabular || 'data').fields;
          dim = dims[dims.length - 1];
        }
        const {utils} = $p;
        for(const row of rows) {
          if(row.children){
            // если это группировка верхнего уровня
            if(level == 0){
              row[dim] = meta[dim].type.is_ref ? {presentation: 'Σ'} : 'Σ';
            }
            else{
              const gdim = dims[level - 1];
              const mgr = this._manager.value_mgr(row, gdim, meta[gdim].type);
              const val = utils.is_data_mgr(mgr) ? mgr.get(row[gdim]) : row[gdim];
              row[dim] = this._manager.value_mgr(row, dim, meta[dim].type) ?
                (
                  utils.is_data_obj(val) ? val : {presentation: val instanceof Date ? utils.moment(val).format(utils.moment._masks[meta[gdim].type.date_part]) : val }
                )
                :
                (
                  utils.is_data_obj(val) ? val.toString() : val
                );
            }
            this.cast(row.children, level + 1, dims, dim, meta);
          }
          else{
            const mgr = this._manager.value_mgr(row, dim, meta[dim].type);
            if(utils.is_data_mgr(mgr)) {
              row[dim] =  mgr.get(row[dim]);
            }
          }
        }
      }
    },

    /**
     * Дополняет табчасть продукциями выбранного заказа
     * @param row
     * @return {Promise.<TResult>}
     */
    fill_by_order: {
      value: function (row) {

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
      get: function () {
        return ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged']
      }
    }

  });

}




