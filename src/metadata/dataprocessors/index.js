// модификаторы обработок

// перо рисовалки
import dp_builder_pen from './dp_builder_pen';

// испосты и раскладки
import dp_lay_impost from './dp_lay_impost';

// отчет цены номенклатуры
import dp_builder_price from './dp_builder_price';

// заказ покупателя
import dp_buyers_order from './dp_buyers_order';

// форма добавления параметрической продукции
import form_product_list from './dp_buyers_order_form_product_list';


export default function ($p) {
  dp_builder_pen($p);
  dp_lay_impost($p);
  dp_builder_price($p);
  dp_buyers_order($p);
  form_product_list($p);
}
