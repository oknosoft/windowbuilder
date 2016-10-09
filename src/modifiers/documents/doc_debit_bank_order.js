/**
 * ### Модуль менеджера и документа _Платежное поручение входящее_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_debit_bank_order
 * Created 10.10.2016
 */

// подписки на события
$p.doc.debit_bank_order.on({

	// перед записью рассчитываем итоги
	before_save: function (attr) {

		this.doc_amount = this.payment_details.aggregate([], "amount");

	},

});


