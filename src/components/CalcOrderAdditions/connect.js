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

// подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
$p.md.once('predefined_elmnts_inited', () => {
  $p.cat.scheme_settings.find_schemas('dp.buyers_order.production');
});


class ItemData {
  constructor(item, Renderer = AdditionsItem) {

    this.Renderer = Renderer;
    this.count = 0;

    // индивидуальные классы строк
    class ItemRow extends $p.DpBuyers_orderProductionRow {
    }

    this.Row = ItemRow;

    // получаем возможные параметры вставок данного типа
    const prms = new Set();
    $p.cat.inserts.find_rows({available: true, insert_type: item}, (inset) => {
      inset.used_params.forEach((param) => {
        !param.is_calculated && prms.add(param);
      });
      inset.specification.forEach(({nom}) => {
        const {used_params} = nom;
        used_params && used_params.forEach((param) => {
          !param.is_calculated && prms.add(param);
        });
      });
    });

    // индивидуальные метаданные строк
    const meta = $p.dp.buyers_order.metadata('production');
    this.meta = meta._clone();

    // отбор по типу вставки
    this.meta.fields.inset.choice_params[0].path = item;

    for (const param of prms) {

      // корректируем схему
      $p.cat.scheme_settings.find_rows({obj: 'dp.buyers_order.production', name: item.name}, (scheme) => {
        if(!scheme.fields.find({field: param.ref})) {
          scheme.fields.add({
            field: param.ref,
            caption: param.caption,
            use: true,
          });
        }
      });

      // корректируем метаданные
      const mf = this.meta.fields[param.ref] = {
        synonym: param.caption,
        type: param.type,
      };
      if(param.type.types.some(type => type === 'cat.property_values')) {
        mf.choice_params = [{name: 'owner', path: param}];
      }

      // корректируем класс строки
      Object.defineProperty(ItemRow.prototype, param.ref, {
        get: function () {
          return this._getter(param.ref);
        },
        set: function (v) {
          this._setter(param.ref, v);
        }
      });
    }

  }
}

// заполняет компонент данными
export function fill_data(ref) {

  const {Подоконник, Водоотлив, МоскитнаяСетка, Откос, Профиль, Монтаж, Доставка, Набор} = $p.enm.inserts_types;
  const items = this.items = [Подоконник, Водоотлив, МоскитнаяСетка, Откос, Профиль, Монтаж, Доставка, Набор];
  const dp = this.dp = $p.dp.buyers_order.create();
  dp.calc_order = $p.doc.calc_order.by_ref[ref];
  const components = this.components = new Map([
    [Подоконник, new ItemData(Подоконник)],
    [Водоотлив, new ItemData(Водоотлив)],
    [МоскитнаяСетка, new ItemData(МоскитнаяСетка)],
    [Откос, new ItemData(Откос)],
    [Профиль, new ItemData(Профиль)],
    [Монтаж, new ItemData(Монтаж)],
    [Доставка, new ItemData(Доставка)],
    [Набор, new ItemData(Набор)],
  ]);

  const {production} = dp;
  const meta = dp._metadata('production');
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
