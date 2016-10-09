/**
 * ### Модуль менеджера и документа _Приходный кассовый ордер_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_debit_cash_order
 * Created 10.10.2016
 */

// подписки на события
$p.doc.debit_cash_order.on({

	// перед записью рассчитываем итоги
	before_save: function (attr) {

		this.doc_amount = this.payment_details.aggregate([], "amount");

	},

});


