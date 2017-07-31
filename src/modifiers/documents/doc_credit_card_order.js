/**
 * ### Модуль менеджера и документа _Оплата платежной картой_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_credit_card_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocCredit_card_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};
