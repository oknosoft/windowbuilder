/**
 * уточнения к сервисворкеру
 */

import {skipWaiting} from 'workbox-core';
import {precacheAndRoute} from 'workbox-precaching';

// в отладочном режиме, обновляем cache раз в день
const dkey = new Date().toISOString().substr(0, 10);

export default function () {
  skipWaiting();

  const revision = '20220309';

  precacheAndRoute([
    {url: '/dist/dhtmlx.min.js', revision: null },
    {url: '/dist/windowbuilder.js', revision },
    {url: '/dist/wnd_debug.js', revision },
    {url: '/dist/paperjs-deep-diff.min.js', revision: null },
    //{url: '/couchdb/mdm/92/common', revision: dkey },
    //{url: '/styles/app.0c9a31.css', revision: null},
  ]);

  const production = [], specification = [];
  production.forEach(product => {
    for (let i = 1; i <= product.quantity; i++) {
      if (!product.characteristic.empty()) {
        product.characteristic.specification.forEach(spec => {
          specification.push(spec);
        });
      } else {
        const prd = $p.utils._mixin({clr: $p.cat.clrs.get()}, product, ['nom','characteristic','price']);
        prd.totqty1 = product.qty;
        prd.price = product.first_cost;
        specification.push(prd);
      }
    }
    first_cost += product.first_cost * product.quantity;
  });

}


