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
		value: async function (pwnd, calc_order, callback) {

			const dp = this.create();

      const attr = {
        // командная панель формы
				toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

				// переопределяем обработчики кнопок командной панели формы
				toolbar_click(btn_id) {
				  if(btn_id == "btn_ok"){
				    dp._data._modified = false;
            attr.wnd.close();
				    callback(dp.production);
				  }
        },

				// переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
				draw_pg_header(o, wnd) {

        },

        // переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
        draw_tabular_sections(dp, wnd, tabular_init) {

          attr.wnd = wnd;

          const {elmnts} = wnd;
          elmnts.frm_toolbar.hideItem("bs_print");

          // добавляем layout на первую страницу
          wnd.detachObject(true);
          wnd.maximize();
          elmnts.layout = wnd.attachLayout({
            pattern: "2E",
            cells: [{
              id: "a",
              text: "Продукция",
              header: false,
            }, {
              id: "b",
              text: "Параметры",
              header: false,
            }],
            offsets: {top: 0, right: 0, bottom: 0, left: 0}
          });

          // добавляем табчасть продукции
          elmnts.grids.production = elmnts.layout.cells('a').attachTabular({
            obj: dp,
            ts: 'production',
            pwnd: wnd,
          });

          // добавляем табчасть пареметров
          elmnts.grids.params = elmnts.layout.cells('b').attachHeadFields({
            obj: dp,
            ts: 'product_params',
            pwnd: wnd,
            selection: {elm: -1},
            oxml: {'Параметры продукции': []},
          });

          const height = elmnts.layout.cells('a').getHeight() + elmnts.layout.cells('b').getHeight();
          elmnts.layout.cells('a').setHeight(height * 0.7);
        }

      };

			dp.presentation = calc_order.presentation + " - добавление продукции";

			dp.form_obj(pwnd, attr).then((res) => {
			  res.wnd.maximize();
			});

		}
	}
});


