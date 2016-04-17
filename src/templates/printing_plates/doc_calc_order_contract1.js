/**
 * Код печатной формы договора
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_calc_order_contract1
 * Created 17.04.2016
 */

var templates = this._template.content.children,
	header = templates.header,
	doc = new $p.SpreadsheetDocument();

// выводим заголовок
doc.put(dhx4.template(header.innerHTML, obj), header.attributes);

return Promise.resolve(doc);