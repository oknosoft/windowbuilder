
/**
 * Подмешивается в конец init-файла
 *
 */

class ParamsRow extends TabularSectionRow{
  get param(){return this._getter('param')}
  set param(v){this._setter('param',v)}
  get value(){return this._getter('value')}
  set value(v){this._setter('value',v)}
}

class ElmParamsRow extends ParamsRow{
  get elm(){return this._getter('elm')}
  set elm(v){this._setter('elm',v)}
}

class HideParamsRow extends ParamsRow{
  get hide(){return this._getter('hide')}
  set hide(v){this._setter('hide',v)}
}

class HideForciblyParamsRow extends HideParamsRow{
  get forcibly(){return this._getter('forcibly')}
  set forcibly(v){this._setter('forcibly',v)}
}

class SelectionParamsRow extends ElmParamsRow{
  get comparison_type(){return this._getter('comparison_type')}
  set comparison_type(v){this._setter('comparison_type',v)}
  get txt_row(){return this._getter('txt_row')}
  set txt_row(v){this._setter('txt_row',v)}
}

class CatFormulasParamsRow extends ParamsRow{}

class DpBuyers_orderProduct_paramsRow extends ElmParamsRow{
  get hide(){return this._getter('hide')}
  set hide(v){this._setter('hide',v)}
}

class CatProduction_paramsFurn_paramsRow extends HideForciblyParamsRow{}

class CatProduction_paramsProduct_paramsRow extends HideForciblyParamsRow{
  get elm(){return this._getter('elm')}
  set elm(v){this._setter('elm',v)}
}

class CatInsertsProduct_paramsRow extends HideForciblyParamsRow{
  get pos(){return this._getter('pos')}
  set pos(v){this._setter('pos',v)}
  get list(){return this._getter('list')}
  set list(v){this._setter('list',v)}
}

class CatCnnsSizesRow extends SelectionParamsRow{}

class CatInsertsSelection_paramsRow extends SelectionParamsRow{}

class CatCnnsSelection_paramsRow extends SelectionParamsRow{}

class CatFurnsSelection_paramsRow extends SelectionParamsRow{
  get dop(){return this._getter('dop')}
  set dop(v){this._setter('dop',v)}
}

class Payment_detailsRow extends TabularSectionRow{
  get cash_flow_article(){return this._getter('cash_flow_article')}
  set cash_flow_article(v){this._setter('cash_flow_article',v)}
  get trans(){return this._getter('trans')}
  set trans(v){this._setter('trans',v)}
  get amount(){return this._getter('amount')}
  set amount(v){this._setter('amount',v)}
}

class DocCredit_card_orderPayment_detailsRow extends Payment_detailsRow{}
class DocDebit_bank_orderPayment_detailsRow extends Payment_detailsRow{}
class DocCredit_bank_orderPayment_detailsRow extends Payment_detailsRow{}
class DocDebit_cash_orderPayment_detailsRow extends Payment_detailsRow{}
class DocCredit_cash_orderPayment_detailsRow extends Payment_detailsRow{}

Object.assign($p, {
  CatFormulasParamsRow,
  DpBuyers_orderProduct_paramsRow,
  CatProduction_paramsFurn_paramsRow,
  CatProduction_paramsProduct_paramsRow,
  CatInsertsProduct_paramsRow,
  CatCnnsSizesRow,
  CatInsertsSelection_paramsRow,
  CatCnnsSelection_paramsRow,
  CatFurnsSelection_paramsRow,
  DocCredit_card_orderPayment_detailsRow,
  DocDebit_bank_orderPayment_detailsRow,
  DocCredit_bank_orderPayment_detailsRow,
  DocDebit_cash_orderPayment_detailsRow,
  DocCredit_cash_orderPayment_detailsRow,
});

