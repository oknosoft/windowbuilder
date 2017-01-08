/**
 * ### Модификаторы обработки _builder_pen_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 13.05.2016
 *
 * @module dp_builder_pen
 */

$p.dp.builder_pen.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset = paper.project.default_inset({elm_type: this.elm_type});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	}
});

$p.dp.builder_lay_impost.on({

	value_change: function(attr){
		if(attr.field == "elm_type") {
			this.inset_by_y = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрГоризонталь
			});
			this.inset_by_x = paper.project.default_inset({
				elm_type: this.elm_type,
				pos: $p.enm.positions.ЦентрВертикаль
			});
			this.rama_impost = paper.project._dp.sys.inserts([this.elm_type]);
		}
	}
});
