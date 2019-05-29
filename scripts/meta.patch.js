/**
 * Верхний уровень корректировки метаданных
 *
 * @module meta.patch.js
 *
 * Created by Evgeniy Malyarov on 18.05.2019.
 */

const include = ['*'];
const exclude = [
  'cat.abonents',
  'cat.servers',
  'cat.property_values_hierarchy',
  'doc.registers_correction'
];

module.exports = function(meta) {
  for(const cls in meta) {
    const mgrs = meta[cls];
    for(const name in mgrs) {
      if(!include.includes('*') && !include.includes(`${cls}.${name}`)) {
        delete mgrs[name];
      }
      else if(exclude.includes(`${cls}.${name}`)) {
        delete mgrs[name];
      }
    }
  }
}
