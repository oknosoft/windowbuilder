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

	value_change: function(attr, _obj){
	  const o = _obj || this;
		if(attr.field == "elm_type") {
      o.inset = paper.project.default_inset({elm_type: o.elm_type});
      o.rama_impost = paper.project._dp.sys.inserts([o.elm_type]);
		}
	},

});

$p.dp.builder_lay_impost.on({

	value_change: function(attr, _obj){
    const o = _obj || this;
		if(attr.field == "elm_type") {
      o.inset_by_y = paper.project.default_inset({
				elm_type: o.elm_type,
				pos: $p.enm.positions.ЦентрГоризонталь
			});
      o.inset_by_x = paper.project.default_inset({
				elm_type: o.elm_type,
				pos: $p.enm.positions.ЦентрВертикаль
			});
      o.rama_impost = paper.project._dp.sys.inserts([o.elm_type]);
		}
	}
});
