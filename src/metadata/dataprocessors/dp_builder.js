/**
 * ### Модификаторы обработки _builder_pen_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 13.05.2016
 *
 * @module dp_builder_pen
 */

/* global paper, $p */

export default function ($p) {

  $p.dp.builder_pen.on({

    value_change: function (attr, obj) {
      if(attr.field == 'elm_type') {
        obj.inset = paper.project.default_inset({elm_type: obj.elm_type});
        obj.rama_impost = paper.project._dp.sys.inserts([obj.elm_type]);
      }
    },

  });

  $p.dp.builder_lay_impost.on({

    value_change: function (attr, obj) {
      if(attr.field == 'elm_type') {
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

}


