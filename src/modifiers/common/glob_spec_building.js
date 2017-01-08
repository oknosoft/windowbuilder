/**
 * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
 * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
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
   * @param attr
   */
  specification_adjustment (attr) {

    var ox = attr.calc_order_row.characteristic,
      calc_order = attr.calc_order_row._owner._owner,
      order_rows = {}, adel = [];

    // удаляем строки, добавленные предыдущими корректировками
    attr.spec.find_rows({ch: {in: [-1,-2]}}, function (row) {
      adel.push(row);
    });
    adel.forEach(function (row) {
      attr.spec.del(row, true);
    });


    // синхронизируем состав строк - сначала удаляем лишние
    adel.length = 0;
    calc_order.production.forEach(function (row) {
      if(row.ordn == ox){
        if(ox._order_rows.indexOf(row.characteristic) == -1){
          adel.push(row);
        }else {
          order_rows[row.characteristic.ref] = row;
        }
      }
    })
    adel.forEach(function (row) {
      calc_order.production.del(row.row-1)
    })

    ox._order_rows.forEach(function (cx) {
      var row = order_rows[cx.ref] || calc_order.production.add({
          characteristic: cx
        });
      row.nom = cx.owner;
      row.unit = row.nom.storage_unit;
      row.ordn = ox;
      row.len = cx.x;
      row.width = cx.y;
      row.s = cx.s;
      row.qty = attr.calc_order_row.qty;
      row.quantity = attr.calc_order_row.quantity;

      cx.save();
      order_rows[cx.ref] = row;
    })

    if(Object.keys(order_rows).length){
      attr.order_rows = order_rows;
    }
  }

}

// Экспортируем экземпляр модуля
$p.spec_building = new SpecBuilding($p);



