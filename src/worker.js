
(function(){

	function onCached(e) {
		if (applicationCache.status === 1) {
			giveIntro();
		}
	}

	function giveIntro() {
		console.log('%c\nЗаказ дилера @ metadata.js', 'color: #4ec084');
	}

	function offerToReload() {

		var confirm_count = 0;

		function do_reload(){

			if(typeof dhtmlx != "undefined"){
				dhtmlx.confirm({
					title: "Версия файлов",
					text: "Файлы на сервере обновлены<br /> Рекомендуется закрыть браузер и войти<br />повторно для применения обновления",
					ok: "Перезагрузка",
					cancel: "Продолжить",
					callback: function(btn) {

						if(btn){

							setTimeout(function () {
								if(typeof $p == "object" && $p.eve)
									$p.eve.redirect = true;
								location.reload(true);
							}, 1000);

						}else{

							confirm_count++;
							setTimeout(do_reload, confirm_count * 30000);

						}
					}
				});
			}else{
				// TODO: показать диалог или всплывающее сообщение
				location.reload(true);
			}

		}

		do_reload();
	}

	if (navigator.serviceWorker) {
		navigator.serviceWorker.register('worker.js')
			.then(function (registration) {
				registration.addEventListener('updatefound', function () {
					var newWorker = registration.installing;
					registration.installing.addEventListener('statechange', function () {
						if (newWorker.state == 'installed' && navigator.serviceWorker.controller) {
							offerToReload();
						}
					});
				});
				giveIntro();
			})
			.catch(function(error) {
				console.log('ServiceWorker registration failed: ', error);
			});
	} else if (window.applicationCache) {
		applicationCache.addEventListener('cached', onCached, false);
		applicationCache.addEventListener('noupdate', giveIntro, false);
		applicationCache.addEventListener('updateready', offerToReload, false);
	}

})();

