/**
 * Код печатной формы договора
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_calc_order_contract1
 * Created 17.04.2016
 */

function fake(obj) {

	var templates = this._template.content.children,
		tpl_header = templates.header,
		tpl_product = templates.product,
		tpl_product_description = templates.product_description,
		doc = new $p.SpreadsheetDocument(),
		print_data;

	// получаем данные печати
	return obj.print_data.then(function (res) {

		print_data = res;

		// выводим заголовок
		doc.put(dhx4.template(tpl_header.innerHTML, print_data), tpl_header.attributes);

		// получаем объекты продукций
		var aobjs = [];
		obj.production.forEach(function (row) {
			if(!row.characteristic.empty())
				aobjs.push($p.cat.characteristics.get(row.characteristic.ref, true, true));
		});
		
		return Promise.all(aobjs);

	})
		.then(function () {

			// выводим эскизы и описания продукций
			obj.production.forEach(function (row) {

				if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

					if(print_data.ПродукцияЭскизы[row.characteristic.ref]){
						tpl_product.children[0].innerHTML =  $p.iface.scale_svg(print_data.ПродукцияЭскизы[row.characteristic.ref], 170, 0);

					}else
						tpl_product.children[0].innerHTML = "";

					tpl_product.children[1].innerHTML = dhx4.template(tpl_product_description.innerHTML, obj.product_description(row));

					doc.put(tpl_product.innerHTML, tpl_product.attributes);

				}


			});

			// выводим табличную часть


			// выводим подвал

			return doc;

		});

}