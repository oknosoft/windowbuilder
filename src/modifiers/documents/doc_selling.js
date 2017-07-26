/**
 * ### Модуль менеджера и документа _Реализация товаров и услуг_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_selling
 *
 * Created 10.10.2016
 */

// подписки на события
$p.doc.selling.on({

	// перед записью рассчитываем итоги
	before_save: function (attr, obj) {
    obj.doc_amount = obj.goods.aggregate([], "amount") + obj.services.aggregate([], "amount");
	},

});


