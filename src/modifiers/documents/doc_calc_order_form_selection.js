/**
 * форма выбора документов Расчет-заказ. публикуемый метод: doc.calc_order.form_selection(pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order_form_selection
 */


$p.doc.calc_order.form_selection = function(pwnd, attr){

	const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

	// настраиваем фильтр для списка заказов
	wnd.elmnts.filter.custom_selection._view = { get value() { return '' } };
	wnd.elmnts.filter.custom_selection._key = { get value() { return '' } };

	// картинка заказа в статусбаре
	wnd.do_not_maximize = true;
	wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.status_bar,
    (ref, dbl) => {
	  if(dbl){
      wnd && wnd.close();
      return pwnd.on_select && pwnd.on_select({_block: ref});
    }
    });
	wnd.elmnts.grid.attachEvent("onRowSelect", (rid) => wnd.elmnts.svgs.reload(rid));


	setTimeout(() => {
		wnd.setDimension(900, 580);
		wnd.centerOnScreen();
	})

	return wnd;
};

