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
      const dp = $p.dp.builder_price.create();
      const pos = elmnts.toolbar.getPosition("input_filter");
      const txt_id = `txt_${dhx4.newId()}`;
      elmnts.toolbar.addText(txt_id, pos, "");
      const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
      const dep = new $p.iface.OCombo({
        parent: txt_div,
        obj: dp,
        field: "department",
        width: 180,
        hide_frm: true,
        get_option_list: function(val, selection){
          const {guid} = $p.utils.blank;
          return this.get_option_list(val, selection)
            .then((list) => {
            if(!list.some((item) => item.value == guid)){
              list.splice(0, 0, {text: "", value: guid})
            };
            return list;
          })
        },
      });
      txt_div.style.border = "1px solid #ccc";
      txt_div.style.borderRadius = "3px";
      txt_div.style.padding = "3px 2px 1px 2px";
      txt_div.style.margin = "1px 5px 1px 1px";
      dep.DOMelem_input.placeholder = "Подразделение";

      Object.observe(dp, (changes) => {
        changes.forEach((change) => {
          if(change.name == "department"){
            elmnts.filter.call_event();
          }
        });
      });

      // настраиваем фильтр для списка заказов
      elmnts.filter.custom_selection.__define({
        department: {
          get: function () {
            const {department} = dp;
            if(department.empty()){
              return {$ne: ''};
            }
            const depts = [];
            $p.cat.divisions.forEach((o) =>{
              if(o.in_hierarchy(department)){
                depts.push(o.ref)
              }
            });
            return {$in: depts};
          },
          enumerable: true
        },
        state: {
          get: function(){
            const state = (tree && tree.getSelectedId()) || 'draft';
            return state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: state};
          },
          enumerable: true
        }
      });
      elmnts.filter.custom_selection._index = 'mango_calc_order';

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

