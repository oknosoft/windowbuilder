import {formatters} from '../../Builder/ToolWnds/VitrazhWnd/SzCell';
import {componentWrapper} from './RecentCell';

const {cat, job_prm, utils} = $p;
const [product, ...predefined] = job_prm.nom.montage_bag;
const folders = predefined.filter(o => o.is_folder);
for(const folder of folders) {
  predefined.splice(predefined.indexOf(folder), 1);
}
const all = [];
for(const o of cat.nom) {
  if(!o.is_folder && !predefined.includes(o) && folders.some(folder => o._hierarchy(folder))) {
    const {_price} = o._data;
    if(_price && Object.keys(_price).length) {
      all.push(o);
    }
  }
}
all.sort(utils.sort('name'));
export {product, predefined, folders, all};

const RecentCell = componentWrapper(predefined, all);

export const columns = {
  production: [
    {key: 'nom', name: 'Продукция', formatter: formatters.get('nom')},
    {key: 'quantity', name: 'Колич.', width: 80, formatter: formatters.get('quantity')},
    {key: 'price', name: 'Цена', width: 100, formatter: formatters.get('price')},
    {key: 'discount_percent', name: 'Скидка%', width: 80, formatter: formatters.get('discount_percent')},
    {key: 'amount', name: 'Сумма', width: 100, formatter: formatters.get('amount')},
  ],
  materials: [
    {key: 'nom', name: 'Материал', formatter: formatters.get('nom'), editor: RecentCell},
    {key: 'qty', name: 'Колич.', width: 80, formatter: formatters.get('qty')}
  ]
};
