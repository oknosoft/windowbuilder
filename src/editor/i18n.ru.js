/**
 * Строковые константы интернационализации
 * Created 13.03.2016<br />
 * &copy; http://www.oknosoft.ru 2014-2016
 * @author Evgeniy Malyarov
 * @module i18n.ru.js
 */

(function (msg){

  msg.additional_inserts = "Доп. вставки";
	msg.align_node_right = "Уравнять вертикально вправо";
	msg.align_node_bottom = "Уравнять горизонтально вниз";
	msg.align_node_top = "Уравнять горизонтально вверх";
	msg.align_node_left = "Уравнять вертикально влево";
	msg.align_set_right = "Установить размер сдвигом правых элементов";
	msg.align_set_bottom = "Установить размер сдвигом нижних элементов";
	msg.align_set_top = "Установить размер сдвигом верхних элементов";
	msg.align_set_left = "Установить размер сдвигом левых элементов";
	msg.align_all = "Установить прямые углы";
	msg.align_invalid_direction = "Неприменимо для элемента с данной ориентацией";

	msg.bld_constructor = "Конструктор объектов графического построителя";
	msg.bld_title = "Графический построитель";
	msg.bld_empty_param = "Не заполнен обязательный параметр <br />";
	msg.bld_not_product = "В текущей строке нет изделия построителя";
	msg.bld_not_draw = "Отсутствует эскиз или не указана система профилей";
	msg.bld_not_sys = "Не указана система профилей";
	msg.bld_from_blocks_title = "Выбор типового блока";
	msg.bld_from_blocks = "Текущее изделие будет заменено конфигурацией типового блока. Продолжить?";
	msg.bld_split_imp = "В параметрах продукции<br />'%1'<br />запрещены незамкнутые контуры<br />" +
		"Для включения деления импостом,<br />установите это свойство в 'Истина'";

	msg.bld_new_stv = "Добавить створку";
	msg.bld_new_stv_no_filling = "Перед добавлением створки, укажите заполнение,<br />в которое поместить створку";

	msg.del_elm = "Удалить элемент";

  msg.to_contour = "в контур";
  msg.to_elm = "в элемент";
  msg.to_product = "в изделие";

	msg.ruler_elm = "Расстояние между элементами";
	msg.ruler_node = "Расстояние между узлами";
	msg.ruler_new_line = "Добавить размерную линию";

	msg.ruler_base = "По опорным линиям";
	msg.ruler_inner = "По внутренним линиям";
	msg.ruler_outer = "По внешним линиям";



})($p.msg);
