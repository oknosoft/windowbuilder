/**
 * ### Модификаторы обработки _Заказ покупателя_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */


// переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
$p.DpBuyers_order = class DpBuyers_order extends $p.DpBuyers_order {

  get clr() {
    return this.characteristic.clr;
  }
  set clr(v) {
    const {characteristic, _data} = this;
    if((!v && characteristic.empty()) || characteristic.clr == v){
      return;
    }
    this._manager.emit_async('update', this, {clr: characteristic.clr});
    characteristic.clr = v;
    _data._modified = true;
  }

  get sys() {
    return this.characteristic.sys;
  }
  set sys(v) {
    const {characteristic, _data} = this;
    if((!v && characteristic.empty()) || characteristic.sys == v){
      return;
    }
    this._manager.emit_async('update', this, {sys: characteristic.sys});
    characteristic.sys = v;
    _data._modified = true;
  }

  get extra_fields() {
    return this.characteristic.params;
  }
}

