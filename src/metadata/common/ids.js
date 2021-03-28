/**
 * Возвращает шестисимвольный id продукции или заказа
 *
 * @module ids
 *
 * Created by Evgeniy Malyarov on 10.01.2019.
 */

const symbols = '123456789ADEFKLMNRSTUVXYZ';

// случайное число в диапазоне
function randomInt(min = 0, max) {
  if(!max) {
    max = symbols.length - 1;
  }
  let res = Math.floor(Math.random() * (max - min + 1)) + min;
  return res > max ? max : res;
}

// случайная строка идентификатора
export default function randomId() {
  let res = symbols[randomInt(9)];
  for(let i = 0; i < 5; i++) {
    let tmp = symbols[randomInt()];
    while (res.endsWith(tmp)){
      tmp = symbols[randomInt()];
    }
    res += tmp;
  }
  return res;
}