// проверяем объекты при загрузке страницы
describe("Загрузка страницы:", function () {

	var wtest,	$p;

	beforeEach(function () {
		wtest = frames[0];
		$p = wtest.$p;
		$p.eve.redirect = true;
	});

	it("Переменная $p должна содержать объект", function () {
		expect(typeof $p).toBe("object");
	});

	it("Свойство $p.job_prm при загрузке должен быть пустым", function () {
		expect($p.job_prm).toBeUndefined();
	});

	it("Свойства $p.eve и $p.iface должны содержать object", function () {
		expect(typeof $p.eve).toBe("object");
		expect(typeof $p.iface).toBe("object");
	});

	it("Свойства $p.Editor должно быть функцией (конструктором)", function () {
		expect(typeof $p.Editor).toBe("function");
	});

});

// проверяем собятия при старте приложения

describe("События:", function () {

	var wtest,
		$p,
		metaCallback;

	beforeEach(function(done) {

		wtest = frames[0];
		wtest.location.reload();
		wtest.onunload = function(){

			setTimeout(function() {
				wtest = frames[0];
				wtest.onload = function(){

					$p = wtest.$p;
					$p.eve.redirect = true;

					metaCallback = jasmine.createSpy("metaCallback");
					$p.eve.attachEvent("meta", metaCallback);

					setTimeout(function() {
						done();
					}, 3000);
				};

			}, 10);

		};
	});

	it("В пределах 3 секунд после загрузки страницы должно случиться событие готовности метаданных", function() {
		expect(metaCallback).toHaveBeenCalled();
	});

});

// должен быть нарисован фрейм основного интерфейса

// должны быть доступны диалог авторизации и закладка настроек
