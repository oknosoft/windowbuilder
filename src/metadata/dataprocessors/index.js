// модификаторы обработок

// заказ покупателя
import dp_buyers_order from './dp_buyers_order';
import dp_builder from './dp_builder';

export default function ($p) {
  dp_buyers_order($p);
  dp_builder($p);
}
