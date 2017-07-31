/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module doc_calc_order_form_obj
 */

(function($p){

	const _mgr = $p.doc.calc_order;
	let _meta_patched;

	_mgr.form_obj = function(pwnd, attr, handlers){

		let o, wnd, evts = [];

		/**
		 * структура заголовков табчасти продукции
		 * @param source
		 */
		if(!_meta_patched){
			(function(source){
				// TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
				if($p.wsql.get_user_param("hide_price_dealer")){
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
					source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0";

				}else if($p.wsql.get_user_param("hide_price_manufacturer")){
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
					source.widths = "40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70";

				}else{
					source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
					source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70";
					source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70";
				}

				if($p.current_user.role_available("СогласованиеРасчетовЗаказов") || $p.current_user.role_available("РедактированиеСкидок"))
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro";
				else
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

			})($p.doc.calc_order.metadata().form.obj.tabular_sections.production);
			_meta_patched = true;
		}

		attr.draw_tabular_sections = (o, wnd, tabular_init) => {

			/**
			 * получим задействованные в заказе объекты характеристик
			 */
			const refs = [];
			o.production.each((row) => {
				if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new())
					refs.push(row._obj.characteristic);
			});
			$p.cat.characteristics.pouch_load_array(refs)
				.then(() => {

					// табчасть продукции со специфическим набором кнопок
					tabular_init("production", $p.injected_data["toolbar_calc_order_production.xml"]);
					const {production} = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent("onRowSelect", (id, ind) => {
            const row = o.production.get(id - 1);
            wnd.elmnts.svgs.select(row.characteristic.ref);
          });

					let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
					toolbar.addSpacer("btn_delete");
					toolbar.attachEvent("onclick", toolbar_click);

					// табчасть планирования
					tabular_init("planning");
					toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
					toolbar.addButton("btn_fill_plan", 3, "Заполнить");
					toolbar.attachEvent("onclick", toolbar_click);

					// попап для присоединенных файлов
					wnd.elmnts.discount_pop = new dhtmlXPopup({
						toolbar: toolbar,
						id: "btn_discount"
					});
					wnd.elmnts.discount_pop.attachEvent("onShow", show_discount);

          // в зависимости от статуса
          set_editable(o, wnd);

				});

			/**
			 *	статусбар с картинками
			 */
			wnd.elmnts.statusbar = wnd.attachStatusBar();
			wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
			wnd.elmnts.svgs.reload(o);

		};

		attr.draw_pg_header = (o, wnd) => {

			function layout_resize_finish() {
				setTimeout(() => {
					if(wnd.elmnts && wnd.elmnts.layout_header && wnd.elmnts.layout_header.setSizes){
						wnd.elmnts.layout_header.setSizes();
						wnd.elmnts.pg_left.objBox.style.width = "100%";
						wnd.elmnts.pg_right.objBox.style.width = "100%";
					}
				}, 200);
			}

			/**
			 *	закладка шапка
			 */
			wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

			wnd.elmnts.layout_header.attachEvent("onResizeFinish", layout_resize_finish);

			wnd.elmnts.layout_header.attachEvent("onPanelResizeFinish", layout_resize_finish);

			/**
			 *	левая колонка шапки документа
			 */
			wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
			wnd.elmnts.cell_left.hideHeader();
			wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
				obj: o,
				pwnd: wnd,
				read_only: wnd.elmnts.ro,
				oxml: {
					" ": [{id: "number_doc", path: "o.number_doc", synonym: "Номер", type: "ro", txt: o.number_doc},
						{id: "date", path: "o.date", synonym: "Дата", type: "ro", txt: moment(o.date).format(moment._masks.date_time)},
						"number_internal"
					],
					"Контактная информация": ["partner", "client_of_dealer", "phone",
						{id: "shipping_address", path: "o.shipping_address", synonym: "Адрес доставки", type: "addr", txt: o["shipping_address"]}
					],
					"Дополнительные реквизиты": ["obj_delivery_state", "category"]
				}
			});

			/**
			 *	правая колонка шапки документа
			 * TODO: задействовать либо удалить choice_links
			 * var choice_links = {contract: [
				 * {name: ["selection", "owner"], path: ["partner"]},
				 * {name: ["selection", "organization"], path: ["organization"]}
				 * ]};
			 */

			wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
			wnd.elmnts.cell_right.hideHeader();
			wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
				obj: o,
				pwnd: wnd,
				read_only: wnd.elmnts.ro,
				oxml: {
					"Налоги": ["vat_consider", "vat_included"],
					"Аналитика": ["project",
						{id: "organization", path: "o.organization", synonym: "Организация", type: "refc"},
						{id: "contract", path: "o.contract", synonym: "Договор", type: "refc"},
						{id: "bank_account", path: "o.bank_account", synonym: "Счет организации", type: "refc"},
						{id: "department", path: "o.department", synonym: "Офис продаж", type: "refc"},
						{id: "warehouse", path: "o.warehouse", synonym: "Склад отгрузки", type: "refc"},
						],
					"Итоги": [{id: "doc_currency", path: "o.doc_currency", synonym: "Валюта документа", type: "ro", txt: o["doc_currency"].presentation},
						{id: "doc_amount", path: "o.doc_amount", synonym: "Сумма", type: "ron", txt: o["doc_amount"]},
						{id: "amount_internal", path: "o.amount_internal", synonym: "Сумма внутр", type: "ron", txt: o["amount_internal"]}]
				}
			});

			/**
			 *	редактор комментариев
			 */
			wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
			wnd.elmnts.cell_note.hideHeader();
			wnd.elmnts.cell_note.setHeight(100);
			wnd.elmnts.cell_note.attachHTMLString("<textarea placeholder='Комментарий к заказу' class='textarea_editor'>" + o.note + "</textarea>");

		};

		attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

		attr.toolbar_click = toolbar_click;

		attr.on_close = frm_close;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then((res) => {
				if(res){
					o = res.o;
					wnd = res.wnd;
          wnd.prompt = prompt;
          wnd.close_confirmed = true;
					return res;
				}
			});

    /**
     * проверка, можно ли покидать страницу
     * @param loc
     * @return {*}
     */
    function prompt(loc) {
      if(loc.pathname.match(/builder/)){
        return true;
      }
      return (o && o._modified) ? `${o.presentation} изменён.\n\nЗакрыть без сохранения?` : true;
    }

    function close() {
      if(o && o._obj){
        const {ref, state} = o._obj;
        handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`);
      }
      else{
        handlers.handleNavigate(`/`);
      }
    }


		/**
		 * обработчик нажатия кнопок командных панелей
		 */
		function toolbar_click(btn_id){

			switch(btn_id) {

				case 'btn_sent':
					save("sent");
					break;

				case 'btn_save':
					save("save");
					break;

				case 'btn_save_close':
					save("close");
					break;

				case 'btn_retrieve':
					save("retrieve");
					break;

				case 'btn_post':
					save("post");
					break;

				case 'btn_unpost':
					save("unpost");
					break;

				case 'btn_fill_plan':
					o.fill_plan();
					break;

				case 'btn_close':
          close();
					break;

				case 'btn_add_builder':
					open_builder(true);
					break;

				case 'btn_add_product':
					new CalcOrderFormProductList(wnd, o);
					break;

				case 'btn_add_material':
					add_material();
					break;

				case 'btn_edit':
					open_builder();
					break;

				case 'btn_spec':
					open_spec();
					break;

				case 'btn_discount':

					break;

				case 'btn_calendar':
					calendar_new_event();
					break;

				case 'btn_go_connection':
					go_connection();
					break;
			}

			if(btn_id.substr(0,4)=="prn_")
				_mgr.print(o, btn_id, wnd);
		}

		/**
		 * создаёт событие календаря
		 */
		function calendar_new_event(){
			$p.msg.show_not_implemented();
		}

		/**
		 * показывает список связанных документов
		 */
		function go_connection(){
			$p.msg.show_not_implemented();
		}

		/**
		 * создаёт и показывает диалог групповых скидок
		 */
		function show_discount(){
			if (!wnd.elmnts.discount) {

				wnd.elmnts.discount = wnd.elmnts.discount_pop.attachForm([
					{type: "fieldset",  name: "discounts", label: "Скидки по группам", width:220, list:[
						{type:"settings", position:"label-left", labelWidth:100, inputWidth:50},
						{type:"input", label:"На продукцию", name:"production", numberFormat:["0.0 %", "", "."]},
						{type:"input", label:"На аксессуары", name:"accessories", numberFormat:["0.0 %", "", "."]},
						{type:"input", label:"На услуги", name:"services", numberFormat:["0.0 %", "", "."]}
					]},
					{ type:"button" , name:"btn_discounts", value:"Ок", tooltip:"Установить скидки"  }
				]);
				wnd.elmnts.discount.setItemValue("production", 0);
				wnd.elmnts.discount.setItemValue("accessories", 0);
				wnd.elmnts.discount.setItemValue("services", 0);
				wnd.elmnts.discount.attachEvent("onButtonClick", function(name){
					wnd.progressOn();
					// TODO: _mgr.save
					//_mgr.save({
					//	ref: o.ref,
					//	discounts: {
					//		production: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("production"), true),
					//		accessories: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("accessories"), true),
					//		services: $p.utils.fix_number(wnd.elmnts.discount.getItemValue("services"), true)
					//	},
					//	o: o._obj,
					//	action: "calc",
					//	specify: "discounts"
					//}).then(function(res){
					//	if(!$p.msg.check_soap_result(res))
					//		wnd.reflect_characteristic_change(res); // - перезаполнить шапку и табчасть
					//	wnd.progressOff();
					//	wnd.elmnts.discount_pop.hide();
					//});
				});
			}
		}


		/**
		 * вспомогательные функции
		 */

		function production_get_sel_index(){
			var selId = wnd.elmnts.grids.production.getSelectedRowId();
			if(selId && !isNaN(Number(selId)))
				return Number(selId)-1;

			$p.msg.show_msg({
				type: "alert-warning",
				text: $p.msg.no_selected_row.replace("%1", "Продукция"),
				title: o.presentation
			});
		}

		function save(action){

			function do_save(post){

				if(!wnd.elmnts.ro){
					o.note = wnd.elmnts.cell_note.cell.querySelector("textarea").value.replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
					wnd.elmnts.pg_left.selectRow(0);
				}

				o.save(post)
					.then(function(){
						if(action == "sent" || action == "close")
							close();
						else{
							wnd.set_text();
							set_editable(o, wnd);
						}

					})
					.catch(function(err){
						$p.record_log(err);
					});
			}

			switch (action) {
        case "sent":
          // показать диалог и обработать возврат
          dhtmlx.confirm({
            title: $p.msg.order_sent_title,
            text: $p.msg.order_sent_message,
            cancel: $p.msg.cancel,
            callback: function(btn) {
              if(btn){
                // установить транспорт в "отправлено" и записать
                o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
                do_save();
              }
            }
          });
          break;

        case "retrieve":
          // установить транспорт в "отозвано" и записать
          o.obj_delivery_state = $p.enm.obj_delivery_states.Отозван;
          do_save();
          break;

        case "post":
          do_save(true);

        case "unpost":
          do_save(true);

        default:
          do_save();
      }
		}

		function frm_close(){

		  if(o && o._modified){
        if(o.is_new()){
          o.unload();
        }
        else{
          setTimeout(o.load.bind(o), 100);
        }
      }

			// выгружаем из памяти всплывающие окна скидки и связанных файлов
			['vault','vault_pop','discount','discount_pop','svgs', 'layout_header'].forEach((elm) => {
				wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
			});

			evts.forEach((id) => $p.eve.detachEvent(id));

			return true;
		}

		// устанавливает видимость и доступность
		function set_editable(o, wnd){

		  const {pg_left, pg_right, frm_toolbar, grids, tabs} = wnd.elmnts;

      pg_right.cells("vat_consider", 1).setDisabled(true);
      pg_right.cells("vat_included", 1).setDisabled(true);

			const ro = wnd.elmnts.ro = o.is_read_only;

			const retrieve_enabed = !o._deleted &&
				(o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

      grids.production.setEditable(!ro);
      grids.planning.setEditable(!ro);
      pg_left.setEditable(!ro);
      pg_right.setEditable(!ro);

			// гасим кнопки проведения, если недоступна роль
			if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов")){
        frm_toolbar.hideItem("btn_post");
        frm_toolbar.hideItem("btn_unpost");
			}

			// если не технологи и не менеджер - запрещаем менять статусы
			if(!$p.current_user.role_available("ИзменениеТехнологическойНСИ") && !$p.current_user.role_available("СогласованиеРасчетовЗаказов")){
        pg_left.cells("obj_delivery_state", 1).setDisabled(true);
			}

			// кнопки записи и отправки гасим в зависимости от статуса
			if(ro){
        frm_toolbar.disableItem("btn_sent");
        frm_toolbar.disableItem("btn_save");
        let toolbar;
        const disable = (itemId) => toolbar.disableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(disable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(disable);
			}
			else{
				// шаблоны никогда не надо отправлять
				if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){
          frm_toolbar.disableItem("btn_sent");
        }
				else{
          frm_toolbar.enableItem("btn_sent");
        }
        frm_toolbar.enableItem("btn_save");
				let toolbar;
				const enable = (itemId) => toolbar.enableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(enable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(enable);
			}
			if(retrieve_enabed){
        frm_toolbar.enableListOption("bs_more", "btn_retrieve");
      }
			else{
        frm_toolbar.disableListOption("bs_more", "btn_retrieve");
      }
		}


		function characteristic_saved(scheme, sattr){
		  const {ox} = scheme;
			if(wnd && ox.calc_order_row && ox.calc_order == o){
        // обновляем эскизы
        wnd.elmnts.svgs.reload(o);
      }
		}

		/**
		 * показывает диалог с сообщением "это не продукция"
		 */
		function not_production(){
			$p.msg.show_msg({
				title: $p.msg.bld_title,
				type: "alert-error",
				text: $p.msg.bld_not_product
			});
		}

		/**
		 * ОткрытьПостроитель()
		 * @param [create_new] {Boolean} - создавать новое изделие или открывать в текущей строке
		 */
		function open_builder(create_new){
			var selId;

			if(create_new){
        o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
          .then((row) => {
            //$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder")
            handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
          });
			}
			else{
			  const selId = production_get_sel_index();
        if(selId != undefined){
          const row = o.production.get(selId);
          if(row){
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory){
              not_production();
            }
            else if(row.characteristic.coordinates.count() == 0){
              // возможно, это заготовка - проверим номенклатуру системы
              if(row.characteristic.leading_product.calc_order == calc_order){
                //$p.iface.set_hash("cat.characteristics", row.characteristic.leading_product.ref, "builder");
                handlers.handleNavigate(`/builder/${row.characteristic.leading_product.ref}`);
              }
            }
            else{
              //$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
              handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
            }
          }
        }
      }

			if(!evts.length){
				evts.push($p.eve.attachEvent("characteristic_saved", characteristic_saved));
			}
		}

		function open_spec(){
		  const selId = production_get_sel_index();
			if(selId != undefined){
				const row = o.production.get(selId);
        row && !row.characteristic.empty() && row.characteristic.form_obj().then((w) => w.wnd.maximize());
			}
		}

		function rsvg_click(ref, dbl) {
      o.production.find_rows({characteristic: ref}, (row) => {
        wnd.elmnts.grids.production.selectRow(row.row-1);
        dbl && open_builder();
        return false;
      })
    }

		/**
		 * добавляет строку материала
		 */
		function add_material(){
			const row = o.create_product_row({grid: wnd.elmnts.grids.production}).row-1;
			setTimeout(() => {
        const grid = wnd.elmnts.grids.production;
        grid.selectRow(row);
        grid.selectCell(row, grid.getColIndexById("nom"), false, true, true);
        grid.cells().open_selection();
      });
		}

	};

})($p);
