/**
 * ### Модуль менеджера и документа _Платежное поручение входящее_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_debit_bank_order
 *
 * Created 10.10.2016
 */

import {FrmObj, before_save} from './common';

export default function ({doc, DocDebit_bank_order}) {

  DocDebit_bank_order.prototype.before_save = before_save;

  doc.debit_bank_order.FrmObj = FrmObj;
}
