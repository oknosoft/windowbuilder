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
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
					on_new: function (o) {
						$p.iface.set_hash(_mgr.class_name, o.ref);
					},
					on_edit: function (_mgr, rId) {
						$p.iface.set_hash(_mgr.class_name, rId);
					}
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


				filter_view = {},
				
				filter_key = {};

			// настраиваем фильтр для списка заказов
			filter_view.__define({
				value: {
					get: function () {
						switch(tree.getSelectedItemId()) {

							case 'draft':
							case 'sent':
							case 'declined':
							case 'confirmed':
							case 'template':
							case 'zarchive':
								return 'doc_calc_order/date';

							case 'credit':
							case 'prepayment':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'deleted':
							case 'all':
								return '';
						}
					}
				}
			});
			filter_key.__define({
				value: {
					get: function () {
						var key;

						switch(tree.getSelectedItemId()) {

							case 'draft':
								key = 'draft';
								break;
							case 'sent':
								key = 'sent';
								break;
							case 'declined':
								key = 'declined';
								break;
							case 'confirmed':
								key = 'confirmed';
								break;
							case 'template':
								key = 'template';
								break;
							case 'zarchive':
								key = 'zarchive';
								break;

							case 'credit':
							case 'prepayment':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';

							case 'deleted':
								return 'deleted';
						}

						var filter = wnd.elmnts.filter.get_filter(true);
						return {
							startkey: [key, filter.date_from.getFullYear(), filter.date_from.getMonth()+1, filter.date_from.getDate()],
							endkey: [key, filter.date_till.getFullYear(), filter.date_till.getMonth()+1, filter.date_till.getDate()],
							_drop_date: true,
							_search: filter.filter.toLowerCase()
						};
					}
				}
			});
			wnd.elmnts.filter.custom_selection._view = filter_view;
			wnd.elmnts.filter.custom_selection._key = filter_key;

			// картинка заказа в статусбаре
			wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.status_bar);
			wnd.elmnts.grid.attachEvent("onRowSelect", function (rid) {
				wnd.elmnts.svgs.reload(rid);
			});

			// настраиваем дерево
			tree.enableTreeImages(false);
			tree.parse($p.injected_data["tree_filteres.xml"]);
			tree.attachEvent("onSelect", wnd.elmnts.filter.call_event);

			return wnd;
		};
	}
);
