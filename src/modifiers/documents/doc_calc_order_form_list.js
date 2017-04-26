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

      // добавляем отбор по подразделению
      const builder_price = $p.dp.builder_price.create();
      const pos = elmnts.toolbar.getPosition("input_filter");
      const id = `txt_${dhx4.newId()}`;
      elmnts.toolbar.addText(id, pos, "");
      const text = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + id].obj;
      const department = new $p.iface.OCombo({
        parent: text,
        obj: builder_price,
        field: "department",
        width: 200,
        hide_frm: true,
        //get_option_list: get_option_list,
      });
      text.style.border = "1px solid #ccc";
      text.style.borderRadius = "3px";
      text.style.padding = "3px 2px 1px 2px";
      text.style.margin = "1px 5px 1px 1px";
      department.DOMelem_input.placeholder = "Подразделение";
      // {
      //   border-right-width: 1px;
      //   border: 1px solid rgb(204, 204, 204);
      //   padding: 3px 2px 1px 2px;
      //   margin: 1px 5px 1px 1px;
      // }

      // настраиваем фильтр для списка заказов
      elmnts.filter.custom_selection.__define({
        department: {
          get: function () {
            return {$ne: ''};
          },
          enumerable: true
        },
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
      tree.attachEvent("onSelect", (rid, mode) => mode && elmnts.filter.call_event());

      resolve(wnd);
    }

    const frm = this.mango_selection(layout.cells("b"), attr);

  });

};

