/**
 * окно отладки построителя paper-canvas
 */

/**
 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 * @param modifiers {Array} - сюда можно добавить обработчики, переопределяющие функциональность объектов данных
 */
$p.settings = function (prm, modifiers) {


	prm.use_builder =  false;           // используем построитель Raphael
	prm.builder_paper = true;           // используем старый построитель
	prm.check_app_installed = false;    // установленность приложения в ChromeStore не проверяем
	prm.use_google_geo = false;			// геолокатор не используем
	prm.offline = true;                 // автономная работа. запросы к 1С запрещены
	prm.demo = {
		calc_order: "f0e9b97d-8396-408a-af14-b3b1c5849def",
		production: "8756eecf-f577-402c-86ce-74608d062a32"
	};
	if(localStorage){
		localStorage.setItem("offline", "true");
		localStorage.setItem("base_blocks_folder", "20c5524b-7eab-11e2-be96-206a8a1a5bb0");// типовой блок по умолчанию
	}

	/**
	 * по умолчанию, обращаемся к зоне 1
	 */
	prm.zone = 1;

	/**
	 * расположение файлов данных
	 */
	prm.data_url = "data/";

	/**
	 * расположение файла инициализации базы sql
	 */
	prm.create_tables = true;
	prm.create_tables_sql = require("create_tables");

	/**
	 * подключаем модификаторы
	 */
	modifiers.push(require("modifiers/catalogs"));
	modifiers.push(require("modifiers/enumerations"));

};



/**
 * инициализация dhtmlXWindows и анализ WebSQL при готовности документа
 */
$p.iface.oninit = function() {

	// Создаём контейнер div, в котором расположим элементы построителя
	var eid = 'paper_builder' + dhx4.newId(), prm, v;

	function on_log_in_step(step){

		switch(step) {

			case $p.eve.steps.authorization:

				$p.iface.main.setText("Авторизация");

				break;

			case $p.eve.steps.load_meta:

				// индикатор прогресса и малое всплывающее сообщение
				$p.iface.main.setText($p.msg.init_catalogues + $p.msg.init_catalogues_meta);

				break;

			case $p.eve.steps.create_managers:

				$p.iface.main.setText("Создаём объекты менеджеров данных...");

				break;

			case $p.eve.steps.process_access:

				break;

			case $p.eve.steps.load_data_files:

				$p.iface.main.setText("Читаем файлы данных зоны...");

				break;

			case $p.eve.steps.load_data_db:

				$p.iface.main.setText("Читаем изменённые справочники из 1С...");

				break;

			case $p.eve.steps.load_data_wsql:

				break;

			case $p.eve.steps.save_data_wsql:

				$p.iface.main.setText("Сохраняем таблицы в локальном SQL...");

				break;

			default:

				break;
		}

	}


	$p.eve.redirect = true;

	// при первой возможности создаём layout
	$p.iface.docs = new dhtmlXLayoutObject({
		parent: document.body,
		pattern: "1C"
	});
	// приклеиваем к layout-у div рисовалки
	$p.iface.main = $p.iface.docs.cells("a");
	$p.iface.main.attachHTMLString("<div id=" + eid + " style='width: 100%; height: 100%;'></div>");

	setTimeout($p.cat.load_catalogues, 0);

	// прочитаем данные из json
	// подключение к 1С на этапе отладки не требуется
	$p.eve.log_in(on_log_in_step)

		.then(function () {

			$p.iface.main.hideHeader();
			$p.scheme = new $p.Scheme(eid, $p.iface.main);

			/**
			 для целей отледки, заполняем __ox__ простыми данными
			 */
			$p.cat.characteristics._cachable = true;
			$p.cat.characteristics.get($p.job_prm.demo.production, true, true)
				.then($p.scheme.load);

		})

		.catch(function (err) {
			console.log(err);
		});



};
