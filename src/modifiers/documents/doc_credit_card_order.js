/**
 * ### Модуль менеджера и документа _Оплата платежной картой_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module doc_credit_card_order
 * Created 10.10.2016
 */

// подписки на события
$p.doc.credit_card_order.on({

	// перед записью рассчитываем итоги
	before_save: function (attr) {

		this.doc_amount = this.payment_details.aggregate([], "amount");

	},

});


