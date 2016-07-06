/**
 * ### Код печатной формы нарезки профиля без оптимизации
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 17.04.2016
 *
 * @module doc_calc_order_cut1
 */

function fake(obj) {

	var templates = this._template.content.children,
		doc = new $p.SpreadsheetDocument(),
		print_data;

	function draw_cut(o, table_div, quantity) {

		table_div.innerHTML = templates.table.innerHTML;

		var table_table = table_div.querySelector("table"),
			tpl_table_row_cut = table_table.querySelector("tbody").querySelector(".row_cut"),
			tpl_table_row_nom = table_table.querySelector("tbody").querySelector(".row_nom");
		tpl_table_row_cut.parentElement.removeChild(tpl_table_row_cut);
		tpl_table_row_nom.parentElement.removeChild(tpl_table_row_nom);

		// сворачиваем по номенклатурам с профиль + армирование
		var noms = $p.wsql.alasql("select nom, characteristic, sum(qty) as qty, sum(len * qty) as len from ? " +
			"where len > 0 and width = 0 group by nom, characteristic", [o.specification._obj]),
			profiles = ["Рама","Створка","Импост","Штульп","Штапик","Порог","Арматура","Подставочник","Добор","Соединитель"];

		noms.forEach(function (row) {

			var table_row = document.createElement("TR"),
				nom = $p.cat.nom.get(row.nom),
				cx = $p.is_empty_guid(row.characteristic) ? "" : " " + $p.cat.nom.get(row.characteristic, false, true),
				len = (row.len + (row.qty + 1) * nom.saw_width).round(2),
				row_data = {
					Материал: "<b>" + (nom.article || nom.name) + " " + cx + "</b> <span style='float: right;'>" +
						len * quantity + " м.п., " + row.qty * quantity + " шт., " + (len * quantity * 1000 / nom.len).round(1) + " хлыст.</span>"
				};

			if(profiles.indexOf(nom.elm_type.ref) != -1){
				table_row.innerHTML = dhx4.template(tpl_table_row_nom.innerHTML, row_data);
				table_table.appendChild(table_row);

				var rows = $p.wsql.alasql("select len, alp1, alp2, sum(qty) as qty from ? " +
						"where nom = ? and characteristic = ? group by len, alp1, alp2 order by len desc",
					[o.specification._obj, row.nom, row.characteristic]);

				rows.forEach(function (row) {
					var table_row = document.createElement("TR");
					row.len = (row.len * 1000).round(0);
					row.qty = row.qty * quantity;
					table_row.innerHTML = dhx4.template(tpl_table_row_cut.innerHTML, row);
					table_table.appendChild(table_row);
					
				});
				
			}

		});
	}

	// получаем данные печати
	return obj.print_data.then(function (res) {

		print_data = res;

		// выводим заголовок
		doc.put(dhx4.template(templates.header.innerHTML, print_data), templates.header.attributes);

		// получаем объекты продукций
		var aobjs = [];
		obj.production.forEach(function (row) {
			if(!row.characteristic.empty())
				aobjs.push($p.cat.characteristics.get(row.characteristic.ref, true, true));
		});
		
		return Promise.all(aobjs);

	})
		.then(function () {

			// выводим эскизы и табличную часть напиловки

			var tpl_product = templates.product;

			obj.production.forEach(function (row) {

				if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory){

					// эскиз
					if(print_data.ПродукцияЭскизы[row.characteristic.ref]){
						tpl_product.children[0].innerHTML = $p.iface.scale_svg(
							print_data.ПродукцияЭскизы[row.characteristic.ref], {height: 220, width: 280, zoom: 0.14}, 0);

					}else
						tpl_product.children[0].innerHTML = "";

					// описание изделия
					var product_info = document.createElement("DIV");
					product_info.innerHTML = dhx4.template(templates.product_description.innerHTML, obj.row_description(row));
					tpl_product.children[0].appendChild(product_info);

					// табчасть напиловки
					draw_cut(row.characteristic, tpl_product.children[1], row.quantity);


					// собственно, вывод строки продукции с напиловкой в отчет
					doc.put(tpl_product.innerHTML, tpl_product.attributes);
				}

			});

			// возаращаем сформированный документ
			return doc;
		});
}