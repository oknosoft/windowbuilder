/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_orders
 */

$p.iface.view_orders = function (cell) {

	function OViewOrders(){

		const t = this;

		function show_list(){

			t.carousel.cells("list").setActive();
			cell.setText({text: "Заказы"});

			if(!t.list){
				t.carousel.cells("list").detachObject(true);
				t.list = $p.doc.calc_order.form_list(t.carousel.cells("list"));
			}

		}

		function show_doc(ref){

			const _cell = t.carousel.cells("doc");

			_cell.setActive();

			if(!_cell.ref || _cell.ref != ref)

				$p.doc.calc_order.form_obj(_cell, {
						ref: ref,
						bind_pwnd: true,
						on_close: () => setTimeout(() => $p.iface.set_hash(undefined, "", "list")),
						set_text: (text) => (t.carousel.getActiveCell() == _cell) && cell.setText({text: "<b>" + text + "</b>"}),
					})
					.then((wnd) => {
						t.doc = wnd;
						setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
					});

			else if(t.doc && t.doc.wnd){
				setTimeout(t.doc.wnd.set_text.bind(t.doc.wnd, true), 200);
			}

		}

		function show_builder(ref){

      if(!t.editor){
        return location.reload(true);
      }

		  const cell_builder = t.carousel.cells("builder");
		  if(t.carousel.getActiveCell() != cell_builder){
        t.carousel.cells("builder").setActive();
      }
      if(!t.editor.project || t.editor.project.ox != ref){
        // отвязываем ошибки открытия построителя от текущего контекста
        setTimeout(t.editor.open.bind(t.editor, ref));
      }
		}

		function hash_route(hprm) {

			if(hprm.view == "orders"){

				if(hprm.obj == "doc.calc_order" && !$p.utils.is_empty_guid(hprm.ref)){

					if(hprm.frm != "doc")
						setTimeout(() => $p.iface.set_hash(undefined, undefined, "doc"));
					else
						show_doc(hprm.ref);

				} else if(hprm.obj == "cat.characteristics" && !$p.utils.is_empty_guid(hprm.ref)) {

					if(hprm.frm != "builder")
						setTimeout(() => $p.iface.set_hash(undefined, undefined, "builder"));
					else
						show_builder(hprm.ref);

				}else{

					if(hprm.obj != "doc.calc_order")
						setTimeout(() => $p.iface.set_hash("doc.calc_order", "", "list"));
					else
						show_list();
				}

				return false;
			}

			return true;

		}

		function create_elmnts(){

			$p.off(create_elmnts);

			// создадим экземпляр графического редактора
			const _cell = t.carousel.cells("builder");
			const obj = $p.job_prm.parse_url().obj || "doc.calc_order";

			_cell._on_close = function (confirmed) {

			  const {project} = t.editor;

				if(project.ox._modified && !confirmed){
					dhtmlx.confirm({
						title: $p.msg.bld_title,
						text: $p.msg.modified_close,
						cancel: $p.msg.cancel,
						callback: (btn) => {
							if(btn){
								// закрыть изменённый без сохранения - значит прочитать его из pouchdb
                project._attr._loading = true;
								if(project.ox.is_new()){
									// если характеристика не была записана - удаляем её вместе со строкой заказа
									const _row = project.ox.calc_order_row;
									if(_row)
										_row._owner.del(_row);
                  project.ox.unload();
									this._on_close(true);
								}else{
                  project.ox.load()
										.then(this._on_close.bind(this, true));
								}
							}
						}
					});
					return;
				}

        project._attr._loading = true;
        project._attr._opened = false;
        project.ox = null;
        project._dp.base_block = null;

				const _cell = t.carousel.cells("doc");

				$p.eve.callEvent("editor_closed", [t.editor]);

				if(!$p.utils.is_empty_guid(_cell.ref)){
          $p.iface.set_hash("doc.calc_order", _cell.ref, "doc");
        }
        else{
					const hprm = $p.job_prm.parse_url();
          const obj = $p.cat.characteristics.get(hprm.ref, false, true);

					if(obj && !obj.calc_order.empty())
						$p.iface.set_hash("doc.calc_order", obj.calc_order.ref, "doc");
					else
						$p.iface.set_hash("doc.calc_order", "", "list");
				}

			}.bind(_cell);

			// создаём экземпляр графического редактора
			t.editor = new $p.Editor(_cell, {
				set_text: (text) => {
					cell.setText({text: "<b>" + text + "</b>"});
				}
			});

			setTimeout(() => $p.iface.set_hash(obj));
		}

		// Рисуем дополнительные элементы навигации
		t.tb_nav = $p.iface.main.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

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
			$p.on({ predefined_elmnts_inited: create_elmnts });

		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	return $p.iface._orders || ($p.iface._orders = new OViewOrders());

};
