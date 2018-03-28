/**
 * ### Форма добавления услуг и комплектуюущих
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import compose from 'recompose/compose';

import AdditionsItem from './AdditionsItem';
const {ItemData} = $p.cat.inserts;

// компилированный запрос для поиска настроек в ОЗУ
export const alasql_schemas = $p.wsql.alasql.compile('select * from cat_scheme_settings where obj="dp.buyers_order.production"');


// заполняет компонент данными
export function fill_data(ref) {

  const items = this.items = $p.enm.inserts_types.additions_groups;
  const dp = this.dp = $p.dp.buyers_order.create();
  dp.calc_order = $p.doc.calc_order.by_ref[ref];
  const components = this.components = new Map();
  items.forEach(v => components.set(v, new ItemData(v, AdditionsItem)));

  const {production, product_params} = dp;

  // фильтруем по пустой ведущей продукции
  dp._data._loading = true;
  dp.calc_order.production.find_rows({ordn: $p.utils.blank.guid}, (row) => {
    const {characteristic} = row;
    const {insert_type} = characteristic.origin;
    const cmp = components.get(insert_type);
    // фильтруем по типу вставки
    if(!characteristic.empty() && !characteristic.origin.empty() && items.indexOf(insert_type) != -1) {
      // добавляем параметры
      const elm = production.count() + 1;
      characteristic.params.forEach(({param, value}) => {
        product_params.add({elm, param, value});
      });
      // добавляем строку продукции
      production.add({
        characteristic,
        inset: characteristic.origin,
        clr: characteristic.clr,
        len: row.len,
        height: row.width,
        quantity: row.quantity,
        note: row.note,
      }, false, cmp.ProductionRow);
      // счетчик строк данного типа
      cmp.count++;
    }
  });
  dp._data._loading = false;
}

export function find_inset(insert_type) {
  if(!this._inset) {
    this._inset = $p.cat.inserts.find({available: true, insert_type});
  }
  return this._inset;
}

function mapStateToProps(state, props) {
  return {
    handleCalck() {
      const {dp} = this.additions;
      return dp.calc_order.process_add_product_list(dp)
        .then(ax => Promise.all(ax))
        .then(() => {
          dp.calc_order.production.sync_grid(props.dialog.wnd.elmnts.grids.production);
        });
    },
    handleCancel() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    }
  };
}

// function mapDispatchToProps(dispatch) {
//   return {};
// }

export default compose(
  withStyles,
  connect(mapStateToProps /*, mapDispatchToProps */),
);
