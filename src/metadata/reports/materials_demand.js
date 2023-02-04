/**
 * ### Отчет _Потребность в материалах_
 * он же - анализ спецификации прдукций
 *
 * Created 07.11.2016
 */

import {Report, RepParams} from '../../components/RepMaterialsDemand';

export default function ($p) {

  const {cat: {characteristics}, rep: {materials_demand}, RepMaterials_demand, utils} = $p;

  const spec_flds = Object.keys(characteristics.metadata('specification').fields);
  const rspec_flds = Object.keys(materials_demand.metadata('specification').fields);

  /**
   * Класс-компонент формы отчета
   * в отчете materials_demand используется типовая форма
   */
  materials_demand.FrmObj = Report;

  /**
   * Класс-компонент панели параметров отчета
   * @type {RepParams}
   */
  materials_demand.RepParams = RepParams;

  /**
   * Имя табчасти, в которой живут данные отчета
   */
  materials_demand._tabular = 'specification';

  /**
   * Разрядность колонки qty
   */
  materials_demand.metadata('specification').fields.qty.type.fraction = 0;

  /**
   * устраняем дребезг react с помощью debounce
   */
  function fill_by_selected({type, elm, layer, ox, _obj}) {
    switch (type) {
      case 'order':
      case 'settings':
        return _obj.fill_by_order()
          .then(() => _obj.calculate());

      case 'root':
        return  _obj.calculate_root(ox);

      case 'layer':
        return  _obj.calculate_root(ox, -layer.cnstr);

      case 'elm':
        return  _obj.calculate_root(ox, elm.elm);

      case 'grp':
      case 'pair':
        return  _obj.calculate_root(ox, elm.map(v => v.elm));

      default:
        console.log(type);
        return Promise.resolve();
    }
  }

  materials_demand.fill_by_selected = function ({type, elm, layer, ox, _obj}) {
    _obj.clear_timers();
    return new Promise((resolve, reject) => {
      _obj._data._resolve_timeout = setTimeout(() => {
        fill_by_selected({type, elm, layer, ox, _obj})
          .then(() => {
            if(_obj._data._reject_timeout) {
              clearTimeout(_obj._data._reject_timeout);
            }
            resolve();
          })
          .catch(reject);
      }, 100);
      _obj._data._reject_timeout = setTimeout(reject, 3000);
    });
  };

  Object.defineProperties(RepMaterials_demand.prototype, {

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
        row.nom_group = nom.nom_group;
        row.price_group = nom.price_group;
        row.material = res;

        row.article = nom.article;
        row.id = nom.id;
        row.packing = nom.packing;

        return res;
      }
    },

    add_sprow: {
      value({sprow, row, specification, prows}) {
        let resrow = {};
        spec_flds.forEach(fld => {
          if(rspec_flds.includes(fld)) {
            resrow[fld] = sprow[fld];
          }
        });
        resrow = specification.add(resrow);

        // учтём количество
        const quantity = row.qty || row.quantity || 1;
        resrow.qty = resrow.qty * quantity;
        resrow.totqty = resrow.totqty * quantity;
        resrow.totqty1 = resrow.totqty1 * quantity;
        resrow.amount = resrow.amount * quantity;
        resrow.amount_marged = resrow.amount_marged * quantity;

        // рассчитаем недостающие поля

        // если номер элемента < 0, интерпретируем его, как номер конструкции
        if(resrow.elm > 0) {
          resrow.cnstr = row.characteristic.coordinates.find({elm: resrow.elm})?.cnstr || 0;
        }
        else if(resrow.elm < 0) {
          resrow.cnstr = -resrow.elm;
        }

        // ссылка на заказ
        resrow.calc_order = row.characteristic.calc_order;

        // номер строки изделия и комментарий
        if(!row.characteristic.empty() && !prows.has(row.characteristic)) {
          const {calc_order_row} = row.characteristic;
          const row_desc = {
            product: calc_order_row ? calc_order_row.row : 1,
            note: calc_order_row ? calc_order_row.note : '',
          };
          prows.set(row.characteristic, row_desc);
        }
        const row_desc = prows.get(row.characteristic);
        resrow.product = row_desc?.product || 0;
        resrow.note = row_desc?.note || '';

        // свойства номенклатуры и группировки
        this.material(resrow);
      }
    },

    clear_timers: {
      value() {
        const {_data} = this;
        if(_data._resolve_timeout) {
          clearTimeout(_data._resolve_timeout);
          _data._resolve_timeout = 0;
        }
        if(_data._reject_timeout) {
          clearTimeout(_data._reject_timeout);
          _data._reject_timeout = 0;
        }
      }
    },

    /**
     * чистит таблицу результата
     */
    clear_spec: {
      value() {
        const {specification} = this;
        specification.clear();
        if(!specification._rows) {
          specification._rows = [];
        }
        else {
          specification._rows.length = 0;
        }
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

        const {specification, production, scheme, calc_order} = this;

        this.clear_spec();

        return this.load_linked_refs()
          .then(() => {

            const prows = new Map();

            // бежим по продукции и заполняем результат
            for(const row of production) {
              if(row.characteristic.calc_order === calc_order) {
                row.characteristic.specification.each((sprow) => {
                  this.add_sprow({sprow, row, specification, prows});
                });
              }
              else {
                const {calc_order} = this;
                const orow = calc_order.production.get(row.elm - 1);
                if(!orow || orow.nom !== row.nom) {
                  continue;
                }
                const sprow = Object.assign({}, {
                  nom: row.nom,
                  characteristic: row.characteristic,
                  qty: row.qty,
                  totqty: row.qty,
                  totqty1: row.qty,
                  price: orow.price_internal,
                  amount: orow.amount_internal,
                  amount_marged: orow.amount_internal,
                });
                this.add_sprow({
                  sprow,
                  row: {
                    characteristic: {calc_order, empty() {return true;}},
                    qty: 1,
                  },
                  specification,
                  prows});
              }
            }

            // фильтруем результат с учетом разыменования и видов сравнения
            scheme.filter(specification, '', true);

            // группируем по схеме - сворачиваем результат и сохраняем его в ._rows
            scheme.group_by(specification);

        });
      }
    },

    calculate_root: {
      value(ox, elm) {
        const {calc_order_row: row} = ox;
        const {specification, scheme} = this;
        const prows = new Map();
        this.clear_spec();

        if(Array.isArray(elm)) {
          for(const sprow of ox.specification) {
            if(elm.includes(sprow.elm)) {
              this.add_sprow({sprow, row, specification, prows});
            }
          }
        }
        else {
          for(const sprow of ox.specification) {
            if(!elm || sprow.elm === elm) {
              this.add_sprow({sprow, row, specification, prows});
            }
          }
        }

        return utils.sleep().then(() => {
          scheme.filter(specification, '', true);
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

        if(!row || (!row._id && !row.ref)) {
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
              if(row.characteristic.calc_order === doc || row.characteristic.calc_order.empty()) {
                rows.push({
                  use: true,
                  nom: row.nom,
                  characteristic: row.characteristic,
                  qty: row.quantity,
                  elm: row.characteristic.calc_order === doc ? 0 : row.row,
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




