/**
 * Код печатной формы договора
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_calc_order_contract1
 * Created 17.04.2016
 */

function fake(obj) {

	var templates = this._template.content.children,
		header = templates.header,
		doc = new $p.SpreadsheetDocument();

// получаем данные печати
	return obj.print_data.then(function (print_data) {

		// выводим заголовок
		doc.put(dhx4.template(header.innerHTML, print_data), header.attributes);

		// выводим табличную часть


		// выводим подвал

		return doc;

	});
	
}