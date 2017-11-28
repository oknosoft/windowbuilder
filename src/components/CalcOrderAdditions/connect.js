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

// компилированный запрос для поиска настроек в ОЗУ
export const alasql_schemas = $p.wsql.alasql.compile('select * from cat_scheme_settings where obj="dp.buyers_order.production"');

// заполняет компонент данными
export function fill_data(ref) {

  const {Подоконник, Водоотлив, МоскитнаяСетка, Откос, Профиль, Монтаж, Доставка} = $p.enm.inserts_types;
  const items = this.items = [Подоконник, Водоотлив, МоскитнаяСетка, Откос, Профиль, Монтаж, Доставка];
  const dp = this.dp = $p.dp.buyers_order.create();
  dp.calc_order = $p.doc.calc_order.by_ref[ref];
  const components = this.components = new Map([
    [Подоконник, {Renderer: AdditionsItem, count: 0, meta: null}],
    [Водоотлив, {Renderer: AdditionsItem, count: 0, meta: null}],
    [МоскитнаяСетка, {Renderer: AdditionsItem, count: 0, meta: null}],
    [Откос, {Renderer: AdditionsItem, count: 0, meta: null}],
    [Профиль, {Renderer: AdditionsItem, count: 0, meta: null}],
    [Монтаж, {Renderer: AdditionsItem, count: 0, meta: null}],
    [Доставка, {Renderer: AdditionsItem, count: 0, meta: null}],
  ]);
  this.state = {schemas: null};

  const {production} = dp;
  const _meta = dp._metadata('production');
  for (const item of items) {
    const cmp = components.get(item);
    // индивидуальные метаданные для отбора по типу вставки
    cmp.meta = _meta._clone();
    cmp.meta.fields.inset.choice_params[0].path = item;
  }
  // фильтруем по пустой ведущей продукции
  dp.calc_order.production.find_rows({ordn: $p.utils.blank.guid}, (row) => {
    const {characteristic} = row;
    const {insert_type} = characteristic.origin;
    // фильтруем по типу вставки
    if(!characteristic.empty() && !characteristic.origin.empty() && items.indexOf(insert_type) != -1) {
      production.add({
        characteristic,
        inset: characteristic.origin,
        clr: characteristic.clr,
        len: row.len,
        height: row.width,
        quantity: row.quantity,
        note: row.note,
      });
      // счетчик строк данного типа
      components.get(insert_type).count++;
    }
  });
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
        .then(ax => {
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
