/**
 * ### Модуль менеджера и документа _Оплата платежной картой_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * @module doc_credit_card_order
 *
 * Created 10.10.2016
 */


import {before_save} from './common';
import MoneyDoc from '../../components/MoneyDoc';

export default function ({doc, DocCredit_card_order}) {

  DocCredit_card_order.prototype.before_save = before_save;

  doc.credit_card_order.FrmObj = MoneyDoc;
}
