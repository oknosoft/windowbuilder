/**
 * Модификаторы обработки _Заказ покупателя_
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module dp_buyers_order
 * Created 13.05.2016
 */

$p.modifiers.push(

	function($p) {

		var _mgr = $p.dp.buyers_order;
			
		// переопределяем свойства цвет и система - они будут псевдонимами свойств текущей характеристики
		
		var obj_constructor =  _mgr._obj_constructor.prototype;
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

		
		_mgr.unload_obj = function () {
			
		};

		/**
		 * форма ДобавитьСписокПродукции. публикуемый метод: $p.dp.buyers_order.form_product_list(o, pwnd, attr)
		 * @param pwnd
		 * @param attr
		 */
		_mgr.form_product_list = function (pwnd, callback) {

			var o = _mgr.create(), 
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
);
