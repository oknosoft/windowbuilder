/**
 * Главное окно интерфейса
 *
 * Created 25.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module wnd_main
 */

/**
 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 * @param modifiers {Array} - сюда можно добавить обработчики, переопределяющие функциональность объектов данных
 */
$p.settings = function (prm, modifiers) {

	// разделитель для localStorage
	prm.local_storage_prefix = "wb_";

	//prm.rest = true;
	prm.irest_enabled = true;

	// расположение rest-сервиса 1c
	prm.rest_path = "/a/zd/%1/odata/standard.odata/";

	// по умолчанию, обращаемся к зоне 0
	prm.zone = 0;

	// расположение couchdb
	prm.couch_path = "/couchdb/wb_";
	//prm.couchdb = "http://192.168.9.136:5984/wb_";

	// логин гостевого пользователя couchdb
	prm.guest_name = "guest";

	// пароль гостевого пользователя couchdb
	prm.guest_pwd = "meta";

	// гостевые пользователи для демо-режима
	prm.guests = [{
		username: "Дилер",
		password: "2"
	}];

	// скин по умолчанию
	prm.skin = "dhx_terrace";

	// сокет временно отключаем
	// prm.ws_url = "ws://builder.oknosoft.local:8001";

	// TODO: удалить расположение файлов данных
	prm.data_url = "data/";

	// используем геокодер
	prm.use_ip_geo = true;

	// разрешаем покидать страницу без лишних вопросов
	// $p.eve.redirect = true;

};

$p.iface.oninit = function() {

	// разделы интерфейса
	$p.iface.sidebar_items = [
		{id: "orders", text: "Заказы", icon: "projects_48.png"},
		{id: "events", text: "Планирование", icon: "events_48.png"},
		{id: "settings", text: "Настройки", icon: "settings_48.png"},
		{id: "about", text: "О программе", icon: "about_48.png"}
	];


	// наблюдатель за событиями авторизации и синхронизации
	$p.iface.btn_auth_sync = new OBtnAuthSync();

	// подписываемся на событие готовности метаданных, после которого рисуем интерфейс
	var dt = Date.now();
	$p.eve.attachEvent("meta", function () {
		console.log(Date.now() - dt);

		// гасим заставку
		document.body.removeChild(document.querySelector("#builder_splash"));

		// основной сайдбар
		$p.iface.main = new dhtmlXSideBar({
			parent: document.body,
			icons_path: "dist/imgs/",
			width: 180,
			header: true,
			template: "tiles",
			autohide: true,
			items: $p.iface.sidebar_items,
			offsets: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		});

		// подписываемся на событие навигации по сайдбару
		$p.iface.main.attachEvent("onSelect", function(id){

			var hprm = $p.job_prm.parse_url();
			if(hprm.view != id)
				$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, id);

			$p.iface["view_" + id]($p.iface.main.cells(id));

		});

		// включаем индикатор загрузки
		$p.iface.main.progressOn();

		// активируем страницу
		hprm = $p.job_prm.parse_url();
		if(!hprm.view || $p.iface.main.getAllItems().indexOf(hprm.view) == -1){
			$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, "orders");
		} else
			setTimeout($p.iface.hash_route);

	});

	// Подписываемся на событие окончания загрузки локальных данных
	var pouch_data_loaded = $p.eve.attachEvent("pouch_load_data_loaded", function () {

		$p.iface.main.progressOff();

		// если разрешено сохранение пароля - сразу пытаемся залогиниться
		if(!$p.wsql.pouch.authorized && navigator.onLine &&
			$p.wsql.get_user_param("enable_save_pwd") &&
			$p.wsql.get_user_param("user_name") &&
			$p.wsql.get_user_param("user_pwd")){

			setTimeout(function () {
				$p.iface.frm_auth({
					modal_dialog: true,
					try_auto: true
				});
			}, 100);
		}

		$p.eve.detachEvent(pouch_data_loaded);

	});

	// Подписываемся на событие окончания загрузки локальных данных
	var pouch_load_data_error = $p.eve.attachEvent("pouch_load_data_error", function (err) {

		// если это первый запуск, показываем диалог авторизации
		if(err.db_name && err.hasOwnProperty("doc_count") && err.doc_count < 10){
			$p.iface.frm_auth({
				modal_dialog: true
			});
		}
		$p.iface.main.progressOff();

	});


};

/**
 * Обработчик маршрутизации
 * @param hprm
 * @return {boolean}
 */
$p.eve.hash_route.push(function (hprm) {

	// view отвечает за переключение закладки в SideBar
	if(hprm.view && $p.iface.main.getActiveItem() != hprm.view){
		$p.iface.main.getAllItems().forEach(function(item){
			if(item == hprm.view)
				$p.iface.main.cells(item).setActive(true);
		});
	}
	return false;
});