;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wnd_debug = factory();
  }
}(this, function() {
$p.injected_data._mixin({"toolbar_calc_order_production.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n\n  <item type=\"buttonSelect\" id=\"bs_grp_add\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку заказа\" openAll=\"true\" >\n    <item type=\"button\" id=\"btn_add_builder\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt; Изделие построителя\" />\n    <item type=\"button\" id=\"btn_add_product\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Продукцию или услугу\" />\n    <item type=\"button\" id=\"btn_add_material\" text=\"&lt;i class='fa fa-cube fa-fw'&gt;&lt;/i&gt; Материал\" />\n    <item type=\"button\" id=\"btn_clone\" text=\"&lt;i class='fa fa-clone fa-fw'&gt;&lt;/i&gt; Скопировать изделие\" />\n  </item>\n\n  <item type=\"button\" id=\"btn_edit\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt;\" title=\"Редактировать изделие построителя\" />\n  <item type=\"button\" id=\"btn_spec\" text=\"&lt;i class='fa fa-table fa-fw'&gt;&lt;/i&gt;\" title=\"Открыть спецификацию изделия\" />\n  <item type=\"button\" id=\"btn_delete\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить строку заказа\" />\n  <item type=\"button\" id=\"btn_discount\" text=\"&lt;i class='fa fa-percent fa-fw'&gt;&lt;/i&gt;\" title=\"Скидки по типам строк заказа\"/>\n  <item id=\"sep1\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_calc_order_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_save_close\" text=\"&lt;i class='fa fa-caret-square-o-down fa-fw'&gt;&lt;/i&gt;\" title=\"Записать и закрыть\"/>\r\n    <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Записать\"/>\r\n    <item type=\"button\" id=\"btn_sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отправить заказ\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\" />\r\n\r\n    <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_message\" enabled=\"false\" text=\"Сообщение\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\r\n        <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\r\n    </item>\r\n\r\n    <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\"  title=\"Дополнительно\" openAll=\"true\">\r\n        <item type=\"button\"     id=\"btn_retrieve\"    text=\"&lt;i class='fa fa-undo fa-fw'&gt;&lt;/i&gt; Отозвать\" title=\"Отозвать заказ\" />\r\n        <item type=\"separator\"  id=\"sep_export\" />\r\n        <item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить из файла\" />\r\n        <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить в файл\" />\r\n    </item>\r\n\r\n    <item id=\"sep_close_1\" type=\"separator\"/>\r\n    <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\r\n    <item id=\"sep_close_2\" type=\"separator\"/>\r\n\r\n</toolbar>","toolbar_product_list.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"btn_ok\"   type=\"button\"   text=\"&lt;b&gt;Рассчитать и закрыть&lt;/b&gt;\" title=\"Рассчитать, записать и закрыть\"  />\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item id=\"btn_xls\"  type=\"button\"\ttext=\"Загрузить из XLS\" title=\"Загрузить список продукции из файла xls\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"buttonSelect\" id=\"bs_print\" enabled=\"false\" text=\"\" title=\"\" openAll=\"true\">\r\n    </item>\r\n\r\n</toolbar>","toolbar_characteristics_specification.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n  <item type=\"button\" id=\"btn_origin\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt; Происхождение\" title=\"Ссылка на настройки\" />\n  <item id=\"sp\" type=\"spacer\"/>\n\n  <item id=\"input_filter\" type=\"buttonInput\" width=\"200\" title=\"Поиск по подстроке\" />\n\n  <item id=\"sep2\" type=\"separator\"/>\n  <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt;\"  title=\"Экспорт\" openAll=\"true\">\n    <item type=\"button\" id=\"btn_csv\" text=\"&lt;i class='fa fa-file-text-o fa-fw'&gt;&lt;/i&gt; Скопировать в CSV\" />\n    <item type=\"button\" id=\"btn_json\" text=\"&lt;i class='fa fa-file-code-o fa-fw'&gt;&lt;/i&gt; Скопировать в JSON\" />\n    <item type=\"button\" id=\"btn_xls\" text=\"&lt;i class='fa fa-file-excel-o fa-fw'&gt;&lt;/i&gt; Выгрузить в XLS\" />\n  </item>\n</toolbar>\n","toolbar_glass_inserts.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"btn_add\" type=\"button\"  text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку\"  />\n  <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\"  title=\"Удалить строку\" />\n  <item id=\"btn_up\" type=\"button\" text=\"&lt;i class='fa fa-arrow-up fa-fw'&gt;&lt;/i&gt;\"  title=\"Переместить строку вверх\" />\n  <item id=\"btn_down\" type=\"button\" text=\"&lt;i class='fa fa-arrow-down fa-fw'&gt;&lt;/i&gt;\"  title=\"Переместить строку вниз\" />\n  <item id=\"sep1\" type=\"separator\"/>\n  <item id=\"btn_inset\" type=\"button\" text=\"&lt;i class='fa fa-plug fa-fw'&gt;&lt;/i&gt;\"  title=\"Заполнить по вставке\" />\n</toolbar>\n","form_auth.xml":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<items>\n<item type=\"settings\" position=\"label-left\" labelWidth=\"80\" inputWidth=\"180\" noteWidth=\"180\"/>\n<item type=\"fieldset\" name=\"data\" inputWidth=\"auto\" label=\"Авторизация\">\n\n  <item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" checked=\"true\" value=\"guest\" label=\"Гостевой (демо) режим\">\n    <item type=\"select\" name=\"guest\" label=\"Роль\">\n      <option value=\"Дилер\" label=\"Дилер\"/>\n    </item>\n  </item>\n\n  <item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" value=\"auth\" label=\"Есть учетная запись\">\n    <item type=\"input\" value=\"\" name=\"login\" label=\"Логин\" validate=\"NotEmpty\" />\n    <item type=\"password\" value=\"\" name=\"password\" label=\"Пароль\" validate=\"NotEmpty\" />\n  </item>\n\n  <item type=\"button\" value=\"Войти\" name=\"submit\"/>\n\n  <item type=\"template\" name=\"text_options\" className=\"order_dealer_options\" inputWidth=\"170\"\n        value=\"&lt;a href='#' onclick='$p.iface.open_settings();' title='Страница настроек программы' &gt; &lt;i class='fa fa-cog fa-lg'&gt;&lt;/i&gt; Настройки &lt;/a&gt; &lt;a href='https://github.com/oknosoft/windowbuilder/issues' target='_blank' style='margin-left: 9px;' title='Задать вопрос через форму обратной связи' &gt; &lt;i class='fa fa-question-circle fa-lg'&gt;&lt;/i&gt; Вопрос &lt;/a&gt;\"  />\n\n</item>\n</items>\n","tree_balance.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"doc.debit_cash_order\" text=\"Приходный кассовый ордер\" select=\"1\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.credit_card_order\" text=\"Оплата от покупателя платежной картой\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.debit_bank_order\" text=\"Платежное поручение входящее\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.selling\" text=\"Реализация товаров и услуг\"><icons file=\"icon_1c_doc\" /></item>\r\n</tree>\r\n","tree_events.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.stores\" text=\"Склады\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.divisions\" text=\"Подразделения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"doc.work_centers_performance\" select=\"1\" text=\"Мощности рабочих центров\"><icons file=\"icon_1c_doc\" /></item>\r\n    <!--\r\n    <item id=\"doc.planning_event\" text=\"Событие планирования\"><icons file=\"icon_1c_doc\" /></item>\r\n    -->\r\n</tree>\r\n","tree_filteres.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<tree id=\"0\">\n    <item id=\"draft\" text=\"Черновики\" select=\"1\" tooltip=\"Предварительные расчеты\"><icons file=\"fa-pencil\" /></item>\n    <item id=\"sent\" text=\"Отправлено\" tooltip=\"Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в 'черновики')\"><icons file=\"fa-paper-plane-o\" /></item>\n    <item id=\"confirmed\" text=\"Согласовано\" tooltip=\"Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером\"><icons file=\"fa-thumbs-o-up\" /></item>\n    <item id=\"declined\" text=\"Отклонено\" tooltip=\"Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации\"><icons file=\"fa-thumbs-o-down\" /></item>\n\n    <!--item id=\"execution\" text=\"Долги\" tooltip=\"Оплата, отгрузка\"><icons file=\"fa-money\" /></item>\n    <item id=\"plan\" text=\"План\" tooltip=\"Согласованы, но еще не запущены в работу\"><icons file=\"fa-calendar-check-o\" /></item>\n    <item id=\"underway\" text=\"В работе\" tooltip=\"Включены в задания на производство, но еще не изготовлены\"><icons file=\"fa-industry\" /></item>\n    <item id=\"manufactured\" text=\"Изготовлено\" tooltip=\"Изготовлены, но еще не отгружены\"><icons file=\"fa-gavel\" /></item>\n    <item id=\"executed\" text=\"Исполнено\" tooltip=\"Отгружены клиенту\"><icons file=\"fa-truck\" /></item -->\n\n    <item id=\"service\" text=\"Сервис\" tooltip=\"Сервисное обслуживание\"><icons file=\"fa-medkit\" /></item>\n    <item id=\"complaints\" text=\"Рекламации\" tooltip=\"Жалобы и рекламации\"><icons file=\"fa-frown-o\" /></item>\n\n    <item id=\"template\" text=\"Шаблоны\" tooltip=\"Типовые блоки\"><icons file=\"fa-puzzle-piece\" /></item>\n    <item id=\"zarchive\" text=\"Архив\" tooltip=\"Старые заказы\"><icons file=\"fa-archive\" /></item>\n    <item id=\"all\" text=\"Все\" tooltip=\"Отключить фильтрацию\"><icons file=\"fa-expand\" /></item>\n</tree>\n","tree_industry.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.nom_kinds\" text=\"Виды номенклатуры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_groups\" text=\"Номенклатурные группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom\" text=\"Номенклатура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.production_params\" text=\"Параметры продукции\" select=\"1\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.cnns\" text=\"Соединения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.inserts\" text=\"Вставки\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.furns\" text=\"Фурнитура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.clrs\" text=\"Цвета\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.color_price_groups\" text=\"Цвето-ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.params_links\" text=\"Связи параметров\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.elm_visualization\" text=\"Визуализация элементов\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.insert_bind\" text=\"Привязки вставок\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.formulas\" text=\"Формулы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cch.properties\" text=\"Дополнительные реквизиты\"><icons file=\"icon_1c_cch\" /></item>\r\n</tree>\r\n","tree_price.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.users\" text=\"Пользователи\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.individuals\" text=\"Физические лица\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.organizations\" text=\"Организации\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.partners\" text=\"Контрагенты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.contracts\" text=\"Договоры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_prices_types\" text=\"Виды цен\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.price_groups\" text=\"Ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.currencies\" text=\"Валюты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"ireg.currency_courses\" text=\"Курсы валют\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"ireg.margin_coefficients\" text=\"Маржинальные коэффициенты\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"doc.nom_prices_setup\" text=\"Установка цен номенклатуры\" select=\"1\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"cch.predefined_elmnts\" text=\"Константы и списки\"><icons file=\"icon_1c_cch\" /></item>\r\n\r\n</tree>\r\n","view_about.html":"<div class=\"md_column1300\">\n    <h1><i class=\"fa fa-info-circle\"></i> Окнософт: Заказ дилера</h1>\n    <p>Заказ дилера - это веб-приложение с открытым исходным кодом, разработанное компанией <a href=\"http://www.oknosoft.ru/\" target=\"_blank\" rel=\"noopener noreferrer\">Окнософт</a> на базе фреймворка <a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\" rel=\"noopener noreferrer\">Metadata.js</a><br />\n        Исходный код и документация доступны на <a href=\"https://github.com/oknosoft/windowbuilder\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub <i class=\"fa fa-github-alt\"></i></a>.<br />\n    </p>\n\n    <h3>Назначение и возможности</h3>\n    <ul>\n        <li>Построение и редактирование эскизов изделий в графическом 2D редакторе</li>\n        <li>Экстремальная поддержка нестандартных изделий (многоугольники, сложные перегибы профиля)</li>\n        <li>Расчет спецификации и координат технологических операций</li>\n        <li>Расчет цены и плановой себестоимости изделий по произвольным формулам с учетом индивидуальных дилерских скидок и наценок</li>\n        <li>Формирование печатных форм для заказчика и производства</li>\n        <li>Поддержка автономной работы при отсутствии доступа в Интернет и прозрачного обмена с сервером при возобновлении соединения</li>\n    </ul>\n\n    <p>Использованы следующие библиотеки и инструменты:</p>\n\n    <h3>Серверная часть</h3>\n    <ul>\n\t\t<li><a href=\"http://couchdb.apache.org/\" target=\"_blank\" rel=\"noopener noreferrer\">couchDB</a>, NoSQL база данных с поддержкой master-master репликации</li>\n\t\t<li><a href=\"http://nginx.org/ru/\" target=\"_blank\" rel=\"noopener noreferrer\">nginx</a>, высокопроизводительный HTTP-сервер</li>\n      <li><a href=\"https://nodejs.org/en/\" target=\"_blank\" rel=\"noopener noreferrer\">NodeJS</a>, JavaScript runtime built on Chrome`s V8 JavaScript engine\n      </li>\n      {/*\n      <li><a href=\"https://github.com/colinskow/superlogin\" target=\"_blank\" rel=\"noopener noreferrer\">SuperLogin</a>, библиотека oAuth авторизации</li>\n      */}\n    </ul>\n\n    <h3>Управление данными в памяти браузера</h3>\n    <ul>\n      <li><a href=\"http://www.oknosoft.ru/metadata/\" target=\"_blank\" rel=\"noopener noreferrer\">Metadata.js</a>, движок ссылочной типизации для браузера и Node.js</li>\n      <li><a href=\"https://pouchdb.com/\" target=\"_blank\" rel=\"noopener noreferrer\">PouchDB</a>, клиентская NoSQL база данных с поддержкой автономной работы и репликации с CouchDB</li>\n      <li><a href=\"https://github.com/agershun/alasql\" target=\"_blank\" rel=\"noopener noreferrer\">AlaSQL</a>, SQL-интерфейс к массивам javascript в памяти браузера и Node.js</li>\n      <li><a href=\"http://www.movable-type.co.uk/scripts/aes.html\" target=\"_blank\" rel=\"noopener noreferrer\">Aes</a>, библиотека шифрования/дешифрования строк</li>\n      <li><a href=\"https://github.com/reactjs/redux\" target=\"_blank\" rel=\"noopener noreferrer\">Redux</a>, диспетчер состояния веб-приложения</li>\n    </ul>\n\n    <h3>UI библиотеки и компоненты интерфейса</h3>\n    <ul>\n      <li><a href=\"http://paperjs.org/\" target=\"_blank\" rel=\"noopener noreferrer\">paper.js</a>, фреймворк векторной графики для HTML5 Canvas</li>\n      <li><a href=\"http://www.material-ui.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Material-ui</a>, компоненты React UI в стиле Google`s material design</li>\n      <li><a href=\"https://github.com/bvaughn/react-virtualized\" target=\"_blank\" rel=\"noopener noreferrer\">React virtualized</a>, компоненты React для динамических списков</li>\n      <li><a href=\"https://github.com/adazzle/react-data-grid\" target=\"_blank\" rel=\"noopener noreferrer\">React data grid</a>, React компонент табличной части</li>\n      <li><a href=\"http://dhtmlx.com/\" target=\"_blank\" rel=\"noopener noreferrer\">dhtmlx</a>, кроссбраузерная javascript библиотека компонентов ui</li>\n      <li><a href=\"http://momentjs.com/\" target=\"_blank\" rel=\"noopener noreferrer\">Moment.js</a>, библиотека форматирования интервалов и дат</li>\n      <li><a href=\"http://meritt.github.io/rubles/\" target=\"_blank\" rel=\"noopener noreferrer\">Rubles.js</a>, библиотека форматирования чисел - сумма прописью</li>\n      <li><a href=\"https://github.com/SheetJS/js-xlsx\" target=\"_blank\" rel=\"noopener noreferrer\">xlsx</a>, библиотека для чтения и записи XLSX / XLSM / XLSB / XLS / ODS</li>\n      <li><a href=\"https://github.com/open-xml-templating/docxtemplater\" target=\"_blank\" rel=\"noopener noreferrer\">docxtemplater</a>, библиотека формирования файлов DOCX по шаблону</li>\n      <li><a href=\"https://fortawesome.github.io/Font-Awesome/\" target=\"_blank\" rel=\"noopener noreferrer\">fontawesome</a>, набор шрифтовых иконок</li>\n    </ul>\n\n    <h2><i class=\"fa fa-question-circle\"></i> Вопросы</h2>\n    <p>Если обнаружили ошибку, пожалуйста,\n        <a href=\"https://github.com/oknosoft/windowbuilder/issues/new\" target=\"_blank\" rel=\"noopener noreferrer\">зарегистрируйте вопрос в GitHub</a> или\n        <a href=\"http://www.oknosoft.ru/metadata/#page-118\" target=\"_blank\" rel=\"noopener noreferrer\">свяжитесь с разработчиком</a> напрямую<br /></p>\n    <p>&nbsp;</p>\n\n</div>\n","view_blank.html":"<!DOCTYPE html>\r\n<html lang=\"ru\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"/>\r\n    <title>Документ</title>\r\n    <style>\r\n\r\n        html {\r\n            width: 100%;\r\n            height: 100%;\r\n            margin: 0;\r\n            padding: 0;\r\n            overflow: auto;\r\n\r\n        }\r\n        body {\r\n            width: 210mm;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n            overflow: hidden;\r\n            color: rgb(48, 57, 66);\r\n            font-family: Arial, sans-serif;\r\n            font-size: 11pt;\r\n            text-rendering: optimizeLegibility;\r\n        }\r\n\r\n        /* Таблица */\r\n        table.border {\r\n            border-collapse: collapse; border: 1px solid;\r\n        }\r\n        table.border > tbody > tr > td,\r\n        table.border > tr > td,\r\n        table.border th{\r\n            border: 1px solid;\r\n        }\r\n        .noborder{\r\n            border: none;\r\n        }\r\n\r\n        /* Многоуровневый список */\r\n        ol {\r\n            counter-reset: li;\r\n            list-style: none;\r\n            padding: 0;\r\n        }\r\n        li {\r\n            margin-top: 8px;\r\n        }\r\n        li:before {\r\n            counter-increment: li;\r\n            content: counters(li,\".\") \".\";\r\n            padding-right: 8px;\r\n        }\r\n        li.flex {\r\n            display: flex;\r\n            text-align: left;\r\n            list-style-position: outside;\r\n            font-weight: normal;\r\n        }\r\n\r\n        .container {\r\n            width: 100%;\r\n            position: relative;\r\n        }\r\n\r\n        .margin-top-20 {\r\n            margin-top: 20px;\r\n        }\r\n\r\n        .column-50-percent {\r\n            width: 48%;\r\n            min-width: 40%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .column-30-percent {\r\n            width: 31%;\r\n            min-width: 30%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .block-left {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        .block-center {\r\n            display: block;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n        }\r\n\r\n        .block-right {\r\n            display: block;\r\n            float: right;\r\n        }\r\n\r\n        .list-center {\r\n            text-align: center;\r\n            list-style-position: inside;\r\n            font-weight: bold;\r\n        }\r\n\r\n        .clear-both {\r\n            clear: both;\r\n        }\r\n\r\n        .small {\r\n            font-size: small;\r\n        }\r\n\r\n        .text-center {\r\n            text-align: center;\r\n        }\r\n\r\n        .text-justify {\r\n            text-align: justify;\r\n        }\r\n\r\n        .text-right {\r\n            text-align: right;\r\n        }\r\n\r\n        .muted-color {\r\n            color: #636773;\r\n        }\r\n\r\n        .accent-color {\r\n            color: #f30000;\r\n        }\r\n\r\n        .note {\r\n            background: #eaf3f8;\r\n            color: #2980b9;\r\n            font-style: italic;\r\n            padding: 12px 20px;\r\n        }\r\n\r\n        .note:before {\r\n            content: 'Замечание: ';\r\n            font-weight: 500;\r\n        }\r\n        *, *:before, *:after {\r\n            box-sizing: inherit;\r\n        }\r\n\r\n    </style>\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>","view_settings.html":"<div class=\"md_column1300\">\r\n\r\n    <div class=\"md_column320\" name=\"form1\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n    <div class=\"md_column320\" name=\"form2\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n</div>"});

$p.md.once('predefined_elmnts_inited', () => $p.cat.characteristics.pouch_load_view('doc/nom_characteristics'));

$p.CatCharacteristics = class CatCharacteristics extends $p.CatCharacteristics {

  before_save(attr) {

    const {prod_nom, calc_order, _data} = this;

    if(calc_order.is_read_only) {
      _data._err = {
        title: 'Права доступа',
        type: 'alert-error',
        text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
      };
      return false;
    }

    const name = this.prod_name();
    if(name) {
      this.name = name;
    }

    this.partner = calc_order.partner;

  }

  add_inset_params(inset, cnstr, blank_inset) {
    const ts_params = this.params;
    const params = [];

    ts_params.find_rows({cnstr: cnstr, inset: blank_inset || inset}, (row) => {
      params.indexOf(row.param) === -1 && params.push(row.param);
      return row.param;
    });

    inset.used_params.forEach((param) => {
      if(params.indexOf(param) == -1) {
        ts_params.add({
          cnstr: cnstr,
          inset: blank_inset || inset,
          param: param
        });
        params.push(param);
      }
    });
  }

  prod_name(short) {
    const {calc_order_row, calc_order, leading_product, sys, clr} = this;
    let name = '';

    if(calc_order_row) {

      if(calc_order.number_internal) {
        name = calc_order.number_internal.trim();
      }
      else {
        let num0 = calc_order.number_doc, part = '';
        for (let i = 0; i < num0.length; i++) {
          if(isNaN(parseInt(num0[i]))) {
            name += num0[i];
          }
          else {
            break;
          }
        }
        for (let i = num0.length - 1; i > 0; i--) {
          if(isNaN(parseInt(num0[i]))) {
            break;
          }
          part = num0[i] + part;
        }
        name += parseInt(part || 0).toFixed(0);
      }

      name += '/' + calc_order_row.row.pad();

      if(!leading_product.empty()) {
        name += ':' + leading_product.calc_order_row.row.pad();
      }

      if(!sys.empty()) {
        name += '/' + sys.name;
      }

      if(!short) {

        if(!clr.empty()) {
          name += '/' + this.clr.name;
        }

        if(this.x && this.y) {
          name += '/' + this.x.toFixed(0) + 'x' + this.y.toFixed(0);
        }
        else if(this.x) {
          name += '/' + this.x.toFixed(0);
        }
        else if(this.y) {
          name += '/' + this.y.toFixed(0);
        }

        if(this.z) {
          if(this.x || this.y) {
            name += 'x' + this.z.toFixed(0);
          }
          else {
            name += '/' + this.z.toFixed(0);
          }
        }

        if(this.s) {
          name += '/S:' + this.s.toFixed(3);
        }

        let sprm = '';
        this.params.find_rows({cnstr: 0}, (row) => {
          if(row.param.include_to_name && sprm.indexOf(String(row.value)) == -1) {
            sprm && (sprm += ';');
            sprm += String(row.value);
          }
        });
        if(sprm) {
          name += '|' + sprm;
        }
      }
    }
    return name;
  }

  open_origin(row_id) {
    try {
      let {origin} = this.specification.get(row_id);
      if(typeof origin == 'number') {
        origin = this.cnn_elmnts.get(origin - 1).cnn;
      }
      if(origin.is_new()) {
        return $p.msg.show_msg({
          type: 'alert-warning',
          text: `Пустая ссылка на настройки в строке №${row_id + 1}`,
          title: o.presentation
        });
      }
      origin.form_obj();
    }
    catch (err) {
      $p.record_log(err);
    }
  }

  find_create_cx(elm, origin) {
    const {_manager, ref, calc_order, params, inserts} = this;
    if(!_manager._find_cx_sql) {
      _manager._find_cx_sql = $p.wsql.alasql.compile('select top 1 ref from cat_characteristics where leading_product = ? and leading_elm = ? and origin = ?');
    }
    const aref = _manager._find_cx_sql([ref, elm, origin]);
    const cx = aref.length ? $p.cat.characteristics.get(aref[0].ref, false) :
      $p.cat.characteristics.create({
        calc_order: calc_order,
        leading_product: this,
        leading_elm: elm,
        origin: origin
      }, false, true)._set_loaded();

    const {length, width} = $p.job_prm.properties;
    cx.params.clear();
    params.find_rows({cnstr: -elm, inset: origin}, (row) => {
      if(row.param != length && row.param != width) {
        cx.params.add({param: row.param, value: row.value});
      }
    });
    inserts.find_rows({cnstr: -elm, inset: origin}, (row) => {
      cx.clr = row.clr;
    });
    cx.name = cx.prod_name();
    return cx;
  }

  get calc_order_row() {
    let _calc_order_row;
    this.calc_order.production.find_rows({characteristic: this}, (_row) => {
      _calc_order_row = _row;
      return false;
    });
    return _calc_order_row;
  }

  get prod_nom() {
    if(!this.sys.empty()) {

      var setted,
        param = this.params;

      if(this.sys.production.count() == 1) {
        this.owner = this.sys.production.get(0).nom;

      }
      else if(this.sys.production.count() > 1) {
        this.sys.production.each(function (row) {

          if(setted) {
            return false;
          }

          if(row.param && !row.param.empty()) {
            param.find_rows({cnstr: 0, param: row.param, value: row.value}, function () {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }

        });
        if(!setted) {
          this.sys.production.find_rows({param: $p.utils.blank.guid}, function (row) {
            setted = true;
            param._owner.owner = row.nom;
            return false;
          });
        }
        if(!setted) {
          this.owner = this.sys.production.get(0).nom;
        }
      }
    }

    return this.owner;
  }
};

$p.CatCharacteristicsInsertsRow.prototype.value_change = function (field, type, value) {
  if(field == 'inset') {
    if(value != this.inset){
      this._obj.inset = value;
      const {_owner} = this._owner;
      _owner.add_inset_params(this.inset, this.cnstr);
    }
  }
}




$p.cat.characteristics.form_obj = function (pwnd, attr) {

  const _meta = this.metadata();

  attr.draw_tabular_sections = function (o, wnd, tabular_init) {

    _meta.form.obj.tabular_sections_order.forEach((ts) => {
      if(ts == 'specification') {
        tabular_init('specification', $p.injected_data['toolbar_characteristics_specification.xml']);
        wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent('onclick', (btn_id) => {

          if(btn_id == 'btn_origin') {
            const selId = wnd.elmnts.grids.specification.getSelectedRowId();
            if(selId && !isNaN(Number(selId))) {
              return o.open_origin(Number(selId) - 1);
            }

            $p.msg.show_msg({
              type: 'alert-warning',
              text: $p.msg.no_selected_row.replace('%1', 'Спецификация'),
              title: o.presentation
            });
          }

        });
      }
      else {
        tabular_init(ts);
      }
    });
  };

  return this.constructor.prototype.form_obj.call(this, pwnd, attr)
    .then(function (res) {
      if(res) {
        o = res.o;
        wnd = res.wnd;
        return res;
      }
    });
};


(function($p){

	const _mgr = $p.cat.characteristics;
	let selection_block, wnd;

	class SelectionBlock {

	  constructor(_mgr) {

	    this._obj = {
        calc_order: $p.wsql.get_user_param("template_block_calc_order")
      }

      this._meta = Object.assign(_mgr.metadata()._clone(), {
        form: {
          selection: {
            fields: ["presentation","svg"],
            cols: [
              {"id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование"},
              {"id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз"}
            ]
          }
        }
      });
    }

    _metadata(f) {
	    const {calc_order} = this._meta.fields;
      return f ? calc_order : {fields: {calc_order}};
    }

    get _manager() {
	    return {
        value_mgr: $p.md.value_mgr,
        class_name: "dp.fake"
      }
    }

    get calc_order() {
      return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
    }
    set calc_order(v) {

	    const {_obj, attr} = this;

      if(!v || v == _obj.calc_order){
        return;
      }
      if(v._block){
        wnd && wnd.close();
        return attr.on_select && attr.on_select(v._block);
      }
      _obj.calc_order = v.valueOf();

      if(wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount()){
        wnd.elmnts.filter.call_event();
      }

      if(!$p.utils.is_empty_guid(_obj.calc_order) &&
        $p.wsql.get_user_param("template_block_calc_order") != _obj.calc_order){
        $p.wsql.set_user_param("template_block_calc_order", _obj.calc_order);
      }
    }

  }

	_mgr.form_selection_block = function(pwnd, attr = {}){

		if(!selection_block){
			selection_block = new SelectionBlock(_mgr);
		}
    selection_block.attr = attr;

		if($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			$p.job_prm.builder.base_block.some((o) => {
				selection_block.calc_order = o;
				return true;
			});
		}

		attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

		attr.metadata = selection_block._meta;

		attr.custom_selection = function (attr) {
			const ares = [], crefs = [];
			let calc_order;

			attr.selection.some((o) => {
				if(Object.keys(o).indexOf("calc_order") != -1){
					calc_order = o.calc_order;
					return true;
				}
			});

			return $p.doc.calc_order.get(calc_order, true, true)
				.then((o) => {

					o.production.each((row) => {
						if(!row.characteristic.empty()){
							if(row.characteristic.is_new()){
                crefs.push(row.characteristic.ref);
              }
							else{
								if(!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()){
									if(row.characteristic._attachments &&
										row.characteristic._attachments.svg &&
										!row.characteristic._attachments.svg.stub){
                    ares.push(row.characteristic);
                  }
									else{
                    crefs.push(row.characteristic.ref);
                  }
								}
							}
						}
					});
					return crefs.length ? _mgr.pouch_load_array(crefs, true) : crefs;
				})
				.then(() => {

					crefs.forEach((o) => {
						o = _mgr.get(o, false, true);
						if(o && !o.calc_order.empty() && o.coordinates.count()){
							ares.push(o);
						}
					});

					crefs.length = 0;
					ares.forEach((o) => {
            const presentation = ((o.calc_order_row && o.calc_order_row.note) || o.note || o.name) + "<br />" + o.owner.name;
						if(!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase()))
							crefs.push({
								ref: o.ref,
								presentation: presentation,
								svg: o._attachments ? o._attachments.svg : ""
							});
					});

					ares.length = 0;
					crefs.forEach((o) => {
						if(o.svg && o.svg.data){
							ares.push($p.utils.blob_as_text(o.svg.data)
								.then(function (svg) {
									o.svg = svg;
								}))
						}
					});
					return Promise.all(ares);

				})
				.then(() => $p.iface.data_to_grid.call(_mgr, crefs, attr));

		};

		wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

		wnd.elmnts.toolbar.hideItem("btn_new");
		wnd.elmnts.toolbar.hideItem("btn_edit");
		wnd.elmnts.toolbar.hideItem("btn_delete");

		wnd.elmnts.filter.add_filter({
			text: "Расчет",
			name: "calc_order"
		});
    const fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
		fdiv.removeChild(fdiv.firstChild);

		wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
			parent: fdiv,
			obj: selection_block,
			field: "calc_order",
			width: 220,
			get_option_list: (selection, val) => new Promise((resolve, reject) => {

			  setTimeout(() => {
          const l = [];

          $p.job_prm.builder.base_block.forEach(({note, presentation, ref}) => {
            if(selection.presentation && selection.presentation.like){
              if(note.toLowerCase().match(selection.presentation.like.toLowerCase()) ||
                presentation.toLowerCase().match(selection.presentation.like.toLowerCase())){
                l.push({text: note || presentation, value: ref});
              }
            }else{
              l.push({text: note || presentation, value: ref});
            }
          });

          l.sort((a, b) => {
            if (a.text < b.text){
              return -1;
            }
            else if (a.text > b.text){
              return 1;
            }
            else{
              return 0;
            }
          });

          resolve(l);

        }, $p.job_prm.builder.base_block ? 0 : 1000)
			})
		});
		wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};

})($p);


$p.cat.clrs.__define({

	by_predefined: {
		value: function(clr, clr_elm, clr_sch){
		  const {predefined_name} = clr;
			if(predefined_name){
			  switch (predefined_name){
          case 'КакЭлемент':
            return clr_elm;
          case 'КакИзделие':
            return clr_sch;
          case 'КакЭлементСнаружи':
            return clr_elm.clr_out.empty() ? clr_elm : clr_elm.clr_out;
          case 'КакЭлементИзнутри':
            return clr_elm.clr_in.empty() ? clr_elm : clr_elm.clr_in;
          case 'КакИзделиеСнаружи':
            return clr_sch.clr_out.empty() ? clr_sch : clr_sch.clr_out;
          case 'КакИзделиеИзнутри':
            return clr_sch.clr_in.empty() ? clr_sch : clr_sch.clr_in;
          case 'КакЭлементИнверсный':
            return this.inverted(clr_elm);
          case 'КакИзделиеИнверсный':
            return this.inverted(clr_sch);
          case 'БезЦвета':
            return this.get();
          default :
            return clr_elm;
        }
			}
      return clr.empty() ? clr_elm : clr
		}
	},

  inverted: {
    value: function(clr){
      if(clr.clr_in == clr.clr_out || clr.clr_in.empty() || clr.clr_out.empty()){
        return clr;
      }
      const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
        [this.alatable, clr.clr_out.ref, clr.clr_in.ref, $p.utils.blank.guid]);
      return ares.length ? this.get(ares[0]) : clr
    }
  },

	selection_exclude_service: {
		value: function (mf, sys) {

			if(mf.choice_params)
				mf.choice_params.length = 0;
			else
				mf.choice_params = [];

			mf.choice_params.push({
				name: "parent",
				path: {not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ")}
			});

			if(sys){
				mf.choice_params.push({
					name: "ref",
					get path(){
            const res = [];
						let clr_group, elm;

						function add_by_clr(clr) {
              if(clr instanceof $p.CatClrs){
                const {ref} = clr;
                if(clr.is_folder){
                  $p.cat.clrs.alatable.forEach((row) => row.parent == ref && res.push(row.ref))
                }
                else{
                  res.push(ref)
                }
              }
              else if(clr instanceof $p.CatColor_price_groups){
                clr.clr_conformity.forEach(({clr1}) => add_by_clr(clr1))
              }
            }

						if(sys instanceof $p.Editor.BuilderElement){
							clr_group = sys.inset.clr_group;
							if(clr_group.empty() && !(sys instanceof $p.Editor.Filling)){
                clr_group = sys.project._dp.sys.clr_group;
              }
						}
						else if(sys instanceof $p.classes.DataProcessorObj){
							clr_group = sys.sys.clr_group;
						}
						else{
							clr_group = sys.clr_group;
						}

						if(clr_group.empty() || !clr_group.clr_conformity.count()){
              return {not: ''};
						}
						else{
              add_by_clr(clr_group)
						}
						return {in: res};
					}
				});
			}
		}
	},

	form_selection: {
		value: function (pwnd, attr) {

		  const eclr = this.get();

			attr.hide_filter = true;

      attr.toolbar_click = function (btn_id, wnd){

        if(btn_id=="btn_select" && !eclr.clr_in.empty() && !eclr.clr_out.empty()) {

          const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)",
            [$p.cat.clrs.alatable, eclr.clr_in.ref, eclr.clr_out.ref, $p.utils.blank.guid]);

          if(ares.length){
            pwnd.on_select.call(pwnd, $p.cat.clrs.get(ares[0]));
          }
          else{
            $p.cat.clrs.create({
              clr_in: eclr.clr_in,
              clr_out: eclr.clr_out,
              name: eclr.clr_in.name + " \\ " + eclr.clr_out.name,
              parent: $p.job_prm.builder.composite_clr_folder
            })
              .then(function (obj) {
                return obj.register_on_server()
              })
              .then(function (obj) {
                pwnd.on_select.call(pwnd, obj);
              })
              .catch(function (err) {
                $p.msg.show_msg({
                  type: "alert-warning",
                  text: "Недостаточно прав для добавления составного цвета",
                  title: "Составной цвет"
                });
              })
          }

          wnd.close();
          return false;
        }
      }

      const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

			function get_option_list(selection, val) {

				selection.clr_in = $p.utils.blank.guid;
				selection.clr_out = $p.utils.blank.guid;

				if(attr.selection){
					attr.selection.some((sel) => {
						for(var key in sel){
							if(key == "ref"){
								selection.ref = sel.ref;
								return true;
							}
						}
					});
				}

				return this.constructor.prototype.get_option_list.call(this, selection, val);
			}

			return (wnd instanceof Promise ? wnd : Promise.resolve(wnd))
				.then((wnd) => {

					const tb_filter = wnd.elmnts.filter;

					tb_filter.__define({
						get_filter: {
							value: () => {
								const res = {
									selection: []
								};
								if(clr_in.getSelectedValue())
									res.selection.push({clr_in: clr_in.getSelectedValue()});
								if(clr_out.getSelectedValue())
									res.selection.push({clr_out: clr_out.getSelectedValue()});
								if(res.selection.length)
									res.hide_tree = true;
								return res;
							}
						}
					});

					wnd.attachEvent("onClose", () => {

						clr_in.unload();
						clr_out.unload();

						eclr.clr_in = $p.utils.blank.guid;
						eclr.clr_out = $p.utils.blank.guid;

						return true;
					});


					eclr.clr_in = $p.utils.blank.guid;
					eclr.clr_out = $p.utils.blank.guid;

					const clr_in = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_in",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});
					const clr_out = new $p.iface.OCombo({
						parent: tb_filter.div.obj,
						obj: eclr,
						field: "clr_out",
						width: 150,
						hide_frm: true,
						get_option_list: get_option_list
					});

					clr_in.DOMelem.style.float = "left";
					clr_in.DOMelem_input.placeholder = "Цвет изнутри";
					clr_out.DOMelem_input.placeholder = "Цвет снаружи";

					clr_in.attachEvent("onChange", tb_filter.call_event);
					clr_out.attachEvent("onChange", tb_filter.call_event);
					clr_in.attachEvent("onClose", tb_filter.call_event);
					clr_out.attachEvent("onClose", tb_filter.call_event);

          wnd.elmnts.toolbar.hideItem("btn_new");
          wnd.elmnts.toolbar.hideItem("btn_edit");
          wnd.elmnts.toolbar.hideItem("btn_delete");

          wnd.elmnts.toolbar.setItemText("btn_select", "<b>Выбрать или создать</b>");

					return wnd;

				})
		}
	},

	sync_grid: {
		value: function(attr, grid) {

			if(attr.action == "get_selection" && attr.selection && attr.selection.some(function (v) {
				return v.hasOwnProperty("clr_in") || v.hasOwnProperty("clr_out");
				})){
				delete attr.parent;
				delete attr.initial_value;
			}

			return $p.classes.DataManager.prototype.sync_grid.call(this, attr, grid);
		}
	}
});

$p.CatClrs = class CatClrs extends $p.CatClrs {

  register_on_server() {
    return $p.wsql.pouch.save_obj(this, {
      db: $p.wsql.pouch.remote.ram
    })
      .then(function (obj) {
        return obj.save();
      })
  }

  get sides() {
    const res = {is_in: false, is_out: false};
    if(!this.empty() && !this.predefined_name){
      if(this.clr_in.empty() && this.clr_out.empty()){
        res.is_in = res.is_out = true;
      }
      else{
        if(!this.clr_in.empty() && !this.clr_in.predefined_name){
          res.is_in = true;
        }
        if(!this.clr_out.empty() && !this.clr_out.predefined_name){
          res.is_out = true;
        }
      }
    }
    return res;
  }
};




$p.cat.cnns.__define({

  _nomcache: {
    value: {}
  },

  sql_selection_list_flds: {
    value: function(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" +
        " left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
    }
  },

  nom_cnn: {
    value: function(nom1, nom2, cnn_types, ign_side, is_outer){

      const {ProfileItem, BuilderElement, Filling} = $p.Editor;
      const {Вертикальная} = $p.enm.orientations

      if(nom1 instanceof ProfileItem && nom2 instanceof ProfileItem &&
        cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 &&
        nom1.orientation != Вертикальная && nom2.orientation == Вертикальная ){
        return this.nom_cnn(nom2, nom1, cnn_types);
      }

      const side = is_outer ? $p.enm.cnn_sides.Снаружи :
        (!ign_side && nom1 instanceof ProfileItem && nom2 instanceof ProfileItem && nom2.cnn_side(nom1));

      let onom2, a1, a2, thickness1, thickness2, is_i = false, art1glass = false, art2glass = false;

      if(!nom2 || ($p.utils.is_data_obj(nom2) && nom2.empty())){
        is_i = true;
        onom2 = nom2 = $p.cat.nom.get();
      }
      else{
        if(nom2 instanceof BuilderElement){
          onom2 = nom2.nom;
        }
        else if($p.utils.is_data_obj(nom2)){
          onom2 = nom2;
        }
        else{
          onom2 = $p.cat.nom.get(nom2);
        }
      }

      const ref1 = nom1.ref;
      const ref2 = onom2.ref;

      if(!is_i){
        if(nom1 instanceof Filling){
          art1glass = true;
          thickness1 = nom1.thickness;
        }
        else if(nom2 instanceof Filling){
          art2glass = true;
          thickness2 = nom2.thickness;
        }
      }

      if(!this._nomcache[ref1]){
        this._nomcache[ref1] = {};
      }
      a1 = this._nomcache[ref1];
      if(!a1[ref2]){
        a2 = (a1[ref2] = []);
        this.each((cnn) => {
          let is_nom1 = art1glass ? (cnn.art1glass && thickness1 >= cnn.tmin && thickness1 <= cnn.tmax && cnn.cnn_type == $p.enm.cnn_types.Наложение) : false,
            is_nom2 = art2glass ? (cnn.art2glass && thickness2 >= cnn.tmin && thickness2 <= cnn.tmax) : false;

          cnn.cnn_elmnts.each((row) => {
            if(is_nom1 && is_nom2){
              return false;
            }
            is_nom1 = is_nom1 || (row.nom1 == ref1 && (row.nom2.empty() || row.nom2 == onom2));
            is_nom2 = is_nom2 || (row.nom2 == onom2 && (row.nom1.empty() || row.nom1 == ref1));
          });
          if(is_nom1 && is_nom2){
            a2.push(cnn);
          }
        });
      }

      if(cnn_types){
        const types = Array.isArray(cnn_types) ? cnn_types : (
            $p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1 ? $p.enm.cnn_types.acn.a : [cnn_types]
          );
        return a1[ref2].filter((cnn) => {
          if(types.indexOf(cnn.cnn_type) != -1){
            if(!side){
              return true
            }
            if(cnn.sd1 == $p.enm.cnn_sides.Изнутри){
              return side == $p.enm.cnn_sides.Изнутри;
            }
            else if(cnn.sd1 == $p.enm.cnn_sides.Снаружи){
              return side == $p.enm.cnn_sides.Снаружи;
            }
            else{
              return true;
            }
          }
        });
      }

      return a1[ref2];
    }
  },

  elm_cnn: {
    value: function(elm1, elm2, cnn_types, curr_cnn, ign_side, is_outer){

      if(curr_cnn && cnn_types && (cnn_types.indexOf(curr_cnn.cnn_type) != -1) && (cnn_types != $p.enm.cnn_types.acn.ii)){


        if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Изнутри){
          if(typeof is_outer == 'boolean'){
            if(!is_outer){
              return curr_cnn;
            }
          }
          else{
            if(elm2.cnn_side(elm1) == $p.enm.cnn_sides.Изнутри){
              return curr_cnn;
            }
          }
        }
        else if(!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Снаружи){
          if(is_outer || elm2.cnn_side(elm1) == $p.enm.cnn_sides.Снаружи)
            return curr_cnn;
        }
        else{
          return curr_cnn;
        }
      }

      const cnns = this.nom_cnn(elm1, elm2, cnn_types, ign_side, is_outer);

      if(cnns.length){
        const sides = [$p.enm.cnn_sides.Изнутри, $p.enm.cnn_sides.Снаружи];
        if(cnns.length > 1){
          cnns.sort((a, b) => {
            if(sides.indexOf(a.sd1) != -1 && sides.indexOf(b.sd1) == -1){
              return 1;
            }
            if(sides.indexOf(b.sd1) != -1 && sides.indexOf(a.sd1) == -1){
              return -1;
            }
            if (a.priority > b.priority) {
              return -1;
            }
            if (a.priority < b.priority) {
              return 1;
            }
            if (a.name > b.name) {
              return -1;
            }
            if (a.name < b.name) {
              return 1;
            }
            return 0;
          });
        }
        return cnns[0];
      }
      else{

      }
    }
  },

})

$p.CatCnns.prototype.__define({

	main_row: {
		value: function (elm) {

			var ares, nom = elm.nom;

			if($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1){

				var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

				ares = this.specification.find_rows({nom: art12});
				if(ares.length)
					return ares[0]._row;
			}

			if(this.cnn_elmnts.find_rows({nom1: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art1});
				if(ares.length)
					return ares[0]._row;
			}
			if(this.cnn_elmnts.find_rows({nom2: nom}).length){
				ares = this.specification.find_rows({nom: $p.job_prm.nom.art2});
				if(ares.length)
					return ares[0]._row;
			}
			ares = this.specification.find_rows({nom: nom});
			if(ares.length)
				return ares[0]._row;

		}
	},

	check_nom2: {
		value: function (nom) {
			var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
			return this.cnn_elmnts._obj.some(function (row) {
				return row.nom == ref;
			})
		}
	}

});


$p.cat.contracts.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization, _p_.name as partner," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" +
				" left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" +
				" left outer join cat_partners as _p_ on _p_.ref = _t_.owner" +
				" left outer join enm_mutual_contract_settlements as _m_ on _m_.ref = _t_.mutual_settlements" +
				" left outer join enm_contract_kinds as _k_ on _k_.ref = _t_.contract_kind %3 %4 LIMIT 300";
		}
	},

	by_partner_and_org: {
		value: function (partner, organization, contract_kind) {
			if(!contract_kind)
				contract_kind = $p.enm.contract_kinds.СПокупателем;
			var res = this.find_rows({owner: partner, organization: organization, contract_kind: contract_kind});
			res.sort(function (a, b) {
				return a.date > b.date;
			});
			return res.length ? res[0] : this.get();
		}
	}


});




Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value: function (selection, val) {
      const list = [];
      $p.current_user.acl_objs.find_rows({type: "cat.divisions"}, (row) => {
        if(list.indexOf(row.acl_obj) == -1){
          list.push(row.acl_obj);
          row.acl_obj._children.forEach((o) => {
            if(list.indexOf(o) == -1){
              list.push(o);
            }
          })
        }
      });
      if(!list.length){
        return this.constructor.prototype.get_option_list.call(this, selection, val);
      }

      function check(v){
        if($p.utils.is_equal(v.value, val))
          v.selected = true;
        return v;
      }

      const l = [];
      $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

      l.sort(function(a, b) {
        if (a.text < b.text){
          return -1;
        }
        else if (a.text > b.text){
          return 1;
        }
        return 0;
      })
      return Promise.resolve(l);
    }
  }
});


$p.CatElm_visualization.prototype.__define({

	draw: {
		value: function (elm, layer, offset) {

		  const {CompoundPath} = elm.project._scope;

			let subpath;

			if(this.svg_path.indexOf('{"method":') == 0){

				const attr = JSON.parse(this.svg_path);

				if(attr.method == "subpath_outer"){

					subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

					subpath.parent = layer._by_spec;
					subpath.strokeWidth = attr.strokeWidth || 4;
					subpath.strokeColor = attr.strokeColor || 'red';
					subpath.strokeCap = attr.strokeCap || 'round';
					if(attr.dashArray)
						subpath.dashArray = attr.dashArray

				}

			}
			else if(this.svg_path){

				subpath = new CompoundPath({
					pathData: this.svg_path,
					parent: layer._by_spec,
					strokeColor: 'black',
					fillColor: 'white',
					strokeScaling: false,
					pivot: [0, 0],
					opacity: elm.opacity
				});

				var angle_hor;
				if(elm.is_linear() || offset < 0)
					angle_hor = elm.generatrix.getTangentAt(0).angle;
				else if(offset > elm.generatrix.length)
					angle_hor = elm.generatrix.getTangentAt(elm.generatrix.length).angle;
				else
					angle_hor = elm.generatrix.getTangentAt(offset).angle;

				if((this.rotate != -1 || elm.orientation == $p.enm.orientations.Горизонтальная) && angle_hor != this.angle_hor){
					subpath.rotation = angle_hor - this.angle_hor;
				}

				offset += elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

				const p0 = elm.generatrix.getPointAt(offset > elm.generatrix.length ? elm.generatrix.length : offset || 0);

				if(this.elm_side == -1){
          const p1 = elm.rays.inner.getNearestPoint(p0);
          const p2 = elm.rays.outer.getNearestPoint(p0);

					subpath.position = p1.add(p2).divide(2);

				}else if(!this.elm_side){
					subpath.position = elm.rays.inner.getNearestPoint(p0);

				}else{
					subpath.position = elm.rays.outer.getNearestPoint(p0);
				}
			}

		}
	}

});


$p.adapters.pouch.once('pouch_data_loaded', () => {
  const {formulas} = $p.cat;
  formulas.pouch_find_rows({ _top: 500, _skip: 0 })
    .then((rows) => {
      rows.forEach((formula) => {
        if(formula.parent == formulas.predefined("printing_plates")){
          formula.params.find_rows({param: "destination"}, (dest) => {
            const dmgr = $p.md.mgr_by_class_name(dest.value);
            if(dmgr){
              if(!dmgr._printing_plates){
                dmgr._printing_plates = {};
              }
              dmgr._printing_plates["prn_" + formula.ref] = formula;
            }
          })
        }
        else if(formula.parent == formulas.predefined("modifiers")){
          formula.execute();
        }
      });
    });
});


$p.CatFormulas.prototype.__define({

	execute: {
		value: function (obj) {

			if(!this._data._formula && this.formula){
			  if(this.async){
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          this._data._formula = (new AsyncFunction("obj,$p", this.formula)).bind(this);
        }
        else{
          this._data._formula = (new Function("obj,$p", this.formula)).bind(this);
        }
      }

      const {_formula} = this._data;

			if(this.parent == $p.cat.formulas.predefined("printing_plates")){

        if(!_formula){
          $p.msg.show_msg({
            title: $p.msg.bld_title,
            type: "alert-error",
            text: `Ошибка в формуле<br /><b>${this.name}</b>`
          });
          return Promise.resolve();
        }

				return _formula(obj, $p)

					.then((doc) => doc instanceof $p.SpreadsheetDocument && doc.print());

			}
			else{
        return _formula && _formula(obj, $p)
      }

		}
	},

	_template: {
		get: function () {
			if(!this._data._template){
        this._data._template = new $p.SpreadsheetDocument(this.template);
      }
			return this._data._template;
		}
	}
});


Object.defineProperties($p.cat.furns, {

  sql_selection_list_flds: {
    value: function(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
    }
  },

  get_option_list: {
    value: function (selection, val) {

      const {characteristic, sys} = paper.project._dp;
      const {furn} = $p.job_prm.properties;

      if(furn && sys && !sys.empty()){

        const links = furn.params_links({
          grid: {selection: {cnstr: 0}},
          obj: {_owner: {_owner: characteristic}}
        });

        if(links.length){
          const list = [];
          links.forEach((link) => link.values.forEach((row) => list.push(this.get(row._obj.value))));

          function check(v){
            if($p.utils.is_equal(v.value, val))
              v.selected = true;
            return v;
          }

          const l = [];
          $p.utils._find_rows.call(this, list, selection, (v) => l.push(check({text: v.presentation, value: v.ref})));

          l.sort((a, b) => {
            if (a.text < b.text){
              return -1;
            }
            else if (a.text > b.text){
              return 1;
            }
            return 0;
          });
          return Promise.resolve(l);
        }
      }
      return this.constructor.prototype.get_option_list.call(this, selection, val);
    },
    configurable: true
  }

});

$p.CatFurns = class CatFurns extends $p.CatFurns {

  refill_prm({project, furn, cnstr}) {

    const fprms = project.ox.params;
    const {direction} = $p.job_prm.properties;

    const aprm = furn.furn_set.add_furn_prm();
    aprm.sort((a, b) => {
      if (a.presentation > b.presentation) {
        return 1;
      }
      if (a.presentation < b.presentation) {
        return -1;
      }
      return 0;
    });

    aprm.forEach((v) => {

      if(v == direction){
        return;
      }

      let prm_row, forcibly = true;
      fprms.find_rows({param: v, cnstr: cnstr}, (row) => {
        prm_row = row;
        return forcibly = false;
      });
      if(!prm_row){
        prm_row = fprms.add({param: v, cnstr: cnstr}, true);
      }

      const {param} = prm_row;
      project._dp.sys.furn_params.each((row) => {
        if(row.param == param){
          if(row.forcibly || forcibly){
            prm_row.value = row.value;
          }
          prm_row.hide = row.hide || param.is_calculated;
          return false;
        }
      });

      param.linked_values(param.params_links({
        grid: {selection: {cnstr: cnstr}},
        obj: {_owner: {_owner: project.ox}}
      }), prm_row);

    });

    const adel = [];
    fprms.find_rows({cnstr: cnstr}, (row) => {
      if(aprm.indexOf(row.param) == -1)
        adel.push(row);
    });
    adel.forEach((row) => fprms.del(row, true));

  }

  add_furn_prm(aprm = [], afurn_set = []) {

    if(afurn_set.indexOf(this.ref)!=-1){
      return;
    }

    afurn_set.push(this.ref);

    this.selection_params.each((row) => aprm.indexOf(row.param)==-1 && !row.param.is_calculated && aprm.push(row.param));

    this.specification.each((row) => row.nom instanceof $p.CatFurns && row.nom.add_furn_prm(aprm, afurn_set));

    return aprm;

  }

  get_spec(contour, cache, exclude_dop) {

    const res = $p.dp.buyers_order.create().specification;
    const {ox} = contour.project;
    const {НаПримыкающий} = $p.enm.transfer_operations_options;

    this.specification.find_rows({dop: 0}, (row_furn) => {

      if(!row_furn.check_restrictions(contour, cache)){
        return;
      }

      if(!exclude_dop){
        this.specification.find_rows({is_main_specification_row: false, elm: row_furn.elm}, (dop_row) => {

          if(!dop_row.check_restrictions(contour, cache)){
            return;
          }

          if(dop_row.is_procedure_row){

            const invert = contour.direction == $p.enm.open_directions.Правое;
            const elm = contour.profile_by_furn_side(dop_row.side, cache);
            const {len} = elm._row;
            const {sizefurn} = elm.nom;
            const dx1 = $p.job_prm.builder.add_d ? sizefurn : 0;
            const faltz = len - 2 * sizefurn;

            let invert_nearest = false, coordin = 0;

            if(dop_row.offset_option == $p.enm.offset_options.Формула){
              if(!dop_row.formula.empty()){
                coordin = dop_row.formula.execute({ox, elm, contour, len, sizefurn, dx1, faltz, invert, dop_row});
              }
            }
            else if(dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу){
              coordin = faltz + dop_row.contraction;
            }
            else if(dop_row.offset_option == $p.enm.offset_options.ОтРучки){
              const {generatrix} = elm;
              const hor = contour.handle_line(elm);
              coordin = generatrix.getOffsetOf(generatrix.intersect_point(hor)) -
                generatrix.getOffsetOf(generatrix.getNearestPoint(elm.corns(1))) +
                (invert ? dop_row.contraction : -dop_row.contraction);
            }
            else if(dop_row.offset_option == $p.enm.offset_options.ОтСередины){
              coordin = len / 2 + (invert ? dop_row.contraction : -dop_row.contraction);
            }
            else{
              if(invert){
                if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                  coordin = dop_row.contraction;
                }
                else{
                  coordin = len - dop_row.contraction;
                }
              }
              else{
                if(dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны){
                  coordin = len - dop_row.contraction;
                }
                else{
                  coordin = dop_row.contraction;
                }
              }
            }

            const procedure_row = res.add(dop_row);
            procedure_row.origin = this;
            procedure_row.handle_height_max = contour.cnstr;
            if(dop_row.transfer_option == НаПримыкающий){
              const nearest = elm.nearest();
              const {outer} = elm.rays;
              const nouter = nearest.rays.outer;
              const point = outer.getPointAt(outer.getOffsetOf(outer.getNearestPoint(elm.corns(1))) + coordin);
              procedure_row.handle_height_min = nearest.elm;
              procedure_row.coefficient = nouter.getOffsetOf(nouter.getNearestPoint(point)) - nouter.getOffsetOf(nouter.getNearestPoint(nearest.corns(1)));
              if(dop_row.overmeasure){
                procedure_row.coefficient +=  nearest.dx0;
              }
            }
            else{
              procedure_row.handle_height_min = elm.elm;
              procedure_row.coefficient = coordin;
              if(dop_row.overmeasure){
                procedure_row.coefficient +=  elm.dx0;
              }
            }

            return;
          }
          else if(!dop_row.quantity){
            return;
          }

          if(dop_row.is_set_row){
            dop_row.nom.get_spec(contour, cache).each((sub_row) => {
              if(sub_row.is_procedure_row){
                res.add(sub_row);
              }
              else if(sub_row.quantity) {
                res.add(sub_row).quantity = (row_furn.quantity || 1) * (dop_row.quantity || 1) * sub_row.quantity;
              }
            });
          }
          else{
            res.add(dop_row).origin = this;
          }
        });
      }

      if(row_furn.is_set_row){
        row_furn.nom.get_spec(contour, cache, exclude_dop).each((sub_row) => {
          if(sub_row.is_procedure_row){
            res.add(sub_row);
          }
          else if(!sub_row.quantity){
            return;
          }
          res.add(sub_row).quantity = (row_furn.quantity || 1) * sub_row.quantity;
        });
      }
      else{
        if(row_furn.quantity){
          const row_spec = res.add(row_furn);
          row_spec.origin = this;
          if(!row_furn.formula.empty()){
            row_furn.formula.execute({ox, contour, row_furn, row_spec});
          }
        }
      }
    });

    return res;
  }

};

$p.CatFurnsSpecificationRow = class CatFurnsSpecificationRow extends $p.CatFurnsSpecificationRow {

  check_restrictions(contour, cache) {
    const {elm, dop, handle_height_min, handle_height_max} = this;
    const {direction, h_ruch, cnstr} = contour;

    if(h_ruch < handle_height_min || (handle_height_max && h_ruch > handle_height_max)){
      return false;
    }

    const {selection_params, specification_restrictions} = this._owner._owner;
    const prop_direction = $p.job_prm.properties.direction;

    let res = true;

    selection_params.find_rows({elm, dop}, (prm_row) => {
      const ok = (prop_direction == prm_row.param) ?
        direction == prm_row.value : prm_row.param.check_condition({row_spec: this, prm_row, cnstr, ox: cache.ox});
      if(!ok){
        return res = false;
      }
    });

    if(res) {

      specification_restrictions.find_rows({elm, dop}, (row) => {
        let len;
        if (contour.is_rectangular) {
          len = (row.side == 1 || row.side == 3) ? cache.w : cache.h;
        }
        else {
          const elm = contour.profile_by_furn_side(row.side, cache);
          len = elm._row.len - 2 * elm.nom.sizefurn;
        }
        if (len < row.lmin || len > row.lmax) {
          return res = false;
        }
      });
    }

    return res;
  }

  get nom() {
    return this._getter('nom')
  }
  set nom (v) {
    if(v !== ""){
      this._setter('nom', v)
    }
  }

  get nom_set() {
    return this.nom;
  }
  set nom_set (v) {
    this.nom = v;
  }

};

(({md}) => {
  const {fields} = md.get("cat.furns").tabular_sections.specification;
  fields.nom_set = fields.nom;
})($p);


$p.cat.inserts.__define({

	_inserts_types_filling: {
		value: [
			$p.enm.inserts_types.Заполнение
		]
	},

	by_thickness: {
		value: function (min, max) {

			if(!this._by_thickness){
				this._by_thickness = {};
				this.find_rows({insert_type: {in: this._inserts_types_filling}}, (ins) => {
					if(ins.thickness > 0){
						if(!this._by_thickness[ins.thickness])
							this._by_thickness[ins.thickness] = [];
						this._by_thickness[ins.thickness].push(ins);
					}
				});
			}

			const res = [];
			for(let thickness in this._by_thickness){
				if(parseFloat(thickness) >= min && parseFloat(thickness) <= max)
					Array.prototype.push.apply(res, this._by_thickness[thickness]);
			}
			return res;

		}
	},

  sql_selection_list_flds: {
	  value: function (initial_value) {
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as insert_type," +
        " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_inserts AS _t_" +
        " left outer join enm_inserts_types as _k_ on _k_.ref = _t_.insert_type %3 %4 LIMIT 300";
    }
  }

});

$p.CatInserts = class CatInserts extends $p.CatInserts {

  nom(elm, strict) {

    const {_data} = this;
    if(!strict && _data.nom){
      return _data.nom;
    }

    const main_rows = [];
    let _nom;

    this.specification.find_rows({is_main_elm: true}, (row) => main_rows.push(row));

    if(!main_rows.length && !strict && this.specification.count()){
      main_rows.push(this.specification.get(0))
    }

    if(main_rows.length && main_rows[0].nom instanceof $p.CatInserts){
      if(main_rows[0].nom == this){
        _nom = $p.cat.nom.get()
      }
      else{
        _nom = main_rows[0].nom.nom(elm, strict)
      }
    }
    else if(main_rows.length){
      if(elm && !main_rows[0].formula.empty()){
        try{
          _nom = main_rows[0].formula.execute({elm});
          if(!_nom){
            _nom = main_rows[0].nom
          }
        }catch(e){
          _nom = main_rows[0].nom
        }
      }
      else{
        _nom = main_rows[0].nom
      }
    }
    else{
      _nom = $p.cat.nom.get()
    }

    if(main_rows.length < 2){
      _data.nom = typeof _nom == 'string' ? $p.cat.nom.get(_nom) : _nom;
    }
    else{
      _data.nom = _nom;
    }

    return _data.nom;
  }

  contour_attrs(contour) {

    const main_rows = [];
    const res = {calc_order: contour.project.ox.calc_order};

    this.specification.find_rows({is_main_elm: true}, (row) => {
      main_rows.push(row);
      return false;
    });

    if(main_rows.length){
      const irow = main_rows[0],
        sizes = {},
        sz_keys = {},
        sz_prms = ['length', 'width', 'thickness'].map((name) => {
          const prm = $p.job_prm.properties[name];
          sz_keys[prm.ref] = name;
          return prm;
        });

      res.owner = irow.nom instanceof $p.CatInserts ? irow.nom.nom() : irow.nom;

      contour.project.ox.params.find_rows({
        cnstr: contour.cnstr,
        inset: this,
        param: {in: sz_prms}
      }, (row) => {
        sizes[sz_keys[row.param.ref]] = row.value
      });

      if(Object.keys(sizes).length > 0){
        res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
        res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
        res.s = ((res.x * res.y) / 1000000).round(3);
        res.z = sizes.thickness * (irow.coefficient * 1000 || 1);
      }
      else{
        if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()){
          irow.formula.execute({
            ox: contour.project.ox,
            contour: contour,
            inset: this,
            row_ins: irow,
            res: res
          });
        }
        if(irow.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади && this.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
          const bounds = contour.bounds_inner(irow.sz);
          res.x = bounds.width.round(1);
          res.y = bounds.height.round(1);
          res.s = ((res.x * res.y) / 1000000).round(3);
        }
        else{
          res.x = contour.w + irow.sz;
          res.y = contour.h + irow.sz;
          res.s = ((res.x * res.y) / 1000000).round(3);
        }
      }
    }

    return res;

  }

  check_restrictions(row, elm, by_perimetr, len_angl) {

    const {_row} = elm;
    const len = len_angl ? len_angl.len : _row.len;
    const is_linear = elm.is_linear ? elm.is_linear() : true;
    let is_tabular = true;

    if(row.smin > _row.s || (_row.s && row.smax && row.smax < _row.s)){
      return false;
    }

    if(row.is_main_elm && !row.quantity){
      return false;
    }

    if((row.for_direct_profile_only > 0 && !is_linear) || (row.for_direct_profile_only < 0 && is_linear)){
      return false;
    }

    if($p.utils.is_data_obj(row)){

      if(row.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов){
        if(!elm.joined_imposts(true)){
          return false;
        }

      }else if(row.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам){
        if(elm.joined_imposts(true)){
          return false;
        }
      }
      is_tabular = false;
    }


    if(!is_tabular || by_perimetr || row.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру){
      if(row.lmin > len || (row.lmax < len && row.lmax > 0)){
        return false;
      }
      if(row.ahmin > _row.angle_hor || row.ahmax < _row.angle_hor){
        return false;
      }
    }


    return true;
  }

  filtered_spec({elm, is_high_level_call, len_angl, own_row, ox}) {

    const res = [];

    if(this.empty()){
      return res;
    }

    function fake_row(row) {
      if(row._metadata){
        const res = {};
        for(let fld in row._metadata().fields){
          res[fld] = row[fld];
        }
        return res;
      }
      else{
        return Object.assign({}, row);
      }
    }

    const {insert_type, check_restrictions} = this;
    const {Профиль, Заполнение} = $p.enm.inserts_types;
    const {check_params} = ProductsBuilding;

    if(is_high_level_call && (insert_type == Заполнение)){

      const glass_rows = [];
      ox.glass_specification.find_rows({elm: elm.elm}, (row) => {
        glass_rows.push(row);
      });

      if(glass_rows.length){
        glass_rows.forEach((row) => {
          row.inset.filtered_spec({elm, len_angl, ox}).forEach((row) => {
            res.push(row);
          });
        });
        return res;
      }
    }

    this.specification.each((row) => {

      if(!check_restrictions(row, elm, insert_type == Профиль, len_angl)){
        return;
      }

      if(own_row && row.clr.empty() && !own_row.clr.empty()){
        row = fake_row(row);
        row.clr = own_row.clr;
      }
      if(!check_params({
          params: this.selection_params,
          ox: ox,
          elm: elm,
          row_spec: row,
          cnstr: len_angl && len_angl.cnstr,
          origin: len_angl && len_angl.origin,
        })){
        return;
      }

      if(row.nom instanceof $p.CatInserts){
        row.nom.filtered_spec({elm, len_angl, ox, own_row: own_row || row}).forEach((subrow) => {
          const fakerow = fake_row(subrow);
          fakerow.quantity = (subrow.quantity || 1) * (row.quantity || 1);
          fakerow.coefficient = (subrow.coefficient || 1) * (row.coefficient || 1);
          fakerow._origin = row.nom;
          if(fakerow.clr.empty()){
            fakerow.clr = row.clr;
          }
          res.push(fakerow);
        });
      }
      else{
        res.push(row);
      }

    });

    return res;
  }

  calculate_spec({elm, len_angl, ox, spec}) {

    const {_row} = elm;
    const {ПоПериметру, ПоШагам, ПоФормуле, ДляЭлемента, ПоПлощади} = $p.enm.count_calculating_ways;
    const {profile_items} = $p.enm.elm_types;
    const {new_spec_row, calc_qty_len, calc_count_area_mass} = ProductsBuilding;

    if(!spec){
      spec = ox.specification;
    }

    this.filtered_spec({elm, is_high_level_call: true, len_angl, ox}).forEach((row_ins_spec) => {

      const origin = row_ins_spec._origin || this;

      let row_spec;

      if((row_ins_spec.count_calc_method != ПоПериметру && row_ins_spec.count_calc_method != ПоШагам) || profile_items.indexOf(_row.elm_type) != -1){
        row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
      }

      if(row_ins_spec.count_calc_method == ПоФормуле && !row_ins_spec.formula.empty()){
        row_spec = new_spec_row({row_spec, elm, row_base: row_ins_spec, origin, spec, ox});
      }
      else if(profile_items.indexOf(_row.elm_type) != -1 || row_ins_spec.count_calc_method == ДляЭлемента){
        calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
      }
      else{

        if(row_ins_spec.count_calc_method == ПоПлощади){
          row_spec.qty = row_ins_spec.quantity;
          if(this.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
            const bounds = elm.layer.bounds_inner(row_ins_spec.sz);
            row_spec.len = bounds.height * (row_ins_spec.coefficient || 0.001);
            row_spec.width = bounds.width * (row_ins_spec.coefficient || 0.001);
            row_spec.s = (row_spec.len * row_spec.width).round(3);
          }
          else{
            row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
            row_spec.s = _row.s;
          }
        }
        else if(row_ins_spec.count_calc_method == ПоПериметру){
          const row_prm = {_row: {len: 0, angle_hor: 0, s: _row.s}};
          const perimeter = elm.perimeter ? elm.perimeter : (
            this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ? elm.layer.perimeter_inner(row_ins_spec.sz) : elm.layer.perimeter
          )
          perimeter.forEach((rib) => {
            row_prm._row._mixin(rib);
            row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
            if(this.check_restrictions(row_ins_spec, row_prm, true)){
              row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
              calc_qty_len(row_spec, row_ins_spec, rib.len);
              calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
            }
            row_spec = null;
          });

        }
        else if(row_ins_spec.count_calc_method == ПоШагам){

          const bounds = this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ?
            elm.layer.bounds_inner(row_ins_spec.sz) : {height: _row.y2 - _row.y1, width: _row.x2 - _row.x1};

          const h = (!row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.height : bounds.width);
          const w = !row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.width : bounds.height;
          if(row_ins_spec.step){
            let qty = 0;
            let pos;
            if(row_ins_spec.do_center && h >= row_ins_spec.step ){
              pos = h / 2;
              if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                qty++;
              }
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                pos = h / 2 + i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
                pos = h / 2 - i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
              }
            }
            else{
              for(let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++){
                pos = i * row_ins_spec.step;
                if(pos >= row_ins_spec.offsets &&  pos <= h - row_ins_spec.offsets){
                  qty++;
                }
              }
            }

            if(qty){
              row_spec = new_spec_row({elm, row_base: row_ins_spec, origin, spec, ox});
              calc_qty_len(row_spec, row_ins_spec, w);
              row_spec.qty *= qty;
              calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
            }
            row_spec = null;
          }
        }
        else{
          throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
        }
      }

      if(row_spec){
        if(!row_ins_spec.formula.empty()){
          const qty = row_ins_spec.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: len_angl && len_angl.cnstr || 0,
            inset: (len_angl && len_angl.hasOwnProperty('cnstr')) ? len_angl.origin : $p.utils.blank.guid,
            row_ins: row_ins_spec,
            row_spec: row_spec,
            len: len_angl ? len_angl.len : _row.len
          });
          if(row_ins_spec.count_calc_method == ПоФормуле){
            row_spec.qty = qty;
          }
        }
        calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
      }
    })
  }

  get thickness() {

    const {_data} = this;

    if(!_data.hasOwnProperty("thickness")){
      _data.thickness = 0;
      const nom = this.nom(null, true);
      if(nom && !nom.empty()){
        _data.thickness = nom.thickness;
      }
      else{
        this.specification.forEach((row) => {
          _data.thickness += row.nom.thickness;
        });
      }
    }

    return _data.thickness;
  }

  get used_params() {
    const res = [];
    this.selection_params.each((row) => {
      if(!row.param.empty() && res.indexOf(row.param) == -1){
        res.push(row.param)
      }
    });
    return res;
  }

}



$p.cat.insert_bind.__define({

  insets: {
    value: function (ox) {
      const {sys, owner} = ox;
      const res = [];
      this.forEach((o) => {
        o.production.forEach((row) => {
          const {nom} = row;
          if(sys._hierarchy(nom) || owner._hierarchy(nom)){
            o.inserts.forEach(({inset, elm_type}) => {
              if(!res.some((irow) => irow.inset == inset &&  irow.elm_type == elm_type)){
                res.push({inset, elm_type});
              }
            });
          }
        })
      })
      return res;
    }
  }

});



$p.cat.nom.__define({

	sql_selection_list_flds: {
		value: function(initial_value){
			return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," +
				" case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" +
				" left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" +
				" left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
		}
	},

	sql_selection_where_flds: {
		value: function(filter){
			return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
		}
	}
});

$p.CatNom.prototype.__define({

	_price: {
		value: function (attr) {

      let price = 0, currency, start_date = $p.utils.blank.date;

			if(!attr){
        attr = {};
      }

			if(!attr.price_type){
        attr.price_type = $p.job_prm.pricing.price_type_sale;
      }
			else if($p.utils.is_data_obj(attr.price_type)){
        attr.price_type = attr.price_type.ref;
      }

      const {_price} = this._data;
      const {x, y, z, clr, ref, calc_order} = (attr.characteristic || {});

			if(!attr.characteristic){
        attr.characteristic = $p.utils.blank.guid;
      }
			else if($p.utils.is_data_obj(attr.characteristic)){
        attr.characteristic = ref;
        if(!calc_order.empty()){
          const tmp = [];
          const {by_ref} = $p.cat.characteristics;
          for(let clrx in _price) {
            const cx = by_ref[clrx];
            if(cx && cx.clr == clr){
              if(_price[clrx][attr.price_type]){
                if(cx.x && x && cx.x - x < -10){
                  continue;
                }
                if(cx.y && y && cx.y - y < -10){
                  continue;
                }
                tmp.push({
                  cx,
                  rate: (cx.x && x ? Math.abs(cx.x - x) : 0) + (cx.y && y ? Math.abs(cx.y - y) : 0) + (cx.z && z && cx.z == z ? 1 : 0)
                })
              }
            }
          }
          if(tmp.length){
            tmp.sort((a, b) => a.rate - b.rate);
            attr.characteristic = tmp[0].cx.ref;
          }
        }
			}
			if(!attr.date){
        attr.date = new Date();
      }

			if(_price){
				if(_price[attr.characteristic]){
					if(_price[attr.characteristic][attr.price_type]){
            _price[attr.characteristic][attr.price_type].forEach((row) => {
							if(row.date > start_date && row.date <= attr.date){
								price = row.price;
								currency = row.currency;
                start_date = row.date;
							}
						})
					}
				}
				else if(attr.clr){
          const {by_ref} = $p.cat.characteristics;
				  for(let clrx in _price){
            const cx = by_ref[clrx];
            if(cx && cx.clr == attr.clr){
              if(_price[clrx][attr.price_type]){
                _price[clrx][attr.price_type].forEach((row) => {
                  if(row.date > start_date && row.date <= attr.date){
                    price = row.price;
                    currency = row.currency;
                    start_date = row.date;
                  }
                })
                break;
              }
            }
          }
        }
      }

      if(attr.formula){

        if(!price && _price && _price[$p.utils.blank.guid]){
          if(_price[$p.utils.blank.guid][attr.price_type]){
            _price[$p.utils.blank.guid][attr.price_type].forEach((row) => {
              if(row.date > start_date && row.date <= attr.date){
                price = row.price;
                currency = row.currency;
                start_date = row.date;
              }
            })
          }
        }
        price = attr.formula.execute({
          nom: this,
          characteristic: $p.cat.characteristics.get(attr.characteristic, false),
          date: attr.date,
          price, currency, x, y, z, clr, calc_order,
        })
      }

			return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);

		}
	},

  grouping: {
	  get: function () {
      if(!this.hasOwnProperty('_grouping')){
        this.extra_fields.find_rows({property: $p.job_prm.properties.grouping}, (row) => {
          this._grouping = row.value.name;
        })
      }
      return this._grouping || '';
    }
  },

  presentation: {
    get : function(){
      return this.name + (this.article ? ' ' + this.article : '');
    },
    set : function(v){
    }
  },

  by_clr_key: {
    value: function (clr) {

      if(this.clr == clr){
        return this;
      }
      if(!this._clr_keys){
        this._clr_keys = new Map();
      }
      const {_clr_keys} = this;
      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(_clr_keys.size){
        return this;
      }

      const clr_key = $p.job_prm.properties.clr_key && $p.job_prm.properties.clr_key.ref;
      let clr_value;
      this.extra_fields.find_rows({property: $p.job_prm.properties.clr_key}, (row) => clr_value = row.value);
      if(!clr_value){
        return this;
      }

      this._manager.alatable.forEach((nom) => {
        nom.extra_fields && nom.extra_fields.some((row) => {
          row.property === clr_key && row.value === clr_value &&
            _clr_keys.set($p.cat.clrs.get(nom.clr), $p.cat.nom.get(nom.ref));
        })
      });

      if(_clr_keys.has(clr)){
        return _clr_keys.get(clr);
      }
      if(!_clr_keys.size){
        _clr_keys.set(0, 0);
      }
      return this;
    }
  }

});


$p.cat.partners.__define({

	sql_selection_where_flds: {
		value: function(filter){
			return " OR inn LIKE '" + filter + "' OR name_full LIKE '" + filter + "' OR name LIKE '" + filter + "'";
		}
	}
});

$p.CatPartners.prototype.__define({

	addr: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.presentation && (
						row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресКонтрагента") ||
						row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресКонтрагента")
					))
					return row.presentation;

			}, "")

		}
	},

	phone: {
		get: function () {

			return this.contact_information._obj.reduce(function (val, row) {

				if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагента") && row.presentation)
					return row.presentation;

				else if(val)
					return val;

				else if(row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагентаМобильный") && row.presentation)
					return row.presentation;

			}, "")
		}
	},

	long_presentation: {
		get: function () {
			var res = this.name_full || this.name,
				addr = this.addr,
				phone = this.phone;

			if(this.inn)
				res+= ", ИНН" + this.inn;

			if(this.kpp)
				res+= ", КПП" + this.kpp;

			if(addr)
				res+= ", " + addr;

			if(phone)
				res+= ", " + phone;

			return res;
		}
	}
});


$p.cat.production_params.__define({

	slist: function(prop, is_furn){
		var res = [], rt, at, pmgr,
			op = this.get(prop);

		if(op && op.type.is_ref){
			for(rt in op.type.types)
				if(op.type.types[rt].indexOf(".") > -1){
					at = op.type.types[rt].split(".");
					pmgr = $p[at[0]][at[1]];
					if(pmgr){
						if(pmgr.class_name=="enm.open_directions")
							pmgr.each(function(v){
								if(v.name!=$p.enm.tso.folding)
									res.push({value: v.ref, text: v.synonym});
							});
						else
							pmgr.find_rows({owner: prop}, function(v){
								res.push({value: v.ref, text: v.presentation});
							});
					}
				}
		}
		return res;
	}
});

$p.CatProduction_params.prototype.__define({

	noms: {
		get: function(){
			var __noms = [];
			this.elmnts._obj.forEach(function(row){
				if(!$p.utils.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1)
					__noms.push(row.nom);
			});
			return __noms;
		}
	},

	inserts: {
		value: function(elm_types, by_default){
			var __noms = [];
			if(!elm_types)
				elm_types = $p.enm.elm_types.rama_impost;

			else if(typeof elm_types == "string")
				elm_types = $p.enm.elm_types[elm_types];

			else if(!Array.isArray(elm_types))
				elm_types = [elm_types];

			this.elmnts.each(function(row){
				if(!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 &&
					(by_default == "rows" || !__noms.some(function (e) {
						return row.nom == e.nom;
					})))
					__noms.push(row);
			});

			if(by_default == "rows")
				return __noms;

			__noms.sort(function (a, b) {

				if(by_default){

					if (a.by_default && !b.by_default)
						return -1;
					else if (!a.by_default && b.by_default)
						return 1;
					else
						return 0;

				}else{
					if (a.nom.name < b.nom.name)
						return -1;
					else if (a.nom.name > b.nom.name)
						return 1;
					else
						return 0;
				}
			});
			return __noms.map(function (e) {
				return e.nom;
			});
		}
	},

	refill_prm: {
		value: function (ox, cnstr = 0) {

			const prm_ts = !cnstr ? this.product_params : this.furn_params;
			const adel = [];
			const auto_align = ox.calc_order.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон && $p.job_prm.properties.auto_align;
			const {params} = ox;

			function add_prm(default_row) {
        let row;
        params.find_rows({cnstr: cnstr, param: default_row.param}, (_row) => {
          row = _row;
          return false;
        });

        if(!row){
          if(cnstr){
            return;
          }
          row = params.add({cnstr: cnstr, param: default_row.param, value: default_row.value});
        }

        if(row.hide != default_row.hide){
          row.hide = default_row.hide;
        }

        if(default_row.forcibly && row.value != default_row.value){
          row.value = default_row.value;
        }
      }

			if(!cnstr){
        params.find_rows({cnstr: cnstr}, (row) => {
				  const {param} = row;
					if(param !== auto_align && prm_ts.find_rows({param}).length == 0){
            adel.push(row);
          }
				});
				adel.forEach((row) => params.del(row));
			}

			prm_ts.forEach(add_prm);

      !cnstr && auto_align && add_prm({param: auto_align, value: '', hide: false});

			if(!cnstr){
				ox.sys = this;
				ox.owner = ox.prod_nom;

				ox.constructions.forEach((row) => !row.furn.empty() && ox.sys.refill_prm(ox, row.cnstr))
			}
		}
	}

});




$p.cat.users.__define({

	load_array: {
		value: function(aattr, forse){
			const res = [];
			for(let aobj of aattr){
			  if(!aobj.acl_objs){
          aobj.acl_objs = [];
        }
        const {acl} = aobj;
			  delete aobj.acl;
        const obj = new $p.CatUsers(aobj, this, true);
        const {_obj} = obj;
        if(_obj){
          _obj._acl = acl;
          obj._set_loaded();
          Object.freeze(obj);
          Object.freeze(_obj);
          for(let j in _obj){
            if(typeof _obj[j] == "object"){
              Object.freeze(_obj[j]);
              for(let k in _obj[j]){
                typeof _obj[j][k] == "object" && Object.freeze(_obj[j][k]);
              }
            }
          }
          res.push(obj);
        }
			}
			return res;
		},
    configurable: false
	}

});



(function($p){

  const {job_prm, adapters, cch, doc} = $p;

  adapters.pouch.once('pouch_doc_ram_loaded', () => {

    cch.predefined_elmnts.pouch_find_rows({_raw: true, _top: 500, _skip: 0})
      .then((rows) => {

        const parents = {};

        rows.forEach((row) => {
          if(row.is_folder && row.synonym){
            var ref = row._id.split("|")[1];
            parents[ref] = row.synonym;
            !job_prm[row.synonym] && job_prm.__define(row.synonym, { value: {} });
          }

        });

        rows.forEach((row) => {

          if(!row.is_folder && row.synonym && parents[row.parent] && !job_prm[parents[row.parent]][row.synonym]){

            let _mgr;

            if(row.type.is_ref){
              const tnames = row.type.types[0].split(".");
              _mgr = $p[tnames[0]][tnames[1]]
            }

            if(row.list == -1){

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: (() => {
                  const res = {};
                  row.elmnts.forEach((row) => {
                    res[row.elm] = _mgr ? _mgr.get(row.value, false, false) : row.value;
                  });
                  return res;
                })()
              });

            }
            else if(row.list){

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: row.elmnts.map((row) => {
                  if(_mgr){
                    const value = _mgr.get(row.value, false, false);
                    if(!$p.utils.is_empty_guid(row.elm)){
                      value._formula = row.elm;
                    }
                    return value;
                  }else{
                    return row.value;
                  }
                })
              });

              if(row.synonym == "calculated"){

              }
            }
            else{

              if(job_prm[parents[row.parent]].hasOwnProperty(row.synonym)){
                delete job_prm[parents[row.parent]][row.synonym];
              }

              job_prm[parents[row.parent]].__define(row.synonym, {
                value: _mgr ? _mgr.get(row.value, false, false) : row.value,
                configurable: true
              });
            }

          }
        });
      })
      .then(() => {

        setTimeout(doc.calc_order.load_templates.bind(doc.calc_order), 1000);

        setTimeout(() => $p.md.emit("predefined_elmnts_inited"), 100);

      });

  });

	const _mgr = cch.predefined_elmnts;


	delete $p.CchPredefined_elmnts.prototype.value;
	$p.CchPredefined_elmnts.prototype.__define({

		value: {
			get: function () {

				const mf = this.type;
				const res = this._obj ? this._obj.value : "";
				let mgr, ref;

				if(this._obj.is_folder){
          return "";
        }
				if(typeof res == "object"){
          return res;
        }
				else if(mf.is_ref){
					if(mf.digits && typeof res === "number"){
            return res;
          }
					if(mf.hasOwnProperty("str_len") && !$p.utils.is_guid(res)){
            return res;
          }
					if(mgr = $p.md.value_mgr(this._obj, "value", mf)){
						if($p.utils.is_data_mgr(mgr)){
              return mgr.get(res, false);
            }
						else{
              return $p.utils.fetch_type(res, mgr);
            }
					}
					if(res){
						console.log(["value", mf, this._obj]);
						return null;
					}
				}
				else if(mf.date_part){
          return $p.utils.fix_date(this._obj.value, true);
        }
        else if(mf.digits){
          return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty("str_len"));
        }
        else if(mf.types[0]=="boolean"){
          return $p.utils.fix_boolean(this._obj.value);
        }
				else{
          return this._obj.value || "";
        }

				return this.characteristic.clr;
			},

			set: function (v) {

				if(this._obj.value === v){
          return;
        }

        _mgr.emit_async('update', this, {value: this._obj.value})
				this._obj.value = v.valueOf();
				this._data._modified = true;
			}
		}
	});

	_mgr.form_obj = function(pwnd, attr){

		let o, wnd;

		return this.constructor.prototype.form_obj.call(this, pwnd, attr)
			.then((res) => {
				if(res){
					o = res.o;
					wnd = res.wnd;
					return res;
				}
			});
	}

})($p);



$p.cch.properties.__define({

	check_mandatory: {
		value: function(prms, title){

			var t, row;

			for(t in prms){
				row = prms[t];
				if(row.param.mandatory && (!row.value || row.value.empty())){
					$p.msg.show_msg({
						type: "alert-error",
						text: $p.msg.bld_empty_param + row.param.presentation,
						title: title || $p.msg.bld_title});
					return true;
				}
			}
		}
	},

	slist: {
		value: function(prop, ret_mgr){

			var res = [], rt, at, pmgr, op = this.get(prop);

			if(op && op.type.is_ref){
				for(rt in op.type.types)
					if(op.type.types[rt].indexOf(".") > -1){
						at = op.type.types[rt].split(".");
						pmgr = $p[at[0]][at[1]];
						if(pmgr){

							if(ret_mgr)
								ret_mgr.mgr = pmgr;

							if(pmgr.class_name=="enm.open_directions")
								pmgr.get_option_list().forEach(function(v){
									if(v.value && v.value!=$p.enm.tso.folding)
										res.push(v);
								});

							else if(pmgr.class_name.indexOf("enm.")!=-1 || !pmgr.metadata().has_owners)
								res = pmgr.get_option_list();

							else
								pmgr.find_rows({owner: prop}, function(v){
									res.push({value: v.ref, text: v.presentation});
								});
						}
					}
			}
			return res;
		}
	}

});

$p.CchProperties.prototype.__define({

  is_calculated: {
    get: function () {
      return ($p.job_prm.properties.calculated || []).indexOf(this) != -1;
    }
  },

  calculated_value: {
    value: function (obj) {
      if(!this._calculated_value){
        if(this._formula){
          this._calculated_value = $p.cat.formulas.get(this._formula);
        }else{
          return;
        }
      }
      return this._calculated_value.execute(obj)
    }
  },

  check_compare: {
    value: function (left, right, comparison_type) {
      const {eq, ne, gt, gte, lt, lte, nin, inh, ninh} = $p.enm.comparison_types;
      switch(comparison_type) {
        case ne:
          return left != right;
        case gt:
          return left > right;
        case gte:
          return left >= right;
        case lt:
          return left < right;
        case lte:
          return left <= right;
        case nin:
          if(Array.isArray(left) && !Array.isArray(right)){
            return left.indexOf(right) == -1;
          }
          else if(!Array.isArray(left) && Array.isArray(right)){
            return right.indexOf(left) == -1;
          }
          else if(!Array.isArray(left) && !Array.isArray(right)){
            return right != left;
          }
          break;
        case $p.enm.comparison_types.in:
          if(Array.isArray(left) && !Array.isArray(right)){
            return left.indexOf(right) != -1;
          }
          else if(!Array.isArray(left) && Array.isArray(right)){
            return right.indexOf(left) != -1;
          }
          else if(!Array.isArray(left) && !Array.isArray(right)){
            return left == right;
          }
          break;
        case inh:
          return $p.utils.is_data_obj(left) ? left._hierarchy(right) : left == right;
        case ninh:
          return $p.utils.is_data_obj(left) ? !left._hierarchy(right) : left != right;
        default:
          return left == right;
      }
    }
  },

  check_condition: {
    value: function ({row_spec, prm_row, elm, cnstr, origin, ox, calc_order}) {

      const {is_calculated} = this;

      const val = is_calculated ? this.calculated_value({
        row: row_spec,
        cnstr: cnstr || 0,
        elm,
        ox,
        calc_order
      }) : this.extract_value(prm_row);

      let ok = false;

      if(ox && !Array.isArray(val) && (prm_row.comparison_type.empty() || prm_row.comparison_type == $p.enm.comparison_types.eq)){
        if(is_calculated){
          ok = val == prm_row.value;
        }
        else{
          ox.params.find_rows({
            cnstr: cnstr || 0,
            inset: (typeof origin !== 'number' && origin) || $p.utils.blank.guid,
            param: this,
            value: val
          }, () => {
            ok = true;
            return false;
          });
        }
      }
      else if(is_calculated){
        const value = this.extract_value(prm_row);
        ok = this.check_compare(val, this.extract_value(prm_row), prm_row.comparison_type);
      }
      else{
        ox.params.find_rows({
          cnstr: cnstr || 0,
          inset: (typeof origin !== 'number' && origin) || $p.utils.blank.guid,
          param: this
        }, ({value}) => {
          ok = this.check_compare(value, val, prm_row.comparison_type);
          return false;
        });
      }
      return ok;
    }
  },

  extract_value: {
    value: function ({comparison_type, txt_row, value}) {

      switch(comparison_type) {

        case $p.enm.comparison_types.in:
        case $p.enm.comparison_types.nin:

          if(!txt_row){
            return value;
          }
          try{
            const arr = JSON.parse(txt_row);
            const {types} = this.type;
            if(types.length == 1){
              const mgr = $p.md.mgr_by_class_name(types[0]);
              return arr.map((ref) => mgr.get(ref, false));
            }
            return arr;
          }
          catch(err){
            return value;
          }

        default:
          return value;
      }
    }
  },

  params_links: {
    value: function (attr) {

      if(!this.hasOwnProperty("_params_links")){
        this._params_links = $p.cat.params_links.find_rows({slave: this})
      }

      return this._params_links.filter((link) => {
        let ok = true;
        link.master.params.forEach((row) => {
          ok = row.property.check_condition({
            cnstr: attr.grid.selection.cnstr,
            ox: attr.obj._owner._owner,
            prm_row: row,
            elm: attr.obj,
          });
          if(!ok){
            return false;
          }
        });
        return ok;
      });
    }
  },

  linked_values: {
    value: function (links, prow) {
      const values = [];
      let changed;
      links.forEach((link) => link.values.forEach((row) => values.push(row)));
      if(values.some((row) => row._obj.value == prow.value)){
        return;
      }
      if(values.some((row) => {
          if(row.forcibly){
            prow.value = row._obj.value;
            return true;
          }
          if(row.by_default && (!prow.value || prow.value.empty && prow.value.empty())){
            prow.value = row._obj.value;
            changed = true;
          }
        })){
        return true;
      }
      if(changed){
        return true;
      }
      if(values.length){
        prow.value = values[0]._obj.value;
        return true;
      }
    }
  },

  filter_params_links: {
    value: function (filter, attr) {
      this.params_links(attr).forEach((link) => {
        if(!filter.ref){
          filter.ref = {in: []}
        }
        if(filter.ref.in){
          link.values._obj.forEach((row) => {
            if(filter.ref.in.indexOf(row.value) == -1){
              filter.ref.in.push(row.value);
            }
          });
        }
      });
    }
  }

});


class Pricing {

  constructor($p) {

    $p.md.once("predefined_elmnts_inited", () => {

      this.by_range()
        .then(() => {
          $p.adapters.pouch.emit('pouch_complete_loaded');
          $p.doc.nom_prices_setup.pouch_db.changes({
            since: 'now',
            live: true,
            include_docs: true,
            selector: {class_name: {$in: ['doc.nom_prices_setup', 'cat.formulas']}}
          }).on('change', (change) => {
            if(change.doc.class_name == 'doc.nom_prices_setup'){
              setTimeout(() => {
                this.by_doc(change.doc)
              }, 1000);
            }
          });
        })
    });

  }

  build_cache(rows) {
    const {nom, currencies} = $p.cat;
    for(const {key, value} of rows){
      if(!Array.isArray(value)){
        return setTimeout(() => $p.iface.do_reload('', 'Индекс цен номенклатуры'), 1000);
      }
      const onom = nom.get(key[0], false, true);
      if (!onom || !onom._data){
        return;
      }
      if (!onom._data._price){
        onom._data._price = {};
      }
      const {_price} = onom._data;

      if (!_price[key[1]]){
        _price[key[1]] = {};
      }
      _price[key[1]][key[2]] = value.map((v) => ({
        date: new Date(v.date),
        currency: currencies.get(v.currency),
        price: v.price
      }));
    }
  }

  by_range(startkey) {

    return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
      {
        limit: 5000,
        include_docs: false,
        startkey: startkey || [''],
        endkey: ['\ufff0'],
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
        if (res.rows.length == 5000) {
          return this.by_range(res.rows[res.rows.length - 1].key);
        }
      });
  }

  by_doc(doc) {
    const keys = doc.goods.map(({nom, nom_characteristic, price_type}) => [nom, nom_characteristic, price_type]);
    return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last",
      {
        include_docs: false,
        keys: keys,
        reduce: true,
        group: true,
      })
      .then((res) => {
        this.build_cache(res.rows);
      });
  }

  nom_price(nom, characteristic, price_type, prm, row) {

    if (row && prm) {
      const {_owner} = prm.calc_order_row._owner,
        price_prm = {
          price_type: price_type,
          characteristic: characteristic,
          date: _owner.date,
          currency: _owner.doc_currency
        };

      if (price_type == prm.price_type.price_type_first_cost && !prm.price_type.formula.empty()) {
        price_prm.formula = prm.price_type.formula;
      }
      else if(price_type == prm.price_type.price_type_sale && !prm.price_type.sale_formula.empty()){
        price_prm.formula = prm.price_type.sale_formula;
      }
      if(!characteristic.clr.empty()){
        price_prm.clr = characteristic.clr;
      }
      row.price = nom._price(price_prm);

      return row.price;
    }
  }

  price_type(prm) {

    const empty_formula = $p.cat.formulas.get();

    prm.price_type = {
      marginality: 1.9,
      marginality_min: 1.2,
      marginality_internal: 1.5,
      discount: 0,
      discount_external: 10,
      extra_charge_external: 0,
      price_type_first_cost: $p.job_prm.pricing.price_type_first_cost,
      price_type_sale: $p.job_prm.pricing.price_type_sale,
      price_type_internal: $p.job_prm.pricing.price_type_first_cost,
      formula: empty_formula,
      sale_formula: empty_formula,
      internal_formula: empty_formula,
      external_formula: empty_formula
    };

    const {calc_order_row} = prm;
    const {nom, characteristic} = calc_order_row;
    const {partner} = calc_order_row._owner._owner;
    const filter = nom.price_group.empty() ?
        {price_group: nom.price_group} :
        {price_group: {in: [nom.price_group, $p.cat.price_groups.get()]}};
    const ares = [];

    $p.ireg.margin_coefficients.find_rows(filter, (row) => {

      let ok = true;
      if(!row.key.empty()){
        row.key.params.forEach((row_prm) => {

          const {property} = row_prm;
          if(property.is_calculated){
            ok = property.check_compare(property.calculated_value({calc_order_row}), property.extract_value(row_prm), row_prm.comparison_type);
          }
          else if(property.empty()){
            const vpartner = $p.cat.partners.get(row_prm._obj.value, false, true);
            if(vpartner && !vpartner.empty()){
              ok = vpartner == partner;
            }
          }
          else{
            let finded;
            characteristic.params.find_rows({
              cnstr: 0,
              param: property
            }, (row_x) => {
              finded = row_x;
              return false;
            });
            if(finded){
              ok = property.check_compare(finded.value, property.extract_value(row_prm), row_prm.comparison_type);
            }
            else{
              ok = false;
            }
          }
          if(!ok){
            return false;
          }
        })
      }
      if(ok){
        ares.push(row);
      }
    });

    if(ares.length){
      ares.sort((a, b) => {

        if ((!a.key.empty() && b.key.empty()) || (a.key.priority > b.key.priority)) {
          return -1;
        }
        if ((a.key.empty() && !b.key.empty()) || (a.key.priority < b.key.priority)) {
          return 1;
        }

        if (a.price_group.ref > b.price_group.ref) {
          return -1;
        }
        if (a.price_group.ref < b.price_group.ref) {
          return 1;
        }

        return 0;

      });
      Object.keys(prm.price_type).forEach((key) => {
        prm.price_type[key] = ares[0][key];
      });
    }

    partner.extra_fields.find_rows({
      property: $p.job_prm.pricing.dealer_surcharge
    }, (row) => {
      const val = parseFloat(row.value);
      if(val){
        prm.price_type.extra_charge_external = val;
      }
      return false;
    });

    return prm.price_type;
  }

  calc_first_cost(prm) {

    const {marginality_in_spec} = $p.job_prm.pricing;
    const fake_row = {};

    if(!prm.spec)
      return;

    if(prm.spec.count()){
      prm.spec.forEach((row) => {

        const {_obj, nom, characteristic} = row;

        this.nom_price(nom, characteristic, prm.price_type.price_type_first_cost, prm, _obj);
        _obj.amount = _obj.price * _obj.totqty1;

        if(marginality_in_spec){
          fake_row.nom = nom;
          const tmp_price = this.nom_price(nom, characteristic, prm.price_type.price_type_sale, prm, fake_row);
          _obj.amount_marged = (tmp_price ? tmp_price : _obj.price) * _obj.totqty1;
        }

      });
      prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
    }
    else{
      fake_row.nom = prm.calc_order_row.nom;
      fake_row.characteristic = prm.calc_order_row.characteristic;
      prm.calc_order_row.first_cost = this.nom_price(fake_row.nom, fake_row.characteristic, prm.price_type.price_type_first_cost, prm, fake_row);
    }

    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_first_cost(fake_prm);
    });
  }

  calc_amount (prm) {

    const {calc_order_row, price_type} = prm;
    const price_cost = $p.job_prm.pricing.marginality_in_spec ?
      prm.spec.aggregate([], ["amount_marged"]) :
      this.nom_price(calc_order_row.nom, calc_order_row.characteristic, price_type.price_type_sale, prm, {});

    let extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");

    if(!$p.current_user.partners_uids.length || !extra_charge){
      extra_charge = price_type.extra_charge_external;
    }

    if(price_cost){
      calc_order_row.price = price_cost.round(2);
    }
    else{
      calc_order_row.price = (calc_order_row.first_cost * price_type.marginality).round(2);
    }

    calc_order_row.marginality = calc_order_row.first_cost ?
      calc_order_row.price * ((100 - calc_order_row.discount_percent)/100) / calc_order_row.first_cost : 0;


    if(extra_charge){
      calc_order_row.price_internal = (calc_order_row.price *
      (100 - calc_order_row.discount_percent)/100 * (100 + extra_charge)/100).round(2);

    }

    !prm.hand_start && calc_order_row.value_change("price", {}, calc_order_row.price, true);

    prm.order_rows && prm.order_rows.forEach((value) => {
      const fake_prm = {
        spec: value.characteristic.specification,
        calc_order_row: value
      }
      this.price_type(fake_prm);
      this.calc_amount(fake_prm);
    });

  }

  from_currency_to_currency (amount, date, from, to) {

    const {main_currency} = $p.job_prm.pricing;

    if(!to || to.empty()){
      to = main_currency;
    }
    if(!from || from.empty()){
      from = main_currency;
    }
    if(from == to){
      return amount;
    }
    if(!date){
      date = new Date();
    }
    if(!this.cource_sql){
      this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `period` desc");
    }

    let cfrom = {course: 1, multiplicity: 1},
      cto = {course: 1, multiplicity: 1};
    if(from != main_currency){
      const tmp = this.cource_sql([from.ref, date]);
      if(tmp.length)
        cfrom = tmp[0];
    }
    if(to != main_currency){
      const tmp = this.cource_sql([to.ref, date]);
      if(tmp.length)
        cto = tmp[0];
    }

    return (amount * cfrom.course / cfrom.multiplicity) * cto.multiplicity / cto.course;
  }

  cut_upload () {

    if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов") && !$p.current_user.role_available("ИзменениеТехнологическойНСИ")){
      $p.msg.show_msg({
        type: "alert-error",
        text: $p.msg.error_low_acl,
        title: $p.msg.error_rights
      });
      return true;
    }

    function upload_acc() {
      const mgrs = [
        "cat.users",
        "cat.individuals",
        "cat.organizations",
        "cat.partners",
        "cat.contracts",
        "cat.currencies",
        "cat.nom_prices_types",
        "cat.price_groups",
        "cat.cashboxes",
        "cat.partner_bank_accounts",
        "cat.organization_bank_accounts",
        "cat.projects",
        "cat.stores",
        "cat.cash_flow_articles",
        "cat.cost_items",
        "cat.price_groups",
        "cat.delivery_areas",
        "ireg.currency_courses",
        "ireg.margin_coefficients"
      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {

        })
        .on('paused', (err) => {

        })
        .on('active', () => {

        })
        .on('denied', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {

          if($p.current_user.role_available("ИзменениеТехнологическойНСИ"))
            upload_tech();

          else
            $p.msg.show_msg({
              type: "alert-info",
              text: $p.msg.sync_complite,
              title: $p.msg.sync_title
            });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    function upload_tech() {
      const mgrs = [
        "cat.units",
        "cat.nom",
        "cat.nom_groups",
        "cat.nom_units",
        "cat.nom_kinds",
        "cat.elm_visualization",
        "cat.destinations",
        "cat.property_values",
        "cat.property_values_hierarchy",
        "cat.inserts",
        "cat.insert_bind",
        "cat.color_price_groups",
        "cat.clrs",
        "cat.furns",
        "cat.cnns",
        "cat.production_params",
        "cat.parameters_keys",
        "cat.formulas",
        "cch.properties",
        "cch.predefined_elmnts"

      ];

      $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
        filter: (doc) => mgrs.indexOf(doc._id.split("|")[0]) != -1
      })
        .on('change', (info) => {

        })
        .on('paused', (err) => {

        })
        .on('active', () => {

        })
        .on('denied', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        })
        .on('complete', (info) => {
          $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });

        })
        .on('error', (err) => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);

        });
    }

    if($p.current_user.role_available("СогласованиеРасчетовЗаказов"))
      upload_acc();
    else
      upload_tech();

  }

}


$p.pricing = new Pricing($p);


class ProductsBuilding {

  constructor(listen) {

    let added_cnn_spec,
      ox,
      spec,
      constructions,
      coordinates,
      cnn_elmnts,
      glass_specification,
      params;


    function cnn_row(elm1, elm2){
      let res = cnn_elmnts.find_rows({elm1: elm1, elm2: elm2});
      if(res.length){
        return res[0].row;
      }
      res = cnn_elmnts.find_rows({elm1: elm2, elm2: elm1});
      if(res.length){
        return res[0].row;
      }
      return 0;
    }

    function cnn_need_add_spec(cnn, elm1, elm2, point){
      if(cnn && cnn.cnn_type == $p.enm.cnn_types.xx){
        if(!added_cnn_spec.points){
          added_cnn_spec.points = [];
        }
        for(let p of added_cnn_spec.points){
          if(p.is_nearest(point, true)){
            return false;
          }
        }
        added_cnn_spec.points.push(point);
        return true;
      }
      else if(!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1){
        return false;
      }
      added_cnn_spec[elm1] = elm2;
      return true;
    }



    function cnn_add_spec(cnn, elm, len_angl, cnn_other){
      if(!cnn){
        return;
      }
      const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      cnn_filter_spec(cnn, elm, len_angl).forEach((row_cnn_spec) => {

        const {nom} = row_cnn_spec;

        if(nom instanceof $p.CatInserts){
          if(len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)){
            const tmp_len_angl = len_angl._clone();
            tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
            nom.calculate_spec({elm, len_angl: tmp_len_angl, ox});
          }else{
            nom.calculate_spec({elm, len_angl, ox});
          }
        }
        else {

          const row_spec = new_spec_row({row_base: row_cnn_spec, origin: len_angl.origin || cnn, elm, nom, spec, ox});

          if(nom.is_pieces){
            if(!row_cnn_spec.coefficient){
              row_spec.qty = row_cnn_spec.quantity;
            }
            else{
              row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5)
                .round(nom.rounding_quantity);
            }
          }
          else{
            row_spec.qty = row_cnn_spec.quantity;

            if(row_cnn_spec.sz || row_cnn_spec.coefficient){
              let sz = row_cnn_spec.sz, finded, qty;
              if(cnn_other){
                cnn_other.specification.find_rows({nom}, (row) => {
                  sz += row.sz;
                  qty = row.quantity;
                  return !(finded = true);
                })
              }
              if(!finded){
                sz *= 2;
              }
              if(!row_spec.qty && finded && len_angl.art1){
                row_spec.qty = qty;
              }
              row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
            }
          }

          if(!row_cnn_spec.formula.empty()) {
            row_cnn_spec.formula.execute({
              ox,
              elm,
              len_angl,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_spec,
              row_spec: row_spec
            });
          }

          calc_count_area_mass(row_spec, spec, len_angl, row_cnn_spec.angle_calc_method);
        }

      });
    }

    function cnn_filter_spec(cnn, elm, len_angl){

      const res = [];
      const {angle_hor} = elm;
      const {art1, art2} = $p.job_prm.nom;
      const {САртикулом1, САртикулом2} = $p.enm.specification_installation_methods;
      const {check_params} = ProductsBuilding;

      const {cnn_type, specification, selection_params} = cnn;
      const {ii, xx, acn} = $p.enm.cnn_types;

      specification.each((row) => {
        const {nom} = row;
        if(!nom || nom.empty() || nom == art1 || nom == art2){
          return;
        }

        if((row.for_direct_profile_only > 0 && !elm.is_linear()) ||
          (row.for_direct_profile_only < 0 && elm.is_linear())){
          return;
        }

        if(cnn_type == ii){
          if(row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len){
            return;
          }
        }else{
          if(row.amin > len_angl.angle || row.amax < len_angl.angle){
            return;
          }
        }

        if((row.set_specification == САртикулом1 && len_angl.art2) || (row.set_specification == САртикулом2 && len_angl.art1)){
          return;
        }
        if(len_angl.art2 && acn.a.indexOf(cnn_type) != -1 && row.set_specification != САртикулом2 && cnn_type != xx){
          return;
        }

        if(check_params({params: selection_params, row_spec: row, elm, ox})){
          res.push(row);
        }

      });

      return res;
    }


    function furn_spec(contour) {

      if(!contour.parent){
        return false;
      }

      const {furn_cache, furn} = contour;
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      if(!furn_check_opening_restrictions(contour, furn_cache)){
        return;
      }

      contour.update_handle_height(furn_cache);

      const blank_clr = $p.cat.clrs.get();
      furn.furn_set.get_spec(contour, furn_cache).each((row) => {
        const elm = {elm: -contour.cnstr, clr: blank_clr};
        const row_spec = new_spec_row({elm, row_base: row, origin: row.origin, spec, ox});

        if(row.is_procedure_row){
          row_spec.elm = row.handle_height_min;
          row_spec.len = row.coefficient / 1000;
          row_spec.qty = 0;
          row_spec.totqty = 1;
          row_spec.totqty1 = 1;
        }
        else{
          row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
          calc_count_area_mass(row_spec, spec);
        }
      });
    }

    function furn_check_opening_restrictions(contour, cache) {

      let ok = true;
      const {new_spec_row} = ProductsBuilding;


      contour.furn.open_tunes.each((row) => {
        const elm = contour.profile_by_furn_side(row.side, cache);
        const len = elm._row.len - 2 * elm.nom.sizefurn;


        if(len < row.lmin || len > row.lmax || (!elm.is_linear() && !row.arc_available)){
          new_spec_row({elm, row_base: {clr: $p.cat.clrs.get(), nom: $p.job_prm.nom.furn_error}, origin: contour.furn, spec, ox});
          ok = false;
        }

      });

      return ok;
    }


    function cnn_spec_nearest(elm) {
      const nearest = elm.nearest();
      if(nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm._attr._nearest_cnn)
        cnn_add_spec(elm._attr._nearest_cnn, elm, {
          angle:  0,
          alp1:   0,
          alp2:   0,
          len:    elm._attr._len,
          origin: cnn_row(elm.elm, nearest.elm)
        });
    }

    function base_spec_profile(elm) {

      const {_row, rays} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
        return;
      }

      const {b, e} = rays;

      if(!b.cnn || !e.cnn){
        return;
      }
      b.check_err();
      e.check_err();

      const prev = b.profile;
      const next = e.profile;
      const row_cnn_prev = b.cnn.main_row(elm);
      const row_cnn_next = e.cnn.main_row(elm);
      const {new_spec_row, calc_count_area_mass} = ProductsBuilding;

      let row_spec;

      const row_cnn = row_cnn_prev || row_cnn_next;
      if(row_cnn){

        row_spec = new_spec_row({elm, row_base: row_cnn, nom: _row.nom, origin: cnn_row(_row.elm, prev ? prev.elm : 0), spec, ox});
        row_spec.qty = row_cnn.quantity;

        const seam = $p.enm.angle_calculating_ways.СварнойШов;
        const d45 = Math.sin(Math.PI / 4);
        const dprev = row_cnn_prev ? (
          row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz
        ) : 0;
        const dnext = row_cnn_next ? (
          row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz
        ) : 0;

        row_spec.len = (_row.len - dprev - dnext)
          * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        elm._attr._len = _row.len;
        _row.len = (_row.len
          - (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz)
          - (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz))
          * 1000 * ( (row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

        if(!elm.is_linear()){
          row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
        }

        if(row_cnn_prev && !row_cnn_prev.formula.empty()){
          row_cnn_prev.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_prev,
            row_spec: row_spec
          });
        }
        else if(row_cnn_next && !row_cnn_next.formula.empty()){
          row_cnn_next.formula.execute({
            ox: ox,
            elm: elm,
            cnstr: 0,
            inset: $p.utils.blank.guid,
            row_cnn: row_cnn_next,
            row_spec: row_spec
          });
        }

        const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
        const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
        const {СоединениеПополам, Соединение} = $p.enm.angle_calculating_ways;
        calc_count_area_mass(
          row_spec,
          spec,
          _row,
          angle_calc_method_prev,
          angle_calc_method_next,
          angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0,
          angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0
        );
      }

      const len_angl = {
        angle: 0,
        alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
        alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
        len: row_spec ? row_spec.len * 1000 : _row.len,
        art1: false,
        art2: true
      };
      if(cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0, b.point)){


        len_angl.angle = len_angl.alp2;

        if(b.cnn.cnn_type == $p.enm.cnn_types.t || b.cnn.cnn_type == $p.enm.cnn_types.i || b.cnn.cnn_type == $p.enm.cnn_types.xx){
          if(cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm, e.point)){
            cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
          }
        }
        else{
          cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
        }

        len_angl.angle = len_angl.alp1;
        len_angl.art2 = false;
        len_angl.art1 = true;
        cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
      }

      elm.inset.calculate_spec({elm, ox});

      cnn_spec_nearest(elm);

      elm.addls.forEach(base_spec_profile);

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция){
          $p.record_log("inset_elm_spec: specification_order_row_types.Продукция");
        }

        len_angl.origin = inset;
        len_angl.angle = elm.angle_hor;
        len_angl.cnstr = elm.layer.cnstr;
        delete len_angl.art1;
        delete len_angl.art2;
        inset.calculate_spec({elm, len_angl, ox});

      });

    }

    function base_spec_sectional(elm) {

      const {_row, _attr, inset, layer} = elm;

      if(_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
        return;
      }

      const spec_tmp = spec;

      inset.calculate_spec({elm, ox});

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция){
          const cx = Object.assign(ox.find_create_cx(elm.elm, inset.ref), inset.contour_attrs(layer));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: layer.cnstr
        }
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      spec = spec_tmp;

    }

    function base_spec_glass(elm) {

      const {profiles, imposts, _row} = elm;

      if(_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
        return;
      }

      const glength = profiles.length;

      for(let i=0; i<glength; i++ ){
        const curr = profiles[i];

        if(curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')){
          return;
        }

        const prev = (i==0 ? profiles[glength-1] : profiles[i-1]).profile;
        const next = (i==glength-1 ? profiles[0] : profiles[i+1]).profile;
        const row_cnn = cnn_elmnts.find_rows({elm1: _row.elm, elm2: curr.profile.elm});

        const len_angl = {
          angle: 0,
          alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
          alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
          len: row_cnn.length ? row_cnn[0].aperture_len : 0,
          origin: cnn_row(_row.elm, curr.profile.elm)

        };

        cnn_add_spec(curr.cnn, curr.profile, len_angl);

      }

      elm.inset.calculate_spec({elm, ox});

      imposts.forEach(base_spec_profile);

      ox.inserts.find_rows({cnstr: -elm.elm}, ({inset, clr}) => {
        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция){
          $p.record_log("inset_elm_spec: specification_order_row_types.Продукция");
        }
        inset.calculate_spec({elm, ox});
      });
    }


    function inset_contour_spec(contour) {

      const spec_tmp = spec;

      ox.inserts.find_rows({cnstr: contour.cnstr}, ({inset, clr}) => {

        if(inset.is_order_row == $p.enm.specification_order_row_types.Продукция){
          const cx = Object.assign(ox.find_create_cx(-contour.cnstr, inset.ref), inset.contour_attrs(contour));
          ox._order_rows.push(cx);
          spec = cx.specification.clear();
        }

        const elm = {
          _row: {},
          elm: 0,
          clr: clr,
          layer: contour,
        };
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          origin: inset,
          cnstr: contour.cnstr
        }
        inset.calculate_spec({elm, len_angl, ox, spec});

      });

      spec = spec_tmp;
    }

    function base_spec(scheme) {

      const {Contour, Filling, Sectional, Profile, ProfileConnective} = $p.Editor;

      added_cnn_spec = {};

      scheme.getItems({class: Contour}).forEach((contour) => {

        for(let elm of contour.children){
          if(elm instanceof Filling){
            base_spec_glass(elm);
          }
          else if(elm instanceof Sectional){
            base_spec_sectional(elm);
          }
          else if(elm instanceof Profile){
            base_spec_profile(elm);
          }
        }

        furn_spec(contour);

        inset_contour_spec(contour);

      });

      for(let elm of scheme.l_connective.children){
        if(elm instanceof ProfileConnective){
          base_spec_profile(elm);
        }
      }

      inset_contour_spec({
        cnstr:0,
        project: scheme,
        get perimeter() {return this.project.perimeter}
      });

    }

    this.recalc = function (scheme, attr) {



      ox = scheme.ox;
      spec = ox.specification;
      constructions = ox.constructions;
      coordinates = ox.coordinates;
      cnn_elmnts = ox.cnn_elmnts;
      glass_specification = ox.glass_specification;
      params = ox.params;

      spec.clear();

      ox._order_rows = [];

      base_spec(scheme);

      spec.group_by("nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop", "qty,totqty,totqty1");



      scheme.draw_visualization();
      scheme.notify(scheme, "coordinates_calculated", attr);


      if(ox.calc_order_row){
        $p.spec_building.specification_adjustment({
          scheme: scheme,
          calc_order_row: ox.calc_order_row,
          spec: spec,
          save: attr.save,
        }, true);
      }

      if(attr.snapshot){
        scheme.notify(scheme, "scheme_snapshot", attr);
      }

      if(attr.save){


        ox.save(undefined, undefined, {
          svg: {
            content_type: "image/svg+xml",
            data: new Blob([scheme.get_svg()], {type: "image/svg+xml"})
          }
        })
          .then(() => {
            $p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
            delete scheme._attr._saving;
            ox.calc_order.characteristic_saved(scheme, attr);
            scheme._scope.eve.emit("characteristic_saved", scheme, attr);


          })
          .catch((ox) => {


            $p.record_log(ox);
            delete scheme._attr._saving;
            if(ox._data && ox._data._err){
              $p.msg.show_msg(ox._data._err);
              delete ox._data._err;
            }
          });
      }
      else{
        delete scheme._attr._saving;
      }

      ox._data._loading = false;

    }

  }

  static check_params({params, row_spec, elm, cnstr, origin, ox}){

    let ok = true;

    params.find_rows({elm: row_spec.elm}, (prm_row) => {
      ok = prm_row.param.check_condition({row_spec, prm_row, elm, cnstr, origin, ox});
      if(!ok){
        return false;
      }
    });

    return ok;
  }

  static new_spec_row({row_spec, elm, row_base, nom, origin, spec, ox}){
    if(!row_spec){
      row_spec = spec.add();
    }
    row_spec.nom = nom || row_base.nom;
    if(!row_spec.nom.visualization.empty()){
      row_spec.dop = -1;
    }
    else if(row_spec.nom.is_procedure){
      row_spec.dop = -2;
    }
    row_spec.characteristic = row_base.nom_characteristic;
    if(!row_spec.characteristic.empty() && row_spec.characteristic.owner != row_spec.nom){
      row_spec.characteristic = $p.utils.blank.guid;
    }
    row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr);
    row_spec.elm = elm.elm;
    if(origin){
      row_spec.origin = origin;
    }
    return row_spec;
  }

  static calc_qty_len(row_spec, row_base, len){

    const {nom} = row_spec;

    if(nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет ||
      nom.cutting_optimization_type.empty() || nom.is_pieces){
      if(!row_base.coefficient || !len){
        row_spec.qty = row_base.quantity;
      }
      else{
        if(!nom.is_pieces){
          row_spec.qty = row_base.quantity;
          row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
          if(nom.rounding_quantity){
            row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
            row_spec.len = 0;
          };
        }
        else if(!nom.rounding_quantity){
          row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
        }
        else{
          row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
        }
      }
    }
    else{
      row_spec.qty = row_base.quantity;
      row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
    }
  }

  static calc_count_area_mass(row_spec, spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2){

    if(!row_spec.qty){
      if(row_spec.dop >= 0){
        spec.del(row_spec.row-1, true);
      }
      return;
    }

    if(!angle_calc_method_next){
      angle_calc_method_next = angle_calc_method_prev;
    }

    if(angle_calc_method_prev && !row_spec.nom.is_pieces){

      const {Основной, СварнойШов, СоединениеПополам, Соединение, _90} = $p.enm.angle_calculating_ways;

      if((angle_calc_method_prev == Основной) || (angle_calc_method_prev == СварнойШов)){
        row_spec.alp1 = row_coord.alp1;
      }
      else if(angle_calc_method_prev == _90){
        row_spec.alp1 = 90;
      }
      else if(angle_calc_method_prev == СоединениеПополам){
        row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
      }
      else if(angle_calc_method_prev == Соединение){
        row_spec.alp1 = (alp1 || row_coord.alp1);
      }

      if((angle_calc_method_next == Основной) || (angle_calc_method_next == СварнойШов)){
        row_spec.alp2 = row_coord.alp2;
      }
      else if(angle_calc_method_next == _90){
        row_spec.alp2 = 90;
      }
      else if(angle_calc_method_next == СоединениеПополам){
        row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
      }
      else if(angle_calc_method_next == Соединение){
        row_spec.alp2 = (alp2 || row_coord.alp2);
      }
    }

    if(row_spec.len){
      if(row_spec.width && !row_spec.s)
        row_spec.s = row_spec.len * row_spec.width;
    }else{
      row_spec.s = 0;
    }

    if(row_spec.s)
      row_spec.totqty = row_spec.qty * row_spec.s;

    else if(row_spec.len)
      row_spec.totqty = row_spec.qty * row_spec.len;

    else
      row_spec.totqty = row_spec.qty;

    row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

    ["len","width","s","qty","alp1","alp2"].forEach((fld) => row_spec[fld] = row_spec[fld].round(4));
    ["totqty","totqty1"].forEach((fld) => row_spec[fld] = row_spec[fld].round(6));
  }

}

$p.ProductsBuilding = ProductsBuilding;
$p.products_building = new ProductsBuilding(true);



class SpecBuilding {

  constructor($p) {

  }

  calc_row_spec (prm, cancel) {

  }

  specification_adjustment (attr, with_price) {

    const {scheme, calc_order_row, spec, save} = attr;
    const calc_order = calc_order_row._owner._owner;
    const order_rows = new Map();
    const adel = [];
    const ox = calc_order_row.characteristic;
    const nom = ox.empty() ? calc_order_row.nom : (calc_order_row.nom = ox.owner);

    $p.pricing.price_type(attr);

    spec.find_rows({ch: {in: [-1, -2]}}, (row) => adel.push(row));
    adel.forEach((row) => spec.del(row, true));

    $p.cat.insert_bind.insets(ox).forEach(({inset, elm_type}) => {

      const elm = {
        _row: {},
        elm: 0,
        get perimeter() {return scheme ? scheme.perimeter : []},
        clr: ox.clr,
        project: scheme,
      };
      const len_angl = {
        angle: 0,
        alp1: 0,
        alp2: 0,
        len: 0,
        cnstr: 0,
        origin: inset,
      };
      inset.calculate_spec({elm, len_angl, ox, spec});

    });

    if(!ox.empty()){
      adel.length = 0;
      calc_order.production.forEach((row) => {
        if (row.ordn === ox){
          if (ox._order_rows.indexOf(row.characteristic) === -1){
            adel.push(row);
          }
          else {
            order_rows.set(row.characteristic, row);
          }
        }
      });
      adel.forEach((row) => calc_order.production.del(row.row-1));
    }

    const ax = [];

    ox._order_rows && ox._order_rows.forEach((cx) => {
      const row = order_rows.get(cx) || calc_order.production.add({characteristic: cx});
      row.nom = cx.owner;
      row.unit = row.nom.storage_unit;
      row.ordn = ox;
      row.len = cx.x;
      row.width = cx.y;
      row.s = cx.s;
      row.qty = calc_order_row.qty;
      row.quantity = calc_order_row.quantity;

      save && ax.push(cx.save().catch($p.record_log));
      order_rows.set(cx, row);
    });
    if(order_rows.size){
      attr.order_rows = order_rows;
    }

    if(with_price){
      $p.pricing.calc_first_cost(attr);

      $p.pricing.calc_amount(attr);
    }

    if(save && !attr.scheme && (ox.is_new() || ox._modified)){
      ax.push(ox.save().catch($p.record_log));
    }

    return ax;
  }

}

$p.spec_building = new SpecBuilding($p);


(function ({prototype}) {
  const {value_mgr} = prototype;
  prototype.value_mgr = function(row, f, mf, array_enabled, v) {
		const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
		if(tmp){
      return tmp;
    }
		if(f == 'trans'){
      return $p.doc.calc_order;
    }
		else if(f == 'partner'){
      return $p.cat.partners;
    }
	}
})($p.classes.DataManager);


$p.dp.builder_pen.on({

	value_change: function(attr, obj){
		if(attr.field == "elm_type") {
      obj.inset = paper.project.default_inset({elm_type: obj.elm_type});
      obj.rama_impost = paper.project._dp.sys.inserts([obj.elm_type]);
		}
	},

});

$p.dp.builder_lay_impost.on({

	value_change: function(attr, obj){
		if(attr.field == "elm_type") {
      obj.inset_by_y = paper.project.default_inset({
				elm_type: obj.elm_type,
				pos: $p.enm.positions.ЦентрГоризонталь
			});
      obj.inset_by_x = paper.project.default_inset({
				elm_type: obj.elm_type,
				pos: $p.enm.positions.ЦентрВертикаль
			});
      obj.rama_impost = paper.project._dp.sys.inserts([obj.elm_type]);
		}
	}
});


$p.DpBuilder_price.prototype.__define({

  form_obj: {
    value: function (pwnd, attr) {

      const {nom, goods, _manager} = this;
      const _metadata = this._metadata();

      const options = {
        name: 'wnd_obj_' + _manager.class_name,
        wnd: {
          top: 80 + Math.random()*40,
          left: 120 + Math.random()*80,
          width: 780,
          height: 400,
          modal: true,
          center: false,
          pwnd: pwnd,
          allow_close: true,
          allow_minmax: true,
          caption: `Цены: <b>${nom.name}</b>`
        }
      };

      const wnd = $p.iface.dat_blank(null, options.wnd);

      const ts_captions = {
        "fields":["price_type","nom_characteristic","date","price","currency"],
        "headers":"Тип Цен,Характеристика,Дата,Цена,Валюта",
        "widths":"200,*,150,120,100",
        "min_widths":"150,200,100,100,100",
        "aligns":"",
        "sortings":"na,na,na,na,na",
        "types":"ro,ro,dhxCalendar,ro,ro"
      };

      return $p.wsql.pouch.local.doc.query('doc/doc_nom_prices_setup_slice_last', {
        limit : 1000,
        include_docs: false,
        reduce: false,
        startkey: [nom.ref, ''],
        endkey: [nom.ref, '\ufff0']
      })
        .then((data) => {
        if(data && data.rows){
          data.rows.forEach((row) => {
            goods.add({
              nom_characteristic: row.key[1],
              price_type: row.key[2],
              date: row.value.date,
              price: row.value.price,
              currency: row.value.currency
            })
          });

          goods.sort(["price_type","nom_characteristic","date"]);

          wnd.elmnts.grids.goods = wnd.attachTabular({
            obj: this,
            ts: "goods",
            pwnd: wnd,
            ts_captions: ts_captions
          });
          wnd.detachToolbar();
        }
      })

    }
  }
});



$p.DpBuyers_order = class DpBuyers_order extends $p.DpBuyers_order {

  get clr() {
    return this.characteristic.clr;
  }
  set clr(v) {
    const {characteristic, _data} = this;
    if((!v && characteristic.empty()) || characteristic.clr == v){
      return;
    }
    this._manager.emit_async('update', this, {clr: characteristic.clr});
    characteristic.clr = v;
    _data._modified = true;
  }

  get sys() {
    return this.characteristic.sys;
  }
  set sys(v) {
    const {characteristic, _data} = this;
    if((!v && characteristic.empty()) || characteristic.sys == v){
      return;
    }
    this._manager.emit_async('update', this, {sys: characteristic.sys});
    characteristic.sys = v;
    _data._modified = true;
  }

  get extra_fields() {
    return this.characteristic.params;
  }
}



$p.DpBuyers_order.prototype.add_row = function (row) {
  if (row._owner.name === 'production') {
    row.qty = row.quantity = 1;
  }
};

$p.DpBuyers_orderProductionRow.prototype.value_change = function (field, type, value) {
  if (field == 'len' || field == 'height') {
    this[field] = value;
  }
  if (this.height != 0 && this.height != 0) {
    this.s = (this.height * this.len / 1000000).round(3);
  }
};


class CalcOrderFormProductList {

  constructor(pwnd, calc_order) {

    this.dp = $p.dp.buyers_order.create();
    this.dp.calc_order = calc_order;

    this.attr = {

      toolbar_struct: $p.injected_data['toolbar_product_list.xml'],

      toolbar_click: this.toolbar_click.bind(this),

      draw_pg_header: this.draw_pg_header.bind(this),

      draw_tabular_sections: this.draw_tabular_sections.bind(this),

    };

    this.dp.presentation = calc_order.presentation + ' - добавление продукции';

    this.dp.form_obj(pwnd, this.attr);


  }

  draw_pg_header(dp, wnd) {
    const {production} = wnd.elmnts.grids;
    const refill_prms = this.refill_prms.bind(this);
    production.attachEvent('onRowSelect', refill_prms);
    production.attachEvent('onEditCell', (stage, rId, cInd) => {
      !cInd && setTimeout(refill_prms);
    });
  }

  draw_tabular_sections(dp, wnd, tabular_init) {

    this.wnd = wnd;
    wnd.maximize();

    const {elmnts} = wnd;
    elmnts.frm_toolbar.hideItem('bs_print');

    wnd.detachObject(true);
    wnd.maximize();
    elmnts.layout = wnd.attachLayout({
      pattern: '2E',
      cells: [{
        id: 'a',
        text: 'Продукция',
        header: false,
      }, {
        id: 'b',
        text: 'Параметры',
        header: false,
      }],
      offsets: {top: 0, right: 0, bottom: 0, left: 0},
    });

    this.meta_production = $p.dp.buyers_order.metadata('production').fields._clone();
    elmnts.grids.production = elmnts.layout.cells('a').attachTabular({
      metadata: this.meta_production,
      obj: dp,
      ts: 'production',
      pwnd: wnd,
    });

    elmnts.grids.params = elmnts.layout.cells('b').attachHeadFields({
      obj: dp,
      ts: 'product_params',
      pwnd: wnd,
      selection: {elm: -1},
      oxml: {'Параметры продукции': []},
    });

    const height = elmnts.layout.cells('a').getHeight() + elmnts.layout.cells('b').getHeight();
    elmnts.layout.cells('a').setHeight(height * 0.7);

  }

  toolbar_click(btn_id) {
    if (btn_id == 'btn_ok') {
      this.dp._data._modified = false;
      this.dp.calc_order.process_add_product_list(this.dp)
        .then(() => {
          this.wnd.close();
          this.wnd = this.dp = this.attr = null;
        })
        .catch((err) => {

        });
    }
  }

  refill_prms() {
    const {meta_production, wnd} = this;
    const {production, params} = wnd.elmnts.grids;
    if (production && params) {
      const row = production.get_cell_field();
      if (row) {
        params.selection = {elm: row.obj.row};
        if (!row.obj.inset.empty()) {
          $p.cat.clrs.selection_exclude_service(meta_production.clr, row.obj.inset);
        }
      }
    }
  }

};



$p.doc.calc_order.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;


$p.doc.calc_order.load_templates = async function () {

  if(!$p.job_prm.builder) {
    $p.job_prm.builder = {};
  }
  if(!$p.job_prm.builder.base_block) {
    $p.job_prm.builder.base_block = [];
  }
  if(!$p.job_prm.pricing) {
    $p.job_prm.pricing = {};
  }

  $p.cat.production_params.forEach((o) => {
    if(!o.is_folder) {
      o.base_blocks.forEach((row) => {
        if($p.job_prm.builder.base_block.indexOf(row.calc_order) == -1) {
          $p.job_prm.builder.base_block.push(row.calc_order);
        }
      });
    }
  });

  const refs = [];
  for (let o of $p.job_prm.builder.base_block) {
    refs.push(o.ref);
    if(refs.length > 9) {
      await $p.doc.calc_order.pouch_load_array(refs);
      refs.length = 0;
    }
  }
  return refs.length ? $p.doc.calc_order.pouch_load_array(refs) : undefined;

};

$p.DocCalc_order = class DocCalc_order extends $p.DocCalc_order {


  after_create() {

    const {enm, cat, current_user, DocCalc_order} = $p;
    const {acl_objs} = current_user;

    acl_objs.find_rows({by_default: true, type: cat.organizations.class_name}, (row) => {
      this.organization = row.acl_obj;
      return false;
    });

    DocCalc_order.set_department.call(this);

    acl_objs.find_rows({by_default: true, type: cat.partners.class_name}, (row) => {
      this.partner = row.acl_obj;
      return false;
    });

    this.contract = cat.contracts.by_partner_and_org(this.partner, this.organization);

    this.manager = current_user;

    this.obj_delivery_state = enm.obj_delivery_states.Черновик;

    return this.new_number_doc();

  }

  before_save() {

    const {Отклонен, Отозван, Шаблон, Подтвержден, Отправлен} = $p.enm.obj_delivery_states;

    let doc_amount = 0,
      amount_internal = 0;

    if(this.posted) {
      if(this.obj_delivery_state == Отклонен || this.obj_delivery_state == Отозван || this.obj_delivery_state == Шаблон) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Нельзя провести заказ со статусом<br/>"Отклонён", "Отозван" или "Шаблон"',
          title: this.presentation
        });
        return false;
      }
      else if(this.obj_delivery_state != Подтвержден) {
        this.obj_delivery_state = Подтвержден;
      }
    }
    else if(this.obj_delivery_state == Подтвержден) {
      this.obj_delivery_state = Отправлен;
    }

    if(this.obj_delivery_state == Шаблон) {
      this.department = $p.utils.blank.guid;
    }
    else if(this.department.empty()) {
      $p.msg.show_msg && $p.msg.show_msg({
        type: 'alert-warning',
        text: 'Не заполнен реквизит "офис продаж" (подразделение)',
        title: this.presentation
      });
      return false;
    }

    this.production.each((row) => {

      doc_amount += row.amount;
      amount_internal += row.amount_internal;

    });

    const {rounding} = this;

    this.doc_amount = doc_amount.round(rounding);
    this.amount_internal = amount_internal.round(rounding);
    this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency).round(rounding);

    const {_obj, obj_delivery_state, category, number_internal, partner, client_of_dealer, note} = this;

    if(obj_delivery_state == 'Шаблон') {
      _obj.state = 'template';
    }
    else if(category == 'Сервис') {
      _obj.state = 'service';
    }
    else if(category == 'Рекламация') {
      _obj.state = 'complaints';
    }
    else if(obj_delivery_state == 'Отправлен') {
      _obj.state = 'sent';
    }
    else if(obj_delivery_state == 'Отклонен') {
      _obj.state = 'declined';
    }
    else if(obj_delivery_state == 'Подтвержден') {
      _obj.state = 'confirmed';
    }
    else if(obj_delivery_state == 'Архив') {
      _obj.state = 'zarchive';
    }
    else {
      _obj.state = 'draft';
    }

    _obj.search = (this.number_doc +
      (number_internal ? ' ' + number_internal : '') +
      (client_of_dealer ? ' ' + client_of_dealer : '') +
      (partner.name ? ' ' + partner.name : '') +
      (note ? ' ' + note : '')).toLowerCase();

  }

  value_change(field, type, value) {
    if(field == 'organization') {
      this.new_number_doc();
      if(this.contract.organization != value) {
        this.contract = $p.cat.contracts.by_partner_and_org(this.partner, value);
      }
    }
    else if(field == 'partner' && this.contract.owner != value) {
      this.contract = $p.cat.contracts.by_partner_and_org(value, this.organization);
    }
    this._manager.emit_add_fields(this, ['contract']);

  }


  get doc_currency() {
    const currency = this.contract.settlements_currency;
    return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
  }

  get rounding() {
    const {pricing} = $p.job_prm;
    if(!pricing.hasOwnProperty('rounding')) {
      const parts = this.doc_currency.parameters_russian_recipe.split(',');
      pricing.rounding = parseInt(parts[parts.length - 1]);
      if(isNaN(pricing.rounding)) {
        pricing.rounding = 2;
      }
    }
    return pricing.rounding;
  }

  get contract() {
    return this._getter('contract');
  }

  set contract(v) {
    this._setter('contract', v);
    this.vat_consider = this.contract.vat_consider;
    this.vat_included = this.contract.vat_included;
  }

  dispatching_totals() {
    var options = {
      reduce: true,
      limit: 10000,
      group: true,
      keys: []
    };
    this.production.forEach(function (row) {
      if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {
        options.keys.push([row.characteristic.ref, '305e374b-3aa9-11e6-bf30-82cf9717e145', 1, 0]);
      }
    });

    return $p.wsql.pouch.remote.doc.query('server/dispatching', options)
      .then(function (result) {
        var res = {};
        result.rows.forEach(function (row) {
          if(row.value.plan) {
            row.value.plan = moment(row.value.plan).format('L');
          }
          if(row.value.fact) {
            row.value.fact = moment(row.value.fact).format('L');
          }
          res[row.key[0]] = row.value;
        });
        return res;
      });
  }

  print_data() {
    const {organization, bank_account, contract, manager} = this;
    const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
    const get_imgs = [];
    const {contact_information_kinds} = $p.cat;

    const res = {
      АдресДоставки: this.shipping_address,
      ВалютаДокумента: this.doc_currency.presentation,
      ДатаЗаказаФорматD: moment(this.date).format('L'),
      ДатаЗаказаФорматDD: moment(this.date).format('LL'),
      ДатаТекущаяФорматD: moment().format('L'),
      ДатаТекущаяФорматDD: moment().format('LL'),
      ДоговорДатаФорматD: moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format('L'),
      ДоговорДатаФорматDD: moment(contract.date.valueOf() == $p.utils.blank.date.valueOf() ? this.date : contract.date).format('LL'),
      ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
      ДоговорСрокДействия: moment(contract.validity).format('L'),
      ЗаказНомер: this.number_doc,
      Контрагент: this.partner.presentation,
      КонтрагентОписание: this.partner.long_presentation,
      КонтрагентДокумент: '',
      КонтрагентКЛДолжность: '',
      КонтрагентКЛДолжностьРП: '',
      КонтрагентКЛИмя: '',
      КонтрагентКЛИмяРП: '',
      КонтрагентКЛК: '',
      КонтрагентКЛОснованиеРП: '',
      КонтрагентКЛОтчество: '',
      КонтрагентКЛОтчествоРП: '',
      КонтрагентКЛФамилия: '',
      КонтрагентКЛФамилияРП: '',
      КонтрагентЮрФизЛицо: '',
      КратностьВзаиморасчетов: this.settlements_multiplicity,
      КурсВзаиморасчетов: this.settlements_course,
      ЛистКомплектацииГруппы: '',
      ЛистКомплектацииСтроки: '',
      Организация: organization.presentation,
      ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, '') || 'Москва',
      ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ЮрАдресОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.presentation && (
            row.kind == contact_information_kinds.predefined('ФактАдресОрганизации') ||
            row.kind == contact_information_kinds.predefined('ПочтовыйАдресОрганизации')
          )) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
        if(row.kind == contact_information_kinds.predefined('ТелефонОрганизации') && row.presentation) {
          return row.presentation;
        }
        else if(val) {
          return val;
        }
        else if(row.kind == contact_information_kinds.predefined('ФаксОрганизации') && row.presentation) {
          return row.presentation;
        }
      }, ''),
      ОрганизацияБанкБИК: our_bank_account.bank.id,
      ОрганизацияБанкГород: our_bank_account.bank.city,
      ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
      ОрганизацияБанкНаименование: our_bank_account.bank.name,
      ОрганизацияБанкНомерСчета: our_bank_account.account_number,
      ОрганизацияИндивидуальныйПредприниматель: organization.individual_entrepreneur.presentation,
      ОрганизацияИНН: organization.inn,
      ОрганизацияКПП: organization.kpp,
      ОрганизацияСвидетельствоДатаВыдачи: organization.certificate_date_issue,
      ОрганизацияСвидетельствоКодОргана: organization.certificate_authority_code,
      ОрганизацияСвидетельствоНаименованиеОргана: organization.certificate_authority_name,
      ОрганизацияСвидетельствоСерияНомер: organization.certificate_series_number,
      ОрганизацияЮрФизЛицо: organization.individual_legal.presentation,
      ПродукцияЭскизы: {},
      Проект: this.project.presentation,
      СистемыПрофилей: this.sys_profile,
      СистемыФурнитуры: this.sys_furn,
      Сотрудник: manager.presentation,
      СотрудникДолжность: manager.individual_person.Должность || 'менеджер',
      СотрудникДолжностьРП: manager.individual_person.ДолжностьРП,
      СотрудникИмя: manager.individual_person.Имя,
      СотрудникИмяРП: manager.individual_person.ИмяРП,
      СотрудникОснованиеРП: manager.individual_person.ОснованиеРП,
      СотрудникОтчество: manager.individual_person.Отчество,
      СотрудникОтчествоРП: manager.individual_person.ОтчествоРП,
      СотрудникФамилия: manager.individual_person.Фамилия,
      СотрудникФамилияРП: manager.individual_person.ФамилияРП,
      СотрудникФИО: manager.individual_person.Фамилия +
      (manager.individual_person.Имя ? ' ' + manager.individual_person.Имя[1].toUpperCase() + '.' : '' ) +
      (manager.individual_person.Отчество ? ' ' + manager.individual_person.Отчество[1].toUpperCase() + '.' : ''),
      СотрудникФИОРП: manager.individual_person.ФамилияРП + ' ' + manager.individual_person.ИмяРП + ' ' + manager.individual_person.ОтчествоРП,
      СуммаДокумента: this.doc_amount.toFixed(2),
      СуммаДокументаПрописью: this.doc_amount.in_words(),
      СуммаДокументаБезСкидки: this.production._obj.reduce(function (val, row) {
        return val + row.quantity * row.price;
      }, 0).toFixed(2),
      СуммаСкидки: this.production._obj.reduce(function (val, row) {
        return val + row.discount;
      }, 0).toFixed(2),
      СуммаНДС: this.production._obj.reduce(function (val, row) {
        return val + row.vat_amount;
      }, 0).toFixed(2),
      ТекстНДС: this.vat_consider ? (this.vat_included ? 'В том числе НДС 18%' : 'НДС 18% (сверху)') : 'Без НДС',
      ТелефонПоАдресуДоставки: this.phone,
      СуммаВключаетНДС: contract.vat_included,
      УчитыватьНДС: contract.vat_consider,
      ВсегоНаименований: this.production.count(),
      ВсегоИзделий: 0,
      ВсегоПлощадьИзделий: 0,
      Продукция: [],
      НомерВнутр: this.number_internal,
      КлиентДилера: this.client_of_dealer,
      Комментарий: this.note,
    };


    this.extra_fields.forEach((row) => {
      res['Свойство' + row.property.name.replace(/\s/g, '')] = row.value.presentation || row.value;
    });

    res.МонтажДоставкаСамовывоз = !this.shipping_address ? 'Самовывоз' : 'Монтаж по адресу: ' + this.shipping_address;

    for (let key in organization._attachments) {
      if(key.indexOf('logo') != -1) {
        get_imgs.push(organization.get_attachment(key)
          .then((blob) => {
            return $p.utils.blob_as_text(blob, blob.type.indexOf('svg') == -1 ? 'data_url' : '');
          })
          .then((data_url) => {
            res.ОрганизацияЛоготип = data_url;
          })
          .catch($p.record_log));
        break;
      }
    }

    this.production.forEach((row) => {

      if(!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {

        res.Продукция.push(this.row_description(row));

        res.ВсегоИзделий += row.quantity;
        res.ВсегоПлощадьИзделий += row.quantity * row.s;

        get_imgs.push($p.cat.characteristics.get_attachment(row.characteristic.ref, 'svg')
          .then((blob) => $p.utils.blob_as_text(blob))
          .then((svg_text) => {
            res.ПродукцияЭскизы[row.characteristic.ref] = svg_text;
          })
          .catch((err) => err && err.status != 404 && $p.record_log(err))
        );
      }
    });
    res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

    return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([]))
      .then(() => $p.load_script('/dist/qrcodejs/qrcode.min.js', 'script'))
      .then(() => {

        const svg = document.createElement('SVG');
        svg.innerHTML = '<g />';
        const qrcode = new QRCode(svg, {
          text: 'http://www.oknosoft.ru/zd/',
          width: 100,
          height: 100,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
          useSVG: true
        });
        res.qrcode = svg.innerHTML;

        return res;
      });
  }

  row_description(row) {

    if(!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic) {
      this.production.find_rows({characteristic: row.characteristic}, (prow) => {
        row = prow;
        return false;
      });
    }
    const {characteristic, nom} = row;
    const res = {
      ref: characteristic.ref,
      НомерСтроки: row.row,
      Количество: row.quantity,
      Ед: row.unit.name || 'шт',
      Цвет: characteristic.clr.name,
      Размеры: row.len + 'x' + row.width + ', ' + row.s + 'м²',
      Площадь: row.s,
      Номенклатура: nom.name_full || nom.name,
      Характеристика: characteristic.name,
      Заполнения: '',
      Фурнитура: '',
      Параметры: [],
      Цена: row.price,
      ЦенаВнутр: row.price_internal,
      СкидкаПроцент: row.discount_percent,
      СкидкаПроцентВнутр: row.discount_percent_internal,
      Скидка: row.discount.round(2),
      Сумма: row.amount.round(2),
      СуммаВнутр: row.amount_internal.round(2)
    };

    characteristic.glasses.forEach((row) => {
      const {name} = row.nom;
      if(res.Заполнения.indexOf(name) == -1) {
        if(res.Заполнения) {
          res.Заполнения += ', ';
        }
        res.Заполнения += name;
      }
    });

    characteristic.constructions.forEach((row) => {
      const {name} = row.furn;
      if(name && res.Фурнитура.indexOf(name) == -1) {
        if(res.Фурнитура) {
          res.Фурнитура += ', ';
        }
        res.Фурнитура += name;
      }
    });

    const params = new Map();
    characteristic.params.forEach((row) => {
      if(row.param.include_to_description) {
        params.set(row.param, row.value);
      }
    });
    for (let [param, value] of params) {
      res.Параметры.push({
        param: param.presentation,
        value: value.presentation || value
      });
    }

    return res;
  }

  fill_plan(confirmed) {

    if(this.planning.count() && !confirmed) {
      dhtmlx.confirm({
        title: $p.msg.main_title,
        text: $p.msg.tabular_will_cleared.replace('%1', 'Планирование'),
        cancel: $p.msg.cancel,
        callback: function (btn) {
          if(btn) {
            this.fill_plan(true);
          }
        }.bind(this)
      });
      return;
    }

    this.planning.clear();

  }

  get is_read_only() {
    const {obj_delivery_state, posted, _deleted} = this;
    const {Черновик, Шаблон, Отозван} = $p.enm.obj_delivery_states;
    let ro = false;
    if(obj_delivery_state == Шаблон) {
      ro = !$p.current_user.role_available('ИзменениеТехнологическойНСИ');
    }
    else if(posted || _deleted) {
      ro = !$p.current_user.role_available('СогласованиеРасчетовЗаказов');
    }
    else if(!obj_delivery_state.empty()) {
      ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
    }
    return ro;
  }

  load_production(forse) {
    const prod = [];
    const mgr = $p.cat.characteristics;
    this.production.forEach((row) => {
      const {nom, characteristic} = row;
      if(!characteristic.empty() && (forse || characteristic.is_new()) && !nom.is_procedure && !nom.is_accessory) {
        prod.push(characteristic.ref);
      }
    });
    return (mgr.adapter.load_array(mgr, prod))
      .then(() => {
        prod.length = 0;
        this.production.forEach((row) => {
          const {nom, characteristic} = row;
          if(!characteristic.empty() && !nom.is_procedure && !nom.is_accessory) {
            prod.push(characteristic);
          }
        });
        return prod;
      });
  }

  characteristic_saved(scheme, sattr) {
    const {ox, _dp} = scheme;
    const row = ox.calc_order_row;

    if(!row || ox.calc_order != this) {
      return;
    }


    row.nom = ox.owner;
    row.note = _dp.note;
    row.quantity = _dp.quantity || 1;
    row.len = ox.x;
    row.width = ox.y;
    row.s = ox.s;
    row.discount_percent = _dp.discount_percent;
    row.discount_percent_internal = _dp.discount_percent_internal;
    if(row.unit.owner != row.nom) {
      row.unit = row.nom.storage_unit;
    }
  }

  create_product_row({row_spec, elm, len_angl, params, create, grid}) {

    const row = this.production.add({
      qty: 1,
      quantity: 1,
      discount_percent_internal: $p.wsql.get_user_param('discount_percent_internal', 'number')
    });

    if(grid) {
      this.production.sync_grid(grid);
      grid.selectRowById(row.row);
    }

    if(!create) {
      return row;
    }

    const mgr = $p.cat.characteristics;
    let cx;
    mgr.find_rows({calc_order: this, product: row.row}, (ox) => {
      for (let ts in mgr.metadata().tabular_sections) {
        ox[ts].clear();
      }
      ox.leading_elm = 0;
      ox.leading_product = '';
      cx = Promise.resolve(ox);
    });

    return (cx || mgr.create({
      ref: $p.utils.generate_guid(),
      calc_order: this,
      product: row.row
    }, true))
      .then((ox) => {
        if(row_spec instanceof $p.DpBuyers_orderProductionRow) {
          ox.owner = row_spec.inset.nom(elm, true);
          ox.origin = row_spec.inset;
          ox.x = row_spec.len;
          ox.y = row_spec.height;
          ox.z = row_spec.depth;
          ox.s = row_spec.s;
          ox.clr = row_spec.clr;
          ox.note = row_spec.note;

          if(params) {
            params.find_rows({elm: row_spec.row}, (prow) => {
              ox.params.add(prow, true);
            });
          }
        }

        Object.assign(row._obj, {
          characteristic: ox.ref,
          nom: ox.owner.ref,
          unit: ox.owner.storage_unit.ref,
          len: ox.x,
          width: ox.y,
          s: ox.s,
          qty: (row_spec && row_spec.quantity) || 1,
          quantity: (row_spec && row_spec.quantity) || 1,
          note: ox.note,
        });

        ox.name = ox.prod_name();

        return this.is_new() ? this.save().then(() => row) : row;
      });

  }

  process_add_product_list(dp) {

    return new Promise(async (resolve, reject) => {

      const ax = [];

      for (let i = 0; i < dp.production.count(); i++) {
        const row_spec = dp.production.get(i);
        let row_prod;

        if(row_spec.inset.empty()) {
          row_prod = this.production.add(row_spec);
          row_prod.unit = row_prod.nom.storage_unit;
          if(!row_spec.clr.empty()) {
            $p.cat.characteristics.find_rows({owner: row_spec.nom}, (ox) => {
              if(ox.clr == row_spec.clr) {
                row_prod.characteristic = ox;
                return false;
              }
            });
          }
        }
        else {
          const len_angl = {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: row_spec.len,
            origin: row_spec.inset,
            cnstr: 0
          };
          const elm = {
            elm: 0,
            angle_hor: 0,
            get _row() {
              return this;
            },
            get clr() {
              return row_spec.clr;
            },
            get len() {
              return row_spec.len;
            },
            get height() {
              return row_spec.height;
            },
            get depth() {
              return row_spec.depth;
            },
            get s() {
              return row_spec.s;
            },
            get perimeter() {
              return [{len: row_spec.len, angle: 0}, {len: row_spec.height, angle: 90}];
            },
            get x1() {
              return 0;
            },
            get y1() {
              return 0;
            },
            get x2() {
              return row_spec.height;
            },
            get y2() {
              return row_spec.len;
            },
          };
          row_prod = await this.create_product_row({row_spec, elm, len_angl, params: dp.product_params, create: true});
          row_spec.inset.calculate_spec({elm, len_angl, ox: row_prod.characteristic});

          row_prod.characteristic.specification.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');
        }

        [].push.apply(ax, $p.spec_building.specification_adjustment({
          calc_order_row: row_prod,
          spec: row_prod.characteristic.specification,
          save: true,
        }, true));

      }

      resolve(ax);

    });
  }

  static set_department() {
    const department = $p.wsql.get_user_param('current_department');
    if(department) {
      this.department = department;
    }
    const {current_user, cat} = $p;
    if(this.department.empty() || this.department.is_new()) {
      current_user.acl_objs && current_user.acl_objs.find_rows({by_default: true, type: cat.divisions.class_name}, (row) => {
        if(this.department != row.acl_obj) {
          this.department = row.acl_obj;
        }
        return false;
      });
    }
  }

};

$p.DocCalc_orderProductionRow = class DocCalc_orderProductionRow extends $p.DocCalc_orderProductionRow {

  value_change(field, type, value, no_extra_charge) {

    let {_obj, _owner, nom, characteristic, unit} = this;
    let recalc;
    const {rounding} = _owner._owner;

    if(field == 'nom' || field == 'characteristic' || field == 'quantity') {

      _obj[field] = field == 'quantity' ? parseFloat(value) : '' + value;

      if(!characteristic.empty()) {
        if(!characteristic.calc_order.empty() && characteristic.owner != nom) {
          characteristic.owner = nom;
        }
        else if(characteristic.owner != nom) {
          _obj.characteristic = $p.utils.blank.guid;
        }
      }

      nom = this.nom;
      characteristic = this.characteristic;

      if(unit.owner != nom) {
        _obj.unit = nom.storage_unit.ref;
      }

      const fake_prm = {
        calc_order_row: this,
        spec: characteristic.specification
      };
      const {price} = _obj;
      $p.pricing.price_type(fake_prm);
      $p.pricing.calc_first_cost(fake_prm);
      $p.pricing.calc_amount(fake_prm);
      if(price && !_obj.price){
        _obj.price = price;
        recalc = true;
      }
    }

    if('price_internal,quantity,discount_percent_internal'.indexOf(field) != -1 || recalc) {

      if(!recalc){
        _obj[field] = parseFloat(value);
      }

      _obj.amount = ((_obj.price || 0) * ((100 - (_obj.discount_percent || 0)) / 100) * _obj.quantity).round(rounding);

      if(!no_extra_charge) {
        const prm = {calc_order_row: this};
        let extra_charge = $p.wsql.get_user_param('surcharge_internal', 'number');

        if(!$p.current_user.partners_uids.length || !extra_charge) {
          $p.pricing.price_type(prm);
          extra_charge = prm.price_type.extra_charge_external;
        }

        if(field != 'price_internal' && extra_charge && _obj.price) {
          _obj.price_internal = (_obj.price * (100 - _obj.discount_percent) / 100 * (100 + extra_charge) / 100).round(rounding);
        }
      }

      _obj.amount_internal = ((_obj.price_internal || 0) * ((100 - (_obj.discount_percent_internal || 0)) / 100) * _obj.quantity).round(rounding);

      const doc = _owner._owner;
      if(doc.vat_consider) {
        const {НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС} = $p.enm.vat_rates;
        _obj.vat_rate = (nom.vat_rate.empty() ? НДС18 : nom.vat_rate).ref;
        switch (this.vat_rate) {
        case НДС18:
        case НДС18_118:
          _obj.vat_amount = (_obj.amount * 18 / 118).round(2);
          break;
        case НДС10:
        case НДС10_110:
          _obj.vat_amount = (_obj.amount * 10 / 110).round(2);
          break;
        case НДС20:
        case НДС20_120:
          _obj.vat_amount = (_obj.amount * 20 / 120).round(2);
          break;
        case НДС0:
        case БезНДС:
        case '_':
        case '':
          _obj.vat_amount = 0;
          break;
        }
        if(!doc.vat_included) {
          _obj.amount = (_obj.amount + _obj.vat_amount).round(2);
        }
      }
      else {
        _obj.vat_rate = '';
        _obj.vat_amount = 0;
      }

      const amount = _owner.aggregate([], ['amount', 'amount_internal']);
      amount.doc_amount = amount.amount.round(rounding);
      amount.amount_internal = amount.amount_internal.round(rounding);
      delete amount.amount;
      Object.assign(doc, amount);
      doc._manager.emit_async('update', doc, amount);


      return false;
    }
  }

};




$p.doc.calc_order.form_list = function(pwnd, attr, handlers){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
			date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
			on_new: (o) => {
        handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
			},
			on_edit: (_mgr, rId) => {
        handlers.handleNavigate(`/${_mgr.class_name}/${rId}`);
			}
		};
	}

  return this.pouch_db.getIndexes()
    .then(({indexes}) => {
      attr._index = {
        ddoc: "mango_calc_order",
        fields: ["department", "state", "date", "search"],
        name: 'list',
        type: 'json',
      };
      if(!indexes.some(({ddoc}) => ddoc && ddoc.indexOf(attr._index.ddoc) != -1)){
        return this.pouch_db.createIndex(attr._index);
      }
    })
    .then(() => {
      return new Promise((resolve, reject) => {

        attr.on_create = (wnd) => {

          const {elmnts} = wnd;

          wnd.dep_listener = (obj, fields) => {
            if(obj == dp && fields.department){
              elmnts.filter.call_event();
              $p.wsql.set_user_param("current_department", dp.department.ref);
            }
          }

          if(handlers){
            const {custom_selection} = elmnts.filter;
            custom_selection._state = handlers.props.state_filter;
            handlers.onProps = (props) => {
              if(custom_selection._state != props.state_filter){
                custom_selection._state = props.state_filter;
                elmnts.filter.call_event();
              }
            }
          }

          const dp = $p.dp.builder_price.create();
          const pos = elmnts.toolbar.getPosition("input_filter");
          const txt_id = `txt_${dhx4.newId()}`;
          elmnts.toolbar.addText(txt_id, pos, "");
          const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
          const dep = new $p.iface.OCombo({
            parent: txt_div,
            obj: dp,
            field: "department",
            width: 180,
            hide_frm: true,
          });
          txt_div.style.border = "1px solid #ccc";
          txt_div.style.borderRadius = "3px";
          txt_div.style.padding = "3px 2px 1px 2px";
          txt_div.style.margin = "1px 5px 1px 1px";
          dep.DOMelem_input.placeholder = "Подразделение";

          dp._manager.on('update', wnd.dep_listener);

          const set_department = $p.DocCalc_order.set_department.bind(dp);
          set_department();
          if(!$p.wsql.get_user_param('couch_direct')){
            $p.md.once('user_log_in', set_department);
          }

          elmnts.filter.custom_selection.__define({
            department: {
              get: function () {
                const {department} = dp;
                return this._state == 'template' ? {$eq: $p.utils.blank.guid} : {$eq: department.ref};
              },
              enumerable: true
            },
            state: {
              get: function(){
                return this._state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: this._state};
              },
              enumerable: true
            }
          });
          elmnts.filter.custom_selection._index = attr._index;

          elmnts.status_bar = wnd.attachStatusBar();
          elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
            (ref, dbl) => {
              dbl && handlers.handleNavigate(`/builder/${ref}`);
            });
          elmnts.grid.attachEvent("onRowSelect", (rid) => elmnts.svgs.reload(rid));

          wnd.attachEvent("onClose", (win) => {
            dep && dep.unload();
            return true;
          });

          attr.on_close = () => {
            elmnts.svgs && elmnts.svgs.unload();
            dep && dep.unload();
          }


          resolve(wnd);
        }

        return this.mango_selection(pwnd, attr);

      });
    });

};



(function ($p) {

  const _mgr = $p.doc.calc_order;
  let _meta_patched;

  _mgr.form_obj = function (pwnd, attr, handlers) {

    let o, wnd;

    if(!_meta_patched) {
      (function (source) {
        if($p.wsql.get_user_param('hide_price_dealer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0';

        }
        else if($p.wsql.get_user_param('hide_price_manufacturer')) {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма';
          source.widths = '40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70';

        }
        else {
          source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
          source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70';
          source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70';
        }

        if($p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
          source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro';
        }
        else if($p.current_user.role_available('РедактированиеСкидок')) {
          source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,ro,ro,calck,calck,ro';
        }
        else {
          source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,ro,ro,calck,calck,ro';
        }

      })($p.doc.calc_order.metadata().form.obj.tabular_sections.production);
      _meta_patched = true;
    }

    attr.draw_tabular_sections = (o, wnd, tabular_init) => {

      const refs = [];
      o.production.each((row) => {
        if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new()) {
          refs.push(row._obj.characteristic);
        }
      });
      $p.cat.characteristics.pouch_load_array(refs)
        .then(() => {

          tabular_init('production', $p.injected_data['toolbar_calc_order_production.xml']);
          const {production} = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent('onRowSelect', (id, ind) => {
            const row = o.production.get(id - 1);
            wnd.elmnts.svgs.select(row.characteristic.ref);
          });

          let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
          toolbar.addSpacer('btn_delete');
          toolbar.attachEvent('onclick', toolbar_click);

          tabular_init('planning');
          toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
          toolbar.addButton('btn_fill_plan', 3, 'Заполнить');
          toolbar.attachEvent('onclick', toolbar_click);

          wnd.elmnts.discount_pop = new dhtmlXPopup({
            toolbar: toolbar,
            id: 'btn_discount'
          });
          wnd.elmnts.discount_pop.attachEvent('onShow', show_discount);

          set_editable(o, wnd);

        });

      wnd.elmnts.statusbar = wnd.attachStatusBar();
      wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
      wnd.elmnts.svgs.reload(o);

    };

    attr.draw_pg_header = (o, wnd) => {

      function layout_resize_finish() {
        setTimeout(() => {
          if(wnd.elmnts && wnd.elmnts.layout_header && wnd.elmnts.layout_header.setSizes) {
            wnd.elmnts.layout_header.setSizes();
            wnd.elmnts.pg_left.objBox.style.width = '100%';
            wnd.elmnts.pg_right.objBox.style.width = '100%';
          }
        }, 200);
      }

      wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

      wnd.elmnts.layout_header.attachEvent('onResizeFinish', layout_resize_finish);

      wnd.elmnts.layout_header.attachEvent('onPanelResizeFinish', layout_resize_finish);

      wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
      wnd.elmnts.cell_left.hideHeader();
      wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          ' ': [{id: 'number_doc', path: 'o.number_doc', synonym: 'Номер', type: 'ro', txt: o.number_doc},
            {id: 'date', path: 'o.date', synonym: 'Дата', type: 'ro', txt: moment(o.date).format(moment._masks.date_time)},
            'number_internal'
          ],
          'Контактная информация': ['partner', 'client_of_dealer', 'phone',
            {id: 'shipping_address', path: 'o.shipping_address', synonym: 'Адрес доставки', type: 'addr', txt: o['shipping_address']}
          ],
          'Дополнительные реквизиты': ['obj_delivery_state', 'category']
        }
      });


      wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
      wnd.elmnts.cell_right.hideHeader();
      wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
        obj: o,
        pwnd: wnd,
        read_only: wnd.elmnts.ro,
        oxml: {
          'Налоги': ['vat_consider', 'vat_included'],
          'Аналитика': ['project',
            {id: 'organization', path: 'o.organization', synonym: 'Организация', type: 'refc'},
            {id: 'contract', path: 'o.contract', synonym: 'Договор', type: 'refc'},
            {id: 'bank_account', path: 'o.bank_account', synonym: 'Счет организации', type: 'refc'},
            {id: 'department', path: 'o.department', synonym: 'Офис продаж', type: 'refc'},
            {id: 'warehouse', path: 'o.warehouse', synonym: 'Склад отгрузки', type: 'refc'},
          ],
          'Итоги': [{id: 'doc_currency', path: 'o.doc_currency', synonym: 'Валюта документа', type: 'ro', txt: o['doc_currency'].presentation},
            {id: 'doc_amount', path: 'o.doc_amount', synonym: 'Сумма', type: 'ron', txt: o['doc_amount']},
            {id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма внутр', type: 'ron', txt: o['amount_internal']}]
        }
      });

      wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
      wnd.elmnts.cell_note.hideHeader();
      wnd.elmnts.cell_note.setHeight(100);
      wnd.elmnts.cell_note.attachHTMLString('<textarea placeholder=\'Комментарий к заказу\' class=\'textarea_editor\'>' + o.note + '</textarea>');

    };

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_obj.xml'];

    attr.toolbar_click = toolbar_click;

    attr.on_close = frm_close;

    return this.constructor.prototype.form_obj.call(this, pwnd, attr)
      .then((res) => {
        if(res) {
          o = res.o;
          wnd = res.wnd;
          wnd.prompt = prompt;
          wnd.close_confirmed = true;

          const search = $p.job_prm.parse_url_str(location.search);
          if(search.ref){
            setTimeout(() => {
              wnd.elmnts.tabs.tab_production && wnd.elmnts.tabs.tab_production.setActive();
              rsvg_click(search.ref, 0);
            }, 200);
          }
          return res;
        }
      });

    function prompt(loc) {
      if(loc.pathname.match(/builder/)) {
        return true;
      }
      return (o && o._modified) ? `${o.presentation} изменён.\n\nЗакрыть без сохранения?` : true;
    }

    function close() {
      if(o && o._obj) {
        const {ref, state} = o._obj;
        handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`);
      }
      else {
        handlers.handleNavigate(`/`);
      }
    }


    function toolbar_click(btn_id) {

      switch (btn_id) {

      case 'btn_sent':
        save('sent');
        break;

      case 'btn_save':
        save('save');
        break;

      case 'btn_save_close':
        save('close');
        break;

      case 'btn_retrieve':
        save('retrieve');
        break;

      case 'btn_post':
        save('post');
        break;

      case 'btn_unpost':
        save('unpost');
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

      case 'btn_clone':
        open_builder('clone');
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

      if(btn_id.substr(0, 4) == 'prn_') {
        _mgr.print(o, btn_id, wnd);
      }
    }

    function calendar_new_event() {
      $p.msg.show_not_implemented();
    }

    function go_connection() {
      $p.msg.show_not_implemented();
    }

    function show_discount() {
      if(!wnd.elmnts.discount) {

        wnd.elmnts.discount = wnd.elmnts.discount_pop.attachForm([
          {
            type: 'fieldset', name: 'discounts', label: 'Скидки по группам', width: 220, list: [
            {type: 'settings', position: 'label-left', labelWidth: 100, inputWidth: 50},
            {type: 'input', label: 'На продукцию', name: 'production', numberFormat: ['0.0 %', '', '.']},
            {type: 'input', label: 'На аксессуары', name: 'accessories', numberFormat: ['0.0 %', '', '.']},
            {type: 'input', label: 'На услуги', name: 'services', numberFormat: ['0.0 %', '', '.']}
          ]
          },
          {type: 'button', name: 'btn_discounts', value: 'Ок', tooltip: 'Установить скидки'}
        ]);
        wnd.elmnts.discount.setItemValue('production', 0);
        wnd.elmnts.discount.setItemValue('accessories', 0);
        wnd.elmnts.discount.setItemValue('services', 0);
        wnd.elmnts.discount.attachEvent('onButtonClick', function (name) {
          wnd.progressOn();
        });
      }
    }



    function production_get_sel_index() {
      var selId = wnd.elmnts.grids.production.getSelectedRowId();
      if(selId && !isNaN(Number(selId))) {
        return Number(selId) - 1;
      }

      $p.msg.show_msg({
        type: 'alert-warning',
        text: $p.msg.no_selected_row.replace('%1', 'Продукция'),
        title: o.presentation
      });
    }

    function save(action) {

      function do_save(post) {

        if(!wnd.elmnts.ro) {
          o.note = wnd.elmnts.cell_note.cell.querySelector('textarea').value.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '').replace(/&.{2,6};/g, '');
          wnd.elmnts.pg_left.selectRow(0);
        }

        o.save(post)
          .then(function () {
            if(action == 'sent' || action == 'close') {
              close();
            }
            else {
              wnd.set_text();
              set_editable(o, wnd);
            }

          })
          .catch(function (err) {
            $p.record_log(err);
          });
      }

      switch (action) {
      case 'sent':
        dhtmlx.confirm({
          title: $p.msg.order_sent_title,
          text: $p.msg.order_sent_message,
          cancel: $p.msg.cancel,
          callback: function (btn) {
            if(btn) {
              o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
              do_save();
            }
          }
        });
        break;

      case 'retrieve':
        o.obj_delivery_state = $p.enm.obj_delivery_states.Отозван;
        do_save();
        break;

      case 'post':
        do_save(true);
        break;

      case 'unpost':
        do_save(false);
        break;

      default:
        do_save();
      }
    }

    function frm_close() {

      if(o && o._modified) {
        if(o.is_new()) {
          o.unload();
        }
        else if(!location.pathname.match(/builder/)) {
          setTimeout(o.load.bind(o), 100);
        }
      }

      ['vault', 'vault_pop', 'discount', 'discount_pop', 'svgs', 'layout_header'].forEach((elm) => {
        wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
      });

      return true;
    }

    function set_editable(o, wnd) {

      const {pg_left, pg_right, frm_toolbar, grids, tabs} = wnd.elmnts;

      pg_right.cells('vat_consider', 1).setDisabled(true);
      pg_right.cells('vat_included', 1).setDisabled(true);

      const ro = wnd.elmnts.ro = o.is_read_only;

      const retrieve_enabed = !o._deleted &&
        (o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

      grids.production.setEditable(!ro);
      grids.planning.setEditable(!ro);
      pg_left.setEditable(!ro);
      pg_right.setEditable(!ro);

      if(!$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
        frm_toolbar.hideItem('btn_post');
        frm_toolbar.hideItem('btn_unpost');
      }

      if(!$p.current_user.role_available('ИзменениеТехнологическойНСИ') && !$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
        pg_left.cells('obj_delivery_state', 1).setDisabled(true);
      }

      if(ro) {
        frm_toolbar.disableItem('btn_sent');
        frm_toolbar.disableItem('btn_save');
        let toolbar;
        const disable = (itemId) => toolbar.disableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(disable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(disable);
      }
      else {
        if(o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон) {
          frm_toolbar.disableItem('btn_sent');
        }
        else {
          frm_toolbar.enableItem('btn_sent');
        }
        frm_toolbar.enableItem('btn_save');
        let toolbar;
        const enable = (itemId) => toolbar.enableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(enable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(enable);
      }
      if(retrieve_enabed) {
        frm_toolbar.enableListOption('bs_more', 'btn_retrieve');
      }
      else {
        frm_toolbar.disableListOption('bs_more', 'btn_retrieve');
      }
    }

    function not_production() {
      $p.msg.show_msg({
        title: $p.msg.bld_title,
        type: 'alert-error',
        text: $p.msg.bld_not_product
      });
    }

    function open_builder(create_new) {
      var selId;

      if(create_new == 'clone') {
        const selId = production_get_sel_index();
        if(selId == undefined) {
          not_production();
        }
        else {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count()) {
              o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
                .then(({characteristic}) => {
                  characteristic._mixin(row.characteristic._obj, null,
                    ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'note', 'partner'], true);
                  handlers.handleNavigate(`/builder/${characteristic.ref}`);
                });
            }
            else {
              not_production();
            }
          }
        }

      }
      else if(create_new) {
        o.create_product_row({grid: wnd.elmnts.grids.production, create: true})
          .then((row) => {
            handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
          });
      }
      else {
        const selId = production_get_sel_index();
        if(selId != undefined) {
          const row = o.production.get(selId);
          if(row) {
            const {owner, calc_order} = row.characteristic;
            if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
              not_production();
            }
            else if(row.characteristic.coordinates.count() == 0) {
              if(row.characteristic.leading_product.calc_order == calc_order) {
                handlers.handleNavigate(`/builder/${row.characteristic.leading_product.ref}`);
              }
            }
            else {
              handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
            }
          }
        }
      }

    }

    function open_spec() {
      const selId = production_get_sel_index();
      if(selId != undefined) {
        const row = o.production.get(selId);
        row && !row.characteristic.empty() && row.characteristic.form_obj().then((w) => w.wnd.maximize());
      }
    }

    function rsvg_click(ref, dbl) {
      o.production.find_rows({characteristic: ref}, (row) => {
        wnd.elmnts.grids.production.selectRow(row.row - 1, dbl === 0);
        dbl && open_builder();
        return false;
      });
    }

    function add_material() {
      const row = o.create_product_row({grid: wnd.elmnts.grids.production}).row - 1;
      setTimeout(() => {
        const grid = wnd.elmnts.grids.production;
        grid.selectRow(row);
        grid.selectCell(row, grid.getColIndexById('nom'), false, true, true);
        grid.cells().open_selection();
      });
    }

  };

})($p);



$p.doc.calc_order.form_selection = function(pwnd, attr){

	const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

	wnd.elmnts.filter.custom_selection._view = { get value() { return '' } };
	wnd.elmnts.filter.custom_selection._key = { get value() { return '' } };

	wnd.do_not_maximize = true;
	wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.status_bar,
    (ref, dbl) => {
	  if(dbl){
      wnd && wnd.close();
      return pwnd.on_select && pwnd.on_select({_block: ref});
    }
    });
	wnd.elmnts.grid.attachEvent("onRowSelect", (rid) => wnd.elmnts.svgs.reload(rid));


	setTimeout(() => {
		wnd.setDimension(900, 580);
		wnd.centerOnScreen();
	})

	return wnd;
};



$p.doc.calc_order.__define({

	rep_invoice_execution: {
		value: function (rep) {

			var query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 3
				},
				res = {
					data: [],
					readOnly: true,
					colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
					colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
					columns: [
						{type: 'text'},
						{type: 'text'},
						{type: 'text'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'},
						{type: 'numeric', format: '0 0.00'}
					],
					wordWrap: false
				};

			if(!$p.current_user.role_available("СогласованиеРасчетовЗаказов")){
				query_options.startkey = [$p.current_user.partners_uids[0],""];
				query_options.endkey = [$p.current_user.partners_uids[0],"\ufff0"];
			}

			return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options)

				.then(function (data) {

					var total = {
						invoice: 0,
						pay: 0,
						total_pay: 0,
						shipment:0,
						total_shipment:0
					};

					if(data.rows){

						data.rows.forEach(function (row) {

							if(!row.value.total_pay && !row.value.total_shipment)
								return;

							res.data.push([
								$p.cat.partners.get(row.key[0]).presentation,
								$p.cat.organizations.get(row.key[1]).presentation,
								row.key[2],
								row.value.invoice,
								row.value.pay,
								row.value.total_pay,
								row.value.shipment,
								row.value.total_shipment]);

							total.invoice+= row.value.invoice;
							total.pay+=row.value.pay;
							total.total_pay+=row.value.total_pay;
							total.shipment+=row.value.shipment;
							total.total_shipment+=row.value.total_shipment;
						});

						res.data.push([
							"Итого:",
							"",
							"",
							total.invoice,
							total.pay,
							total.total_pay,
							total.shipment,
							total.total_shipment]);

						res.mergeCells= [
							{row: res.data.length-1, col: 0, rowspan: 1, colspan: 3}
						]
					}

					rep.requery(res);

					return res;
				});
		}
	},

	rep_planing: {
		value: function (rep, attr) {

			var date_from = $p.utils.date_add_day(new Date(), -1, true),
				date_till = $p.utils.date_add_day(date_from, 7, true),
				query_options = {
					reduce: true,
					limit: 10000,
					group: true,
					group_level: 5,
					startkey: [date_from.getFullYear(), date_from.getMonth()+1, date_from.getDate(), ""],
					endkey: [date_till.getFullYear(), date_till.getMonth()+1, date_till.getDate(),"\ufff0"]
				},
				res = {
					data: [],
					readOnly: true,
					wordWrap: false
				};



			return $p.wsql.pouch.remote.doc.query("server/planning", query_options)

				.then(function (data) {


					if(data.rows){

						var include_detales = $p.current_user.role_available("СогласованиеРасчетовЗаказов");

						data.rows.forEach(function (row) {

							if(!include_detales){

							}

							res.data.push([
								new Date(row.key[0], row.key[1]-1, row.key[2]),
								$p.cat.parameters_keys.get(row.key[3]),
								row.value.debit,
								row.value.credit,
								row.value.total
							]);
						});

					}

					rep.requery(res);

					return res;
				});

		}
	}

});


$p.DocCredit_card_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};


$p.DocDebit_bank_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};


$p.DocDebit_cash_order.prototype.before_save = function () {
  this.doc_amount = this.payment_details.aggregate([], 'amount');
};



$p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

$p.DocNom_prices_setup.prototype.after_create = function () {
  return this.new_number_doc();
};

$p.DocNom_prices_setup.prototype.add_row = function (row) {
  if (row._owner.name === 'goods') {
    const {price_type} = row._owner._owner;
    row.price_type = price_type;
    row.currency = price_type.price_currency;
  }
};

$p.DocNom_prices_setup.prototype.before_save = function () {
  let aggr = this.goods.aggregate(['nom', 'nom_characteristic', 'price_type'], ['price'], 'COUNT', true),
    err;
  if (aggr.some((row) => {
      if (row.price > 1) {
        err = row;
        return row.price > 1;
      }
    })) {
    $p.msg.show_msg({
      type: 'alert-warning',
      text: '<table style=\'text-align: left; width: 100%;\'><tr><td>Номенклатура</td><td>' + $p.cat.nom.get(err.nom).presentation + '</td></tr>' +
      '<tr><td>Характеристика</td><td>' + $p.cat.characteristics.get(err.nom_characteristic).presentation + '</td></tr>' +
      '<tr><td>Тип цен</td><td>' + $p.cat.nom_prices_types.get(err.price_type).presentation + '</td></tr></table>',
      title: 'Дубли строк',
    });

    return false;
  }
};

$p.on('tabular_paste', (clip) => {

  if (clip.grid && clip.obj && clip.obj._manager == $p.doc.nom_prices_setup) {

    var rows = [];

    clip.data.split('\n').map(function (row) {
      return row.split('\t');
    }).forEach(function (row) {

      if (row.length != 3)
        return;

      var nom = $p.cat.nom.by_name(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.by_id(row[0]);
      if (nom.empty())
        nom = $p.cat.nom.find({article: row[0]});
      if (!nom || nom.empty())
        return;

      var characteristic = '';
      if (row[1]) {
        characteristic = $p.cat.characteristics.find({owner: nom, name: row[1]});
        if (!characteristic || characteristic.empty())
          characteristic = $p.cat.characteristics.find({owner: nom, name: {like: row[1]}});
      }

      rows.push({
        nom: nom,
        nom_characteristic: characteristic,
        price: parseFloat(row[2].replace(',', '.')),
        price_type: clip.obj.price_type,
      });
    });

    if (rows.length) {

      clip.grid.editStop();

      var first = clip.obj.goods.get(parseInt(clip.grid.getSelectedRowId()) - 1);

      rows.forEach(function (row) {
        if (first) {
          first._mixin(row);
          first = null;
        } else
          clip.obj.goods.add(row);
      });

      clip.obj.goods.sync_grid(clip.grid);

      clip.e.preventDefault();
      return $p.iface.cancel_bubble(e);
    }
  }

});



$p.DocSelling.prototype.before_save = function () {
  this.doc_amount = this.goods.aggregate([], 'amount') + this.services.aggregate([], 'amount');
};




(function(_mgr){


	_mgr.acn = {

	  cache: {},

    get ii() {
      return this.cache.ii || ( this.cache.ii = [_mgr.Наложение] );
    },

    get i() {
      return this.cache.i || ( this.cache.i = [_mgr.НезамкнутыйКонтур] );
    },

    get a() {
      return this.cache.a
        || ( this.cache.a = [
          _mgr.УгловоеДиагональное,
          _mgr.УгловоеКВертикальной,
          _mgr.УгловоеКГоризонтальной,
          _mgr.КрестВСтык] );
    },

    get t() {
      return this.cache.t || ( this.cache.t = [_mgr.ТОбразное, _mgr.КрестВСтык] );
    },

	};


	Object.defineProperties(_mgr, {
	  ad: {
	    get: function () {
        return _mgr.УгловоеДиагональное;
      }
    },
    av: {
      get: function () {
        return _mgr.УгловоеКВертикальной;
      }
    },
    ah: {
      get: function () {
        return _mgr.УгловоеКГоризонтальной;
      }
    },
    t: {
      get: function () {
        return _mgr.ТОбразное;
      }
    },
    ii: {
      get: function () {
        return _mgr.Наложение;
      }
    },
    i: {
      get: function () {
        return _mgr.НезамкнутыйКонтур;
      }
    },
    xt: {
      get: function () {
        return _mgr.КрестПересечение;
      }
    },
    xx: {
      get: function () {
        return _mgr.КрестВСтык;
      }
    },

  });

})($p.enm.cnn_types);


(function(_mgr){

	const cache = {};

	_mgr.__define({

		profiles: {
			get : function(){
				return cache.profiles
					|| ( cache.profiles = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп] );
			}
		},

		profile_items: {
			get : function(){
				return cache.profile_items
					|| ( cache.profile_items = [
						_mgr.Рама,
						_mgr.Створка,
						_mgr.Импост,
						_mgr.Штульп,
						_mgr.Добор,
						_mgr.Соединитель,
						_mgr.Раскладка
					] );
			}
		},

		rama_impost: {
			get : function(){
				return cache.rama_impost
					|| ( cache.rama_impost = [ _mgr.Рама, _mgr.Импост] );
			}
		},

		impost_lay: {
			get : function(){
				return cache.impost_lay
					|| ( cache.impost_lay = [ _mgr.Импост, _mgr.Раскладка] );
			}
		},

		stvs: {
			get : function(){
				return cache.stvs || ( cache.stvs = [_mgr.Створка] );
			}
		},

		glasses: {
			get : function(){
				return cache.glasses
					|| ( cache.glasses = [ _mgr.Стекло, _mgr.Заполнение] );
			}
		}

	});


})($p.enm.elm_types);


(function($p){

	$p.enm.open_types.__define({

		is_opening: {
			value: function (v) {

				if(!v || v.empty() || v == this.Глухое || v == this.Неподвижное)
					return false;

				return true;

			}
		}


	});

	$p.enm.orientations.__define({

		hor: {
			get: function () {
				return this.Горизонтальная;
			}
		},

		vert: {
			get: function () {
				return this.Вертикальная;
			}
		},

		incline: {
			get: function () {
				return this.Наклонная;
			}
		}
	});

	$p.enm.positions.__define({

		left: {
			get: function () {
				return this.Лев;
			}
		},

		right: {
			get: function () {
				return this.Прав;
			}
		},

		top: {
			get: function () {
				return this.Верх;
			}
		},

		bottom: {
			get: function () {
				return this.Низ;
			}
		},

		hor: {
			get: function () {
				return this.ЦентрГоризонталь;
			}
		},

		vert: {
			get: function () {
				return this.ЦентрВертикаль;
			}
		}
	});


})($p);


(($p) => {

  Object.assign($p.RepMaterials_demand.prototype, {

    print_data() {
      return this.calc_order.print_data().then((order) => {
        return this.calculate012()
          .then((specification) => {

            return Object.assign(order, {specification, _grouping: this.scheme.dimensions})
          })
      })
    },

    calculate012() {

      const {specification, production, scheme, discard, _manager} = this;
      const arefs = [];
      const aobjs = [];
      const spec_flds = Object.keys($p.cat.characteristics.metadata('specification').fields);
      const rspec_flds = Object.keys(_manager.metadata('specification').fields);

      production.each((row) => {
        if(!row.use){
          return;
        }
        if (!row.characteristic.empty() && row.characteristic.is_new() && arefs.indexOf(row.characteristic.ref) == -1) {
          arefs.push(row.characteristic.ref)
          aobjs.push(row.characteristic.load())
        }
      })

      specification.clear();
      if (!specification._rows) {
        specification._rows = []
      } else {
        specification._rows.length = 0;
      }

      return Promise.all(aobjs)

        .then((ares) => {

          arefs.length = 0;
          aobjs.length = 0;

          production.each((row) => {
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty() && !row.characteristic.calc_order.empty()
              && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
              arefs.push(row.characteristic.calc_order.ref)
              aobjs.push(row.characteristic.calc_order.load())
            }
            row.characteristic.specification.each((sprow) => {
              if (!sprow.characteristic.empty() && sprow.characteristic.is_new() && arefs.indexOf(sprow.characteristic.ref) == -1) {
                arefs.push(sprow.characteristic.ref)
                aobjs.push(sprow.characteristic.load())
              }
            })
          });

          return Promise.all(aobjs)

        })

        .then(() => {

          const prows = {};

          const selection = [];
          scheme.selection.forEach((row) => {
            if(row.use){
              selection.push(row)
            }
          })

          production.each((row) => {
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty()) {
              row.characteristic.specification.each((sprow) => {

                if(discard(sprow, selection)){
                  return;
                }

                let resrow = {};
                spec_flds.forEach(fld => {
                  if (rspec_flds.indexOf(fld) != -1) {
                    resrow[fld] = sprow[fld]
                  }
                });
                resrow = specification.add(resrow)

                resrow.qty = resrow.qty * row.qty;
                resrow.totqty = resrow.totqty * row.qty;
                resrow.totqty1 = resrow.totqty1 * row.qty;
                resrow.amount = resrow.amount * row.qty;
                resrow.amount_marged = resrow.amount_marged * row.qty;


                if (resrow.elm > 0) {
                  resrow.cnstr = row.characteristic.coordinates.find_rows({elm: resrow.elm})[0].cnstr;
                }
                else if (resrow.elm < 0) {
                  resrow.cnstr = -resrow.elm;
                }

                resrow.calc_order = row.characteristic;

                if (!prows[row.characteristic.ref]) {
                  prows[row.characteristic.ref] = row.characteristic.calc_order.production.find_rows({characteristic: row.characteristic});
                  if (prows[row.characteristic.ref].length) {
                    prows[row.characteristic.ref] = prows[row.characteristic.ref][0].row
                  }
                  else {
                    prows[row.characteristic.ref] = 1
                  }
                }
                resrow.product = prows[row.characteristic.ref];

                this.material(resrow);

              })
            }
          })

          const dimentions = [], resources = [];
          scheme.columns('ts').forEach(fld => {
            const {key} = fld
            if ($p.RepMaterials_demand.resources.indexOf(key) != -1) {
              resources.push(key)
            } else {
              dimentions.push(key)
            }
          })
          specification.group_by(dimentions, resources);
          specification.forEach((row) => {

            row.qty = row.qty.round(3);
            row.totqty = row.totqty.round(3);
            row.totqty1 = row.totqty1.round(3);
            row.price = row.price.round(3);
            row.amount = row.amount.round(3);
            row.amount_marged = row.amount_marged.round(3);

            specification._rows.push(row);
          })
          return specification._rows;
        })
    },

    generate() {

      return this.print_data().then((data) => {

        const doc = new $p.SpreadsheetDocument(void(0), {fill_template: this.on_fill_template.bind(this)});

        this.scheme.composition.find_rows({use: true}, (row) => {
          doc.append(this.templates(row.field), data);
        });

        return doc;
      })
    },

    discard(row, selection) {
      return selection.some((srow) => {

        const left = srow.left_value.split('.');
        let left_value = row[left[0]];
        for(let i = 1; i < left.length; i++){
          left_value = left_value[left[i]];
        }

        const {comparison_type, right_value} = srow;
        const {comparison_types} = $p.enm;

        switch (comparison_type) {
        case comparison_types.eq:
          return left_value != right_value;

        case comparison_types.ne:
          return left_value == right_value;

        case comparison_types.lt:
          return !(left_value < right_value);

        case comparison_types.gt:
          return !(left_value > right_value);

        case comparison_types.in:
          return !left_value || right_value.indexOf(left_value.toString()) == -1;

        case comparison_types.nin:
          return right_value.indexOf(left_value.toString()) != -1;
        }

      })
    },

    material(row) {

      const {nom, characteristic, len, width} = row;

      let res = nom.name;

      if (!characteristic.empty()) {
        res += ' ' + characteristic.presentation;
      }

      if (len && width)
        row.sz = (1000 * len).toFixed(0) + "x" + (1000 * width).toFixed(0);
      else if (len)
        row.sz = + (1000 * len).toFixed(0);
      else if (width)
        row.sz = + (1000 * width).toFixed(0);

      row.nom_kind = nom.nom_kind;
      row.grouping = nom.grouping;
      row.article = nom.article;
      row.material = res;

      return res;
    },

    form_obj(pwnd, attr) {

      this._data._modified = false;

      const {calc_order, _manager} = this;

      this.wnd = this.draw_tabs($p.iface.dat_blank(null, {
        width: 720,
        height: 400,
        modal: true,
        center: true,
        pwnd: pwnd,
        allow_close: true,
        allow_minmax: true,
        caption: `<b>${calc_order.presentation}</b>`
      }));
      const {elmnts} = this.wnd;

      elmnts.grids.production = this.draw_production(elmnts.tabs.cells("prod"));


      this.listener = this.listener.bind(this);
      this._manager.on('update', this.listener);

      this.wnd.attachEvent("onClose", () => {
        this._manager.off('update', this.listener);
        elmnts.scheme.unload && elmnts.scheme.unload();
        for(let grid in elmnts.grids){
          elmnts.grids[grid].unload && elmnts.grids[grid].unload()
        }
        return true;
      });

      $p.cat.scheme_settings.get_scheme(_manager.class_name + '.specification')
        .then((scheme) => {
          this.scheme = scheme;
        });

      this.fill_by_order();

      return Promise.resolve({wnd: this.wnd, o: this});

    },

    draw_tabs(wnd) {

      const items = [
        {id: "info", type: "text", text: "Вариант настроек:"},
        {id: "scheme", type: "text", text: "<div style='width: 300px; margin-top: -2px;' name='scheme'></div>"}
      ];
      if($p.current_user.role_available("ИзменениеТехнологическойНСИ")){
        items.push(
          {id: "save", type: "button", text: "<i class='fa fa-floppy-o fa-fw'></i>", title: 'Сохранить вариант'},
          {id: "sep", type: "separator"},
          {id: "saveas", type: "button", text: "<i class='fa fa-plus-square fa-fw'></i>", title: 'Сохранить как...'});
      }
      items.push(
        {id: "sp", type: "spacer"},
        {id: "print", type: "button", text: "<i class='fa fa-print fa-fw'></i>", title: 'Печать отчета'});

      wnd.attachToolbar({
        items: items,
        onClick: (name) => {
          if(this.scheme.empty()){
            return $p.msg.show_msg({
              type: "alert-warning",
              text: "Не выбран вариант настроек",
              title: $p.msg.main_title
            });
          }
          if(name == 'print'){
            this.generate().then((doc) => doc.print());
          }
          else if(name == 'save'){
            this.scheme.save().then((scheme) => scheme.set_default());
          }
          else if(name == 'saveas'){
            $p.iface.query_value(this.scheme.name.replace(/[0-9]/g, '') + Math.floor(10 + Math.random() * 21), 'Укажите название варианта')
              .then((name) => {
                const proto = this.scheme._obj._clone();
                delete proto.ref;
                proto.name = name;
                return this.scheme._manager.create(proto);
              })
              .then((scheme) => scheme.save())
              .then((scheme) => this.scheme = scheme.set_default())
              .catch((err) => null);
          }
        }
      })

      wnd.elmnts.scheme = new $p.iface.OCombo({
        parent: wnd.cell.querySelector('[name=scheme]'),
        obj: this,
        field: "scheme",
        width: 280
      });

      wnd.elmnts.tabs = wnd.attachTabbar({
        arrows_mode: "auto",
        tabs: [
          {id: "prod", text: "Продукция", active:  true},
          {id: "composition", text: "Состав"},
          {id: "columns", text: "Колонки"},
          {id: "selection", text: "Отбор"},
          {id: "dimensions", text: "Группировка"},
        ]
      });

      return wnd;
    },

    draw_production(cell) {
      return cell.attachTabular({
        obj: this,
        ts: "production",
        ts_captions: {
          "fields":["use","characteristic","qty"],
          "headers":",Продукция,Штук",
          "widths":"40,*,150",
          "min_widths":"40,200,120",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ref,calck"
        }
      })
    },

    draw_columns(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "fields",
        reorder: true,
        ts_captions: {
          "fields":["use","field","caption"],
          "headers":",Поле,Заголовок",
          "widths":"40,200,*",
          "min_widths":"40,200,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    draw_composition(cell) {
      this.composition_parts();
      return cell.attachTabular({
        obj: this.scheme,
        ts: "composition",
        reorder: true,
        ts_captions: {
          "fields":["use","field","definition"],
          "headers":",Элемент,Описание",
          "widths":"40,160,*",
          "min_widths":"40,120,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    draw_selection(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "selection",
        reorder: true,
        ts_captions: {
          "fields":["use","left_value","comparison_type","right_value"],
          "headers":",Левое значение,Вид сравнения,Правое значение",
          "widths":"40,200,100,*",
          "min_widths":"40,200,100,200",
          "aligns":"",
          "sortings":"na,na,na,na",
          "types":"ch,ed,ref,ed"
        }
      });
    },

    draw_dimensions(cell) {
      return cell.attachTabular({
        obj: this.scheme,
        ts: "dimensions",
        reorder: true,
        ts_captions: {
          "fields":["use","parent","field"],
          "headers":",Таблица,Поле",
          "widths":"40,200,*",
          "min_widths":"40,200,200",
          "aligns":"",
          "sortings":"na,na,na",
          "types":"ch,ed,ed"
        }
      });
    },

    composition_parts(refill) {
      const {composition} = this.scheme;
      if(!composition.count()){
        refill = true;
      }
      if(refill){
        this.templates().forEach((template, index) => {
          const {attributes} = template;
          composition.add({
            field: attributes.id ? attributes.id.value : index,
            kind: attributes.kind ? attributes.kind.value : 'obj',
            definition: attributes.definition ? attributes.definition.value : 'Описание отсутствует',
          })
        });
      }
    },

    templates(name) {

      const {children} = this.formula._template.content;

      if(name){
        return children.namedItem(name);
      }
      const res = [];
      for(let i = 0; i < children.length; i++){
        res.push(children.item(i))
      }
      return res;
    },

    on_fill_template(template, data) {

      if(template.attributes.tabular && template.attributes.tabular.value == "specification"){
        const specification = data.specification.map((row) => {
          return {
            product: row.product,
            grouping: row.grouping,
            Номенклатура: row.nom.article + ' ' + row.nom.name + (!row.clr.empty() && !row.clr.predefined_name ? ' ' + row.clr.name : ''),
            Размеры: row.sz,
            Количество: row.qty.toFixed(),
            Угол1: row.alp1,
            Угол2: row.alp2,
          }
        });
        return {specification, _grouping: data._grouping}
      }
      else if(template.attributes.tabular && template.attributes.tabular.value == "production"){
        const production = [];
        this.production.find_rows({use: true}, (row) => {
          production.push(Object.assign(
            this.calc_order.row_description(row),
            data.ПродукцияЭскизы[row.characteristic.ref] ?
              {svg: $p.iface.scale_svg(data.ПродукцияЭскизы[row.characteristic.ref], 170, 0)} : {}
          ))
        });
        return Object.assign({}, data, {production});
      }
      return data;
    },

    listener(obj, fields) {
      if(obj === this && fields.hasOwnProperty('scheme') && this.wnd && this.wnd.elmnts){
        const {grids, tabs} = this.wnd.elmnts;

        grids.columns && grids.columns.unload && grids.columns.unload();
        grids.selection && grids.selection.unload && grids.selection.unload();
        grids.composition && grids.composition.unload && grids.composition.unload();
        grids.dimensions && grids.dimensions.unload && grids.dimensions.unload();

        grids.columns = this.draw_columns(tabs.cells("columns"));
        grids.selection = this.draw_selection(tabs.cells("selection"));
        grids.composition = this.draw_composition(tabs.cells("composition"));
        grids.dimensions = this.draw_dimensions(tabs.cells("dimensions"));
      }
    },

    fill_by_order(row, _mgr) {

      let pdoc;

      if(!row || !row._id){
        if(this.calc_order.empty()){
          return;
        }
        if(this.calc_order.is_new()){
          pdoc = this.calc_order.load();
        }
        else{
          pdoc = Promise.resolve(this.calc_order);
        }
      }
      else{
        const ids = row._id.split('|');
        if (ids.length < 2) {
          return
        }
        pdoc = _mgr.get(ids[1], 'promise');
      }

      return pdoc
        .then((doc) => {
          const rows = []
          const refs = []
          doc.production.forEach((row) => {
            if (!row.characteristic.empty()) {
              rows.push({
                use: true,
                characteristic: row.characteristic,
                qty: row.qty,
              })
              if (row.characteristic.is_new()) {
                refs.push(row.characteristic.ref)
              }
            }
          })

          return ($p.adapters ? $p.adapters.pouch.load_array($p.cat.characteristics, refs) : $p.cat.characteristics.pouch_load_array(refs))
            .then(() => rows)
        })
        .then((rows) => {
          this.production.load(rows)
          return rows
        })
    },

  });

  Object.assign($p.RepMaterials_demand, {

    resources: ['qty', 'totqty', 'totqty1', 'amount', 'amount_marged'],
  });

})($p);







function eXcell_rsvg(cell){ 
	if (cell){                
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}
	this.edit = function(){};  
	this.isDisabled = function(){ return true; }; 
	this.setValue=function(val){
		this.cell.style.padding = "2px 4px";
		this.setCValue(val ? $p.iface.scale_svg(val, 120, 0) : "нет эскиза");
	}
}
eXcell_rsvg.prototype = new eXcell();
window.eXcell_rsvg = eXcell_rsvg;

class OSvgs {

  constructor (layout, area, handler) {

    Object.assign(this, {
      layout: layout,
      minmax: document.createElement('div'),
      pics_area: document.createElement('div'),
      stack: [],
      reload_id: 0,
      area_hidden: $p.wsql.get_user_param("svgs_area_hidden", "boolean"),
      area_text: area.querySelector(".dhx_cell_statusbar_text"),
      onclick: this.onclick.bind(this),
      ondblclick: this.ondblclick.bind(this),
      handler: handler,
    });


    const {pics_area} = this;
    pics_area.className = 'svgs-area';
    if(area.firstChild){
      area.insertBefore(pics_area, area.firstChild);
    }
    else{
      area.appendChild(pics_area);
    }

    area.appendChild(Object.assign(this.minmax, {
      className: 'svgs-minmax',
      title: "Скрыть/показать панель эскизов",
      onclick: () => {
        this.area_hidden = !this.area_hidden;
        $p.wsql.set_user_param("svgs_area_hidden", this.area_hidden);
        this.apply_area_hidden();

        if(!this.area_hidden && this.stack.length){
          this.reload();
        }
      }
    }));

    this.apply_area_hidden();

  }

  apply_area_hidden () {

    const {pics_area, area_hidden, area_text, layout, minmax} = this;

    pics_area.style.display = area_hidden ? 'none' : '';
    area_text.style.display = area_hidden ? '' : 'none';

    if (layout.setSizes){
      layout.setSizes();
    }
    else if (layout.layout && layout.layout.setSizes) {
      layout.layout.setSizes();
    }
    else if (layout.getDimension) {
      const dim = layout.getDimension();
      layout.setDimension(dim[0], dim[1]);
      if (!layout.do_not_maximize){
        layout.maximize();
      }
    }

    minmax.style.backgroundPositionX = area_hidden ? '-32px' : '0px';
  }

  draw_svgs(res){

    const {pics_area} = this;

    if(!pics_area){
      return;
    }

    while (pics_area.firstChild){
      pics_area.removeChild(pics_area.firstChild)
    }

    res.forEach(({ref, svg}) => {
      if(!svg || svg.substr(0, 1) != "<"){
        return;
      }
      const svg_elm = document.createElement("div");
      pics_area.appendChild(svg_elm);
      svg_elm.className = "rsvg_elm";
      svg_elm.innerHTML = $p.iface.scale_svg(svg, 88, 22);
      svg_elm.ref = ref;
      svg_elm.onclick = this.onclick;
      svg_elm.ondblclick = this.ondblclick;
    });

    if(!res.length){
    }
  }

  onclick(event, dbl) {
    if(event.currentTarget && event.currentTarget.ref){
      this.handler && this.handler(event.currentTarget.ref, dbl);
      this.pics_area && this.select(event.currentTarget.ref);
    }
  }

  ondblclick(event){
    this.onclick(event, true);
  }

  reload(ref) {

    const {stack, reload_id, area_hidden} = this;

    ref && stack.push(ref);
    reload_id && clearTimeout(reload_id);

    if(!area_hidden)
      this.reload_id = setTimeout(() => {

        if(stack.length){

          let _obj = stack.pop();
          const db = $p.adapters.pouch.local.doc;
          db.query('svgs', {
            startkey: [typeof _obj == "string" ? _obj : _obj.ref, 0],
            endkey: [typeof _obj == "string" ? _obj : _obj.ref, 10e9]
          })
            .then((res) => {
              const aatt = [];
              for(const {id} of res.rows){
                aatt.push(db.getAttachment(id, "svg")
                  .then((att) => ({ref: id.substr(20), att: att}))
                  .catch((err) => {}));
              };
              return Promise.all(aatt);
            })
            .then((res) => {
              const aatt = [];
              res.forEach(({ref, att}) => {
                if(att instanceof Blob && att.size)
                  aatt.push($p.utils.blob_as_text(att)
                    .then((svg) => ({ref, svg})));
              });
              return Promise.all(aatt);
            })
            .then(this.draw_svgs.bind(this))
            .catch($p.record_log);

          stack.length = 0;
        }
      }, 300);
  }

  select(ref) {
    if(!this.pics_area){
      return;
    }
    const {children} = this.pics_area;
    for(let i = 0; i < children.length; i++){
      const elm = children.item(i);
      if(elm.ref == ref){
        elm.classList.add("rsvg_selected");
      }
      else{
        elm.classList.remove("rsvg_selected");
      }
    }
  }

  unload() {
    this.draw_svgs([]);
    for(let fld in this){
      if(this[fld] instanceof HTMLElement && this[fld].parentNode){
        this[fld].parentNode.removeChild(this[fld]);
      }
      this[fld] = null;
    }
  }

}

$p.iface.OSvgs = OSvgs;


class WndAddressData {

  constructor(owner){
    this.owner = owner;
    this.country = "Россия";
    this.region = "";
    this.city = "";
    this.street =	"";
    this.postal_code = "";
    this.marker = {};
    this.flat = "";

    this._house = "";
    this._housing = "";

    const {coordinates} = this;
    this.latitude = coordinates.length ? coordinates[0] : 0;
    this.longitude = coordinates.length ? coordinates[1] : 0;
  }

  get delivery_area() {
    return this.owner.obj.delivery_area;
  }
  set delivery_area(v) {
    this.owner.pgrid_on_select(v);
  }

  get house() {
    return this._house + (this._housing ? " " + this._housing : "");
  }
  set house(v) {
    this._house = v;
  }

  get coordinates() {
    const {coordinates} = this.owner.obj;
    return coordinates ? JSON.parse(coordinates) : []
  }

}

class WndAddress {

  constructor(source) {
    this.obj = source.obj;
    this.pwnd = source.pwnd;
    this.grid = source.grid;
    this.v = new WndAddressData(this);
    this.process_address_fields().then(() => this.frm_create());
  }

  frm_create() {

    const {obj, pwnd, v} = this;

    const options = {
      name: 'wnd_addr',
      wnd: {
        id: 'wnd_addr',
        width: 800,
        height: 560,
        modal: true,
        center: true,
        pwnd: pwnd,
        allow_close: true,
        allow_minmax: true,
        on_close: this.frm_close.bind(this),
        caption: obj.shipping_address || 'Адрес доставки'
      }
    };

    if (pwnd && pwnd.getHeight) {
      if (options.wnd.height > pwnd.getHeight())
        options.wnd.height = pwnd.getHeight();
    }

    const wnd = this.wnd = $p.iface.dat_blank(null, options.wnd);
    const {elmnts} = wnd;


    elmnts.layout = wnd.attachLayout('3U');
    elmnts.cell_frm1 = elmnts.layout.cells('a');
    elmnts.cell_frm1.setHeight('52');
    elmnts.cell_frm1.hideHeader();
    elmnts.cell_frm1.fixSize(0, 1);

    elmnts.pgrid = elmnts.cell_frm1.attachPropertyGrid();
    elmnts.pgrid.init();
    elmnts.pgrid.parse(obj._manager.get_property_grid_xml({
      " ": [
        {id: "city", path: "o.city", synonym: "Насел. пункт", type: "ed", txt: v.city},
        {id: "street", path: "o.street", synonym: "Улица", type: "ed", txt: v.street}
      ]
    }, v), () => {
      elmnts.pgrid.enableAutoHeight(true);
      elmnts.pgrid.setInitWidthsP("40,60");
      elmnts.pgrid.setSizes();
      elmnts.pgrid.attachEvent("onPropertyChanged", (pname, new_value, old_value) => {
        this.pgrid_on_changed(elmnts.pgrid.getSelectedRowId(), new_value, old_value)
      });
    }, "xml");

    elmnts.cell_frm2 = elmnts.layout.cells('b');
    elmnts.cell_frm2.hideHeader();
    elmnts.pgrid2 = elmnts.cell_frm2.attachPropertyGrid();
    elmnts.pgrid2.init();
    elmnts.pgrid2.parse(obj._manager.get_property_grid_xml({
      " ": [
        {id: "house", path: "o.house", synonym: "Дом, корп., лит.", type: "ed", txt: v.house},
        {id: "flat", path: "o.flat", synonym: "Кварт., оф.", type: "ed", txt: v.flat}
      ]
    }, v), () => {
      elmnts.pgrid2.enableAutoHeight(true);
      elmnts.pgrid2.setInitWidthsP("40,60");
      elmnts.pgrid2.setSizes();
      elmnts.pgrid2.attachEvent("onPropertyChanged", (pname, new_value, old_value) => {
        this.pgrid_on_changed(elmnts.pgrid2.getSelectedRowId(), new_value, old_value)
      });
    }, "xml");


    this.listener = this.listener.bind(this);
    obj._manager.on('update', this.listener);

    elmnts.pgrid.get_cell_field = () => {
      return {
        obj: v,
        field: "delivery_area",
        on_select: this.pgrid_on_select.bind(this),
        pwnd: wnd,
        metadata: {
          "synonym": "Район",
          "tooltip": "Район (зона, направление) доставки для группировки при планировании и оптимизации маршрута геокодером",
          "choice_groups_elm": "elm",
          "type": {
            "types": [
              "cat.delivery_areas"
            ],
            "is_ref": true
          }
        }
      };
    };

    const toolbar_click = this.toolbar_click.bind(this);
    elmnts.toolbar = wnd.attachToolbar({icons_path: dhtmlx.image_path + 'dhxtoolbar' + dhtmlx.skin_suffix()});
    elmnts.toolbar.loadStruct('<toolbar><item id="btn_select" type="button" title="Установить адрес" text="&lt;b&gt;Выбрать&lt;/b&gt;" /><item type="separator"  id="sep1"	/></toolbar>', function(){

      this.attachEvent("onclick", toolbar_click);

      const delivery_area_id = `txt_${dhx4.newId()}`;
      this.addText(delivery_area_id);
      this.addSeparator("sep2");
      this.addText("txt_region");

      const txt_div = this.objPull[this.idPrefix + delivery_area_id].obj;
      const delivery_area = new $p.iface.OCombo({
        parent: txt_div,
        obj: obj,
        field: "delivery_area",
        width: 200,
        hide_frm: true,
      });
      txt_div.style.border = "1px solid #ccc";
      txt_div.style.borderRadius = "3px";
      txt_div.style.padding = "3px 2px 1px 2px";
      txt_div.style.margin = "1px 5px 1px 1px";
      delivery_area.DOMelem_input.placeholder = "Район доставки";

      this.setItemText('txt_region', v.region);

    });

    elmnts.cell_map = elmnts.layout.cells('c');
    elmnts.cell_map.hideHeader();

    const {maps} = google;
    const mapParams = {
      center: new maps.LatLng(v.latitude, v.longitude),
      zoom: v.street ? 14 : 11,
      mapTypeId: maps.MapTypeId.ROADMAP
    };
    elmnts.map = elmnts.cell_map.attachMap(mapParams);

    v.marker = new maps.Marker({
      map: elmnts.map,
      draggable: true,
      animation: maps.Animation.DROP,
      position: mapParams.center
    });
    this._marker_toggle_bounce = maps.event.addListener(v.marker, 'click', this.marker_toggle_bounce.bind(this));
    this._marker_dragend = maps.event.addListener(v.marker, 'dragend', this.marker_dragend.bind(this));

    this.refresh_grid();
  }

  pgrid_on_select(selv){
    if(selv===undefined){
      return;
    }
    obj.delivery_area = selv;
    this.delivery_area_changed();
  }

  toolbar_click(btn_id){
    if(btn_id=="btn_select"){
      const {obj, v, wnd} = this;
      this.assemble_address_fields();
      obj.coordinates = JSON.stringify([v.latitude, v.longitude]);
      wnd.close();
    }
  }

  listener(_obj, fields) {
    const {obj, v, wnd, listener} = this;
    const names = ['delivery_area','city','street','house','flat']
    if (obj == _obj) {
      for(let name of names){
        fields.hasOwnProperty(name) && this.pgrid_on_changed(name, v[name], fields[name]);
      }
    }
  }

  delivery_area_changed(){

    const {v, wnd} = this;

    if(!v.delivery_area.empty()){
      v.street = "";
    }

    if(v.delivery_area.region){
      v.region = v.delivery_area.region;
    }
    else {
      v.region = "";
    }
    wnd.elmnts.toolbar.setItemText('txt_region', v.region);

    if(v.delivery_area.city){
      v.city = v.delivery_area.city;
      wnd.elmnts.pgrid.cells("city", 1).setValue(v.city);
    }
    else{
      v.city = "";
    }

    if(v.delivery_area.latitude && v.delivery_area.longitude){
      const LatLng = new google.maps.LatLng(v.delivery_area.latitude, v.delivery_area.longitude);
      wnd.elmnts.map.setCenter(LatLng);
      v.marker.setPosition(LatLng);
    }

    this.refresh_grid();
  }

  refresh_grid(){
    const {pgrid, pgrid2} = this.wnd.elmnts;
    const {region, city, street, house, flat} = this.v;
    pgrid.cells("city", 1).setValue(city);
    pgrid.cells("street", 1).setValue(street);
    pgrid2.cells("house", 1).setValue(house);
    pgrid2.cells("flat", 1).setValue(flat);
  }

  addr_changed() {
    const {v, wnd} = this;
    const zoom = v.street ? 15 : 12;

    if(wnd.elmnts.map.getZoom() != zoom){
      wnd.elmnts.map.setZoom(zoom);
    }

    this.do_geocoding((results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const loc = results[0].geometry.location;
        wnd.elmnts.map.setCenter(loc);
        v.marker.setPosition(loc);
        v.latitude = loc.lat();
        v.longitude = loc.lng();
        v.postal_code = $p.ipinfo.components({}, results[0].address_components).postal_code || "";
      }
    });
  }

  assemble_addr(with_flat){
    const {country, region, city, street, postal_code, house, flat} = this.v;
    return (street ? (street.replace(/,/g," ") + ", ") : "") +
      (house ? (house + ", ") : "") +
      (with_flat && flat ? (flat + ", ") : "") +
      (city ? (city + ", ") : "") +
      (region ? (region + ", ") : "") + country +
      (postal_code ? (", " + postal_code) : "");
  }

  assemble_address_fields(){

    const {obj, v} = this;
    const {fias} = WndAddress;

    obj.shipping_address = this.assemble_addr(true);

    let fields = '<КонтактнаяИнформация  \
				xmlns="http://www.v8.1c.ru/ssl/contactinfo" \
				xmlns:xs="http://www.w3.org/2001/XMLSchema" \
				xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"   \
				Представление="%1">   \
					<Комментарий/>  \
					<Состав xsi:type="Адрес" Страна="РОССИЯ">   \
						<Состав xsi:type="АдресРФ">'.replace('%1', obj.shipping_address);

    if(v.region){
      fields += '\n<СубъектРФ>' + v.region + '</СубъектРФ>';
    }

    if(v.city){
      if(v.city.indexOf('г.') != -1 || v.city.indexOf('г ') != -1 || v.city.indexOf(' г') != -1)
        fields += '\n<Город>' + v.city + '</Город>';
      else
        fields += '\n<НаселПункт>' + v.city + '</НаселПункт>';
    }

    if(v.street){
      fields += '\n<Улица>' + (v.street.replace(/,/g," ")) + '</Улица>';
    }

    let suffix, index, house_type, flat_type;

    let house = v.house;
    if(house){
      for(let i in fias){
        if(fias[i].type == 1){
          for(let syn of fias[i].syn){
            if((index = house.indexOf(syn.trimLeft())) != -1){
              house_type = i;
              house = house.substr(index + syn.trimLeft().length).trim();
              break;
            }
          }
          if(house_type)
            break;
        }
      }
      if(!house_type){
        house_type = "1010";
        if((index = house.indexOf(" ")) != -1){
          house = house.substr(index);
        }
      }
      fields += '\n<ДопАдрЭл><Номер Тип="' + house_type +  '" Значение="' + house.trim() + '"/></ДопАдрЭл>';
    }

    let flat = v.flat;
    if(flat){
      for(let i in fias){
        if(fias[i].type == 3){
          for(let syn of fias[i].syn){
            if((index = flat.indexOf(syn)) != -1){
              flat_type = i;
              flat = flat.substr(index + syn.length);
              break;
            }
          }
          if(flat_type)
            break;
        }
      }
      if(!flat_type){
        flat_type = "2010";
        if((index = flat.indexOf(" ")) != -1){
          flat = flat.substr(index);
        }
      }
      fields += '\n<ДопАдрЭл><Номер Тип="' + flat_type +  '" Значение="' + flat.trim() + '"/></ДопАдрЭл>';
    }

    if(v.postal_code)
      fields += '<ДопАдрЭл ТипАдрЭл="10100000" Значение="' + v.postal_code + '"/>';

    fields += '</Состав> \
					</Состав></КонтактнаяИнформация>';

    obj.address_fields = fields;
  }

  process_address_fields(){

    const {obj, v} = this;
    const {fias} = WndAddress;

    if(obj.address_fields){
      v.xml = ( new DOMParser() ).parseFromString(obj.address_fields, "text/xml");
      let tmp = {}, res = {}, tattr,
        nss = "СубъектРФ,Округ,СвРайМО,СвРайМО,ВнутригРайон,НаселПункт,Улица,Город,ДопАдрЭл,Адрес_по_документу,Местоположение".split(",");

      function get_aatributes(ca){
        if(ca.attributes && ca.attributes.length == 2){
          return {[ca.attributes[0].value]: ca.attributes[1].value};
        }
      }

      for(let i in nss){
        tmp[nss[i]] = v.xml.getElementsByTagName(nss[i]);
      }
      for(let i in tmp){
        for(let j in tmp[i]){
          if(j == "length" || !tmp[i].hasOwnProperty(j))
            continue;
          if(tattr = get_aatributes(tmp[i][j])){
            if(!res[i])
              res[i] = [];
            res[i].push(tattr);
          }
          else if(tmp[i][j].childNodes.length){
            for(let k in tmp[i][j].childNodes){
              if(k == "length" || !tmp[i][j].childNodes.hasOwnProperty(k))
                continue;
              if(tattr = get_aatributes(tmp[i][j].childNodes[k])){
                if(!res[i])
                  res[i] = [];
                res[i].push(tattr);
              }else if(tmp[i][j].childNodes[k].nodeValue){
                if(!res[i])
                  res[i] = tmp[i][j].childNodes[k].nodeValue;
                else
                  res[i] += " " + tmp[i][j].childNodes[k].nodeValue;
              }
            }
          }
        }
      }
      for(let i in res["ДопАдрЭл"]){
        for(let j in fias){
          if(j.length != 4)
            continue;
          if(res["ДопАдрЭл"][i][j])
            if(fias[j].type == 1){
              v._house = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
            else if(fias[j].type == 2){
              v._housing = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
            else if(fias[j].type == 3){
              v.flat = fias[j].name + " " + res["ДопАдрЭл"][i][j];
            }
        }

        if(res["ДопАдрЭл"][i]["10100000"])
          v.postal_code = res["ДопАдрЭл"][i]["10100000"];
      }

      v.address_fields = res;

      v.region = res["СубъектРФ"] || res["Округ"] || "";
      v.city = res["Город"] || res["НаселПункт"] || "";
      v.street = (res["Улица"] || "");
    }

    return new Promise(function(resolve, reject){

      if(!$p.ipinfo)
        $p.ipinfo = new IPInfo();

      if(window.google && window.google.maps){
        return resolve();
      }

      $p.load_script("https://maps.google.com/maps/api/js?key=" + $p.job_prm.use_google_geo + "&callback=$p.ipinfo.location_callback", "script", function(){});

      let google_ready = $p.eve.attachEvent("geo_google_ready", () => {

        if(watch_dog)
          clearTimeout(watch_dog);

        if(google_ready){
          $p.eve.detachEvent(google_ready);
          google_ready = null;
          resolve();
        }
      });

      let watch_dog = setTimeout(() => {

        if(google_ready){
          $p.eve.detachEvent(google_ready);
          google_ready = null;
        }
        $p.msg.show_msg({
          type: "alert-warning",
          text: $p.msg.error_geocoding + " Google",
          title: $p.msg.main_title
        });

        reject();

      }, 10000);


    })
      .then(() => {

        if(!v.latitude || !v.longitude){
          if(obj.shipping_address){
            this.do_geocoding((results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                v.latitude = results[0].geometry.location.lat();
                v.longitude = results[0].geometry.location.lng();
              }
            });
          }
          else if($p.ipinfo.latitude && $p.ipinfo.longitude ){
            v.latitude = $p.ipinfo.latitude;
            v.longitude = $p.ipinfo.longitude;
          }
          else{
            v.latitude = 55.635924;
            v.longitude = 37.6066379;
            $p.msg.show_msg($p.msg.empty_geocoding);
          }
        }
      });
  }

  do_geocoding(call){
    $p.ipinfo.ggeocoder.geocode({address: this.assemble_addr()}, call);
  }

  marker_toggle_bounce() {
    const {v} = this;
    if (v.marker.getAnimation() != null) {
      v.marker.setAnimation(null);
    }
    else {
      v.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => v.marker.setAnimation(null), 1500);
    }
  }

  marker_dragend(e) {
    $p.ipinfo.ggeocoder.geocode({'latLng': e.latLng}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const {v, wnd} = this;
        if (results[0]) {
          const addr = results[0];
          wnd.setText(addr.formatted_address);
          $p.ipinfo.components(v, addr.address_components);

          this.refresh_grid();

          const zoom = v.street ? 15 : 12;
          if(wnd.elmnts.map.getZoom() != zoom){
            wnd.elmnts.map.setZoom(zoom);
            wnd.elmnts.map.setCenter(e.latLng);
          }

          v.latitude = e.latLng.lat();
          v.longitude = e.latLng.lng();
        }
      }
    });
  }

  pgrid_on_changed(pname, new_value, old_value){
    const {v, wnd} = this;
    if(pname){
      if(v.delivery_area.empty()){
        new_value = old_value;
        $p.msg.show_msg({
          type: "alert",
          text: $p.msg.delivery_area_empty,
          title: $p.msg.addr_title});
        setTimeout(() => wnd.elmnts.pgrid.selectRowById("delivery_area"), 50);
      }
      else if(pname == "delivery_area"){
        this.delivery_area_changed();
      }
      else{
        v[pname] = new_value;
        this.addr_changed();
      }
    }
  }

  frm_close(win){
    const {grid, obj, listener} = this;
    grid && grid.editStop();
    obj && obj._manager.off('update', listener);
    const {event} = google.maps;
    event.removeListener(this._marker_toggle_bounce);
    event.removeListener(this._marker_dragend);
    return !win.error;
  }

}

WndAddress.fias = {
  types: ["владение", "здание", "помещение"],

  "1010": {name: "дом",			type: 1, order: 1, fid: 2, syn: [" д.", " д ", " дом"]},
  "1020": {name: "владение",		type: 1, order: 2, fid: 1, syn: [" вл.", " вл ", " влад.", " влад ", " владен.", " владен ", " владение"]},
  "1030": {name: "домовладение",	type: 1, order: 3, fid: 3, syn: [" домовлад"]},

  "1050": {name: "корпус",		type: 2, order: 1, syn: [" к.", " к ", " корп.", " корп ", "корпус"]},
  "1060": {name: "строение",	type: 2, order: 2, fid: 1, syn: [" стр.", " стр ", " строен.", " строен ", "строение"]},
  "1080": {name: "литера",		type: 2, order: 3, fid: 3, syn: [" л.", " л ", " лит.", " лит ", "литера"]},
  "1070": {name: "сооружение",	type: 2, order: 4, fid: 2, syn: [" соор.", " соор ", " сооруж.", " сооруж ", "сооружение"]},
  "1040": {name: "участок",	type: 2, order: 5, syn: [" уч.", " уч ", "участок"]},

  "2010": {name: "квартира",	type: 3, order: 1, syn: ["кв.", "кв ", "кварт.", "кварт ", "квартира", "-"]},
  "2030": {name: "офис",		type: 3, order: 2, syn: ["оф.", "оф ", "офис", "-"]},
  "2040": {name: "бокс",		type: 3, order: 3, syn: ["бокс", "бкс"]},
  "2020": {name: "помещение",	type: 3, order: 4, syn: ["помещение", "пом", "помещ"]},
  "2050": {name: "комната",	type: 3, order: 5, syn: ["комн.", "комн ", "комната"]},

  "10100000": {name: "Почтовый индекс"},
  "10200000": {name: "Адресная точка"},
  "10300000": {name: "Садовое товарищество"},
  "10400000": {name: "Элемент улично-дорожной сети, планировочной структуры дополнительного адресного элемента"},
  "10500000": {name: "Промышленная зона"},
  "10600000": {name: "Гаражно-строительный кооператив"},
  "10700000": {name: "Территория"},

}

class eXcell_addr extends eXcell {

  constructor(cell) {

    if (!cell){
      return;
    }

    super(cell);

    this.cell = cell;
    this.open_selection = this.open_selection.bind(this);
    this.edit = eXcell_addr.prototype.edit.bind(this);
    this.detach = eXcell_addr.prototype.detach.bind(this);

  }

  get grid() {
    return this.cell.parentNode.grid
  }

  ti_keydown(e) {
    return eXcell_ocombo.prototype.input_keydown(e, this);
  }

  open_selection(e) {
    const source = {grid: this.grid}._mixin(this.grid.get_cell_field());
    new WndAddress(source);
    return $p.iface.cancel_bubble(e);
  }


  setValue(val) {
    this.setCValue(val);
  }

  getValue() {
    return this.grid.get_cell_value();
  }

  edit() {

    this.val = this.getValue();		
    this.cell.innerHTML = '<div class="ref_div21"><input type="text" class="dhx_combo_edit" style="height: 20px;"><div class="ref_field21">&nbsp;</div></div>';

    const td = this.cell.firstChild;
    const ti = td.childNodes[0];
    ti.value = this.val;
    ti.onclick = $p.iface.cancel_bubble;		
    ti.readOnly = true;
    ti.focus();
    ti.onkeydown = this.ti_keydown.bind(this);
    td.childNodes[1].onclick = this.open_selection;
  };

  detach() {
    this.setValue(this.getValue());
    return !$p.utils.is_equal(this.val, this.getValue());				
  }

}
window.eXcell_addr = eXcell_addr;


return ;
}));
