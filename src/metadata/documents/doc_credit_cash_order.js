/**
 * ### Модуль менеджера и документа _Расходный кассовый ордер_
 *
 * @module doc_credit_cash_order
 *
 * Created by Evgeniy Malyarov on 03.05.2019.
 */

import {before_save} from './common';
import MoneyDoc from '../../components/MoneyDoc';

export default function ({doc, DocCredit_cash_order}) {

  DocCredit_cash_order.prototype.before_save = before_save;

  doc.credit_cash_order.FrmObj = MoneyDoc;
}
