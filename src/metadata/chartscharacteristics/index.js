// модификаторы планов видов характеристик

import glasses_list from './glasses_list';
import prod_list_area from './prod_list_area';
import GlassSeparately from '../../components/PropFields/GlassSeparately';


export default function ({cch: {properties}, adapters: {pouch}, utils}) {
  pouch.once('pouch_data_loaded', () => {
    glasses_list({properties, utils});
    prod_list_area({properties, utils});
    const glass_separately = properties.predefined('glass_separately');
    if(glass_separately) {
      glass_separately.Component = GlassSeparately;
    }
  });
}
