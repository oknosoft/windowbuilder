// модификаторы справочников

import SpecFragment from 'wb-forms/dist/CatCharacteristics/LazySpec';
import select_template from 'wb-core/dist/select_template';

export default function ($p) {
  $p.cat.characteristics.SpecFragment = SpecFragment;
  select_template($p);
}
