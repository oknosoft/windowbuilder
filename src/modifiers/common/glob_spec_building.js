/* eslint-disable no-multiple-empty-lines,space-infix-ops */
/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module  glob_spec_building
 * Created 26.05.2015
 */

class SpecBuilding {

  constructor($p) {

  }

  /**
   * Рассчитывает спецификацию в строке документа Расчет
   * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
   * @param prm
   * @param cancel
   */
  calc_row_spec (prm, cancel) {

  }

  /**
   * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
   * Синхронный метод, но возвращает массив промисов
   * @param attr {Object}
   * @param with_price {Boolean}
   */
  specification_adjustment (attr, with_price) {

    const {cat, pricing} = $p;
    const {scheme, calc_order_row, spec, save} = attr;
    const calc_order = calc_order_row._owner._owner;
    const order_rows = new Map();
    const adel = [];
    const ox = calc_order_row.characteristic;
    const nom = ox.empty() ? calc_order_row.nom : (calc_order_row.nom = ox.owner);

    // типы цен получаем заранее, т.к. они могут пригодиться при расчете корректировки спецификации
    pricing.price_type(attr);

    // удаляем из спецификации строки, добавленные предыдущими корректировками
    spec.find_rows({ch: {in: [-1, -2]}}, (row) => adel.push(row));
    adel.forEach((row) => spec.del(row, true));

    // находим привязанные к продукции вставки и выполняем
    // здесь может быть как расчет допспецификации, так и доппроверки корректности параметров и геометрии
    cat.insert_bind.insets(ox).forEach(({inset, elm_type}) => {

      const elm = {
        _row: {},
        elm: 0,
        get perimeter() {return scheme ? scheme.perimeter : []},
        clr: ox.clr,
        project: scheme,
      };
      const len_angl = {
        angle: 0,
        alp1: 0,
        alp2: 0,
        len: 0,
        cnstr: 0,
        origin: inset,
      };
      // рассчитаем спецификацию вставки
      inset.calculate_spec({elm, len_angl, ox, spec});

    });

    // синхронизируем состав строк - сначала удаляем лишние
    if(!ox.empty()){
      adel.length = 0;
      calc_order.production.forEach((row) => {
        if (row.ordn === ox){
          if (ox._order_rows.indexOf(row.characteristic) === -1){
            adel.push(row);
          }
          else {
            order_rows.set(row.characteristic, row);
          }
        }
      });
      adel.forEach((row) => calc_order.production.del(row.row-1));
    }

    const ax = [];

    // затем, добавляем в заказ строки, назначенные к вытягиванию
    ox._order_rows && ox._order_rows.forEach((cx) => {
      const row = order_rows.get(cx) || calc_order.production.add({characteristic: cx});
      row.nom = cx.owner;
      row.unit = row.nom.storage_unit;
      row.ordn = ox;
      row.len = cx.x;
      row.width = cx.y;
      row.s = cx.s;
      row.qty = calc_order_row.qty;
      row.quantity = calc_order_row.quantity;

      save && ax.push(cx.save());
      order_rows.set(cx, row);
    });
    if(order_rows.size){
      attr.order_rows = order_rows;
    }

    if(with_price){
      // рассчитываем плановую себестоимость
      pricing.calc_first_cost(attr);

      // рассчитываем стоимость продажи
      pricing.calc_amount(attr);
    }

    if(save && !attr.scheme && (ox.is_new() || ox._modified)){
      ax.push(ox.save());
    }

    return ax;
  }

}

// Экспортируем экземпляр модуля
$p.spec_building = new SpecBuilding($p);
