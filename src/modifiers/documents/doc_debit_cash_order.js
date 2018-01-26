/**
 * ### Модуль менеджера и документа _Приходный кассовый ордер_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_debit_cash_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocDebit_cash_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};
