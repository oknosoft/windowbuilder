/**
 * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
 */


$p.modifiers.push(

	function($p) {

		var _mgr = $p.doc.calc_order;

		/**
		 * структура заголовков табчасти продукции
		 * @param source
		 */
		(function(source){

			if($p.wsql.get_user_param("hide_price_dealer")){
				source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил";
				source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0";
				source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0";

			}else if($p.wsql.get_user_param("hide_price_manufacturer")){
				source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
				source.widths = "40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70";
				source.min_widths = "30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70";

			}else{
				source.headers = "№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма";
				source.widths = "40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70";
				source.min_widths = "30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70";
			}

			if($p.ajax.root)
				source.types = "cntr,ref,ref,txt,calck,calck,calck,calck,calck,ref,calck,ro,ro,calck,calck,ro";
			else
				source.types = "cntr,ref,ref,txt,calck,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro";

		})($p.doc.calc_order.metadata().form.obj.tabular_sections.production);

		_mgr.form_obj = function(pwnd, attr){

			var o, wnd;

			attr.draw_tabular_sections = function (o, wnd, tabular_init) {

				/**
				 * получим задействованные в заказе объекты характеристик
				 */
				var refs = [];
				o.production.each(function (row) {
					if(!$p.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new())
						refs.push(row._obj.characteristic);
				});
				$p.cat.characteristics.pouch_load_array(refs)
					.then(function () {

						/**
						 * табчасть продукции
						 */
						tabular_init("production", $p.injected_data["toolbar_calc_order_production.xml"]);

						var toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
						toolbar.addSpacer("btn_delete");
						toolbar.attachEvent("onclick", toolbar_click);

						// попап для присоединенных файлов
						wnd.elmnts.discount_pop = new dhtmlXPopup({
							toolbar: toolbar,
							id: "btn_discount"
						});
						wnd.elmnts.discount_pop.attachEvent("onShow", show_discount);

						// в зависимости от статуса
						setTimeout(set_editable, 50);

					})

				/**
				 *	статусбар с картинками
				 */
				wnd.elmnts.statusbar = wnd.attachStatusBar({text: "<div></div>"});
				wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.statusbar);
				wnd.elmnts.svgs.reload(o.ref);

			};

			attr.draw_pg_header = function (o, wnd) {

				/**
				 *	закладка шапка
				 */
				wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

				/**
				 *	левая колонка шапки документа
				 */
				wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
				wnd.elmnts.cell_left.hideHeader();
				wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
					obj: o,
					pwnd: wnd,
					read_only: !$p.ajax.root,
					oxml: {
						" ": [{id: "number_doc", path: "o.number_doc", synonym: "Номер", type: "ro", txt: o.number_doc},
							{id: "date", path: "o.date", synonym: "Дата", type: "ro", txt: $p.dateFormat(o.date, "")},
							"number_internal"
							],
						"Контактная информация": ["partner", "client_of_dealer", "phone",
							{id: "shipping_address", path: "o.shipping_address", synonym: "Адрес доставки", type: "addr", txt: o["shipping_address"]}
						],
						"Дополнительные реквизиты": ["invoice_state",
							{id: "obj_delivery_state", path: "o.obj_delivery_state", synonym: "Состояние транспорта", type: "ro", txt: o["obj_delivery_state"].presentation}
						]
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
					read_only: !$p.ajax.root,
					oxml: {
						"Налоги": ["vat_consider", "vat_included"],
						"Аналитика": ["project",
							{id: "organization", path: "o.organization", synonym: "Организация", type: "refc", txt: o["organization"].presentation},
							"contract", "organizational_unit", "department"],
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
				wnd.elmnts.cell_note.setHeight(140);
				wnd.elmnts.note_editor = wnd.elmnts.cell_note.attachEditor();
				wnd.elmnts.note_editor.setContent(o.note);
				wnd.elmnts.note_editor.attachEvent("onAccess", function(name, ev){
					if(wnd.elmnts.ro)
						return false;
					if (name == "blur")
						o.note = this.getContent();
				});

				//wnd.elmnts.pg_header = wnd.elmnts.tabs.tab_header.attachHeadFields({
				//	obj: o,
				//	pwnd: wnd,
				//	read_only: !$p.ajax.root    // TODO: учитывать права для каждой роли на каждый объект
				//});
			};

			attr.toolbar_struct = $p.injected_data["toolbar_calc_order_obj.xml"];

			attr.toolbar_click = toolbar_click;

			return this.constructor.prototype.form_obj.call(this, pwnd, attr)
				.then(function (res) {

					o = res.o;
					wnd = res.wnd;

					return res;
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

					case 'btn_retrieve':
						save("retrieve");
						break;

					case 'btn_close':
						wnd.close();
						break;

					case 'btn_add_builder':
						open_builder(true);
						break;

					case 'btn_add_product':
						$p.injected_data["wnd/wnd_product_list"](o, wnd, process_add_product);
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
						caltndar_new_event();
						break;

					case 'btn_go_connection':
						go_connection();
						break;

				}
			}

			/**
			 * создаёт событие календаря
			 */
			function caltndar_new_event(){
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
						//		production: $p.fix_number(wnd.elmnts.discount.getItemValue("production"), true),
						//		accessories: $p.fix_number(wnd.elmnts.discount.getItemValue("accessories"), true),
						//		services: $p.fix_number(wnd.elmnts.discount.getItemValue("services"), true)
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
			 * обработчик выбора значения в таблице продукции (ссылочные типы)
			 */
			function production_on_value_select(v){
				this.row[this.col] = v;
				this.cell.setValue(v.presentation);
				production_on_value_change();
			}

			/**
			 * РассчитатьСпецификациюСтроки() + ПродукцияПриОкончанииРедактирования()
			 * при изменении строки табчасти продукции
			 */
			function production_on_value_change(rId){

				wnd.progressOn();
				// TODO: _mgr.save
				//_mgr.save({
				//	ref: o.ref,
				//	row: rId!=undefined ? rId : production_get_sel_index(),
				//	o: o._obj,
				//	action: "calc",
				//	specify: "production"
				//}).then(function(res){
				//	if(!$p.msg.check_soap_result(res))
				//		wnd.reflect_characteristic_change(res); // - перезаполнить шапку и табчасть
				//	wnd.progressOff();
				//});
			}

			/**
			 * Перечитать табчасть продукции из объекта
			 */
			function production_refresh(){
				o["production"].sync_grid(wnd.elmnts.grids.production);
			}

			/**
			 * обработчик активизации строки продукции
			 */
			function production_on_row_activate(rId, cInd){
				var row = o["production"].get(rId-1),
					sfields = this.getUserData("", "source").fields,
					rofields = "nom,characteristic,qty,len,width,s,quantity,unit",
					pval;


				if($p.is_data_obj(row.ordn) && !row.ordn.empty()){
					for(var i in sfields)
						if(rofields.indexOf(sfields[i])!=-1){
							pval = this.cells(rId, Number(i)).getValue();
							this.setCellExcellType(rId, Number(i), "ro");
							if($p.is_data_obj(pval))
								this.cells(rId, Number(i)).setValue(pval.presentation);
						}
				}
			}

			/**
			 * обработчик изменения значения в таблице продукции (примитивные типы)
			 */
			function production_on_edit(stage, rId, cInd, nValue, oValue){
				if(stage != 2 || nValue == oValue) return true;
				var fName = this.getUserData("", "source").fields[cInd], ret_code;
				if(fName == "note"){
					ret_code = true;
					o["production"].get(rId-1)[fName] = nValue;
				} else if (!isNaN(Number(nValue))){
					ret_code = true;
					o["production"].get(rId-1)[fName] = Number(nValue);
				}
				if(ret_code){
					setTimeout(function(){ production_on_value_change(rId-1); } , 0);
					return ret_code;
				}
			}


			/**
			 * вспомогательные функции
			 */


			/**
			 * настройка (инициализация) табличной части продукции
			 */
			function production_init(){


				// собственно табличная часть
				var grid = wnd.elmnts.grids.production,
					source = {
						o: o,
						wnd: wnd,
						on_select: production_on_value_select,
						tabular_section: "production",
						footer_style: "text-align: right; font: bold 12px Tahoma; color: #005; background: #f9f9f9; height: 22px;"
					};
				production_captions(source);

				grid.setIconsPath(dhtmlx.image_path);
				grid.setImagePath(dhtmlx.image_path);

				// 16 полей
				//row, nom, characteristic, note, qty, len, width, s, quantity, unit, discount_percent, price, amount, discount_percent_internal, price_internal, amount_internal
				grid.setHeader(source.headers);
				grid.setInitWidths(source.widths);
				grid.setColumnMinWidth(source.min_widths);

				grid.setColumnIds(source.fields.join(","));
				grid.enableAutoWidth(true, 1200, 600);
				grid.enableEditTabOnly(true);

				grid.init();
				//grid.enableLightMouseNavigation(true);
				//grid.enableKeyboardSupport(true);
				//grid.splitAt(2);

				grid.attachFooter("Итого:,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,#cspan,{#stat_total}, ,#cspan,{#stat_total}",
					[source.footer_style, "","","","","","","","","","","",source.footer_style,source.footer_style,"",source.footer_style]);

				grid.setUserData("", "source", source);
				grid.attachEvent("onEditCell", production_on_edit);
				grid.attachEvent("onRowSelect", production_on_row_activate);
			}


			/**
			 * перечитывает реквизиты шапки из объекта в гриды
			 */
			function header_refresh(){
				function reflect(id){
					if(typeof id == "string"){
						var fv = o[id]
						if(fv != undefined){
							if($p.is_data_obj(fv))
								this.cells(id, 1).setValue(fv.presentation);
							else if(fv instanceof Date)
								this.cells(id, 1).setValue($p.dateFormat(fv, ""));
							else
								this.cells(id, 1).setValue(fv);

						}else if(id.indexOf("extra_fields") > -1){
							var row = o["extra_fields"].find(id.split("|")[1]);
						}
					}
				}
				wnd.elmnts.pg_left.forEachRow(function(id){	reflect.call(wnd.elmnts.pg_left, id); });
				wnd.elmnts.pg_right.forEachRow(function(id){ reflect.call(wnd.elmnts.pg_right, id); });
			}

			function production_new_row(){
				var row = o["production"].add({
					qty: 1,
					quantity: 1,
					discount_percent_internal: $p.wsql.get_user_param("discount", "number")
				});
				production_refresh();
				wnd.elmnts.grids.production.selectRowById(row.row);
				return row;
			}

			function production_get_sel_index(){
				var selId = wnd.elmnts.grids.production.getSelectedRowId();
				if(selId && !isNaN(Number(selId)))
					return Number(selId)-1;
				$p.msg.show_msg({type: "alert-warning",
					text: $p.msg.no_selected_row.replace("%1", "Продукция"),
					title: _mgr.metadata()["obj_presentation"] + ' №' + o.number_str});
			}

			function production_del_row(){

				var rId = production_get_sel_index(), row;

				if(rId == undefined)
					return;
				else
					row = o["production"].get(rId);

				// проверяем, не подчинена ли текущая строка продукции
				if($p.is_data_obj(row.ordn) && !row.ordn.empty()){
					// возможно, ссылка оборвана. в этом случае, удаление надо разрешить
					if(o["production"].find({characteristic: row.ordn})){
						$p.msg.show_msg({type: "alert-warning",
							text: $p.msg.sub_row_change_disabled,
							title: o.presentation + ' стр. №' + (rId + 1)});
						return;
					}
				}

				// если удаляем строку продукции, за одно надо удалить и подчиненные аксессуары
				if($p.is_data_obj(row.characteristic) && !row.characteristic.empty()){
					o["production"].find_rows({ordn: row.characteristic}).forEach(function (r) {
						o["production"].del(r);
					});
				}

			}

			function save(action){

				function do_save(){

					wnd.progressOn();

					o.note = wnd.elmnts.note_editor.getContent();

					o.save()
						.then(function(){

							wnd.progressOff();
							wnd.modified = false;

							if(action == "sent" || action == "close")
								wnd.close();

						})
						.catch(function(err){
							wnd.progressOff();
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
								o["obj_delivery_state"] = $p.enm.obj_delivery_states.Отправлен;
								do_save();
							}
						}
					});

				} else if(action == "retrieve"){
					// установить транспорт в "отозвано" и записать
					o["obj_delivery_state"] =  $p.enm.obj_delivery_states.Отозван;
					do_save();

				} else if(action == "save"){
					do_save();
				}
			}

			function frm_close(win){

				// выгружаем из памяти всплывающие окна скидки и связанных файлов
				["vault", "vault_pop", "discount", "discount_pop"].forEach(function (elm) {
					if (wnd.elmnts[elm])
						wnd.elmnts[elm].unload();
				});



				return true;
			}

			function set_editable(){

				// статусы
				var ds = $p.enm["obj_delivery_states"],
					st_draft = ds.Черновик.ref,
					st_sent = ds.Отправлен.ref,
					st_retrieve = ds.Отозван.ref,
					st_rejected = ds.Отклонен.ref,
					retrieve_enabed,
					detales_toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();

				wnd.elmnts.pg_right.cells("vat_consider", 1).setDisabled(true);
				wnd.elmnts.pg_right.cells("vat_included", 1).setDisabled(true);

				wnd.elmnts.ro = o["posted"] || o["_deleted"];
				if(!wnd.elmnts.ro && !o["obj_delivery_state"].empty())
					wnd.elmnts.ro = !($p.is_equal(o["obj_delivery_state"], st_draft) || $p.is_equal(o["obj_delivery_state"], st_retrieve));

				retrieve_enabed = !o["_deleted"] &&
					($p.is_equal(o["obj_delivery_state"], st_sent) || $p.is_equal(o["obj_delivery_state"], st_rejected));

				wnd.elmnts.grids.production.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_left.setEditable(!wnd.elmnts.ro);
				wnd.elmnts.pg_right.setEditable(!wnd.elmnts.ro);

				// кнопки проведения гасим всегда
				wnd.elmnts.frm_toolbar.hideItem("btn_post");
				wnd.elmnts.frm_toolbar.hideItem("btn_unpost");

				// кнопки записи и отправки гасим в зависимости от статуса
				if(wnd.elmnts.ro){
					wnd.elmnts.frm_toolbar.disableItem("btn_sent");
					wnd.elmnts.frm_toolbar.disableItem("btn_save");
					detales_toolbar.forEachItem(function(itemId){
						detales_toolbar.disableItem(itemId);
					});
				}else{
					wnd.elmnts.frm_toolbar.enableItem("btn_sent");
					wnd.elmnts.frm_toolbar.enableItem("btn_save");
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
			 * ОткрытьПостроитель()
			 * @param create_new {Boolean} - создавать новое изделие или открывать в текущей строке
			 */
			function open_builder(create_new){
				var selId, row, attr;

				if(create_new){
					row = production_new_row();
					// объект продукции создаём, но из 1С не читаем и пока не записываем
					$p.cat.characteristics.create({
						ref: $p.generate_guid(),
						calc_order: o,
						product: row.row
					}, true)
						.then(function (ox) {
							row.characteristic = ox;
							$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
						});

				}else if((selId = production_get_sel_index()) != undefined){
					row = o.production.get(selId);
					if(row && !$p.is_empty_guid(row.characteristic.ref))
						$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
				}
			}

			function open_spec(){
				var selId, row;

				if((selId = production_get_sel_index()) != undefined){
					row = o.production.get(selId);
					if(row && !$p.is_empty_guid(row.characteristic.ref)){
						row.characteristic.form_obj()
							.then(function (w) {
								w.wnd.maximize();
							});
					}
				}
			}

			/**
			 * добавляет строку материала
			 */
			function add_material(){
				var row = production_new_row(),
					grid = wnd.elmnts.grids.production,
					cell;
				grid.selectCell(row.row-1, grid.getColIndexById("nom"), false, true, true);
				cell = grid.cells();
				cell.edit();
				cell.open_selection();
			}

			/**
			 * ОбработатьДобавитьПродукцию()
			 */
			function process_add_product(new_rows){

				wnd.progressOn();
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

		}

	}
);
