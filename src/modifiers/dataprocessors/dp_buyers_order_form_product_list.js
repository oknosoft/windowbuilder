/**
 * ### Форма ДобавитьСписокПродукции
 * В этой форме пользователь задаёт размеры и параметры вставок, по которым будет сформирована продукция заказа
 *
 *
 * Created 13.05.2016
 *
 * @module dp_buyers_order
 */

class CalcOrderFormProductList {

  constructor(pwnd, calc_order) {

    this.calc_order = calc_order;
    this.dp = $p.dp.buyers_order.create();

    this.attr = {
      // командная панель формы
      toolbar_struct: $p.injected_data["toolbar_product_list.xml"],

      // переопределяем обработчики кнопок командной панели формы
      toolbar_click: this.toolbar_click.bind(this),

      // переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_pg_header: this.draw_pg_header.bind(this),

      // переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_tabular_sections: this.draw_tabular_sections.bind(this)

    };

    this.dp.presentation = calc_order.presentation + " - добавление продукции";

    this.dp.form_obj(pwnd, this.attr);


  }

  // навешиваем обработчики событий на элементы управления
  draw_pg_header(dp, wnd) {

  }

  // переопределяем страницы формы
  draw_tabular_sections(dp, wnd, tabular_init) {

    this.wnd = wnd;
    wnd.maximize();

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

  // команды формы
  toolbar_click(btn_id) {
    if(btn_id == "btn_ok"){
      this.dp._data._modified = false;
      this.wnd.close();
      this.calc_order.process_add_product_list(this.dp);
      this.calc_order = this.wnd = this.dp = this.attr = null;
    }
  }

}


