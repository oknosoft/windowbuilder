/**
 * Дополнительные методы справочника Визуализация элементов
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module cat_elm_visualization
 * Created 08.04.2016
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.cat.elm_visualization;


		// публичные методы объекта

		_mgr._obj_сonstructor.prototype.__define({

			draw: {
				value: function (elm, layer) {

					if(this.svg_path.indexOf('{"method":') == 0){

						if(!layer._by_spec)
							layer._by_spec = new paper.Group({ parent: l_vis });

						var attr = JSON.parse(this.svg_path);

						if(attr.method == "subpath_outer"){

							var subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

							subpath.parent = layer._by_spec;
							subpath.strokeWidth = attr.strokeWidth || 10;
							subpath.strokeColor = attr.strokeColor || 'red';
							subpath.strokeCap = attr.strokeCap || 'round';
							if(attr.dashArray)
								subpath.dashArray = attr.dashArray

						}
						
					}

				}
			}

		});

	}
);