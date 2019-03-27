/**
 * ### Модуль менеджера и документа _Приходный кассовый ордер_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_debit_cash_order
 *
 * Created 10.10.2016
 */

import {FrmObj, before_save} from './common';

export default function ({doc, DocDebit_cash_order}) {

  DocDebit_cash_order.prototype.before_save = before_save;

  doc.debit_cash_order.FrmObj = FrmObj;
}
