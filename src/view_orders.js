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
			
			t.carousel.cells("list").setActive();
			cell.setText({text: "Заказы"});

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			var _cell = t.carousel.cells("doc");

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
							if(t.carousel.getActiveCell() == _cell)
								cell.setText({text: "<b>" + text + "</b>"});
						}
					})
					.then(function (wnd) {
						t.doc = wnd;
						setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
					});

			else if(t.doc && t.doc.wnd){
				setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
			}

		}

		function show_builder(ref){

			t.carousel.cells("builder").setActive();

			// отвязываем ошибки открытия построителя от текущего контекста
			setTimeout(t.editor.open.bind(t.editor, ref));

		}

		function hash_route(hprm) {

			if(hprm.view == "orders"){

				if(hprm.obj == "doc.calc_order" && !$p.utils.is_empty_guid(hprm.ref)){

					if(hprm.frm != "doc")
						setTimeout(function () {
							$p.iface.set_hash(undefined, undefined, "doc");
						});
					else
						show_doc(hprm.ref);


				} else if(hprm.obj == "cat.characteristics" && !$p.utils.is_empty_guid(hprm.ref)) {

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

			return true;

		}

		function create_elmnts(){

			if(t.init_event_id){
				$p.eve.detachEvent(t.init_event_id);
				delete t.init_event_id;
			}

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
										.then(this._on_close.bind(this, true));
								}
							}								
						}.bind(this)
					});
					return;
				}

				t.editor.project.data._loading = true;
				t.editor.project.data._opened = false;
				t.editor.project.ox = null;
				t.editor.project._dp.base_block = null;

				var _cell = t.carousel.cells("doc");
				
				$p.eve.callEvent("editor_closed", [t.editor]);

				if(!$p.utils.is_empty_guid(_cell.ref))
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
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

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
		t.carousel.conf.anim_step = 200;
		t.carousel.conf.anim_slide = "left 0.1s";


		// Подписываемся на событие окончания загрузки локальных данных
		// и рисум список заказов и заготовку графического редактора
		if($p.job_prm.builder)
			setTimeout(create_elmnts);
		else
			t.init_event_id = $p.eve.attachEvent("predefined_elmnts_inited", create_elmnts);


		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	if(!$p.iface._orders)
		$p.iface._orders = new OViewOrders();

	return $p.iface._orders;

};
