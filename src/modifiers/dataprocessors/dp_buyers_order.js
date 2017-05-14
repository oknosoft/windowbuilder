/**
 * ### Модификаторы обработки _Заказ покупателя_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */


(($p) => {

  const Proto = $p.DpBuyers_order;

  // переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
  delete Proto.prototype.clr;
  delete Proto.prototype.sys;

  // переопределяем прототип
  $p.DpBuyers_order = class DpBuyers_order extends Proto {

    get clr() {
      return this.characteristic.clr;
    }
    set clr(v) {
      const {characteristic, _data} = this;
      if((!v && characteristic.empty()) || characteristic.clr == v){
        return;
      }
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'clr',
        oldValue: characteristic.clr
      });
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
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'sys',
        oldValue: characteristic.sys
      });
      characteristic.sys = v;
      _data._modified = true;
    }

    get extra_fields() {
      return this.characteristic.params;
    }
  }

})($p);
