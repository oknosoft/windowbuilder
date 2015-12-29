/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {

	function OViewOrders(){

		// Рисуем стандартную форму аутентификации. К ней уже привязан алгоритм входа по умолчанию
		// При необходимости, можно реализовать клиентские сертификаты, двухфакторную авторизацию с одноразовыми sms и т.д.
		$p.iface.frm_auth({
			cell: cell
		}, function () {

				// В случае успешной авторизации, открываем список заказов
				$p.iface.set_hash("doc.СчетНаОплатуПокупателю", "", "", "oper");

			},
			$p.record_log
		);

		// Рисуем дополнительные элементы навигации
		this.tb_nav = new $p.iface.OTooolBar({
			wrapper: cell.cell.querySelector(".dhx_cell_sidebar_hdr"),
			class_name: 'md_otbnav',
			width: '220px', height: '28px', top: '3px', right: '3px', name: 'right',
			buttons: [
				{name: 'about', text: '<i class="fa fa-info-circle md-fa-lg"></i>', title: 'О&nbsp;программе', float: 'right'},
				{name: 'settings', text: '<i class="fa fa-cog md-fa-lg"></i>', title: 'Настройки', float: 'right'},
				{name: 'events', text: '<i class="fa fa-calendar-check-o md-fa-lg"></i>', title: 'Календарь', float: 'right'},
				{name: 'orders', text: '<i class="fa fa-suitcase md-fa-lg"></i>', title: 'Заказы', float: 'right'},

				{name: 'filter', text: '<i class="fa fa-filter md-fa-lg"></i>', title: 'Фильтр', float: 'left'}


			], onclick: function (name) {
				if(['settings', 'about', 'events'].indexOf(name) != -1)
					$p.iface.main.cells(name).setActive(true);
				else {

				}
				return false;
			}
		});

	}

	if(!$p.iface._orders)
		$p.iface._orders = new OViewOrders();

	return $p.iface._orders;

};
