/**
 * Модификаторы обработки _Заказ покупателя_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module dp_buyers_order
 * Created 13.05.2016
 */

$p.modifiers.push(

	function($p) {

		var obj_constructor =  $p.dp.buyers_order._obj_constructor.prototype;

		delete obj_constructor.clr;
		delete obj_constructor.sys;
		
		
		obj_constructor.__define({
			
			clr: {
				get: function () {
					return this.characteristic.clr;
				},
				set: function (v) {
					
					if(this.characteristic.clr == v)
						return;

					Object.getNotifier(this).notify({
						type: 'update',
						name: 'clr',
						oldValue: this.characteristic.clr
					});
					this.characteristic.clr = v;
					this._data._modified = true;
				}
			},

			sys: {
				get: function () {
					return this.characteristic.sys;
				},
				set: function (v) {

					if(this.characteristic.sys == v)
						return;

					Object.getNotifier(this).notify({
						type: 'update',
						name: 'sys',
						oldValue: this.characteristic.sys
					});
					this.characteristic.sys = v;
					this._data._modified = true;
				}
			}
		});
	}
);
