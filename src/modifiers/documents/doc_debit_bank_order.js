/**
 * ### Модуль менеджера и документа _Платежное поручение входящее_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_debit_bank_order
 *
 * Created 10.10.2016
 */

// перед записью рассчитываем итоги
$p.DocDebit_bank_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};
