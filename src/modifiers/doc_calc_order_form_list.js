/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.doc.calc_order;

		_mgr.form_list = function(pwnd, attr){
			
			if(!attr)
				attr = {
					hide_header: true,
					date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31")
				};
			
			var layout = pwnd.attachLayout({
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
			}),

				wnd = _mgr.form_selection(layout.cells("b"), attr),

				tree = layout.cells("a").attachTree(),


				filter_view = {"value": "doc_calc_order/date"},
				filter_key = {};

			// настраиваем фильтр для списка заказов
			filter_key.__define({
				value: {
					get: function () {
						return "draft";
					}
				}
			});
			wnd.elmnts.filter.additional._view = filter_view;
			wnd.elmnts.filter.additional._key = filter_key;

			// настраиваем дерево
			tree.enableTreeImages(false);
			tree.parse($p.injected_data["tree_filteres.xml"]);
			tree.attachEvent("onSelect", function(id){
				id = null;
			});

			return wnd;
		};
	}
);
