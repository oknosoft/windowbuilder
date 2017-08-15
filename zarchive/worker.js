// Useful resources:
// - https://eduardoboucas.com/blog/2015/06/04/supercharging-jekyll-with-a-serviceworker.html
// - https://jakearchibald.com/2014/offline-cookbook

"use strict";

const newCacheName = 'windowbuilder-cache-v20170113';

const criticalAssets = [
  'index.html',

  // css
  'https://cdn.jsdelivr.net/fontawesome/4.6.3/css/font-awesome.min.css',
  'https://cdn.jsdelivr.net/fontawesome/4.6.3/fonts/fontawesome-webfont.woff2?v=4.6.3',
  'https://cdn.jsdelivr.net/g/metadata@0.12.225(dhx_terrace.css+metadata.css)',
  'dist/windowbuilder.css',

  // js
  'https://cdn.jsdelivr.net/g/momentjs@2.17,alasql@0.3,pouchdb@6.1,jquery@2.2,metadata@0.12.225(dhtmlx.min.js)',
  'lib/metadata.min.js',
  'lib/paper-core.min.js',
  'dist/windowbuilder.js',
  'dist/wnd_debug.js'
];

const pages = [];

const nonCriticalAssets =
  [
    'imgs/fav-wnd.ico',
    'imgs/fav-okn144.png',
    'imgs/splash.gif',

    'imgs/stamp.png',
    'imgs/about_48.png',
    'imgs/settings_48.png',
    'imgs/events_48.png',
    'imgs/projects_48.png',
  ]
    .concat(pages);
		// .filter((file) => {
		// 	return file.indexOf('/blog/page') === -1;
		// });

// после установки, сразу кешируем статику
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(newCacheName)
			.then((cache) => {
				cache.addAll(nonCriticalAssets);
				// Only return the criticalAssets to waitUntil
				// This will allow the noncritical assets to fail
				return cache.addAll(criticalAssets);
			})
			.then(() => self.skipWaiting())
	);
});

// после активации, удаляем старые экземпляры кешей
self.addEventListener('activate', (event) => {

	// remove caches beginning "windowbuilder-" that aren't the new cache
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (!/^windowbuilder-/.test(cacheName)) {
							return;
						}
						if (newCacheName !== cacheName) {
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => self.clients.claim())
	);

});

// обработчик http-запросов веб-приложения
self.addEventListener('fetch', (event) => {

  const {request} = event;

  // запросы к couchdb и запросы с методом, отличным от GET, обрабатываем без кеширования
	if(request.method != 'GET' || request.url.match('couchdb/') || request.url.match('couchdb2/') || request.url.match(':5984')){
		return fetch(request)
			.catch((err) => {
				console.log(err);
				//return cache.match('/offline.html');
			});
	}

	// Try the cache, if it's not in there try the network, then cache that response
	// if that network request fails show the offline.html page.
	event.respondWith(
		caches.open(newCacheName).then((cache) => {
			return cache.match(request)
				.then((response) => {
					return response || fetch(request)
              .then((response) => {
					  try{
              cache.put(request, response.clone());
            }
            catch(err){}
            return response;
					})
              .catch((err) => {
					      console.log(err);
							  //return cache.match('/offline.html');
						});
			});
		})
	);
});
