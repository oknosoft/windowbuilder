import {formatters} from '../../Builder/ToolWnds/VitrazhWnd/SzCell';
export const columns = {
  production: [
    {key: 'nom', name: 'Продукция', formatter: formatters.get('nom')},
    {key: 'quantity', name: 'Колич.', width: 80, formatter: formatters.get('quantity')},
    {key: 'price', name: 'Цена', width: 100, formatter: formatters.get('price')},
    {key: 'discount_percent', name: 'Скидка%', width: 80, formatter: formatters.get('discount_percent')},
    {key: 'amount', name: 'Сумма', width: 100, formatter: formatters.get('amount')},
  ],
  materials: [
    {key: 'nom', name: 'Продукция', formatter: formatters.get('nom')},
    {key: 'quantity', name: 'Колич.', width: 80, formatter: formatters.get('quantity')}
  ]
};
