/**
 * ### Модификаторы обработки _builder_lay_impost_
 *
 */


export default function ($p) {

  const {positions} = $p.enm;

  class DpBuilderLayImpost extends $p.DpBuilder_lay_impost {
    /*комментируем новый код есть варианты доработать
    до  работоспособного состояния*/
    // при смене типа элемента, устанавливаем вставки по умолчанию
    /*в текущем контектсе передается строка
    далее по контексту требуется обект перечисления
    */
    // value_change(field, type, value) {
    //   if(field == 'elm_type') {
    //     const {project} = paper;
    //     this.inset_by_y = project.default_inset({
    //       elm_type: value,
    //       pos: positions.ЦентрГоризонталь
    //     });
    //     this.inset_by_x = project.default_inset({
    //       elm_type: value,
    //       pos: positions.ЦентрВертикаль
    //     });
    //     this.rama_impost = project._dp.sys.inserts([value]);
    //   }
    // }

    // начальное заполнение, когда обработку создали из инструмента Витраж
    init_vitrazh() {

      const {project} = paper;

      if(!project.contours.length) {
        paper.constructor.Contour.create({project});
      }
      const {bounds, l_dimensions} = project.contours[0];
      this.w = bounds.width;
      this.h = bounds.height;
      // надо переделать с умом, чтобы на старте дроби и или * подставлялись,
      // а миллиметры только для ячеек, размер которых существенно выбивается из ряда
      for(const dl of l_dimensions.ihor.sizes()) {
        this.sizes.add({elm: 1, sz: dl.size});
        this.elm_by_y++;
      }
      for(const dl of l_dimensions.ivert.sizes()) {
        this.sizes.add({elm: 0, sz: dl.size});
        this.elm_by_x++;
      }
      project._attr._vitrazh = this;
      paper.eve.on('move_points', this.move_points.bind(this));
    }

    // сюда попадаем при изменении размера размерной линией
    // надо пересчитать строки табчасти sizes, но сначала, понять - размер какой ячейки и в какую сторону изменился
    // а еще, ничего пересчитывать не надо, если изменение вызвано текущим инструментом
    move_points(an) {
      if(paper.tool === this) {
        return;
      }

    }

    /**
     * Пересчитывает табчасть, при изменении размера в некой строке
     * @param row {DpBuilderLayImpostSizesRow}
     * @return {{vert: number[], hor: number[]}}
     */
    calc_sizes(row) {
      const {contours} = paper.project;
      const hor = [], vert = [];
      if(contours.length) {
        // получаем габарит
        const {bounds, l_dimensions} = contours[0];

        // выясняем, вертикаль или горизонт

        // делим с учётом автозаполнения и дробей

        // формируем массивы размеров в миллиметрах
      }

      return {hor, vert};
    }

  }

  class DpBuilderLayImpostSizesRow extends $p.DpBuilder_lay_impostSizesRow {

    // если изменили размер ячейки, надо пересчитать соседние
    value_change(field, type, value) {
      if(field === 'sz') {
        this._owner._owner.calc_sizes(this);
      }
    }
  }

  $p.DpBuilder_lay_impost = DpBuilderLayImpost;
  $p.DpBuilder_lay_impostSizesRow = DpBuilderLayImpostSizesRow;

}
