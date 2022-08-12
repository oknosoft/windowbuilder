// модификаторы справочников

import SpecFragment from 'wb-forms/dist/CatCharacteristics/LazySpec';
import RevsDetales from 'wb-forms/dist/CatCharacteristics/RevsDetales';
import FieldClr from 'wb-forms/dist/CatClrs/Editor';
import meta_clrs from 'wb-forms/dist/CatClrs/meta';
import meta_cnns from 'wb-forms/dist/CatCnns/meta';
import meta_inserts from 'wb-forms/dist/CatInserts/meta';
import meta_furns from 'wb-forms/dist/CatFurns/meta';
import select_template from 'wb-core/dist/select_template';

export default function ($p) {
  $p.cat.characteristics.SpecFragment = SpecFragment;
  $p.cat.characteristics.RevsDetales = RevsDetales;

  $p.cat.clrs.Editor = FieldClr;
  meta_clrs($p);

  meta_cnns($p);

  meta_inserts($p);

  meta_furns($p);

  select_template($p);

  $p.CatCharacteristics.prototype.hierarchyName = function (cnstr) {
    const {constructions} = this;
    // строка табчасти конструкций
    const row = constructions.find({cnstr});
    if(!row) {
      return '';
    }
    // найдём все слои нашего уровня
    const rows = constructions.find_rows({parent: row.parent})
      .map((row) => row._row)
      .sort($p.utils.sort('cnstr'));
    let index = (rows.indexOf(row) + 1).toFixed();
    if(row.parent) {
      index = `${this.hierarchyName(row.parent)}.${index}`;
    }
    return index;
  }
}
