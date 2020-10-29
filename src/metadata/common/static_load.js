/**
 * Дополняет ProfileItem математикой расчета статических нагрузок
 *
 * @module static_load
 *
 * Created 29.10.2020.
 */

// если нужно подключить другие файлы...
// import ... from ...;

export default function ({Editor}) {
  Editor.ProfileItem.prototype.static_load = function () {
    // получаем номенклатуру и длину
    const {nom, orientation, length} = this;
  };
}
