/**
 * ### Код печатной формы счета-заказа
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 17.04.2016
 *
 * @module doc_calc_order_invoice2
 */

function fake(obj) {

  const templates = this._template.content.children;
  const doc = new $p.SpreadsheetDocument();

  // получаем данные печати
  return obj.print_data().then((res) => {

    // выводим заголовок
    doc.put(dhx4.template(templates.header.innerHTML, res), templates.header.attributes);

    // получаем объекты продукций
    const aobjs = [];
    obj.production.forEach((row) => {
      if(!row.characteristic.empty())
        aobjs.push($p.cat.characteristics.get(row.characteristic.ref, true, true));
    });

    return Promise.all(aobjs)
      .then(() => res)

  })
    .then((print_data) => {

      // выводим эскизы и описания продукций
      const tpl_product = templates.product;
      obj.production.forEach((row) => {
        if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){
          if(print_data.ПродукцияЭскизы[row.characteristic.ref]){
            tpl_product.children[0].innerHTML =  $p.iface.scale_svg(print_data.ПродукцияЭскизы[row.characteristic.ref], 170, 0);
          }
          else{
            tpl_product.children[0].innerHTML = "";
          }
          tpl_product.children[1].innerHTML = dhx4.template(templates.product_description.innerHTML, obj.row_description(row));
          doc.put(tpl_product.innerHTML, tpl_product.attributes);
        }
      });

      // выводим табличную часть
      const table_div = document.createElement("div");
      const table_footer = document.createElement("div");

      table_div.innerHTML = templates.table.innerHTML;
      const table_table = table_div.querySelector("table");
      const tpl_table_row = table_table.querySelector("tbody").querySelector("tr");

      tpl_table_row.parentElement.removeChild(tpl_table_row);

      obj.production.forEach((row) => {
        const table_row = document.createElement("TR");
        table_row.innerHTML = dhx4.template(tpl_table_row.innerHTML, obj.row_description(row));
        table_table.appendChild(table_row);
      });

      // выводим подвал табличной части в table_div
      table_footer.innerHTML = dhx4.template(templates.table_footer.innerHTML, print_data);
      table_div.appendChild(table_footer);

      // собственно, вывод табличной части в отчет
      doc.put(table_div.innerHTML, table_div.attributes);

      // выводим подвал отчета
      doc.put(dhx4.template(templates.footer.innerHTML, print_data), templates.footer.attributes);

      // возаращаем сформированный документ
      return doc;

    });

}
