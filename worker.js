// Useful resources:
// - https://eduardoboucas.com/blog/2015/06/04/supercharging-jekyll-with-a-serviceworker.html
// - https://jakearchibald.com/2014/offline-cookbook

var newCacheName = 'windowbuilder-cache-v2016-09-09';

var criticalAssets = [
	'index.html',

	// css
	'https://cdn.jsdelivr.net/fontawesome/4.6.3/css/font-awesome.min.css',
	'https://cdn.jsdelivr.net/g/metadata@0.11.219(dhx_terrace.css+metadata.css)',
	'dist/windowbuilder.css',

	// js
	'https://cdn.jsdelivr.net/g/momentjs@2.14,alasql@0.3,pouchdb@6.0,jquery@2.2,metadata@0.11.219(dhtmlx.min.js)',
	'lib/metadata.min.js',
	'lib/paper-core.min.js',
	'dist/windowbuilder.js',
	'dist/wnd_debug.js'
];

var pages = [];

var nonCriticalAssets =
	[
		'dist/imgs/fav-wnd.ico',
		'dist/imgs/fav-okn144.png',
		'dist/imgs/splash.gif',

		'dist/imgs/stamp.png',
		'dist/imgs/about_48.png',
		'dist/imgs/settings_48.png',
		'dist/imgs/events_48.png',
		'dist/imgs/projects_48.png',
	]
		.concat(pages);
		// .filter(function (file) {
		// 	return file.indexOf('/blog/page') === -1;
		// });

// после установки, сразу кешируем статику
self.addEventListener('install', function (event) {
	event.waitUntil(
		caches.open(newCacheName)
			.then(function (cache) {
				cache.addAll(nonCriticalAssets);
				// Only return the criticalAssets to waitUntil
				// This will allow the noncritical assets to fail
				return cache.addAll(criticalAssets);
			})
			.then(function () {
				return self.skipWaiting();
			})
	);
});

// после активации, удаляем старые экземпляры кешей
self.addEventListener('activate', function (event) {

	// remove caches beginning "windowbuilder-" that aren't the new cache
	event.waitUntil(
		caches.keys()
			.then(function (cacheNames) {
				return Promise.all(
					cacheNames.map(function (cacheName) {
						if (!/^windowbuilder-/.test(cacheName)) {
							return;
						}
						if (newCacheName !== cacheName) {
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(function () {
				return self.clients.claim();
			})
	);
});

// обработчик http-запросов веб-приложения
self.addEventListener('fetch', function (event) {

	if(event.request.method != "GET" || event.request.url.indexOf('couchdb/') != -1){
		return fetch(event.request)
			.catch(function (err) {
				console.log(err);
				//return cache.match('/offline.html');
			});
	}

	// Try the cache, if it's not in there try the network, then cache that response
	// if that network request fails show the offline.html page.
	event.respondWith(
		caches.open(newCacheName).then(function (cache) {
			return cache.match(event.request)
				.then(function (response) {
					return response || fetch(event.request)
							.then(function (response) {
								cache.put(event.request, response.clone());
								return response;
							})
						.catch(function (err) {
							console.log(err);
							//return cache.match('/offline.html');
						});
			});
		})
	);
});
