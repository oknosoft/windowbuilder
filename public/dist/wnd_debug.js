;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Wnd_debug = factory();
  }
}(this, function() {
$p.injected_data._mixin({"toolbar_calc_order_production.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n\n  <item type=\"buttonSelect\" id=\"bs_grp_add\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку заказа\" openAll=\"true\" >\n    <item type=\"button\" id=\"btn_add_builder\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt; Изделие построителя\" />\n    <item type=\"button\" id=\"btn_add_product\" text=\"&lt;i class='fa fa-gavel fa-fw'&gt;&lt;/i&gt; Продукцию или услугу\" />\n    <item type=\"button\" id=\"btn_add_material\" text=\"&lt;i class='fa fa-cube fa-fw'&gt;&lt;/i&gt; Материал\" />\n    <item type=\"button\" id=\"btn_additions\" text=\"&lt;i class='fa fa-cart-plus fa-fw'&gt;&lt;/i&gt; Аксессуары и услуги\" />\n    <item type=\"button\" id=\"btn_clone\" text=\"&lt;i class='fa fa-clone fa-fw'&gt;&lt;/i&gt; Скопировать изделие\" />\n    <item id=\"sep_prod\" type=\"separator\"/>\n    <item type=\"button\" id=\"btn_recalc_row\" text=\"&lt;i class='fa fa-repeat fa-fw'&gt;&lt;/i&gt; Пересчитать строку\" />\n    <item type=\"button\" id=\"btn_recalc_doc\" text=\"&lt;i class='fa fa-repeat fa-fw'&gt;&lt;/i&gt; Пересчитать заказ\" />\n  </item>\n\n  <item type=\"button\" id=\"btn_edit\" text=\"&lt;i class='fa fa-object-ungroup fa-fw'&gt;&lt;/i&gt;\" title=\"Редактировать изделие построителя\" />\n  <item type=\"button\" id=\"btn_spec\" text=\"&lt;i class='fa fa-table fa-fw'&gt;&lt;/i&gt;\" title=\"Открыть спецификацию изделия\" />\n  <item type=\"button\" id=\"btn_delete\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить строку заказа\" />\n  <item type=\"button\" id=\"btn_discount\" text=\"&lt;i class='fa fa-percent fa-fw'&gt;&lt;/i&gt;\" title=\"Скидки по типам строк заказа\"/>\n  <item id=\"sep1\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_calc_order_obj.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n  <item type=\"button\" id=\"btn_save_close\" text=\"&lt;i class='fa fa-caret-square-o-down fa-fw'&gt;&lt;/i&gt;\" title=\"Записать и закрыть\"/>\n  <item type=\"button\" id=\"btn_save\" text=\"&lt;i class='fa fa-floppy-o fa-fw'&gt;&lt;/i&gt;\" title=\"Записать\"/>\n  <item type=\"button\" id=\"btn_sent\" text=\"&lt;i class='fa fa-paper-plane-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отправить заказ\"/>\n\n  <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"&lt;i class='fa fa-check-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Провести документ\"/>\n  <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"&lt;i class='fa fa-square-o fa-fw'&gt;&lt;/i&gt;\" title=\"Отмена проведения\"/>\n\n  <item type=\"button\" id=\"btn_files\" text=\"&lt;i class='fa fa-paperclip fa-fw'&gt;&lt;/i&gt;\" title=\"Присоединенные файлы\"/>\n\n  <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt;\" title=\"Печать\" openAll=\"true\">\n  </item>\n\n  <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\">\n    <item type=\"button\" id=\"planning_event\" enabled=\"false\" text=\"Событие\"/>\n    <item type=\"button\" id=\"calc_order\" text=\"Расчет\"/>\n    <item type=\"button\" id=\"debit_cash_order\" enabled=\"false\" text=\"Наличная оплата\"/>\n    <item type=\"button\" id=\"credit_card_order\" enabled=\"false\" text=\"Оплата картой\"/>\n    <item type=\"button\" id=\"selling\" enabled=\"false\" text=\"Реализация товаров услуг\"/>\n  </item>\n\n  <!--item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\">\n    <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\"/>\n  </item-->\n\n  <item type=\"buttonSelect\" id=\"bs_more\" text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\" title=\"Дополнительно\" openAll=\"true\">\n    <item type=\"button\" id=\"btn_reload\" text=\"&lt;i class='fa fa-refresh fa-fw'&gt;&lt;/i&gt; Перечитать с сервера\"/>\n    <item type=\"separator\" id=\"sep_reload\"/>\n    <item type=\"button\" id=\"btn_retrieve\" text=\"&lt;i class='fa fa-undo fa-fw'&gt;&lt;/i&gt; Отозвать\" title=\"Отозвать заказ\"/>\n    <item type=\"separator\" id=\"sep_export\"/>\n    <item type=\"button\" id=\"btn_share\" text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt; Отправить сотруднику\"/>\n\n    <!--item type=\"button\" id=\"btn_import\" text=\"&lt;i class='fa fa-upload fa-fw'&gt;&lt;/i&gt; Загрузить из файла\"/>\n    <item type=\"button\" id=\"btn_export\" text=\"&lt;i class='fa fa-download fa-fw'&gt;&lt;/i&gt; Выгрузить в файл\"/>\n    <item id=\"btn_download\" type=\"button\" text=\"&lt;i class='fa fa-cloud-download fa-fw'&gt;&lt;/i&gt; Обновить из облака\"/>\n    <item id=\"btn_share\" type=\"button\" text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt; Отправить сотруднику\"/>\n    <item id=\"btn_inbox\" type=\"button\" text=\"&lt;i class='fa fa-inbox fa-fw'&gt;&lt;/i&gt; Входящие заказы\"/-->\n  </item>\n\n  <item id=\"sep_close_1\" type=\"separator\"/>\n  <item type=\"button\" id=\"btn_close\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Закрыть форму\"/>\n  <item id=\"sep_close_2\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_calc_order_selection.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n\n  <item id=\"sep0\" type=\"separator\"/>\n\n  <item id=\"btn_select\" type=\"button\" title=\"Выбрать элемент списка\" text=\"&lt;b&gt;Выбрать&lt;/b&gt;\"/>\n\n  <item id=\"sep1\" type=\"separator\"/>\n  <item id=\"btn_new\" type=\"button\" text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Создать\"/>\n  <item id=\"btn_edit\" type=\"button\" text=\"&lt;i class='fa fa-pencil fa-fw'&gt;&lt;/i&gt;\" title=\"Изменить\"/>\n  <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\" title=\"Удалить\"/>\n  <item id=\"sep2\" type=\"separator\"/>\n\n  <item type=\"buttonSelect\" id=\"bs_print\" text=\"&lt;i class='fa fa-print fa-fw'&gt;&lt;/i&gt; Печать\" openAll=\"true\">\n  </item>\n\n  <item type=\"buttonSelect\" id=\"bs_create_by_virtue\" text=\"&lt;i class='fa fa-bolt fa-fw'&gt;&lt;/i&gt;\" title=\"Создать на основании\" openAll=\"true\">\n    <item type=\"button\" id=\"planning_event\" enabled=\"false\" text=\"Событие\"/>\n    <item type=\"button\" id=\"calc_order\" text=\"Расчет\"/>\n    <item type=\"button\" id=\"debit_cash_order\" enabled=\"false\" text=\"Наличная оплата\"/>\n    <item type=\"button\" id=\"credit_card_order\" enabled=\"false\" text=\"Оплата картой\"/>\n    <item type=\"button\" id=\"selling\" enabled=\"false\" text=\"Реализация товаров услуг\"/>\n  </item>\n\n  <!--item type=\"buttonSelect\" id=\"bs_go_to\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt;\" title=\"Перейти\" openAll=\"true\" >\n    <item type=\"button\" id=\"btn_go_connection\" enabled=\"false\" text=\"Связи\" />\n  </item-->\n\n  <item type=\"buttonSelect\" id=\"bs_more\" text=\"&lt;i class='fa fa-th-large fa-fw'&gt;&lt;/i&gt;\" title=\"Дополнительно\" openAll=\"true\">\n    <item id=\"btn_requery\" type=\"button\" text=\"&lt;i class='fa fa-refresh fa-fw'&gt;&lt;/i&gt; Обновить список\"/>\n    <item id=\"sep_requery\" type=\"separator\"/>\n    <item id=\"btn_download\" type=\"button\" text=\"&lt;i class='fa fa-cloud-download fa-fw'&gt;&lt;/i&gt; Обновить из облака\"/>\n    <item id=\"btn_share\" type=\"button\" text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt; Отправить сотруднику\"/>\n    <item id=\"btn_inbox\" type=\"button\" text=\"&lt;i class='fa fa-inbox fa-fw'&gt;&lt;/i&gt; Входящие заказы\"/>\n    <item id=\"sep_export\" type=\"separator\"/>\n  </item>\n\n  <item id=\"sep3\" type=\"separator\"/>\n\n</toolbar>\n","toolbar_product_list.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\r\n<toolbar>\r\n    <item id=\"btn_ok\"   type=\"button\"   text=\"&lt;b&gt;Рассчитать и закрыть&lt;/b&gt;\" title=\"Рассчитать, записать и закрыть\"  />\r\n    <item id=\"sep0\" type=\"separator\"/>\r\n    <item id=\"btn_xls\"  type=\"button\"\ttext=\"Загрузить из XLS\" title=\"Загрузить список продукции из файла xls\" />\r\n\r\n    <item type=\"button\" id=\"btn_post\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"button\" id=\"btn_unpost\" enabled=\"false\" text=\"\" title=\"\" />\r\n    <item type=\"buttonSelect\" id=\"bs_print\" enabled=\"false\" text=\"\" title=\"\" openAll=\"true\">\r\n    </item>\r\n\r\n</toolbar>","toolbar_characteristics_specification.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"sep0\" type=\"separator\"/>\n  <item type=\"button\" id=\"btn_origin\" text=\"&lt;i class='fa fa-external-link fa-fw'&gt;&lt;/i&gt; Происхождение\" title=\"Ссылка на настройки\" />\n  <item id=\"sp\" type=\"spacer\"/>\n\n  <item id=\"input_filter\" type=\"buttonInput\" width=\"200\" title=\"Поиск по подстроке\" />\n\n  <item id=\"sep2\" type=\"separator\"/>\n  <item type=\"buttonSelect\"   id=\"bs_more\"  text=\"&lt;i class='fa fa-share-alt fa-fw'&gt;&lt;/i&gt;\"  title=\"Экспорт\" openAll=\"true\">\n    <item type=\"button\" id=\"btn_csv\" text=\"&lt;i class='fa fa-file-text-o fa-fw'&gt;&lt;/i&gt; Скопировать в CSV\" />\n    <item type=\"button\" id=\"btn_json\" text=\"&lt;i class='fa fa-file-code-o fa-fw'&gt;&lt;/i&gt; Скопировать в JSON\" />\n    <item type=\"button\" id=\"btn_xls\" text=\"&lt;i class='fa fa-file-excel-o fa-fw'&gt;&lt;/i&gt; Выгрузить в XLS\" />\n  </item>\n</toolbar>\n","toolbar_glass_inserts.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item id=\"btn_add\" type=\"button\"  text=\"&lt;i class='fa fa-plus-circle fa-fw'&gt;&lt;/i&gt;\" title=\"Добавить строку\"  />\n  <item id=\"btn_delete\" type=\"button\" text=\"&lt;i class='fa fa-times fa-fw'&gt;&lt;/i&gt;\"  title=\"Удалить строку\" />\n  <item id=\"btn_up\" type=\"button\" text=\"&lt;i class='fa fa-arrow-up fa-fw'&gt;&lt;/i&gt;\"  title=\"Переместить строку вверх\" />\n  <item id=\"btn_down\" type=\"button\" text=\"&lt;i class='fa fa-arrow-down fa-fw'&gt;&lt;/i&gt;\"  title=\"Переместить строку вниз\" />\n  <item id=\"sep1\" type=\"separator\"/>\n  <item id=\"btn_inset\" type=\"button\" text=\"&lt;i class='fa fa-plug fa-fw'&gt;&lt;/i&gt;\"  title=\"Заполнить по вставке\" />\n</toolbar>\n","toolbar_discounts.xml":"<?xml version=\"1.0\" encoding='utf-8'?>\n<toolbar>\n  <item type=\"buttonSelect\"   id=\"bs\"  text=\"Скидки производителя\"  title=\"Режим\" openAll=\"true\">\n    <item type=\"button\" id=\"discount_percent\" text=\"Скидки производителя\" />\n    <item type=\"button\" id=\"discount_percent_internal\" text=\"Скидки дилера\" />\n  </item>\n</toolbar>\n","form_auth.xml":"<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<items>\n<item type=\"settings\" position=\"label-left\" labelWidth=\"80\" inputWidth=\"180\" noteWidth=\"180\"/>\n<item type=\"fieldset\" name=\"data\" inputWidth=\"auto\" label=\"Авторизация\">\n\n  <item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" checked=\"true\" value=\"guest\" label=\"Гостевой (демо) режим\">\n    <item type=\"select\" name=\"guest\" label=\"Роль\">\n      <option value=\"Дилер\" label=\"Дилер\"/>\n    </item>\n  </item>\n\n  <item type=\"radio\" name=\"type\" labelWidth=\"auto\" position=\"label-right\" value=\"auth\" label=\"Есть учетная запись\">\n    <item type=\"input\" value=\"\" name=\"login\" label=\"Логин\" validate=\"NotEmpty\" />\n    <item type=\"password\" value=\"\" name=\"password\" label=\"Пароль\" validate=\"NotEmpty\" />\n  </item>\n\n  <item type=\"button\" value=\"Войти\" name=\"submit\"/>\n\n  <item type=\"template\" name=\"text_options\" className=\"order_dealer_options\" inputWidth=\"170\"\n        value=\"&lt;a href='#' onclick='$p.iface.open_settings();' title='Страница настроек программы' &gt; &lt;i class='fa fa-cog fa-lg'&gt;&lt;/i&gt; Настройки &lt;/a&gt; &lt;a href='https://github.com/oknosoft/windowbuilder/issues' target='_blank' style='margin-left: 9px;' title='Задать вопрос через форму обратной связи' &gt; &lt;i class='fa fa-question-circle fa-lg'&gt;&lt;/i&gt; Вопрос &lt;/a&gt;\"  />\n\n</item>\n</items>\n","tree_balance.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"doc.debit_cash_order\" text=\"Приходный кассовый ордер\" select=\"1\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.credit_card_order\" text=\"Оплата от покупателя платежной картой\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.debit_bank_order\" text=\"Платежное поручение входящее\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"doc.selling\" text=\"Реализация товаров и услуг\"><icons file=\"icon_1c_doc\" /></item>\r\n</tree>\r\n","tree_events.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.stores\" text=\"Склады\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.divisions\" text=\"Подразделения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"doc.work_centers_performance\" select=\"1\" text=\"Мощности рабочих центров\"><icons file=\"icon_1c_doc\" /></item>\r\n    <!--\r\n    <item id=\"doc.planning_event\" text=\"Событие планирования\"><icons file=\"icon_1c_doc\" /></item>\r\n    -->\r\n</tree>\r\n","tree_filteres.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<tree id=\"0\">\n    <item id=\"draft\" text=\"Черновики\" select=\"1\" tooltip=\"Предварительные расчеты\"><icons file=\"fa-pencil\" /></item>\n    <item id=\"sent\" text=\"Отправлено\" tooltip=\"Отправленные, но еще не принятые в работу. Могут быть отозваны (переведены в 'черновики')\"><icons file=\"fa-paper-plane-o\" /></item>\n    <item id=\"confirmed\" text=\"Согласовано\" tooltip=\"Включены в план производства. Могут быть изменены менеджером. Недоступны для изменения дилером\"><icons file=\"fa-thumbs-o-up\" /></item>\n    <item id=\"declined\" text=\"Отклонено\" tooltip=\"Не приняты в работу по техническим причинам. Требуется изменение конструктива или комплектации\"><icons file=\"fa-thumbs-o-down\" /></item>\n\n    <!--item id=\"execution\" text=\"Долги\" tooltip=\"Оплата, отгрузка\"><icons file=\"fa-money\" /></item>\n    <item id=\"plan\" text=\"План\" tooltip=\"Согласованы, но еще не запущены в работу\"><icons file=\"fa-calendar-check-o\" /></item>\n    <item id=\"underway\" text=\"В работе\" tooltip=\"Включены в задания на производство, но еще не изготовлены\"><icons file=\"fa-industry\" /></item>\n    <item id=\"manufactured\" text=\"Изготовлено\" tooltip=\"Изготовлены, но еще не отгружены\"><icons file=\"fa-gavel\" /></item>\n    <item id=\"executed\" text=\"Исполнено\" tooltip=\"Отгружены клиенту\"><icons file=\"fa-truck\" /></item -->\n\n    <item id=\"service\" text=\"Сервис\" tooltip=\"Сервисное обслуживание\"><icons file=\"fa-medkit\" /></item>\n    <item id=\"complaints\" text=\"Рекламации\" tooltip=\"Жалобы и рекламации\"><icons file=\"fa-frown-o\" /></item>\n\n    <item id=\"template\" text=\"Шаблоны\" tooltip=\"Типовые блоки\"><icons file=\"fa-puzzle-piece\" /></item>\n    <item id=\"zarchive\" text=\"Архив\" tooltip=\"Старые заказы\"><icons file=\"fa-archive\" /></item>\n    <item id=\"all\" text=\"Все\" tooltip=\"Отключить фильтрацию\"><icons file=\"fa-expand\" /></item>\n</tree>\n","tree_industry.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.nom_kinds\" text=\"Виды номенклатуры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_groups\" text=\"Номенклатурные группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom\" text=\"Номенклатура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.production_params\" text=\"Параметры продукции\" select=\"1\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.cnns\" text=\"Соединения\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.inserts\" text=\"Вставки\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.furns\" text=\"Фурнитура\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.clrs\" text=\"Цвета\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.color_price_groups\" text=\"Цвето-ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.params_links\" text=\"Связи параметров\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.elm_visualization\" text=\"Визуализация элементов\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.insert_bind\" text=\"Привязки вставок\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.formulas\" text=\"Формулы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cch.properties\" text=\"Дополнительные реквизиты\"><icons file=\"icon_1c_cch\" /></item>\r\n</tree>\r\n","tree_price.xml":"<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n<tree id=\"0\">\r\n    <item id=\"cat.users\" text=\"Пользователи\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.individuals\" text=\"Физические лица\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.organizations\" text=\"Организации\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.partners\" text=\"Контрагенты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.contracts\" text=\"Договоры\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.nom_prices_types\" text=\"Виды цен\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.price_groups\" text=\"Ценовые группы\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"cat.currencies\" text=\"Валюты\"><icons file=\"icon_1c_cat\" /></item>\r\n    <item id=\"ireg.currency_courses\" text=\"Курсы валют\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"ireg.margin_coefficients\" text=\"Маржинальные коэффициенты\"><icons file=\"icon_1c_ireg\" /></item>\r\n    <item id=\"doc.nom_prices_setup\" text=\"Установка цен номенклатуры\" select=\"1\"><icons file=\"icon_1c_doc\" /></item>\r\n    <item id=\"cch.predefined_elmnts\" text=\"Константы и списки\"><icons file=\"icon_1c_cch\" /></item>\r\n\r\n</tree>\r\n","view_blank.html":"<!DOCTYPE html>\r\n<html lang=\"ru\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"/>\r\n    <title>Документ</title>\r\n    <style>\r\n\r\n        html {\r\n            width: 100%;\r\n            height: 100%;\r\n            margin: 0;\r\n            padding: 0;\r\n            overflow: auto;\r\n\r\n        }\r\n        body {\r\n            width: 210mm;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n            overflow: hidden;\r\n            color: rgb(48, 57, 66);\r\n            font-family: Arial, sans-serif;\r\n            font-size: 11pt;\r\n            text-rendering: optimizeLegibility;\r\n        }\r\n\r\n        /* Таблица */\r\n        table.border {\r\n            border-collapse: collapse; border: 1px solid;\r\n        }\r\n        table.border > tbody > tr > td,\r\n        table.border > tr > td,\r\n        table.border th{\r\n            border: 1px solid;\r\n        }\r\n        .noborder{\r\n            border: none;\r\n        }\r\n\r\n        /* Многоуровневый список */\r\n        ol {\r\n            counter-reset: li;\r\n            list-style: none;\r\n            padding: 0;\r\n        }\r\n        li {\r\n            margin-top: 8px;\r\n        }\r\n        li:before {\r\n            counter-increment: li;\r\n            content: counters(li,\".\") \".\";\r\n            padding-right: 8px;\r\n        }\r\n        li.flex {\r\n            display: flex;\r\n            text-align: left;\r\n            list-style-position: outside;\r\n            font-weight: normal;\r\n        }\r\n\r\n        .container {\r\n            width: 100%;\r\n            position: relative;\r\n        }\r\n\r\n        .margin-top-20 {\r\n            margin-top: 20px;\r\n        }\r\n\r\n        .column-50-percent {\r\n            width: 48%;\r\n            min-width: 40%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .column-30-percent {\r\n            width: 31%;\r\n            min-width: 30%;\r\n            float: left;\r\n            padding: 8px;\r\n        }\r\n\r\n        .block-left {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        .block-center {\r\n            display: block;\r\n            margin-left: auto;\r\n            margin-right: auto;\r\n        }\r\n\r\n        .block-right {\r\n            display: block;\r\n            float: right;\r\n        }\r\n\r\n        .list-center {\r\n            text-align: center;\r\n            list-style-position: inside;\r\n            font-weight: bold;\r\n        }\r\n\r\n        .clear-both {\r\n            clear: both;\r\n        }\r\n\r\n        .small {\r\n            font-size: small;\r\n        }\r\n\r\n        .text-center {\r\n            text-align: center;\r\n        }\r\n\r\n        .text-justify {\r\n            text-align: justify;\r\n        }\r\n\r\n        .text-right {\r\n            text-align: right;\r\n        }\r\n\r\n        .muted-color {\r\n            color: #636773;\r\n        }\r\n\r\n        .accent-color {\r\n            color: #f30000;\r\n        }\r\n\r\n        .note {\r\n            background: #eaf3f8;\r\n            color: #2980b9;\r\n            font-style: italic;\r\n            padding: 12px 20px;\r\n        }\r\n\r\n        .note:before {\r\n            content: 'Замечание: ';\r\n            font-weight: 500;\r\n        }\r\n        *, *:before, *:after {\r\n            box-sizing: inherit;\r\n        }\r\n\r\n    </style>\r\n</head>\r\n<body>\r\n\r\n</body>\r\n</html>","view_settings.html":"<div class=\"md_column1300\">\r\n\r\n    <div class=\"md_column320\" name=\"form1\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n    <div class=\"md_column320\" name=\"form2\" style=\"max-width: 400px;\"><div></div></div>\r\n\r\n</div>"});
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
    .then((res) => {
      if(res) {
        o = res.o;
        wnd = res.wnd;
        return res;
      }
    });
};


(function({cat: {characteristics}, wsql, CatCharacteristics, utils, enm, doc, job_prm, iface}){

  const {prototype} = characteristics.constructor;
	let selection_block, wnd;

	class SelectionBlock {

	  constructor() {

	    this._obj = {
        calc_order: wsql.get_user_param('template_block_calc_order')
      }

      this._meta = Object.assign(utils._clone(characteristics.metadata()), {
        form: {
          selection: {
            fields: ['presentation', 'svg'],
            cols: [
              {id: 'presentation', width: '320', type: 'ro', align: 'left', sort: 'na', caption: 'Наименование'},
              {id: 'svg', width: '*', type: 'rsvg', align: 'left', sort: 'na', caption: 'Эскиз'}
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
        value_mgr: characteristics.value_mgr,
        class_name: 'dp.fake'
      }
    }

    get calc_order() {
      return CatCharacteristics.prototype._getter.call(this, 'calc_order');
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

      if(!utils.is_empty_guid(_obj.calc_order) && wsql.get_user_param('template_block_calc_order') != _obj.calc_order) {
        const tmp = doc.calc_order.by_ref[_obj.calc_order];
        tmp && tmp.obj_delivery_state === enm.obj_delivery_states.Шаблон && wsql.set_user_param('template_block_calc_order', _obj.calc_order);
      }
    }

  }

  characteristics.form_selection_block = function(pwnd, attr = {}){

		if(!selection_block){
			selection_block = new SelectionBlock();
		}
    selection_block.attr = attr;

		if(job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())){
			job_prm.builder.base_block.some((o) => {
				selection_block.calc_order = o;
				return true;
			});
		}

    attr.initial_value = wsql.get_user_param('template_block_initial_value');

		attr.metadata = selection_block._meta;

		attr.custom_selection = function (attr) {
			const ares = [], crefs = [];
			let calc_order;

      attr.selection.some((o) => {
        if(Object.keys(o).indexOf('calc_order') != -1) {
          calc_order = o.calc_order;
          return true;
        }
      });

			return doc.calc_order.get(calc_order, true, true)
				.then((o) => {

					o.production.forEach(({characteristic}) => {
						if(!characteristic.empty()){
							if(characteristic.is_new()){
                crefs.push(characteristic.ref);
              }
							else{
                if(!characteristic.calc_order.empty() && characteristic.coordinates.count()) {
                  if(characteristic.svg) {
                    ares.push(characteristic);
                  }
                  else {
                    crefs.push(characteristic.ref);
                  }
                }
							}
						}
					});
					return crefs.length ? characteristics.adapter.load_array(characteristics, crefs, false, characteristics.adapter.local.templates) : crefs;
				})
				.then(() => {

					crefs.forEach((o) => {
						o = characteristics.get(o, false, true);
						if(o && !o.calc_order.empty() && o.coordinates.count()){
							ares.push(o);
						}
					});

					crefs.length = 0;
					ares.forEach((o) => {
            const presentation = ((o.calc_order_row && o.calc_order_row.note) || o.note || o.name) + '<br />' + o.owner.name;
						if(!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase()))
							crefs.push({
								ref: o.ref,
                presentation:   '<div style="white-space:normal"> ' + presentation + ' </div>',
								svg: o.svg || ''
							});
					});

					return Promise.all(ares);

				})
				.then(() => iface.data_to_grid.call(characteristics, crefs, attr));

		};

		wnd = prototype.form_selection.call(this, pwnd, attr);

		const {toolbar, filter} = wnd.elmnts;
    'btn_new,btn_edit,btn_delete,bs_print,bs_create_by_virtue,bs_go_to'.split(',').forEach(name => toolbar.hideItem(name));

    const fdiv = filter.add_filter({text: 'Расчет', name: 'calc_order'}).custom_selection.calc_order.parentNode;
		fdiv.removeChild(fdiv.firstChild);

    filter.custom_selection.calc_order = new iface.OCombo({
			parent: fdiv,
			obj: selection_block,
			field: "calc_order",
			width: 220,
			get_option_list: (selection, val) => new Promise((resolve, reject) => {

			  setTimeout(() => {
          const l = [];
          const {base_block, branch_filter} = job_prm.builder;

          base_block.forEach(({note, presentation, ref, production}) => {
            if(branch_filter && branch_filter.sys && branch_filter.sys.length && production.count()) {
              const {characteristic} = production.get(0);
              if(!branch_filter.sys.some((filter) => characteristic.sys._hierarchy(filter))){
                return;
              }
            }
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

        }, job_prm.builder.base_block ? 0 : 1000);
			})
		});
    filter.custom_selection.calc_order.getBase().style.border = "none";

		return wnd;
	};


})($p);




Object.defineProperties($p.cat.divisions, {
  get_option_list: {
    value(selection, val) {
      const list = [];
      $p.current_user.acl_objs.find_rows({type: "cat.divisions"}, ({acl_obj}) => {
        if(acl_obj && list.indexOf(acl_obj) == -1){
          list.push(acl_obj);
          acl_obj._children().forEach((o) => list.indexOf(o) == -1 && list.push(o));
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
    },
    writable: true
  }
});

Object.defineProperties($p.cat.furns, {

  sql_selection_list_flds: {
    value(initial_value){
      return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
    }
  },

  get_option_list: {
    value(selection, val) {

      if(window.paper && paper.project) {
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
      }

      return this.constructor.prototype.get_option_list.call(this, selection, val);
    },
    configurable: true
  }

});



$p.doc.calc_order.form_list = function(pwnd, attr, handlers){

	if(!attr){
		attr = {
			hide_header: true,
			date_from: moment().subtract(2, 'month').toDate(),
			date_till: moment().add(1, 'month').toDate(),
			on_new: (o) => {
        handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
			},
			on_edit: (_mgr, ref) => {
        handlers.handleNavigate(`/${_mgr.class_name}/${ref}`);
			}
		};
	}

  return new Promise((resolve, reject) => {

    attr._index = {
      ddoc: ['mango_calc_order', 'list'],
      fields: ['department', 'state', 'date', 'search']
    };

    attr.on_create = (wnd) => {

      const {elmnts} = wnd;

      wnd.dep_listener = (obj, fields) => {
        if(obj == dp && fields.department){
          elmnts.filter.call_event();
          $p.wsql.set_user_param('current_department', dp.department.ref);
        }
      }

      if(handlers){
        const {custom_selection} = elmnts.filter;
        custom_selection._state = handlers.props.state_filter;
        custom_selection.class_name = 'doc.calc_order';
        handlers.onProps = (props) => {
          if(custom_selection._state != props.state_filter){
            custom_selection._state = props.state_filter;
            elmnts.filter.call_event();
          }
          if(elmnts.toolbar) {
            if(custom_selection._state === 'draft') {
              elmnts.toolbar.enableItem('btn_delete');
            }
            else {
              elmnts.toolbar.disableItem('btn_delete');
            }
          }
        }

        wnd.handleNavigate = handlers.handleNavigate;
        wnd.handleIfaceState = handlers.handleIfaceState;
      }

      const dp = $p.dp.builder_price.create();
      const pos = elmnts.toolbar.getPosition('input_filter');


      const txt_id = `txt_${dhx4.newId()}`;
      elmnts.toolbar.addText(txt_id, pos, '');
      const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
      const dep = new $p.iface.OCombo({
        parent: txt_div,
        obj: dp,
        field: 'department',
        width: 180,
        hide_frm: true,
      });
      txt_div.style.border = '1px solid #ccc';
      txt_div.style.borderRadius = '3px';
      txt_div.style.padding = '3px 2px 1px 2px';
      txt_div.style.margin = '1px 5px 1px 1px';
      dep.DOMelem_input.placeholder = 'Подразделение';

      dp._manager.on('update', wnd.dep_listener);

      const set_department = $p.DocCalc_order.set_department.bind(dp);
      set_department();
      if(!$p.wsql.get_user_param('couch_direct')){
        $p.md.once('user_log_in', set_department);
      }

      elmnts.filter.disable_timer = true;
      elmnts.filter.custom_selection.__define({
        department: {
          get() {
            const {department} = dp;
            return this._state == 'template' ? {$eq: $p.utils.blank.guid} : {$eq: department.ref};
          },
          enumerable: true
        },
        state: {
          get(){
            return this._state == 'all' ? {$in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',')} : {$eq: this._state};
          },
          enumerable: true
        },

        _sort: {
          get() {
            return [{department: 'desc'}, {state: 'desc'}, {date: 'desc'}];
          }
        },

        _index: {
          get() {
            const {filter, date_till} = elmnts.filter.get_filter();
            if(filter.length === 11 && filter.replace(/\D/g, '').length > 5) {
              const {doc} = $p.adapters.pouch.local;
              return doc.query('doc/number_doc', {
                include_docs: true,
                key: ['doc.calc_order', date_till.getFullYear(), filter]
              })
                .then(({rows}) => {
                  return rows.length ? {rows} : doc.query('doc/number_doc', {
                    include_docs: true,
                    key: ['doc.calc_order', date_till.getFullYear() - 1, filter]
                  })
                })
                .then(({rows}) => {
                  return {docs: rows.map((v) => v.doc)};
                });
            }
            return attr._index;
          }
        },

      });

      elmnts.status_bar = wnd.attachStatusBar();
      elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar,
        (ref, dbl) => {
          dbl && handlers.handleNavigate(`/builder/${ref}`);
        });
      elmnts.grid.attachEvent('onRowSelect', (rid) => elmnts.svgs.reload(rid));

      wnd.attachEvent('onClose', (win) => {
        dep && dep.unload();
        return true;
      });

      attr.on_close = () => {
        elmnts.svgs && elmnts.svgs.unload();
        dep && dep.unload();
      }



      attr.toolbar_click = function toolbar_click(btn_id) {
        switch (btn_id) {

        case 'calc_order':
          const ref = wnd.elmnts.grid.getSelectedRowId();
          if(ref) {
            const {calc_order} = $p.doc;
            handlers.handleIfaceState({
              component: '',
              name: 'repl',
              value: {root: {title: 'Длительная операция', text: 'Копирование и пересчет заказа'}},
            });
            handlers.handleNavigate(`/waiting`);
            calc_order.clone(ref)
              .then((doc) => {
                handlers.handleNavigate(`/${calc_order.class_name}/${doc.ref}`);
              })
              .catch($p.record_log);
            ;
          }
          else {
            $p.msg.show_msg({
              type: 'alert-warning',
              text: $p.msg.no_selected_row.replace('%1', ''),
              title: $p.msg.main_title
            });
          }
          break;

        case 'btn_download':
        case 'btn_share':
        case 'btn_inbox':
          $p.dp.buyers_order.open_component(wnd, {
            ref: wnd.elmnts.grid.getSelectedRowId(),
            cmd: btn_id
          }, handlers, 'PushUtils', 'CalcOrderList');
          break;

        }
      }

      resolve(wnd);
    }

    attr.toolbar_struct = $p.injected_data['toolbar_calc_order_selection.xml'];



    return this.mango_selection(pwnd, attr);

  });

};



(function ($p) {

  const _mgr = $p.doc.calc_order;
  let _meta_patched;

  _mgr.form_obj = function (pwnd, attr, handlers) {

    let o, wnd;

    if(!_meta_patched) {
      (function (source, user) {
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

        if(user.role_available('СогласованиеРасчетовЗаказов') || user.role_available('РедактированиеЦен') || user.role_available('РедактированиеСкидок')) {
          source.types = 'cntr,ref,ref,txt,ro,ro,ro,ro,calck,ref,calck,calck,ro,calck,calck,ro';
        }
        else {
          source.types = 'cntr,ref,ref,txt,ro,ro,ro,ro,calck,ref,ro,calck,ro,calck,calck,ro';
        }

        _meta_patched = true;

      })($p.doc.calc_order.metadata().form.obj.tabular_sections.production, $p.current_user);
    }

    attr.draw_tabular_sections = (o, wnd, tabular_init) => {

      const refs = [];
      o.production.forEach((row) => {
        if(!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new()) {
          refs.push(row._obj.characteristic);
        }
      });
      const {cat: {characteristics}, enm: {obj_delivery_states}} = $p;
      characteristics.adapter.load_array(characteristics, refs, false,
          o.obj_delivery_state == obj_delivery_states.Шаблон && characteristics.adapter.local.templates)
        .then(() => {

          const footer = {
            columns: ",,,,#stat_total,,,#stat_s,,,,,#stat_total,,,#stat_total",
            _in_header_stat_s: function(tag,index,data){
              const calck=function(){
                let sum=0;
                o.production.forEach((row) => {
                  sum += row.s * row.quantity;
                });
                return sum.toFixed(2);
              }
              this._stat_in_header(tag,calck,index,data);
            }
          }

          tabular_init('production', $p.injected_data['toolbar_calc_order_production.xml'], footer);
          const {production} = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent('onRowSelect', production_select);
          production.attachEvent('onEditCell', (stage,rId,cInd,nValue,oValue,fake) => {
            if(stage == 2 && fake !== true){
              if(production._edit_timer){
                clearTimeout(production._edit_timer);
              }
              production._edit_timer = setTimeout(() => {
                if(wnd && wnd.elmnts){
                  production.callEvent('onEditCell', [2, 0, 7, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 12, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 15, null, null, true]);
                }
              }, 300);
            }
          });

          let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
          toolbar.addSpacer('btn_delete');
          toolbar.attachEvent('onclick', toolbar_click);

          tabular_init('planning');
          toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
          toolbar.addButton('btn_fill_plan', 3, 'Заполнить');
          toolbar.attachEvent('onclick', toolbar_click);

          set_editable(o, wnd);

        });

      wnd.elmnts.statusbar = wnd.attachStatusBar();
      wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
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
          ' ': [
            {id: 'number_doc', path: 'o.number_doc', synonym: 'Номер', type: 'ro'},
            {id: 'date', path: 'o.date', synonym: 'Дата', type: 'ro', txt: moment(o.date).format(moment._masks.date_time)},
            'number_internal'
          ],
          'Контактная информация': [
            'partner',
            {id: 'client_of_dealer', path: 'o.client_of_dealer', synonym: 'Клиент дилера', type: 'client'},
            'phone',
            {id: 'shipping_address', path: 'o.shipping_address', synonym: 'Адрес доставки', type: 'addr'}
          ],
          'Дополнительные реквизиты': [
            'obj_delivery_state',
            'category',
            {id: 'manager', path: 'o.manager', synonym: 'Автор', type: 'ro'},
            'leading_manager'
          ]
        }
      });
      wnd.elmnts.pg_left.xcell_action = function (component, fld) {
        $p.dp.buyers_order.open_component(wnd, {
          ref: o.ref,
          cmd: fld,
          _mgr: _mgr,
        }, handlers, component);
      }


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
          'Итоги': [{id: 'doc_currency', path: 'o.doc_currency', synonym: 'Валюта документа', type: 'ro', txt: o['doc_currency'].toString()},
            {id: 'doc_amount', path: 'o.doc_amount', synonym: 'Сумма', type: 'ron', txt: o['doc_amount']},
            {id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма внутр', type: 'ron', txt: o['amount_internal']}]
        }
      });

      wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
      wnd.elmnts.cell_note.hideHeader();
      wnd.elmnts.cell_note.setHeight(100);
      wnd.elmnts.cell_note.attachHTMLString(`<textarea placeholder='Комментарий к заказу' class='textarea_editor'>${o.note}</textarea>`);

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
          if(handlers) {
            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          (o._data._reload ? o.load() : Promise.resolve())
            .then(() => {
              if(o._data._reload) {
                delete o._data._reload;
                _mgr.emit_async('rows', o, {'production': true});
              }
              return o.load_production();
            })
            .then(() => {
              rsvg_reload();
              o._manager.on('svgs', rsvg_reload);

              const search = $p.job_prm.parse_url_str(location.search);
              if(search.ref) {
                setTimeout(() => {
                  wnd.elmnts.tabs.tab_production && wnd.elmnts.tabs.tab_production.setActive();
                  rsvg_click(search.ref, 0);
                }, 200);
              };
            })
            .catch(() => {
              delete o._data._reload;
            });

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
      $p.doc.calc_order.off('svgs', rsvg_reload);
    }

    function production_select(id, ind) {
      const row = o.production.get(id - 1);
      const {svgs, grids: {production}} = wnd.elmnts;
      wnd.elmnts.svgs.select(row.characteristic.ref);

      if(production.columnIds[ind] === 'price') {
        const {current_user, CatParameters_keys, utils, enm: {comparison_types, parameters_keys_applying}} = $p;
        if(current_user.role_available('СогласованиеРасчетовЗаказов') || current_user.role_available('РедактированиеЦен')) {
          production.cells(id, ind).setDisabled(false);
        }
        else {
          const {nom} = row;
          let disabled = true;
          current_user.acl_objs.forEach(({acl_obj}) => {
            if(acl_obj instanceof CatParameters_keys && acl_obj.applying == parameters_keys_applying.Ценообразование) {
              acl_obj.params.forEach(({value, comparison_type}) => {
                if(utils.check_compare(nom, value, comparison_type, comparison_types)) {
                  return disabled = false;
                }
              });
              if(!disabled) {
                return disabled;
              }
            }
          });
          production.cells(id, ind).setDisabled(disabled);
        }
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

      case 'btn_reload':
        reload();
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
        $p.dp.buyers_order.open_component(wnd, o, handlers, 'CalcOrderAdditionsExt');
        break;

      case 'btn_additions':
        $p.dp.buyers_order.open_component(wnd, o, handlers, 'CalcOrderAdditions');
        break;

      case 'btn_share':
        $p.dp.buyers_order.open_component(wnd, {ref: o.ref, cmd: btn_id}, handlers, 'PushUtils');
        break;

      case 'btn_add_material':
        add_material();
        break;

      case 'btn_edit':
        open_builder();
        break;

      case 'btn_recalc_row':
        recalc('row');
        break;

      case 'btn_recalc_doc':
        recalc('doc');
        break;

      case 'btn_spec':
        open_spec();
        break;

      case 'btn_discount':
        show_discount();
        break;

      case 'btn_calendar':
        calendar_new_event();
        break;

      case 'btn_go_connection':
        go_connection();
        break;

      case 'calc_order':
        clone_calc_order(o);
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

    function clone_calc_order(o) {
      const {_manager} = o;
      if(o._modified) {
        return $p.msg.show_msg({
          title: o.presentation,
          type: 'alert-warning',
          text: 'Документ изменён.<br />Перед созданием копии сохраните заказ'
        });
      };
      handlers.handleIfaceState({
        component: '',
        name: 'repl',
        value: {root: {title: 'Длительная операция', text: 'Копирование и пересчет заказа'}},
      });
      handlers.handleNavigate(`/waiting`);
      _manager.clone(o)
        .then((doc) => {
          handlers.handleNavigate(`/${_manager.class_name}/${doc.ref}`);
        })
        .catch((err) => {
          $p.record_log(err);
          handlers.handleNavigate(`/`);
        });
    }

    function show_discount() {

      if(!wnd.elmnts.discount) {
        wnd.elmnts.discount = $p.dp.buyers_order.create();
      }
      refill_discount(wnd.elmnts.discount);

      const discount = $p.iface.dat_blank(null, {
        width: 300,
        height: 220,
        allow_close: true,
        allow_minmax: false,
        caption: 'Скидки по группам'
      });
      discount.setModal(true);

      discount.attachTabular({
        obj: wnd.elmnts.discount,
        ts: 'charges_discounts',
        reorder: false,
        disable_add_del: true,
        toolbar_struct: $p.injected_data['toolbar_discounts.xml'],
        ts_captions: {
          'fields': ['nom_kind', 'discount_percent'],
          'headers': 'Группа,Скидка',
          'widths': '*,80',
          'min_widths': '120,70',
          'aligns': '',
          'sortings': 'na,na',
          'types': 'ro,calck'
        },
      });
      const toolbar = discount.getAttachedToolbar();
      toolbar.attachEvent('onclick', (btn) => {
        wnd.elmnts.discount._mode = btn;
        refill_discount(wnd.elmnts.discount);
        toolbar.setItemText('bs', toolbar.getListOptionText('bs', btn));
      });
      if(wnd.elmnts.discount._disable_internal) {
        toolbar.disableListOption('bs', 'discount_percent');
      }
      toolbar.setItemText('bs', toolbar.getListOptionText('bs', wnd.elmnts.discount._mode));
    }

    function refill_discount(dp) {

      if(!dp._mode) {
        dp._disable_internal = !$p.current_user.role_available('РедактированиеСкидок');
        dp._mode = dp._disable_internal ? 'discount_percent_internal' : 'discount_percent';
        dp._calc_order = o;
      }

      const {charges_discounts} = dp;
      const groups = new Set();
      dp._data._loading = true;
      charges_discounts.clear();
      o.production.forEach((row) => {
        const group = {nom_kind: row.nom.nom_kind};
        if(!groups.has(group.nom_kind)) {
          groups.add(group.nom_kind);
          charges_discounts.add(group);
        }
        charges_discounts.find_rows(group, (sub) => {
          const percent = row[dp._mode];
          if(percent > sub.discount_percent) {
            sub.discount_percent = percent;
          }
        });
      });
      dp._data._loading = false;
      dp._manager.emit_async('rows', dp, {'charges_discounts': true});
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

    function reload() {
      o && o.load()
        .then(() => o.load_production(true))
        .then(() => {
          const {pg_left, pg_right, grids} = wnd.elmnts;
          pg_left.reload();
          pg_right.reload();
          grids.production.selection = grids.production.selection;
          wnd.set_text();
        });
    }

    function save(action) {

      const {msg, enm} = $p;

      function do_save(post) {

        if(!wnd.elmnts.ro) {
          o.note = wnd.elmnts.cell_note.cell.querySelector('textarea').value.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '').replace(/&.{2,6};/g, '');
          wnd.elmnts.pg_left.selectRow(0);
        }

        o.save(post)
          .then(() => {
            if(action == 'sent' || action == 'close') {
              close();
            }
            else {
              wnd.set_text();
              set_editable(o, wnd);
            }
          })
          .catch((err) => {
            if(err._rev) {
              dhtmlx.confirm({
                title: o.presentation,
                text: err.message + '<div style="text-align: left;padding-top: 16px;">Ваши правки потеряны, можно закрыть форму либо прочитать актуальную версию заказа с сервера</div>',
                cancel: 'Прочитать',
                callback: (btn) => {
                  btn === false && reload();
                }
              });
            }
            else {
              msg.show_msg({
                type: 'alert-warning',
                text: err.message || err,
                title: o.presentation
              });
            }
          });
      }

      switch (action) {
      case 'sent':
        dhtmlx.confirm({
          title: msg.order_sent_title,
          text: msg.order_sent_message,
          cancel: msg.cancel,
          callback: function (btn) {
            if(btn) {
              o.obj_delivery_state = enm.obj_delivery_states.Отправлен;
              do_save();
            }
          }
        });
        break;

      case 'retrieve':
        o.obj_delivery_state = enm.obj_delivery_states.Отозван;
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


      ['vault', 'vault_pop', 'discount', 'svgs', 'layout_header'].forEach((elm) => {
        wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
      });

      return true;
    }

    function set_editable(o, wnd) {

      const {pg_left, pg_right, frm_toolbar, grids, tabs} = wnd.elmnts;

      pg_right.cells('vat_consider', 1).setDisabled(true);
      pg_right.cells('vat_included', 1).setDisabled(true);

      const ro = wnd.elmnts.ro = o.is_read_only;
      const {enm: {obj_delivery_states: {Отправлен, Отклонен, Шаблон}}, current_user} = $p;

      const retrieve_enabed = !o._deleted &&
        (o.obj_delivery_state == Отправлен || o.obj_delivery_state == Отклонен);

      grids.production.setEditable(!ro);
      grids.planning.setEditable(!ro);
      pg_left.setEditable(!ro);
      pg_right.setEditable(!ro);

      if(!current_user.role_available('СогласованиеРасчетовЗаказов')) {
        frm_toolbar.hideItem('btn_post');
        frm_toolbar.hideItem('btn_unpost');
      }

      if(!current_user.role_available('ИзменениеТехнологическойНСИ') && !current_user.role_available('СогласованиеРасчетовЗаказов')) {
        pg_left.cells('obj_delivery_state', 1).setDisabled(true);
      }

      if(ro) {
        frm_toolbar.disableItem('btn_sent');
        frm_toolbar.disableItem('btn_save');
        frm_toolbar.disableItem('btn_save_close');
        let toolbar;
        const disable = (itemId) => toolbar.disableItem(itemId);
        toolbar = tabs.tab_production.getAttachedToolbar();
        toolbar.forEachItem(disable);
        toolbar = tabs.tab_planning.getAttachedToolbar();
        toolbar.forEachItem(disable);
      }
      else {
        if(o.obj_delivery_state == Шаблон) {
          frm_toolbar.disableItem('btn_sent');
        }
        else {
          frm_toolbar.enableItem('btn_sent');
        }
        frm_toolbar.enableItem('btn_save');
        frm_toolbar.enableItem('btn_save_close');
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
      const {msg} = $p;
      msg.show_msg({
        title: msg.bld_title,
        type: 'alert-error',
        text: msg.bld_not_product
      });
    }

    function recalc(mode) {
      if(mode == 'row') {
        const selId = production_get_sel_index();
        if(selId == undefined) {
          return not_production();
        }
        const row = o.production.get(selId);
        if(row) {
          const {owner, calc_order} = row.characteristic;
          let ox;
          if(row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
            return not_production();
          }
          else if(row.characteristic.coordinates.count() == 0) {
            if(row.characteristic.leading_product.calc_order == calc_order) {
              ox = row.characteristic.leading_product;
            }
          }
          else {
            ox = row.characteristic;
          }
          if(ox) {
            wnd.progressOn();
            ox.recalc()
              .catch((err) => {
                $p.msg.show_msg({
                  title: $p.msg.bld_title,
                  type: 'alert-error',
                  text: err.stack || err.message
                });
              })
              .then(() => wnd.progressOff());
          }
        }
      }
      else {
        wnd.progressOn();
        o.recalc({save: true})
          .catch((err) => {
            $p.msg.show_msg({
              title: $p.msg.bld_title,
              type: 'alert-error',
              text: err.stack || err.message
            });
          })
          .then(() => {
            wnd.progressOff();
            wnd.set_text();
          });
      }
    }

    function open_builder(create_new) {

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
                    'ref,name,calc_order,product,leading_product,leading_elm,origin,note,partner'.split(','), true);

                  if(calc_order.refill_props) {
                    characteristic._data.refill_props = true;
                  }

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

    function rsvg_reload() {
      o && wnd && wnd.elmnts && wnd.elmnts.svgs && wnd.elmnts.svgs.reload(o);
    }

    function rsvg_click(ref, dbl) {
      const {production} = wnd.elmnts.grids;
      production && o.production.find_rows({characteristic: ref}, (row) => {
        production.selectRow(row.row - 1, dbl === 0);
        dbl && open_builder();
        return false;
      });
    }

    function add_material() {
      const {production} = wnd.elmnts.grids;
      const row = o.create_product_row({grid: production}).row - 1;
      setTimeout(() => {
        production.selectRow(row);
        production.selectCell(row, production.getColIndexById('nom'), false, true, true);
        production.cells().open_selection();
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



((_mgr) => {

  const {form, tabular_sections} = _mgr.metadata();
  tabular_sections.production.fields.characteristic._option_list_local = true;

  form.client_of_dealer = {
    fields: {
      surname: {
        synonym: 'Фамилия',
        mandatory: true,
        type: {types: ['string'], str_len: 50}
      },
      name: {
        synonym: 'Имя',
        mandatory: true,
        type: {types: ['string'], str_len: 50}
      },
      patronymic: {
        synonym: 'Отчество',
        type: {types: ['string'], str_len: 50}
      },
      passport_serial_number: {
        synonym: 'Серия и номер паспорта',
        tooltip: 'Серия и номер через пробел',
        type: {types: ['string'], str_len: 20}
      },
      passport_date: {
        synonym: 'Дата выдачи паспорта',
        type: {types: ['string'], str_len: 20}
      },
      note: {
        synonym: 'Дополнительно',
        multiline_mode: true,
        type: {types: ['string'], str_len: 0}
      }
    },
    obj: {
      items: [
        {
          element: 'FormGroup',
          row: true,
          items: [
            {
              element: 'FormGroup',
              items: [
                {
                  element: 'DataField',
                  fld: 'surname',
                },
                {
                  element: 'DataField',
                  fld: 'name',
                },
                {
                  element: 'DataField',
                  fld: 'patronymic',
                },
              ]
            },
            {
              element: 'FormGroup',
              items: [
                {
                  element: 'DataField',
                  fld: 'passport_serial_number',
                },
                {
                  element: 'DataField',
                  fld: 'passport_date',
                },
                {
                  element: 'DataField',
                  fld: 'note',
                },
              ]
            }
          ]
        }
      ]
    },
    selection: {
      indexes: [
        {
          mango: false,
          name: ''
        }
      ]
    }
  };

  _mgr._destinations_condition = {predefined_name: {in: ['Документ_Расчет', 'Документ_ЗаказПокупателя']}};

  _mgr.build_search = function (tmp, obj) {

    const {number_internal, client_of_dealer, partner, note} = obj;

    tmp.search = (obj.number_doc +
      (number_internal ? ' ' + number_internal : '') +
      (client_of_dealer ? ' ' + client_of_dealer : '') +
      (partner.name ? ' ' + partner.name : '') +
      (note ? ' ' + note : '')).toLowerCase();
  };

  _mgr.load_templates = async function () {

    if(!$p.job_prm.builder) {
      $p.job_prm.builder = {};
    }
    if(!$p.job_prm.builder.base_block) {
      $p.job_prm.builder.base_block = [];
    }
    if(!$p.job_prm.pricing) {
      $p.job_prm.pricing = {};
    }

    const {base_block} = $p.job_prm.builder;
    $p.cat.production_params.forEach((o) => {
      if(!o.is_folder) {
        o.base_blocks.forEach(({_obj}) => {
          const calc_order = _mgr.get(_obj.calc_order, false, false);
          if(base_block.indexOf(calc_order) == -1) {
            base_block.push(calc_order);
          }
        });
      }
    });

    try {
      const refs = [];
      for (let o of base_block) {
        refs.push(o.ref);
        if(refs.length > 29) {
          await _mgr.adapter.load_array(_mgr, refs, false, _mgr.adapter.local.templates);
          refs.length = 0;
        }
      }
      if(refs.length) {
        await _mgr.adapter.load_array(_mgr, refs, false, _mgr.adapter.local.templates);
      }

      refs.length = 0;
      base_block.forEach(({production}) => {
        if(production.count()) {
          refs.push(production.get(0).characteristic.ref);
        }
      });
      return _mgr.adapter.load_array($p.cat.characteristics, refs, false, _mgr.adapter.local.templates);
    }
    catch (e) {

    }

  };

  _mgr.clone = async function(src) {
    if(typeof src === 'string') {
      src = await _mgr.get(src, 'promise');
    }
    await src.load_production();
    const {organization, partner, contract, ...others} = src._obj;
    const dst = await _mgr.create({date: new Date(), organization, partner, contract});
    dst._mixin(others, null, 'ref,date,number_doc,posted,_deleted,number_internal,production,planning,manager,obj_delivery_state'.split(','), true);
    const map = new Map();

    src.production.forEach((row) => {
      const prow = Object.assign({}, row._obj);
      if(row.characteristic.calc_order === src) {
        const cx = prow.characteristic = $p.cat.characteristics.create({calc_order: dst.ref}, false, true);
        cx._mixin(row.characteristic._obj, null, 'ref,name,calc_order,timestamp'.split(','), true);
        cx._data._modified = true;
        cx._data._is_new = true;
        if(cx.coordinates.count() && src.refill_props) {
          cx._data.refill_props = true;
        }
        map.set(row.characteristic, cx);
      }
      dst.production.add(prow);
    });

    dst.production.forEach((row) => {
      const cx = map.get(row.ordn);
      if(cx) {
        row.ordn = row.characteristic.leading_product = cx;
      }
    });

    if(src.refill_props) {
      await dst.recalc();
    }

    return dst.save();
  }


})($p.doc.calc_order);


$p.doc.calc_order.__define({

	rep_invoice_execution: {
		value(rep) {

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

			return $p.adapters.pouch.remote.doc.query("server/invoice_execution", query_options)

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
		value(rep, attr) {

			var date_from = $p.utils.date_add_day(new Date(), -1, true),
				date_till = $p.utils.date_add_day(date_from, 7, true),
        query_options = {
          reduce: true,
          limit: 10000,
          group: true,
          group_level: 5,
          startkey: [date_from.getFullYear(), date_from.getMonth() + 1, date_from.getDate(), ''],
          endkey: [date_till.getFullYear(), date_till.getMonth() + 1, date_till.getDate(), '\ufff0']
        },
				res = {
					data: [],
					readOnly: true,
					wordWrap: false
				};

      return $p.adapters.pouch.remote.doc.query('server/planning', query_options)

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

      production.forEach((row) => {
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

          production.forEach((row) => {
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty() && !row.characteristic.calc_order.empty()
              && row.characteristic.calc_order.is_new() && arefs.indexOf(row.characteristic.calc_order.ref) == -1) {
              arefs.push(row.characteristic.calc_order.ref)
              aobjs.push(row.characteristic.calc_order.load())
            }
            row.characteristic.specification.forEach((sprow) => {
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

          production.forEach((row) => {
            if(!row.use){
              return;
            }
            if (!row.characteristic.empty()) {
              row.characteristic.specification.forEach((sprow) => {

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
            if (this.resources.indexOf(key) != -1) {
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

      const {current_user, msg, iface, utils} = $p;

      const items = [
        {id: "info", type: "text", text: "Вариант настроек:"},
        {id: "scheme", type: "text", text: "<div style='width: 300px; margin-top: -2px;' name='scheme'></div>"}
      ];
      if(current_user.role_available("ИзменениеТехнологическойНСИ")){
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
            return msg.show_msg({
              type: "alert-warning",
              text: "Не выбран вариант настроек",
              title: msg.main_title
            });
          }
          if(name == 'print'){
            this.generate().then((doc) => doc.print());
          }
          else if(name == 'save'){
            this.scheme.save().then((scheme) => scheme.set_default());
          }
          else if(name == 'saveas'){
            iface.query_value(this.scheme.name.replace(/[0-9]/g, '') + Math.floor(10 + Math.random() * 21), 'Укажите название варианта')
              .then((name) => {
                const proto = utils._clone(this.scheme._obj);
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

    this.draw_svgs = this.draw_svgs.bind(this);

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

          const keys = [];
          if(typeof _obj == 'string') {
            const {doc} = $p.adapters.pouch.local;
            doc.get(`doc.calc_order|${_obj}`)
              .then(({production}) => {
                production && production.forEach(({characteristic}) => {
                  !$p.utils.is_empty_guid(characteristic) && keys.push(`cat.characteristics|${characteristic}`);
                });
                return keys.length ? doc.allDocs({keys, limit: keys.length, include_docs: true}) : {rows: keys};
              })
              .then(({rows}) => {
                const adel = [];
                rows.forEach(({id, doc}) => {
                  if(doc && doc.svg) {
                    const ind = keys.indexOf(id);
                    keys[ind] = {ref: id.substr(20), svg: doc.svg};
                  }
                });
                return keys.filter((v) => v.svg);
              })
              .then(this.draw_svgs)
              .catch($p.record_log)
          }
          else {
            _obj.production.forEach(({characteristic: {ref, svg}}) => {
              if(svg) {
                keys.push({ref, svg});
              }
            });
            this.draw_svgs(keys);
          }
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



class eXcell_client extends eXcell {

  constructor(cell) {

    if (!cell){
      return;
    }

    super(cell);

    this.cell = cell;
    this.open_selection = this.open_selection.bind(this);
    this.open_obj = this.open_obj.bind(this);
    this.edit = eXcell_client.prototype.edit.bind(this);
    this.detach = eXcell_client.prototype.detach.bind(this);

  }

  get grid() {
    return this.cell.parentNode.grid;
  }

  ti_keydown(e) {
    const {code, ctrlKey} = e;
    const {grid} = this;
    const {iface, job_prm: {builder}} = $p;
    if(code === 'F4' || (ctrlKey && code === 'KeyF')) {
      return this.open_selection(e);
    }
    if(code === 'F2' && builder.client_of_dealer_mode != 'string') {
      return this.open_obj(e);
    }

    if(builder.client_of_dealer_mode == 'frm') {
      return iface.cancel_bubble(e, true);
    }

    if(code === 'Delete') {
      this.setValue('')
      grid.editStop();
      return iface.cancel_bubble(e);
    }
    if(code === 'Tab') {
      const {cell: {firstChild}} = this;
      firstChild.childNodes[0].value += '\u00A0';
      return iface.cancel_bubble(e);
    }
    if(code === 'Enter') {
      grid.editStop();
      return iface.cancel_bubble(e);
    }
  }

  open_selection(e) {
    const v = this.grid.get_cell_field();
    if(v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('ClientOfDealerSearch', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  open_obj(e) {
    const v = this.grid.get_cell_field();
    if(v && v.field) {
      v.obj[v.field] = this.getValue();
      this.grid.xcell_action && this.grid.xcell_action('ClientOfDealer', v.field);
    }
    return $p.iface.cancel_bubble(e);
  }

  setValue(val, fld) {
    const v = this.grid.get_cell_field();
    if(v && v.field && (!fld || v.field === fld) && v.obj[v.field] !== val) {
      v.obj[v.field] = val;
    }
    this.setCValue(val);
  }

  getValue() {
    const {cell: {firstChild}} = this;
    if(firstChild && firstChild.childNodes.length) {
      return firstChild.childNodes[0].value;
    }
    else {
      const v = this.grid.get_cell_field();
      return v && v.field ? v.obj[v.field] : '';
    }

  }

  edit() {

    this.val = this.getValue();		
    this.cell.innerHTML = `<div class="ref_div21"><input type="text" class="dhx_combo_edit" style="height: 20px;"><div class="ref_ofrm21" title="Открыть форму ввода по реквизитам {F2}">&nbsp;</div><div class="ref_field21" title="Выбрать из списка прежних клиентов {F4}">&nbsp;</div></div>`;

    const {cell: {firstChild}, val} = this;
    const ti = firstChild.childNodes[0];
    ti.value = val;
    ti.onclick = $p.iface.cancel_bubble;		
    ti.focus();
    ti.onkeydown = this.ti_keydown.bind(this);
    firstChild.childNodes[1].onclick = this.open_obj;
    firstChild.childNodes[2].onclick = this.open_selection;
  };

  detach() {
    const val = this.getValue();
    val !== null && this.setValue(val);
    return !$p.utils.is_equal(this.val, this.getValue());				
  }

}
window.eXcell_client = eXcell_client;



class WndAddressData {

  constructor(owner){
    this.owner = owner;
    this.country = "Россия";
    this.region = "";
    this.city = "";
    this.street =	"";
    this.postal_code = "";
    this.marker = null;
    this.poly_area = null;
    this.poly_direction = null;
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
    const {latitude, longitude, owner: {obj}} = this;
    const {coordinates} = obj;
    return coordinates ? JSON.parse(coordinates) : (latitude && longitude ? [latitude, longitude] : []);
  }

  init_map(map, position) {
    const {maps} = window.google || {};
    if(maps) {
      this.marker = new maps.Marker({
        map,
        draggable: true,
        animation: maps.Animation.DROP,
        position
      });
      this.poly_area = new maps.Polygon(
        {
          map,
          strokeColor     : '#80aa80',
          strokeOpacity   : 0.4,
          strokeWeight    : 2,
          fillColor       : "#c0d0e0",
          fillOpacity     : 0.3,
          geodesic        : true
        });
      this.poly_direction = new maps.Polygon(
        {
          map,
          strokeColor     : '#aa80ff',
          strokeOpacity   : 0.4,
          strokeWeight    : 1,
          fillColor       : "#ccaaff",
          fillOpacity     : 0.2,
          geodesic        : true
        });
      this.refresh_coordinates();
      this._marker_toggle_bounce = maps.event.addListener(this.marker, 'click', this.marker_toggle_bounce.bind(this));
      this._marker_dragend = maps.event.addListener(this.marker, 'dragend', this.marker_dragend.bind(this));
    }
  }

  ulisten() {
    const {maps} = window.google || {};
    if(maps) {
      maps.event.removeListener(this._marker_toggle_bounce);
      maps.event.removeListener(this._marker_dragend);
    }
  }

  assemble_addr(with_flat){
    const {country, region, city, street, postal_code, house, flat} = this;
    const res = (region && region !== city ? (region + ', ') : '') +
      (city ? (city + ', ') : '') +
      (street ? (street.replace(/,/g, ' ') + ', ') : '') +
      (house ? (house + ', ') : '') +
      (with_flat && flat ? (flat + ', ') : '');
    return res.endsWith(', ') ? res.substr(0, res.length - 2) : res;
  }

  assemble_address_fields(without_flat){

    const {fias} = WndAddressData;
    const {obj} = this.owner;
    const v = this;

    obj.shipping_address = this.assemble_addr(!without_flat);

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

  refresh_coordinates(latitude, longitude){
    const v = this;
    const {wnd} = this.owner;
    if(latitude && longitude) {
      v.latitude = latitude;
      v.longitude = longitude;
    }
    if(wnd && wnd.elmnts && wnd.elmnts.map) {
      v.latitude && wnd.elmnts.toolbar.setValue('coordinates', `${v.latitude.toFixed(8)} ${v.longitude.toFixed(8)}`);
      const {delivery_area, poly_area, poly_direction} = v;
      const {LatLng} = google.maps;
      for(const poly of [poly_area, poly_direction]) {
        poly.getPath().clear();
      }
      if(delivery_area.coordinates.count() > 2) {
        poly_area.setPath(delivery_area.coordinates._obj.map((v) => new LatLng(v.latitude, v.longitude)));
      }
      $p.cat.delivery_directions.forEach(({composition, coordinates}) => {
        if(composition.find({elm: delivery_area})) {
          poly_direction.setPath(coordinates._obj.map((v) => new LatLng(v.latitude, v.longitude)));
          return false;
        }
      });
    }
  }

  process_address_fields(){

    const v = this;
    const {obj} = this.owner;
    const {ipinfo, msg} = $p;
    const {fias} = WndAddressData;


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

    return ipinfo.google_ready()
      .then(() => {

        if(!v.latitude || !v.longitude){
          if(obj.shipping_address && ipinfo.ggeocoder){
            ipinfo.ggeocoder.geocode({address: v.assemble_addr()}, (results, status) => {
              if (status == google.maps.GeocoderStatus.OK) {
                const {location} = results[0].geometry;
                v.refresh_coordinates(location.lat(), location.lng());
              }
            });
          }
          else if(ipinfo.latitude && ipinfo.longitude ){
            v.refresh_coordinates(ipinfo.latitude, ipinfo.longitude);
          }
          else{
            v.latitude = 55.635924;
            v.longitude = 37.6066379;
            msg.show_msg(msg.empty_geocoding);
          }
        }
      });
  }

  assemble_lat_lng(str) {
    const simpleMatches = [];
    simpleMatches[0] = /^\s*?(-?[0-9]+\.?[0-9]+?)\s*\,\s*(-?[0-9]+\.?[0-9]+?)\s*$/.exec(str);
    simpleMatches[2] = /^\s*?(-?[0-9]+[,.]?[0-9]+?)\s*;?\s*(-?[0-9]+[,.]?[0-9]+?)\s*$/.exec(str);
    const simpleMatch = simpleMatches.find(match => match && match.length === 3);
    const otherMatches = [];
    otherMatches[0] = /^\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[NS]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[WE]\s*$/.exec(str);
    otherMatches[1] = /^\s*[NS]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*[EW]\s*([0-9]+)°([0-9]+)'([0-9.,]*)"?\s*$/.exec(str);
    const otherMatch = otherMatches.find(match => match && match.length === 7);
    if (simpleMatch) {
      const lat = parseFloat(simpleMatch[1].replace(',', '.'));
      const lng = parseFloat(simpleMatch[2].replace(',', '.'));

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }

    } else if (otherMatch) {
      const latDeg = parseFloat(otherMatch[1]);
      const latMin = parseFloat(otherMatch[2]);
      const latSec = parseFloat(otherMatch[3].replace(',', '.'));
      const lngDeg = parseFloat(otherMatch[4]);
      const lngMin = parseFloat(otherMatch[5]);
      const lngSec = parseFloat(otherMatch[6].replace(',', '.'));

      const lat = (latDeg + latMin / 60 + latSec / 3600) * (str.indexOf('S') !== -1 ? -1 : 1);
      const lng = (lngDeg + lngMin / 60 + lngSec / 3600) * (str.indexOf('W') !== -1 ? -1 : 1);

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

  }

  marker_toggle_bounce() {
    if (this.marker.getAnimation() != null) {
      this.marker.setAnimation(null);
    }
    else {
      this.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => this.marker.setAnimation(null), 1500);
    }
  }

  marker_dragend(e) {
    const {ipinfo} = $p;
    ipinfo.ggeocoder && ipinfo.ggeocoder.geocode({'latLng': e.latLng}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const v = this;
        const {wnd} = this.owner;
        if (results[0]) {
          const addr = results[0];
          wnd.setText(addr.formatted_address);
          ipinfo.components(v, addr.address_components);
          v.refresh_coordinates(e.latLng.lat(), e.latLng.lng());

          this.owner.refresh_grid && this.owner.refresh_grid();

          const zoom = v.street ? 15 : 12;
          if(wnd.elmnts.map.getZoom() != zoom){
            wnd.elmnts.map.setZoom(zoom);
            wnd.elmnts.map.setCenter(e.latLng);
          }

        }
      }
    });
  }

}

class WndAddress {

  constructor(source) {
    this.obj = source.obj;
    this.pwnd = source.pwnd;
    this.grid = source.grid;
    this.v = new WndAddressData(this);
    this.v.process_address_fields()
      .then(() => this.frm_create());
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

      this.attachEvent('onclick', toolbar_click);

      const delivery_area_id = `txt_${dhx4.newId()}`;
      this.addText(delivery_area_id);
      this.addSeparator('sep2');
      this.addText('txt_region');

      const txt_div = this.objPull[this.idPrefix + delivery_area_id].obj;
      const delivery_area = new $p.iface.OCombo({
        parent: txt_div,
        obj: obj,
        field: 'delivery_area',
        width: 200,
        hide_frm: true,
      });
      txt_div.style.border = '1px solid #ccc';
      txt_div.style.borderRadius = '3px';
      txt_div.style.padding = '3px 2px 1px 2px';
      txt_div.style.margin = '1px 5px 1px 1px';
      delivery_area.DOMelem_input.placeholder = 'Район доставки';

      this.addInput('coordinates');
      this.setWidth('coordinates', 210);
      this.cont.querySelector('.dhxtoolbar_float_left').style.width = '100%';
      const coordinates = this.getInput('coordinates');
      coordinates.parentElement.style.float = 'right';
      coordinates.placeholder = 'Координаты';

      this.setItemText('txt_region', v.region);

    });

    elmnts.toolbar.attachEvent("onEnter", (id, value) => {
      if(id === 'coordinates') {
        const {v, wnd} = this;
        const coordinates = v.assemble_lat_lng(value);
        if(coordinates) {
          const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
          wnd.elmnts.map.setCenter(latLng);
          v.marker.setPosition(latLng);
          v.marker_dragend({latLng});
        }
      }
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
    v.init_map(elmnts.map, mapParams.center);

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
      const {elmnts: {pgrid, pgrid2}} = wnd;
      pgrid && pgrid.editStop();
      pgrid2 && pgrid2.editStop();
      v.assemble_address_fields();
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
    const {delivery_area} = v;

    if(!delivery_area.empty()){
      v.street = "";
    }

    if(delivery_area.region){
      v.region = delivery_area.region;
    }
    else {
      v.region = "";
    }
    wnd.elmnts.toolbar.setItemText('txt_region', v.region);

    if(delivery_area.city){
      v.city = delivery_area.city;
      wnd.elmnts.pgrid.cells("city", 1).setValue(v.city);
    }
    else{
      v.city = "";
    }

    if(delivery_area.latitude && delivery_area.longitude){
      const LatLng = new google.maps.LatLng(delivery_area.latitude, delivery_area.longitude);
      wnd.elmnts.map.setCenter(LatLng);
      v.marker.setPosition(LatLng);
      v.refresh_coordinates(delivery_area.latitude, delivery_area.longitude)
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

    const {ipinfo} = $p;
    ipinfo.ggeocoder && ipinfo.ggeocoder.geocode({address: v.assemble_addr()}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        const loc = results[0].geometry.location;
        wnd.elmnts.map.setCenter(loc);
        v.marker.setPosition(loc);
        v.postal_code = ipinfo.components({}, results[0].address_components).postal_code || "";
        v.refresh_coordinates(loc.lat(), loc.lng());
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
    const {grid, obj, listener, v} = this;
    grid && grid.editStop();
    obj && obj._manager.off('update', listener);
    v.ulisten();
    return !win.error;
  }

}

WndAddressData.fias = {
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

$p.classes.WndAddressData = WndAddressData;

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
    const {code, ctrlKey} = e;
    if(e.code === 'Backspace' || e.code === 'Delete'){          
      const {obj} = this.grid.get_cell_field();
      obj.shipping_address = '';
      obj.address_fields = '';
      this.grid.editStop();
      return $p.iface.cancel_bubble(e);
    }
    else if(code === 'F4' || code === 'F2' || (ctrlKey && code === 'KeyF')) {
      return this.open_selection(e);
    }

    return eXcell_ocombo.prototype.input_keydown(e, this);
  }

  open_selection(e) {
    const v = this.grid.get_cell_field();
    const {iface, job_prm: {builder}, enm: {geo_map_kind}} = $p;

    if(v && v.field) {
      switch(builder.geo_map) {
      case undefined:
      case 'dhtmlx_google':
        new WndAddress({grid: this.grid}._mixin(v));
        break;
      case 'react_google':
      case 'react_google_without_area':
      case 'react_yandex':
      case 'react_yandex_without_area':
        this.grid.xcell_action && this.grid.xcell_action('DeliveryAddr', v.field);
      }
    }

    return iface.cancel_bubble(e);
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
