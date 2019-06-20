/**
 * ### Дополнительные методы справочника _Цветоценовые группы_
 *
 * Created 17.06.2019.
 */

exports.CatColor_price_groups = class CatColor_price_groups extends Object {

  /**
   * Рассчитывает и устанавливает при необходимости в obj цвет по умолчанию
   * @param [obj] - если указано, в поле clr этого объекта будет установлен цвет
   * @return CatClrs
   */
  default_clr(obj = {}) {
    const {clr_conformity, _manager} = this;
    const {cat: {clrs}, CatClrs, CatColor_price_groups} = _manager._owner.$p;
    
    // а надо ли устанавливать? если не задано ограничение, выходим
    if(!clr_conformity.count()) {
      return clrs.get();
    }

    // бежим по строкам ограничения цветов
    let ok;
    clr_conformity.forEach(({clr1}) => {
      if(clr1 === obj.clr || clr1 === obj.clr.parent) {
        ok = true;
        return false;
      }
    });
    if(ok) {
      return obj.clr;
    }
    // подставляем первый разрешенный
    clr_conformity.forEach(({clr1}) => {
      if(clr1 instanceof CatClrs) {
        if(clr1.is_folder) {
          clrs.find_rows({parent: clr1}, (v) => {
            obj.clr = v;
            return false;
          });
        }
        else {
          obj.clr = clr1;
        }
        return false;
      }
      else if(clr1 instanceof CatColor_price_groups) {
        clr1.default_clr(obj);
        return false;
      }
    });
    return obj.clr;
  }
};
