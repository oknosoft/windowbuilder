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

	var prm, v, _cell;

	function on_log_in_step(step){

		switch(step) {

			case $p.eve.steps.authorization:

				_cell.setText("Авторизация");

				break;

			case $p.eve.steps.load_meta:

				// индикатор прогресса и малое всплывающее сообщение
				_cell.setText($p.msg.init_catalogues + $p.msg.init_catalogues_meta);

				break;

			case $p.eve.steps.create_managers:

				_cell.setText("Создаём объекты менеджеров данных...");

				break;

			case $p.eve.steps.process_access:

				break;

			case $p.eve.steps.load_data_files:

				_cell.setText("Читаем файлы данных зоны...");

				break;

			case $p.eve.steps.load_data_db:

				_cell.setText("Читаем изменённые справочники из 1С...");

				break;

			case $p.eve.steps.load_data_wsql:

				break;

			case $p.eve.steps.save_data_wsql:

				_cell.setText("Сохраняем таблицы в локальном SQL...");

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
	_cell = $p.iface.docs.cells("a");

	setTimeout($p.cat.load_catalogues, 0);

	// прочитаем данные из json
	// подключение к 1С на этапе отладки не требуется
	$p.eve.log_in(on_log_in_step)

		.then(function () {

			_cell.hideHeader();
			$p.scheme = new $p.Scheme(_cell);

			/**
			 для целей отледки, заполняем __ox__ простыми данными
			 */
			$p.cat.characteristics._cachable = true;

			$p.cat.characteristics.form_selection({
				initial_value: $p.job_prm.demo.production,
				on_select: function (sval) {
					$p.scheme.load(sval);
				}
			});

		})

		.catch(function (err) {
			console.log(err);
		});



};
