/**
 * Пример подключаемого невизуального инструмента _Пропорции типового блока_
 * Инструмент подписывается на событие при изменении размера элементов _DimensionLine_
 * Если _DimensionLine_ является внешней размерной линией и форма изделия подобна типовому блоку,
 * делается попытка сдвинуть импосты и внутренние контуры таким образом, чтобы сохранить пропорции частей изделия
 * 
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module tool_proportions
 * Created 06.07.2016
 */

$p.eve.attachEvent("sizes_wnd", function (attr) {
	
	if(attr.name != "size_change" || !attr.tool || attr.tool instanceof paper.Tool)
		return;
	
});