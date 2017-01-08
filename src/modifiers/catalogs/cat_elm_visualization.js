/**
 * ### Дополнительные методы справочника Визуализация элементов
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 08.04.2016
 *
 * @module cat_elm_visualization
 */

// публичные методы объекта
$p.CatElm_visualization.prototype.__define({

	draw: {
		value: function (elm, layer, offset) {

			var subpath;

			if(this.svg_path.indexOf('{"method":') == 0){

				if(!layer._by_spec)
					layer._by_spec = new paper.Group({ parent: l_vis });

				var attr = JSON.parse(this.svg_path);

				if(attr.method == "subpath_outer"){

					subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

					subpath.parent = layer._by_spec;
					subpath.strokeWidth = attr.strokeWidth || 4;
					subpath.strokeColor = attr.strokeColor || 'red';
					subpath.strokeCap = attr.strokeCap || 'round';
					if(attr.dashArray)
						subpath.dashArray = attr.dashArray

				}

			}else if(this.svg_path){

				subpath = new paper.CompoundPath({
					pathData: this.svg_path,
					parent: layer._by_spec,
					strokeColor: 'black',
					fillColor: 'white',
					strokeScaling: false,
					pivot: [0, 0],
					opacity: elm.opacity
				});

				// угол касательной
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

				var p0 = elm.generatrix.getPointAt(offset > elm.generatrix.length ? elm.generatrix.length : offset || 0);
				if(this.elm_side == -1){
					// в середине элемента
					var p1 = elm.rays.inner.getNearestPoint(p0),
						p2 = elm.rays.outer.getNearestPoint(p0);

					subpath.position = p1.add(p2).divide(2);

				}else if(!this.elm_side){
					// изнутри
					subpath.position = elm.rays.inner.getNearestPoint(p0);

				}else{
					// снаружи
					subpath.position = elm.rays.outer.getNearestPoint(p0);
				}




			}

		}
	}

});
