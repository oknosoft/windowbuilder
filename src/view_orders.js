/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {

	function OViewOrders(){

		var t = this;

		function show_list(){

			var _cell = t.carousel.cells("list");

			if(t.carousel.getActiveCell() != _cell){
				_cell.setActive();
				cell.setText({text: "Заказы"});
			}

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			var _cell = t.carousel.cells("doc");

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			if(!_cell.ref || _cell.ref != ref)
				$p.doc.calc_order.form_obj(_cell, {
						ref: ref,
						bind_pwnd: true,
						on_close: function () {
							setTimeout(function () {
								$p.iface.set_hash(undefined, "", "list");
							});
						},
						set_text: function (text) {
							cell.setText({text: "<b>" + text + "</b>"});
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
					});

			else if(t.doc && t.doc.wnd){
				t.doc.wnd.set_text();
			}
		}

		function show_builder(ref){

			var _cell = t.carousel.cells("builder");

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			t.editor.open(ref);

		}

		function hash_route(hprm) {

			if(hprm.view == "orders"){

				if(hprm.obj == "doc.calc_order" && !$p.is_empty_guid(hprm.ref)){

					if(hprm.frm != "doc")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "doc");
						});
					else
						show_doc(hprm.ref);


				} else if(hprm.obj == "cat.characteristics" && !$p.is_empty_guid(hprm.ref)) {

					if(hprm.frm != "builder")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "builder");
						});
					else
						show_builder(hprm.ref);


				}else{

					if(hprm.obj != "doc.calc_order")
						setTimeout(function () {
							$p.iface.set_hash("doc.calc_order", "", "list");
						});
					else
						show_list();
				}

				return false;
			}

		}

		function create_elmnts(){

			// создадим экземпляр графического редактора
			var _cell = t.carousel.cells("builder"),
				obj = $p.job_prm.parse_url().obj || "doc.calc_order";

			_cell._on_close = function (confirmed) {

				if(t.editor.project.ox._modified && !confirmed){
					dhtmlx.confirm({
						title: $p.msg.bld_title,
						text: $p.msg.modified_close,
						cancel: $p.msg.cancel,
						callback: function(btn) {
							if(btn){
								// закрыть изменённый без сохранения - значит прочитать его из pouchdb
								t.editor.project.data._loading = true;
								if(t.editor.project.ox.is_new()){
									// если характеристика не была записана - удаляем её вместе со строкой заказа
									var _row = t.editor.project.ox.calc_order_row;
									if(_row)
										_row._owner.del(_row);
									t.editor.project.ox.unload();
									this._on_close(true);
								}else{
									t.editor.project.ox.load()
										.then(function () {
											this._on_close(true);
										}.bind(this));
								}
							}								
						}.bind(this)
					});
					return;
				}

				t.editor.project.data._loading = true;
				t.editor.project.ox = null;

				var _cell = t.carousel.cells("doc");
				
				$p.eve.callEvent("editor_closed", [t.editor]);

				if(!$p.is_empty_guid(_cell.ref))
					$p.iface.set_hash("doc.calc_order", _cell.ref, "doc");

				else{
					
					var hprm = $p.job_prm.parse_url(),
						obj = $p.cat.characteristics.get(hprm.ref, false, true);
					
					if(obj && !obj.calc_order.empty())
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}.bind(_cell);

			// создаём экземпляр графического редактора
			t.editor = new $p.Editor(_cell, {
				set_text: function (text) {
					cell.setText({text: "<b>" + text + "</b>"});
				}
			});

			setTimeout(function () {
				$p.iface.set_hash(obj);
			});
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '260px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', tooltip: 'О программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', tooltip: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', tooltip: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', tooltip: 'Заказы', float: 'right'},
				{name: 'sep_0', text: '', float: 'right'},
				{name: 'sync', text: '', float: 'right'},
				{name: 'auth', text: '', width: '80px', float: 'right'}

				//{name: 'filter', text: '<i class="fa fa-filter md-fa-lg"></i>', tooltip: 'Фильтр', float: 'left'}

			], onclick: function (name) {

				if(['settings', 'about', 'events'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);

				return false;
			}
		});
		$p.iface.btn_auth_sync.bind(t.tb_nav);

		// страницы карусели
		t.carousel = cell.attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     0,
			offset_item:    0
		});
		t.carousel.hideControls();
		t.carousel.addCell("list");
		t.carousel.addCell("doc");
		t.carousel.addCell("builder");


		// Подписываемся на событие окончания загрузки локальных данных
		// и рисум список заказов и заготовку графического редактора
		if($p.wsql.pouch._data_loaded)
			setTimeout(create_elmnts);
		else
			$p.eve.attachEvent("pouch_load_data_loaded", create_elmnts);


		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.eve.hash_route.push(hash_route);

	}

	if(!$p.iface._orders)
		$p.iface._orders = new OViewOrders();

	return $p.iface._orders;

};
