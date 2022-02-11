
/**
 * ### Модификаторы обработки _builder_pen_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
 *
 * Created 13.05.2016
 *
 * @module dp_builder_pen
 */


export default function ({dp}) {

  dp.builder_pen.on({

    value_change(attr, obj) {
      const {project} = paper;
      if(attr.field == 'elm_type') {
        obj.inset = project.default_inset({elm_type: obj.elm_type});
        obj.rama_impost = project._dp.sys.inserts([obj.elm_type]);
      }
      if(attr.field == 'elm_type' || attr.field == 'inset') {
        obj.clr = project.clr;
        obj.inset.clr_group.default_clr(obj);
        $p.cat.clrs.selection_exclude_service(obj._metadata('clr'), obj.inset);
      }
    },

  });

}
