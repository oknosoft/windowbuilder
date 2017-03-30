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


	_mgr.form_obj = function(pwnd, attr){

		let o, wnd, evts = [], attr_on_close = attr.on_close;

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

				if($p.current_acl.role_available("СогласованиеРасчетовЗаказов") || $p.current_acl.role_available("РедактированиеСкидок"))
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro";
				else
					source.types = "cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

			})($p.doc.calc_order.metadata().form.obj.tabular_sections.production);
			_meta_patched = true;
		}

		attr.draw_tabular_sections = function (o, wnd, tabular_init) {

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
					setTimeout(set_editable, 50);

				});

			/**
			 *	статусбар с картинками
			 */
			wnd.elmnts.statusbar = wnd.attachStatusBar({text: "<div></div>"});
			wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
			wnd.elmnts.svgs.reload(o);

		};

		attr.draw_pg_header = function (o, wnd) {

			function layout_resize_finish() {
				setTimeout(function () {
					if(wnd.elmnts.layout_header.setSizes){
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
						{id: "date", path: "o.date", synonym: "Дата", type: "ro", txt: $p.moment(o.date).format($p.moment._masks.date_time)},
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
			wnd.elmnts.cell_note.attachHTMLString("<textarea class='textarea_editor'>" + o.note + "</textarea>");
			// wnd.elmnts.note_editor = wnd.elmnts.cell_note.attachEditor({
			// 	content: o.note,
			// 	onFocusChanged: function(name, ev){
			// 		if(!wnd.elmnts.ro && name == "blur")
			// 			o.note = this.getContent().replace(/&nbsp;/g, " ").replace(/<.*?>/g, "").replace(/&.{2,6};/g, "");
			// 	}
			// });

			//wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
			//	obj: o,
			//	pwnd: wnd,
			//	read_only: wnd.elmnts.ro    // TODO: учитывать права для каждой роли на каждый объект
			//});
		};

		attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

		attr.toolbar_click = toolbar_click;

		attr.on_close = frm_close;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then((res) => {
				if(res){
					o = res.o;
					wnd = res.wnd;
					return res;
				}
			});


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
					wnd.close();
					break;

				case 'btn_add_builder':
					open_builder(true);
					break;

				case 'btn_add_product':
					$p.dp.buyers_order.form_product_list(wnd, process_add_product);
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

		function production_new_row(){
			var row = o["production"].add({
				qty: 1,
				quantity: 1,
				discount_percent_internal: $p.wsql.get_user_param("discount_percent_internal", "number")
			});
			o["production"].sync_grid(wnd.elmnts.grids.production);
			wnd.elmnts.grids.production.selectRowById(row.row);
			return row;
		}

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
							wnd.close();
						else{
							wnd.set_text();
							set_editable();
						}

					})
					.catch(function(err){
						$p.record_log(err);
					});
			}

			if(action == "sent"){
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

			} else if(action == "retrieve"){
				// установить транспорт в "отозвано" и записать
				o.obj_delivery_state =  $p.enm.obj_delivery_states.Отозван;
				do_save();

			} else if(action == "save" || action == "close"){
				do_save();

			}else if(action == "post"){
				do_save(true);

			}else if(action == "unpost"){
				do_save(false);
			}
		}

		function frm_close(){

			// выгружаем из памяти всплывающие окна скидки и связанных файлов
			['vault','vault_pop','discount','discount_pop','svgs'].forEach((elm) => {
				wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
			});

			evts.forEach((id) => $p.eve.detachEvent(id));

			typeof attr_on_close == "function" && attr_on_close();

			return true;
		}

		// устанавливает видимость и доступность
		function set_editable(){

			// статусы
			var st_draft = $p.enm.obj_delivery_states.Черновик,
				st_retrieve = $p.enm.obj_delivery_states.Отозван,
				retrieve_enabed, detales_toolbar;

			wnd.elmnts.pg_right.cells("vat_consider", 1).setDisabled(true);
			wnd.elmnts.pg_right.cells("vat_included", 1).setDisabled(true);

			wnd.elmnts.ro = false;

			// технолог может изменять шаблоны
			if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон){
				wnd.elmnts.ro = !$p.current_acl.role_available("ИзменениеТехнологическойНСИ");

				// ведущий менеджер может изменять проведенные
			}else if(o.posted || o._deleted){
				wnd.elmnts.ro = !$p.current_acl.role_available("СогласованиеРасчетовЗаказов");

			}else if(!wnd.elmnts.ro && !o.obj_delivery_state.empty())
				wnd.elmnts.ro = o.obj_delivery_state != st_draft && o.obj_delivery_state != st_retrieve;

			retrieve_enabed = !o._deleted &&
				(o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

			wnd.elmnts.grids.production.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.grids.planning.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.pg_left.setEditable(!wnd.elmnts.ro);
			wnd.elmnts.pg_right.setEditable(!wnd.elmnts.ro);

			// гасим кнопки проведения, если недоступна роль
			if(!$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				wnd.elmnts.frm_toolbar.hideItem("btn_post");
				wnd.elmnts.frm_toolbar.hideItem("btn_unpost");
			}

			// если не технологи и не менеджер - запрещаем менять статусы
			if(!$p.current_acl.role_available("ИзменениеТехнологическойНСИ") && !$p.current_acl.role_available("СогласованиеРасчетовЗаказов")){
				wnd.elmnts.pg_left.cells("obj_delivery_state", 1).setDisabled(true);
			}

			// кнопки записи и отправки гасим в зависимости от статуса
			if(wnd.elmnts.ro){
				wnd.elmnts.frm_toolbar.disableItem("btn_sent");
				wnd.elmnts.frm_toolbar.disableItem("btn_save");

				detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.disableItem(itemId);
				});

				detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.disableItem(itemId);
				});

			}else{
				// шаблоны никогда не надо отправлять
				if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон)
					wnd.elmnts.frm_toolbar.disableItem("btn_sent");
				else
					wnd.elmnts.frm_toolbar.enableItem("btn_sent");

				wnd.elmnts.frm_toolbar.enableItem("btn_save");

				detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.enableItem(itemId);
				});

				detales_toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
				detales_toolbar.forEachItem(function(itemId){
					detales_toolbar.enableItem(itemId);
				});
			}
			if(retrieve_enabed)
				wnd.elmnts.frm_toolbar.enableListOption("bs_more", "btn_retrieve");
			else
				wnd.elmnts.frm_toolbar.disableListOption("bs_more", "btn_retrieve");
		}

		/**
		 * Обработчик события _ЗаписанаХарактеристикаПостроителя_
		 * @param scheme
		 * @param sattr
		 */
		function characteristic_saved(scheme, sattr){

			var ox = scheme.ox,
				dp = scheme._dp,
				row = ox.calc_order_row;

			if(!row || ox.calc_order != o)
				return;

			//nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
			//discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

			// т.к. табчасть мы будем перерисовывать в любом случае, отключаем обсерверы
			ox._data._silent = true;

			row.nom = ox.owner;
			row.note = dp.note;
			row.quantity = dp.quantity || 1;
			row.len = ox.x;
			row.width = ox.y;
			row.s = ox.s;
			row.discount_percent = dp.discount_percent;
			row.discount_percent_internal = dp.discount_percent_internal;
			if(row.unit.owner != row.nom)
				row.unit = row.nom.storage_unit;

			// обновляем табчасть
			wnd.elmnts.grids.production.refresh_row(row);

			// обновляем эскизы
			wnd.elmnts.svgs.reload(o);

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
			var selId, row;

			if(create_new){

				row = production_new_row();

				// объект продукции создаём, но из базы не читаем и пока не записываем
				$p.cat.characteristics.create({
					ref: $p.utils.generate_guid(),
					calc_order: o,
					product: row.row
				}, true)
					.then((ox) => {

						// записываем расчет, если не сделали этого ранее
						if(o.is_new())
							return o.save().then(() => ox);
						else
							return ox;
					})
					.then((ox) => {
						row.characteristic = ox;
						$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
					});
			}
			else if((selId = production_get_sel_index()) != undefined){
				row = o.production.get(selId);
				if(row){
					if(row.characteristic.empty() ||
						row.characteristic.calc_order.empty() ||
						row.characteristic.owner.is_procedure ||
						row.characteristic.owner.is_service ||
						row.characteristic.owner.is_accessory){
						not_production();
					}
					else if(row.characteristic.coordinates.count() == 0){
						// возможно, это заготовка - проверим номенклатуру системы
					}
					else{
            $p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
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
			const row = production_new_row().row-1;
			setTimeout(() => {
        const grid = wnd.elmnts.grids.production;
        grid.selectRow(row);
        grid.selectCell(row, grid.getColIndexById("nom"), false, true, true);
        grid.cells().open_selection();
      });
		}

		/**
		 * ОбработатьДобавитьПродукцию()
		 */
		function process_add_product(ts){

			if(ts && ts.count()){

				ts.clear();
			}
			//wnd.progressOn();
			// TODO: _mgr.save
			//_mgr.save({
			//	ref: o.ref,
			//	row: 0,
			//	o: o._obj,
			//	action: "calc",
			//	specify: "product_list",
			//	new_rows: new_rows
			//}).then(function(res){
			//	if(!$p.msg.check_soap_result(res))
			//		wnd.reflect_characteristic_change(res);
			//	wnd.progressOff();
			//});
		}

	};

})($p);
