/**
 * ### Форма добавления услуг и комплектуюущих
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import withStyles from './styles';
import {withMobileDialog} from 'material-ui/Dialog';
import compose from 'recompose/compose';

import ItemSill from './AdditionsItemSill';

// компилированный запрос для поиска настроек в ОЗУ
export const alasql_schemas = $p.wsql.alasql.compile('select * from cat_scheme_settings where obj="dp.buyers_order.production"');

// заполняет компонент данными
export function fill_data(ref) {
  const {Подоконник, Водоотлив, МоскитнаяСетка, Откос, Монтаж} = $p.enm.inserts_types;
  const items = this.items = [Подоконник, Водоотлив, МоскитнаяСетка, Откос, Монтаж];
  this.dp = $p.dp.buyers_order.create();
  this.dp.calc_order = $p.doc.calc_order.by_ref[ref];
  const components = this.components = new Map([
    [Подоконник, {
      Renderer: ItemSill,
      count: 0
    }],
  ]);
  this.state = {schemas: null};

  const {production} = this.dp;
  const _meta = this.dp._metadata('production');
  this.dp.calc_order.production.find_rows({ordn: $p.utils.blank.guid}, (row) => {
    const {characteristic} = row;
    const {insert_type} = characteristic.origin;
    if(!characteristic.empty() && !characteristic.origin.empty() && items.indexOf(insert_type) != -1){
      production.add({
        characteristic,
        inset: characteristic.origin,
        clr: characteristic.clr,
        len: row.len,
        height: row.width,
        quantity: row.quantity,
        note: row.note,
      });
      const cmp = components.get(insert_type);
      if(cmp){
        // счетчик строк данного типа
        cmp.count++;
        // индивидуальные метаданные для отбора по типу вставки
        if(!cmp.meta) {
          cmp.meta = _meta._clone();
          cmp.meta.fields.inset.choice_params[0].path = insert_type;
        }
      }
    }
  })
}

function mapStateToProps (state, props) {
  return {
    handleCalck() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
      });
    },
    handleOk() {
      props.handlers.handleIfaceState({
        component: 'DataObjPage',
        name: 'dialog',
        value: null,
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
};

function mapDispatchToProps(dispatch) {
  return {

  };
}

export default compose(
  withStyles,
  withMobileDialog(),
  connect(mapStateToProps, mapDispatchToProps),
);
