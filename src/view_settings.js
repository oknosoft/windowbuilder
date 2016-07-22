/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_settings
 */

$p.iface.view_settings = function (cell) {

	function OViewSettings(){

		var t = this, deferred_id;

		function hash_route(hprm) {

			if(hprm.view == "settings"){

				return false;
			}

			return true;
		}

		function deferred_init(){

			// отписываемся от события
			if(deferred_id)
				$p.eve.detachEvent(deferred_id);

			// разблокируем
			if(t.form2.isLocked())
				t.form2.unlock();

			// устанавливаем значения сокрытия колонок цен
			if($p.wsql.get_user_param("hide_price_dealer")){
				t.form2.checkItem("hide_price", "hide_price_dealer");

			}else if($p.wsql.get_user_param("hide_price_manufacturer")){
				t.form2.checkItem("hide_price", "hide_price_manufacturer");

			}else{
				t.form2.checkItem("hide_price", "hide_price_no");

			}

			if($p.current_acl.partners_uids.length){


				var partner = $p.cat.partners.get($p.current_acl.partners_uids[0]),
					prm = {calc_order_row: {
						nom: $p.cat.nom.get(),
						_owner: {_owner: {partner: partner}}
					}};

				$p.pricing.price_type(prm);

				t.form2.setItemValue("surcharge_internal", prm.price_type.extra_charge_external);


			}else{
				t.form2.disableItem("surcharge_internal");
				t.form2.disableItem("discount_percent_internal");
			}

			// подключаем обработчик изменения значений в форме
			t.form2.attachEvent("onChange", function (name, value, state){
				
				if(name == "hide_price"){
					if(value == "hide_price_dealer"){
						$p.wsql.set_user_param("hide_price_dealer", true);
						$p.wsql.set_user_param("hide_price_manufacturer", "");

					}else if(value == "hide_price_manufacturer"){
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", true);

					}else{
						$p.wsql.set_user_param("hide_price_dealer", "");
						$p.wsql.set_user_param("hide_price_manufacturer", "");
					}
				}
			});

			t.form2.getInput("modifiers").onchange = function () {
				$p.wsql.set_user_param("modifiers", this.value);
			};

		}
		
		t.tb_nav = $p.iface.btns_nav(cell.cell.querySelector(".dhx_cell_sidebar_hdr"));

		// разделы настроек
		t.tabs = cell.attachTabbar({
			arrows_mode:    "auto",
			tabs: [
				{id: "const", text: '<i class="fa fa-key"></i> Общее', active: true},
				{id: "industry", text: '<i class="fa fa-industry"></i> Технология'},
				{id: "price", text: '<i class="fa fa-money"></i> Учет'},
				{id: "events", text: '<i class="fa fa-calendar-check-o"></i> Планирование'}
			]
		});

		t.tabs.attachEvent("onSelect", function(id){
			if(t[id] && t[id].tree && t[id].tree.getSelectedItemId()){
				t[id].tree.callEvent("onSelect", [t[id].tree.getSelectedItemId()]);
			}
			return true;
		});

		// закладка основных настроек
		t.tabs.cells("const").attachHTMLString($p.injected_data['view_settings.html']);
		t.const = t.tabs.cells("const").cell.querySelector(".dhx_cell_cont_tabbar");
		t.const.style.overflow = "auto";

		// форма общих настроек
		t.form1 = t.const.querySelector("[name=form1]");
		t.form1 = new dhtmlXForm(t.form1.firstChild, [

			{ type:"settings", labelWidth:80, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Тип устройства", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_device_type", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"device_type", labelWidth:120, label:'<i class="fa fa-desktop"></i> Компьютер', value:"desktop"},
				{ type:"newcolumn"   },
				{ type:"radio" , name:"device_type", labelWidth:150, label:'<i class="fa fa-mobile fa-lg"></i> Телефон, планшет', value:"phone"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Класс устройства определяется автоматически, но пользователь может задать его явно", width: 320}},

			//{type: "label", labelWidth:320, label: "Адрес http сервиса 1С", className: "label_options"},
			//{type:"input" , inputWidth: 220, name:"rest_path", label:"Путь", validate:"NotEmpty"},
			//{type:"template", label:"",value:"",
			//	note: {text: "Можно указать как относительный, так и абсолютный URL публикации 1С OData. " +
			//	"О настройке кроссдоменных запросов к 1С <a href='#'>см. здесь</a>", width: 320}},

			{type: "label", labelWidth:320, label: "Адрес CouchDB", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_path", label:"Путь:", validate:"NotEmpty"},
			{type:"template", label:"",value:"",
				note: {text: "Можно указать как относительный, так и абсолютный URL публикации CouchDB", width: 320}},

			{type: "label", labelWidth:320, label: "Значение разделителя данных", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"zone", label:"Зона:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Для неразделенной публикации, зона = 0", width: 320}},

			{type: "label", labelWidth:320, label: "Суффикс базы пользователя", className: "label_options"},
			{type:"input" , inputWidth: 220, name:"couch_suffix", label:"Суффикс:"},
			{type:"template", label:"",value:"",
				note: {text: "Назначается дилеру при регистрации", width: 320}},

			{type: "label", labelWidth:320, label: "Сохранять пароль пользователя", className: "label_options"},
			{type:"checkbox", name:"enable_save_pwd", label:"Разрешить:", checked: $p.wsql.get_user_param("enable_save_pwd", "boolean")},
			{type:"template", label:"",value:"", note: {text: "Не рекомендуется, если к компьютеру имеют доступ посторонние лица", width: 320}},
			{type:"template", label:"",value:"", note: {text: "", width: 320}},

			{ type:"block", blockOffset: 0, name:"block_buttons", list:[
				{type: "button", name: "save", value: "<i class='fa fa-floppy-o fa-lg'></i>", tooltip: "Применить настройки и перезагрузить программу"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 20, name: "reset", value: "<i class='fa fa-refresh fa-lg'></i>", tooltip: "Стереть справочники и перезаполнить данными сервера"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 60, name: "upload", value: "<i class='fa fa-cloud-upload fa-lg'></i>", tooltip: "Выгрузить изменения справочников на сервер"}
			]  }

			]
		);
		t.form1.cont.style.fontSize = "100%";

		// инициализация свойств

		t.form1.checkItem("device_type", $p.job_prm.device_type);

		["zone", "couch_path", "couch_suffix"].forEach(function (prm) {
			if(prm == "zone")
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm));
			else
				t.form1.setItemValue(prm, $p.wsql.get_user_param(prm) || $p.job_prm[prm]);
		});

		t.form1.attachEvent("onChange", function (name, value, state){
			$p.wsql.set_user_param(name, name == "enable_save_pwd" ? state || "" : value);
		});

		t.form1.attachEvent("onButtonClick", function(name){

			function do_reload(){
				setTimeout(function () {
					$p.eve.redirect = true;
					location.reload(true);
				}, 2000);
			}

			if(name == "save")
				location.reload();

			else if(name == "reset"){
				dhtmlx.confirm({
					title: "Сброс данных",
					text: "Стереть справочники и перезаполнить данными сервера?",
					cancel: $p.msg.cancel,
					callback: function(btn) {
						if(btn)
							$p.wsql.pouch.reset_local_data();
					}
				});
				
			}else if(name == "upload"){
				$p.pricing.cut_upload();
			}
		});

		// форма личных настроек
		t.form2 = t.const.querySelector("[name=form2]");
		t.form2 = new dhtmlXForm(t.form2.firstChild, [
			{ type:"settings", labelWidth:220, position:"label-left"  },

			{type: "label", labelWidth:320, label: "Колонки цен", className: "label_options"},
			{ type:"block", blockOffset: 0, name:"block_hide_price", list:[
				{ type:"settings", labelAlign:"left", position:"label-right"  },
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-eye fa-fw"></i> Показывать все цены', value:"hide_price_no"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-user-secret fa-fw"></i> Скрыть цены дилера', value:"hide_price_dealer"},
				{ type:"radio" , name:"hide_price", label:'<i class="fa fa-university fa-fw"></i> Скрыть цены завода', value:"hide_price_manufacturer"}
			]  },
			{type:"template", label:"",value:"", note: {text: "Настройка видимости колонок в документе 'Расчет' и графическом построителе", width: 320}},

			{type: "label", labelWidth:320, label: "Наценки и скидки", className: "label_options"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"surcharge_internal", label:"Наценка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"input" , labelWidth:180, inputWidth: 120, name:"discount_percent_internal", label:"Скидка дилера, %:", numberFormat: ["0", "", ""], validate:"NotEmpty,ValidInteger"},
			{type:"template", label:"",value:"", note: {text: "Значения наценки и скидки по умолчанию, которые дилер предоставляет своим (конечным) покупателям", width: 320}},

			{type: "label", labelWidth:320, label: "Подключаемые модули", className: "label_options"},
			{type:"input" , position:"label-top", inputWidth: 320, name:"modifiers", label:"Модификаторы:", value: $p.wsql.get_user_param("modifiers"), rows: 3, style:"height:80px;"},
			{type:"template", label:"",value:"", note: {text: "Список дополнительных модулей", width: 320}}

		]);
		t.form2.cont.style.fontSize = "100%";

		// если основной контрагент уже в озу, устанавливаем умолчания. иначе, setReadonly и подписываемся на событие окончания загрузки
		if(!$p.cat.partners.alatable.length || !$p.current_acl){
			t.form2.lock();
			deferred_id = $p.eve.attachEvent("predefined_elmnts_inited", deferred_init);
		}else {
			deferred_init();
		}



		// закладка технологии
		t.industry = {
			layout: t.tabs.cells("industry").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево технологических справочников
		t.industry.tree = t.industry.layout.cells("a").attachTree();
		t.industry.tree.enableTreeImages(false);
		t.industry.tree.parse($p.injected_data["tree_industry.xml"]);
		t.industry.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.industry.layout.cells("b"), {hide_header: true});
		});

		// закладка ценообразования
		t.price = {
			layout: t.tabs.cells("price").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников ценообразования
		t.price.tree = t.price.layout.cells("a").attachTree();
		t.price.tree.enableTreeImages(false);
		t.price.tree.parse($p.injected_data["tree_price.xml"]);
		t.price.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.price.layout.cells("b"), {hide_header: true});
		});

		// закладка планирования
		t.events = {
			layout: t.tabs.cells("events").attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Разделы",
					collapsed_text: "Разделы",
					width: 200
				}, {
					id: "b",
					text: "Раздел",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			})
		};
		// дерево справочников планирования
		t.events.tree = t.events.layout.cells("a").attachTree();
		t.events.tree.enableTreeImages(false);
		t.events.tree.parse($p.injected_data["tree_events.xml"]);
		t.events.tree.attachEvent("onSelect", function (name) {
			$p.md.mgr_by_class_name(name).form_list(t.events.layout.cells("b"), {hide_header: true});
		});
		
		
		/**
		 * Обработчик маршрутизации
		 * @param hprm
		 * @return {boolean}
		 */
		$p.on("hash_route", hash_route);

	}

	return $p.iface._settings || ($p.iface._settings = new OViewSettings());

};
