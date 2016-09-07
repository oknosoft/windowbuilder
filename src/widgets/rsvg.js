/**
 * Ячейка грида для отображения картинки svg и компонент,
 * получающий и отображающий галерею эскизов объекта данных
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module  widgets
 * @submodule rsvg
 */

/**
 * Конструктор поля картинки svg
 */
function eXcell_rsvg(cell){ //the eXcell name is defined here
	if (cell){                // the default pattern, just copy it
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	}
	this.edit = function(){};  //read-only cell doesn't have edit method
	this.isDisabled = function(){ return true; }; // the cell is read-only, so it's always in the disabled state
	this.setValue=function(val){
		this.cell.style.padding = "2px 4px";
		this.setCValue(val ? $p.iface.scale_svg(val, 120, 0) : "нет эскиза");
	}
}
eXcell_rsvg.prototype = new eXcell();
window.eXcell_rsvg = eXcell_rsvg;

/**
 * ### Визуальный компонент OSvgs
 * Получает и отображает галерею эскизов объекта данных
 *
 * @class OSvgs
 * @param manager {DataManager}
 * @param layout {dhtmlXLayoutObject|dhtmlXWindowsCell}
 * @param area {HTMLElement}
 * @constructor
 */
$p.iface.OSvgs = function (manager, layout, area) {

	var t = this,
		minmax = document.createElement('div'),
		pics_area = document.createElement('div'),
		stack = [], reload_id,
		area_hidden = $p.wsql.get_user_param("svgs_area_hidden", "boolean"),
		area_text = area.querySelector(".dhx_cell_statusbar_text");

	if(area_text && area_text.innerHTML == "<div></div>")
		area_text.style.display = "none";

	pics_area.className = 'svgs-area';
	if(area.firstChild)
		area.insertBefore(pics_area, area.firstChild);
	else
		area.appendChild(pics_area);

	minmax.className = 'svgs-minmax';
	minmax.title="Скрыть/показать панель эскизов";
	minmax.onclick = function () {
		area_hidden = !area_hidden;
		$p.wsql.set_user_param("svgs_area_hidden", area_hidden);
		apply_area_hidden();

		if(!area_hidden && stack.length)
			t.reload();

	};
	area.appendChild(minmax);
	apply_area_hidden();

	function apply_area_hidden(){

		pics_area.style.display = area_hidden ? "none" : "";

		if(layout.setSizes)
			layout.setSizes();

		else if(layout.getDimension){
			var dim = layout.getDimension();
			layout.setDimension(dim[0], dim[1]);
			layout.maximize();
		}

		minmax.style.backgroundPositionX = area_hidden ? "-32px" : "0px";
	}

	function draw_svgs(res){

		$p.iface.clear_svgs(pics_area);

		res.forEach(function (svg) {
			if(!svg || svg.substr(0, 1) != "<")
				return;
			var svg_elm = document.createElement("div");
			pics_area.appendChild(svg_elm);
			svg_elm.style.float = "left";
			svg_elm.style.marginLeft = "4px";
			svg_elm.innerHTML = $p.iface.scale_svg(svg, 88, 22);
		});

		if(!res.length){
			// возможно, стоит показать надпись, что нет эскизов
		}
	}

	this.reload = function (ref) {

		if(ref){
			stack.push(ref);
			ref = null;
		}

		if(reload_id)
			clearTimeout(reload_id);

		if(!area_hidden)
			reload_id = setTimeout(function(){
				if(stack.length){

					// Получаем табчасть заказа
					var _obj = stack.pop();

					if (typeof _obj == "string")
						_obj = $p.doc.calc_order.pouch_db.get(manager.class_name + "|" + _obj);
					else
						_obj = Promise.resolve({production: _obj.production._obj});

					_obj.then(function (res) {

						// Для продукций заказа получаем вложения
						var aatt = [];
						if(res.production)
							res.production.forEach(function (row) {
								if(!$p.utils.is_empty_guid(row.characteristic))
									aatt.push($p.cat.characteristics.get_attachment(row.characteristic, "svg")
										.catch(function (err) {}));
						});
						_obj = null;
						return Promise.all(aatt);
					})
					.then(function (res) {
						// Извлекаем из блоба svg-текст эскизов
						var aatt = [];
						res.forEach(function (row) {
							if(row instanceof Blob && row.size)
								aatt.push($p.utils.blob_as_text(row));
						});
						return Promise.all(aatt);
					})
					.then(draw_svgs)
					.catch($p.record_log);

					stack.length = 0;
				}
			}, 300);
	}

};