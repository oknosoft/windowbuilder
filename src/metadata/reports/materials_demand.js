/**
 * ### Отчет _Потребность в материалах_
 * он же - анализ спецификации прдукций
 *
 * Created 07.11.2016
 */

import RepParams from '../../components/RepMaterialsDemand/RepParams';
import Report from '../../components/RepMaterialsDemand/Report';

import DataFrame from 'dataframe';

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

        const {specification, production, scheme, resources, _manager} = this;
        const meta = _manager.metadata(_manager._tabular || 'data').fields;
        const _columns = scheme.rx_columns({_obj: this, mode: 'ts', fields: meta});

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

            // округляем числовые поля - TODO: сделать вместо этого format()
            // const nflds = 'qty,totqty,totqty1,price,amount,amount_marged'.split(',');
            // specification.forEach((row) => {
            //   for(const fld of nflds){
            //     row[fld] = row[fld].round(3);
            //   }
            // });

            // группируем по схеме - сворачиваем результат и сохраняем его в ._rows
            const grouping = scheme.dims();


          // TODO сейчас поддержана только первая запись иерархии

          // TODO сейчас нет понятия детальных записей - всё сворачивается по измерениям

          // TODO сейчас набор полей не поддержан в интерфейсе, но решаем сразу для группировки по нескольким полям

          if(grouping.length) {

            // dims - конкатенация явных полей группировки с полями детальных записей
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

            // строка полей группировки без пустых полей
            const dflds = dims.filter(v => v);

            // DataFrame

            // TODO: скомпилировать и подклеить агрегаты из схемы
            const reduce = function(row, memo) {
              for(const resource of ress){
                memo[resource] = (memo[resource] || 0) + row[resource];
              }
              return memo;
            };

            const df = DataFrame({
              rows: specification._obj,
              dimensions: dflds.map(v => ({value: v, title: v})),
              reduce
            });

            const res = df.calculate({
              dimensions: dflds,
              sortBy: '',
              sortDir: 'asc',
            });

            // TODO в группировке может потребоваться разыменовать поля

            // TODO итоги надо считать не по всем русурсам

            // TODO итоги надо считать с учетом формулы

            // const sql = `select ${dflds}${ress.length ? ', ' : ' '}${
            //   ress.map(res => `sum(${res}) as ${res}`).join(', ')} INTO CSV("my.csv", {headers:true}) from ? ${dflds ? 'group by ROLLUP(' + dflds + ')' : ''}`;
            //
            // // TODO еще, в alasql есть ROLLUP, CUBE и GROUPING SETS - сейчас используем ROLLUP
            // const res = $p.wsql.alasql(sql, [specification._obj]);

            // складываем результат в иерархическую структуру
            const stack = []; // здесь храним родительские строки
            const col0 = _columns[0];
            const {is_data_obj, is_data_mgr, moment} = $p.utils;
            let prevLevel;    // предыдущий уровень группировки
            let index = 0;    // счетчик количества строк + id строки результирующего набора

            const cast_field = function (row, gdim, force) {

              const mgr = _manager.value_mgr(row, gdim, meta[gdim].type);
              const val = is_data_mgr(mgr) ? mgr.get(row[gdim]) : row[gdim];

              if(_columns.some(v => v.key === gdim)){
                row[gdim] = val;
              }
              else if(force){
                row[col0.key] = _manager.value_mgr(row, col0.key, meta[col0.key].type) ?
                  is_data_obj(val) ? val : {presentation: val instanceof Date ? moment(val).format(moment._masks[meta[gdim].type.date_part]) : val }
                  :
                  is_data_obj(val) ? val.toString() : val;
              }
            };

            const totals = !grouping[0];
            if(totals){
              grouping.splice(0, 1);
              const row = {
                row: (index++).toString(),
                children: [],
              };
              specification._rows.push(row);
              stack.push(row);
              row[col0.key] = col0._meta.type.is_ref ? {presentation: 'Σ'} : 'Σ';
            }
            else{
              stack.push({children: specification._rows});
            }

            for(const row of res) {

              // варианты:
              // - это подуровень группировки: добавляем к родителю, добавляем в stack, level растёт
              // - это очередная строка того же уровня: добавляем к родителю, level без изменений
              // - это следующее значение родителя: меняем в стеке, level без изменений
              // - этот уровень не нужен в результирующем наборе - пропускаем
              const level = stack.length - 1;
              const parent = stack[level];
              if(!prevLevel) {
                prevLevel = level;
              }

              // по числу не-null в измерениях, определяем уровень
              let lvl = row._level + 1;

              // если такой уровень не нужен - пропускаем
              if(lvl > grouping.length && lvl < dflds.length) {
                prevLevel = lvl;
                continue;
              }

              row.row = (index++).toString();

              if(lvl > level && lvl < dflds.length){
                parent.children.push(row);
                row.children = [];
                stack.push(row);
                cast_field(row, grouping[stack.length - 2], true);
              }
              else if(lvl < prevLevel) {
                stack.pop();
                stack[stack.length - 1].children.push(row);
                row.children = [];
                stack.push(row);
                cast_field(row, grouping[stack.length - 2], true);
              }
              else {
                parent.children.push(row);
                for(const gdim of dflds){
                  cast_field(row, gdim);
                }
              }

              prevLevel = lvl;
            }

            specification._rows._count = index;

            if(totals){
              const row = specification._rows[0];
              row.children.reduce((memo, row) => reduce(row, memo), row);
            }

              // выполняем для ссылочных полей приведение типов
              //this.cast(specification._rows, 0, dims);

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
              const gdim = dims[level];
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
        return ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged'];
      }
    }

  });

}




