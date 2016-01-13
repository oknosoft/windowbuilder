/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {


	function show_list(){

		if(!$p.iface._orders.list){
			$p.iface._orders.carousel.cells("list").detachObject(true);
			$p.iface._orders.list = $p.doc.calc_order.form_list($p.iface._orders.carousel.cells("list"), {
				hide_header: true
			});
		}else
			$p.iface._orders.carousel.cells("list").setActive();

	}

	function show_doc(ref){

		$p.iface._orders.carousel.cells("doc").setActive();

		$p.doc.calc_order.form_obj($p.iface._orders.carousel.cells("doc"), {
			ref: ref,
			bind_pwnd: true,
			on_close: show_list
		});
	}

	function show_builder(){

	}


	function OViewOrders(){

		// Рисуем дополнительные элементы навигации
		this.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '220px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', title: 'О&nbsp;программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', title: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', title: 'Календарь', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', title: 'Заказы', float: 'right'}

				//{name: 'filter', text: '<i class="fa fa-filter md-fa-lg"></i>', title: 'Фильтр', float: 'left'}

			], onclick: function (name) {
				if(['settings', 'about', 'events'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);
				else {

				}
				return false;
			}
		});

		// страницы карусели
		this.carousel = cell.attachCarousel({
			keys:           false,
			touch_scroll:   false,
			offset_left:    0,
			offset_top:     4,
			offset_item:    0
		});
		this.carousel.hideControls();
		this.carousel.addCell("list");
		this.carousel.addCell("doc");
		this.carousel.addCell("builder");

		// Рисуем стандартную форму аутентификации. К ней уже привязан алгоритм входа по умолчанию
		// При необходимости, можно реализовать клиентские сертификаты, двухфакторную авторизацию с одноразовыми sms и т.д.
		if($p.eve.logged_in)
			setTimeout(show_list);
		else
			$p.iface.frm_auth({	cell: this.carousel.cells("list") },	null, $p.record_log	);

	}

	// слушаем событие online-offline


	// слушаем событие авторизации и входа в систему
	dhx4.attachEvent("log_in", function () {
		if($p.iface._orders)
			show_list();
	});


	/**
	 * Обработчик маршрутизации
	 * @param hprm
	 * @return {boolean}
	 */
	$p.eve.hash_route.push(function (hprm) {

		if(hprm.view == "orders" && $p.iface._orders){
			if(hprm.obj == "doc.calc_order" && !$p.is_empty_guid(hprm.ref))
				show_doc(hprm.ref);

			else if($p.is_empty_guid(hprm.ref) || hprm.frm == "list")
				show_list();

			return false;
		}

	});

	if(!$p.iface._orders)
		$p.iface._orders = new OViewOrders();

	return $p.iface._orders;

};
