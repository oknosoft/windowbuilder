/**
 * ### Модификаторы обработки _Заказ покупателя_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */


$p.dp.buyers_order.__define({

	unload_obj: {
		value: function () {

		}
	},

	/**
	 * форма ДобавитьСписокПродукции. публикуемый метод: $p.dp.buyers_order.form_product_list(o, pwnd, attr)
	 * @param pwnd
	 * @param attr
	 */
	form_product_list: {
		value: function (pwnd, callback) {

			var o = this.create(),
				wnd,
				attr = {

					// командная панель формы
					toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

					// переопределяем обработчики кнопок командной панели формы
					toolbar_click: function (btn_id) {
						if(btn_id == "btn_ok"){
							o._data._modified = false;
							wnd.close();
							callback(o.production);
						}
					},

					// переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
					draw_pg_header: function (o, wnd) {
						wnd.elmnts.tabs.tab_header.hide();
						wnd.elmnts.frm_tabs.tabsArea.classList.add("tabs_hidden");
						wnd.elmnts.frm_toolbar.hideItem("bs_print");
					}
				};

			// переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
			// attr.draw_tabular_sections = function (o, wnd, tabular_init) {
			//
			// };


			o.presentation = "Добавление продукции с параметрами";

			o.form_obj(pwnd, attr)
				.then(function (res) {
					wnd = res.wnd
				});

		}
	}
});

// переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
delete $p.DpBuyers_order.prototype.clr;
delete $p.DpBuyers_order.prototype.sys;
$p.DpBuyers_order.prototype.__define({

	clr: {
		get: function () {
			return this.characteristic.clr;
		},
		set: function (v) {
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
	},

	sys: {
		get: function () {
			return this.characteristic.sys;
		},
		set: function (v) {
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
	}
});
