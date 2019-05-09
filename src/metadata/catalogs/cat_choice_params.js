/**
 * Вычисляемые параметры выбора
 *
 * @module cat_choice_params
 *
 * Created by Evgeniy Malyarov on 09.05.2019.
 */

exports.CatChoice_paramsManager = class CatChoice_paramsManager extends Object {

  load_array(aattr, forse) {
    const objs = super.load_array(aattr, forse);
    const {md, utils, enm: {comparison_types}} = this._owner.$p;
    // бежим по загруженным объектам
    for(const obj of objs) {
      // учитываем только те, что не runtime
      if(obj.runtime) {
        continue;
      }
      // для всех полей из состава метаданных
      obj.composition.forEach(({field}) => {
        const path = field.split('.');
        const mgr = md.mgr_by_class_name(`${path[0]}.${path[1]}`);
        if(!mgr) {
          return;
        }
        // получаем метаданные поля
        let mf = mgr.metadata(path[2]);
        if(path.length >= 4) {
          mf = mf.fields[path[3]];
        }
        if(!mf) {
          return;
        }
        if(!mf.choice_params) {
          mf.choice_params = [];
        }
        // бежим по ключу, вычисляемые параметры с типом, отличным от типа текущего поля, должны выполняться
        let ok = true;
        obj.key.params.forEach((row) => {
          if(row.property.is_calculated && row.property.type.types.every((type) => !mf.type.types.includes(type))) {
            ok = utils.check_compare(row.property.calculated_value({}), row.property.extract_value(row), row.comparison_type, comparison_types);
            if(!ok) {
              return false;
            }
          }
        });
        ok && obj.key.params.forEach((row) => {
          if(row.property.type.types.some((type) => mf.type.types.includes(type))) {
            mf.choice_params.push({
              name: "ref",
              path: {[row.comparison_type.valueOf()]: row.property.extract_value(row)}
            })
          }
        });
      });
    }
    return objs;
  }
}
