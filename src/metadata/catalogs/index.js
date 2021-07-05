// модификаторы справочников

import SpecFragment from 'wb-forms/dist/CatCharacteristics/LazySpec';
import RevsDetales from 'wb-forms/dist/CatCharacteristics/RevsDetales';
import select_template from 'wb-core/dist/select_template';

export default function ($p) {
  $p.cat.characteristics.SpecFragment = SpecFragment;
  $p.cat.characteristics.RevsDetales = RevsDetales;
  select_template($p);
}
