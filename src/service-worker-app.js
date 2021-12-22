/**
 * уточнения к сервисворкеру
 */

import {skipWaiting} from 'workbox-core';
import {precacheAndRoute} from 'workbox-precaching';

// в отладочном режиме, обновляем cache раз в день
const dkey = new Date().toISOString().substr(0, 10);

export default function () {
  skipWaiting();

  precacheAndRoute([
    {url: '/dist/dhtmlx.min.js', revision: null },
    {url: '/dist/windowbuilder.js', revision: null },
    {url: '/dist/wnd_debug.js', revision: null },
    {url: '/dist/paperjs-deep-diff.min.js', revision: null },
    //{url: '/couchdb/mdm/92/common', revision: dkey },
    //{url: '/styles/app.0c9a31.css', revision: null},
  ]);
}