/**
 * ### Модификаторы обработки _builder_lay_impost_
 *
 */


export default function ($p) {

  const {dp, enm: {positions}} = $p;

  class DpBuilderLayImpost extends $p.DpBuilder_lay_impost {

    // начальное заполнение, когда обработку создали из инструмента Витраж
    init_vitrazh(project, Editor) {

      if(!project.contours.length) {
        Editor.Contour.create({project});
      }
      const {bounds, l_dimensions} = project.contours[0];
      this.w = bounds.width;
      this.h = bounds.height || 3000;
      this.align_by_x = 'left';
      this.align_by_y = 'bottom';
      project._attr._vitrazh = this;
    }

  }

  class DpBuilderLayImpostSizesRow extends $p.DpBuilder_lay_impostSizesRow {

    // если изменили размер ячейки, надо пересчитать соседние
    value_change(field, type, value) {
      if(field === 'sz') {

      }
    }
  }

  $p.DpBuilder_lay_impost = DpBuilderLayImpost;
  $p.DpBuilder_lay_impostSizesRow = DpBuilderLayImpostSizesRow;

  dp.builder_lay_impost.on({

    value_change(attr, obj) {
      if(attr.field == 'elm_type') {
        const {project} = paper;
        obj.inset_by_y = project.default_inset({
          elm_type: obj.elm_type,
          pos: positions.ЦентрГоризонталь
        });
        obj.inset_by_x = project.default_inset({
          elm_type: obj.elm_type,
          pos: positions.ЦентрВертикаль
        });
        obj.rama_impost = project._dp.sys.inserts([obj.elm_type]);
      }
    }
  });

}
