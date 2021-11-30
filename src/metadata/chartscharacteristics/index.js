// модификаторы планов видов характеристик

import glasses_list from './glasses_list';

export default function ({cch: {properties}, adapters: {pouch}, utils}) {
  pouch.once('pouch_data_loaded', () => {
    glasses_list({properties, utils});
  });
}
