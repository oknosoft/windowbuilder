/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order_form_list
 */


$p.doc.calc_order.form_list = function(pwnd, attr){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
			date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
			on_new: (o) => {
				$p.iface.set_hash(this.class_name, o.ref, "doc");
			},
			on_edit: (_mgr, rId) => {
				$p.iface.set_hash(_mgr.class_name, rId, "doc");
			}
		};
	}

	// разбивка на 2 колонки - дерево и карусель
	const layout = pwnd.attachLayout({
			pattern: "2U",
			cells: [{
				id: "a",
				text: "Фильтр",
				collapsed_text: "Фильтр",
				width: 180
			}, {
				id: "b",
				text: "Заказы",
				header: false
			}],
			offsets: { top: 0, right: 0, bottom: 0, left: 0}
		});
	const tree = layout.cells("a").attachTreeView({
			iconset: "font_awesome"
		});

  return new Promise((resolve, reject) => {

    attr.on_create = (wnd) => {

      const {elmnts} = wnd;

      // настраиваем фильтр для списка заказов
      elmnts.filter.custom_selection.__define({
        state: {
          get: function(){
            const state = (tree && tree.getSelectedId()) || 'draft';
            return state == 'all' ? {$ne: ''} : {$eq: state};
          },
          enumerable: true
        }
      });

      // картинка заказа в статусбаре
      elmnts.status_bar = wnd.attachStatusBar();
      elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
        (ref, dbl) => dbl && $p.iface.set_hash("cat.characteristics", ref, "builder"));
      elmnts.grid.attachEvent("onRowSelect", (rid) => elmnts.svgs.reload(rid));

      // настраиваем дерево
      tree.loadStruct($p.injected_data["tree_filteres.xml"]);
      tree.attachEvent("onSelect", (rid, mode) => {

        if(!mode)
          return;

        // переключаем страницу карусели
        switch(rid) {

          case 'draft':
          case 'sent':
          case 'declined':
          case 'confirmed':
          case 'service':
          case 'complaints':
          case 'template':
          case 'zarchive':
          case 'all':
            elmnts.filter.call_event();
            return;
        }

      });

      resolve(wnd);
    }

    const frm = this.mango_selection(layout.cells("b"), attr);

  });

};

