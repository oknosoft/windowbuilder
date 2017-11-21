// модификаторы обработок

// заказ покупателя
import dp_buyers_order from "./dp_buyers_order";
import form_product_list from "./dp_buyers_order_form_product_list";


export default function ($p) {
  dp_buyers_order($p);
  form_product_list($p);
}
