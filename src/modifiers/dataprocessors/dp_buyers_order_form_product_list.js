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

    this.dp = $p.dp.buyers_order.create();
    this.dp.calc_order = calc_order;

    this.attr = {

      // командная панель формы
      toolbar_struct: $p.injected_data['toolbar_product_list.xml'],

      // переопределяем обработчики кнопок командной панели формы
      toolbar_click: this.toolbar_click.bind(this),

      // переопределяем метод отрисовки шапки документа, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_pg_header: this.draw_pg_header.bind(this),

      // переопределяем метод отрисовки табличных частей, т.к. мы хотим разместить табчасть на первой странице без закладок
      draw_tabular_sections: this.draw_tabular_sections.bind(this),

    };

    this.dp.presentation = calc_order.presentation + ' - добавление продукции';

    this.dp.form_obj(pwnd, this.attr);


  }

  // навешиваем обработчики событий на элементы управления
  draw_pg_header(dp, wnd) {
    const {production} = wnd.elmnts.grids;
    const refill_prms = this.refill_prms.bind(this);
    production.attachEvent('onRowSelect', refill_prms);
    production.attachEvent('onEditCell', (stage, rId, cInd) => {
      !cInd && setTimeout(refill_prms);
    });
  }

  // переопределяем страницы формы
  draw_tabular_sections(dp, wnd, tabular_init) {

    this.wnd = wnd;
    wnd.maximize();

    const {elmnts} = wnd;
    elmnts.frm_toolbar.hideItem('bs_print');

    // добавляем layout на первую страницу
    wnd.detachObject(true);
    wnd.maximize();
    elmnts.layout = wnd.attachLayout({
      pattern: '2E',
      cells: [{
        id: 'a',
        text: 'Продукция',
        header: false,
      }, {
        id: 'b',
        text: 'Параметры',
        header: false,
      }],
      offsets: {top: 0, right: 0, bottom: 0, left: 0},
    });

    // добавляем табчасть продукции
    this.meta_production = $p.dp.buyers_order.metadata('production').fields._clone();
    elmnts.grids.production = elmnts.layout.cells('a').attachTabular({
      metadata: this.meta_production,
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
    if (btn_id == 'btn_ok') {
      this.dp._data._modified = false;
      this.dp.calc_order.process_add_product_list(this.dp)
        .then(() => {
          this.wnd.close();
          this.wnd = this.dp = this.attr = null;
        })
        .catch((err) => {

        });
    }
  }

  refill_prms() {
    const {meta_production, wnd} = this;
    const {production, params} = wnd.elmnts.grids;
    if (production && params) {
      const row = production.get_cell_field();
      if (row) {
        params.selection = {elm: row.obj.row};
        if (!row.obj.inset.empty()) {
          $p.cat.clrs.selection_exclude_service(meta_production.clr, row.obj.inset);
        }
      }
    }
  }

};

