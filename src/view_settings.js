/**
 *
 * Created 24.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author  Evgeniy Malyarov
 * @module  view_settings
 */

$p.iface.view_settings = function (cell) {

	function OViewSettings(){

		var t = this;

		function hash_route(hprm) {

			if(hprm.view == "settings"){

				return false;
			}

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
		t.form = t.const.querySelector("[name=form1]");
		t.form = new dhtmlXForm(t.form.firstChild, [

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

			{type: "label", labelWidth:320, label: "Значение разделителя публикации 1С fresh", className: "label_options"},
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
				{type: "button", name: "save", value: "<i class='fa fa-floppy-o fa-fw' aria-hidden='true'></i>", tooltip: "Применить настройки и перезагрузить программу"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 20, name: "reset", value: "<i class='fa fa-refresh fa-fw' aria-hidden='true'></i>", tooltip: "Стереть справочники и перезаполнить данными сервера"},
				{type:"newcolumn"},
				{type: "button", offsetLeft: 60, name: "upload", value: "<i class='fa fa-cloud-upload fa-fw' aria-hidden='true'></i>", tooltip: "Выгрузить изменения справочников на сервер"}
			]  }

			]
		);
		t.form.cont.style.fontSize = "100%";

		// инициализация свойств

		t.form.checkItem("device_type", $p.wsql.get_user_param("device_type"));

		["zone", "couch_path", "couch_suffix"].forEach(function (prm) {
			if(prm == "zone")
				t.form.setItemValue(prm, $p.wsql.get_user_param(prm));
			else
				t.form.setItemValue(prm, $p.wsql.get_user_param(prm) || $p.job_prm[prm]);
		});

		t.form.attachEvent("onChange", function (name, value, state){
			$p.wsql.set_user_param(name, name == "enable_save_pwd" ? state || "" : value);
		});

		t.form.attachEvent("onButtonClick", function(name){

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
		$p.eve.hash_route.push(hash_route);

	}

	if(!$p.iface._settings)
		$p.iface._settings = new OViewSettings();

	return $p.iface._settings;

};
