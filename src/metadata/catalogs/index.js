// модификаторы справочников

import SpecFragment from 'wb-forms/dist/CatCharacteristics/LazySpec';
import RevsDetales from 'wb-forms/dist/CatCharacteristics/RevsDetales';
import ProductionParamsList from '../../components/CatProductionParams/List';
import FieldClr from 'wb-forms/dist/CatClrs/Editor';
import meta_clrs from 'wb-forms/dist/CatClrs/meta';
import meta_cnns from 'wb-forms/dist/CatCnns/meta';
import meta_inserts from 'wb-forms/dist/CatInserts/meta';
import meta_furns from 'wb-forms/dist/CatFurns/meta';
import select_template from 'wb-core/dist/select_template';

export default function ($p) {
  const {cat} = $p;
  cat.characteristics.SpecFragment = SpecFragment;
  cat.characteristics.RevsDetales = RevsDetales;
  cat.production_params.FrmList = ProductionParamsList;

  cat.clrs.Editor = FieldClr;
  meta_clrs($p);

  meta_cnns($p);

  meta_inserts($p);

  meta_furns($p);

  select_template($p);

}
