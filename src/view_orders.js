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

			if(t.carousel.getActiveCell() != _cell)
				_cell.setActive();

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"), {
					hide_header: true,
					date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31")
				});
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
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
					});
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


				} if(hprm.obj == "cat.characteristics" && !$p.is_empty_guid(hprm.ref)) {

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
				hprm = $p.job_prm.parse_url(),
				obj = hprm.obj || "doc.calc_order";

			_cell._on_close = function () {

				_cell = t.carousel.cells("doc");

				if(!$p.is_empty_guid(_cell.ref))
					$p.iface.set_hash("doc.calc_order", _cell.ref, "doc");

				else{
					hprm = $p.job_prm.parse_url();
					obj = $p.cat.characteristics.get(hprm.ref, false, true);
					if(obj && !$p.is_empty_guid(obj.calc_order.ref))
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}

			t.editor = new $p.Editor(_cell);

			setTimeout(function () {
				$p.iface.set_hash(obj);
			});
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '200px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', title: 'О&nbsp;программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', title: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', title: 'Планирование', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', title: 'Заказы', float: 'right'},
				{name: 'auth', text: '<i class="fa fa-sign-in md-fa-lg"></i>', title: 'Авторизация', float: 'left'},
				{name: 'bell', text: '<i class="fa fa-bell-o md-fa-lg"></i>', float: 'left'}

				//{name: 'filter', text: '<i class="fa fa-filter md-fa-lg"></i>', title: 'Фильтр', float: 'left'}

			], onclick: function (name) {

				if(['settings', 'about', 'events'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);

				else if(name == 'auth') {
					$p.iface.frm_auth({
						modal_dialog: true
						//, try_auto: true
					});
				}
				return false;
			}
		});
		$(t.tb_nav.buttons.bell).addClass("disabledbutton");

		// страницы карусели
		t.carousel = cell.attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     4,
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
