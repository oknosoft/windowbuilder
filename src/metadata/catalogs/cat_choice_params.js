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
      // выполняем формулу условия
      if(!obj.condition_formula.empty() && !obj.condition_formula.execute(obj)) {
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
        // дополняем отбор
        obj.key.params.forEach((row) => {
          mf.choice_params.push({
            name: obj.field || 'ref',
            path: {[row.comparison_type.valueOf()]: row.property.extract_value(row)}
          });
        });
      });
    }
    return objs;
  }
}
