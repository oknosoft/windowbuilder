/**
 * ### Модуль менеджера и документа _Реализация товаров и услуг_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_selling
 *
 * Created 10.10.2016
 */


// перед записью рассчитываем итоги
$p.DocSelling.prototype.before_save = function () {
  this.doc_amount = this.goods.aggregate([], 'amount') + this.services.aggregate([], 'amount');
};


