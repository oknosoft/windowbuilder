/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016
 * @module main
 *
 * Created 18.08.2016
 */

var http = require('http'),
	httpProxy = require('http-proxy'),
	package_data = JSON.parse(require('fs').readFileSync('./package.json', 'utf8'));  // данные файла package.json

var	$p = require('metadata-js');    // подключим метадату

// установим параметры
$p.on("settings", function (prm) {

	// разделитель для localStorage
	prm.local_storage_prefix = package_data.config.prefix;

	// по умолчанию, обращаемся к зоне 0
	prm.zone = package_data.config.zone;

	// расположение couchdb
	prm.couch_path = package_data.config.couchdb;

	// логин гостевого пользователя couchdb
	prm.guest_name = "guest";

	// пароль гостевого пользователя couchdb
	prm.guest_pwd = "meta";

});
$p.eve.init();

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
	// You can define here your custom logic to handle the request
	// and then proxy the request.
	proxy.web(req, res, { target: 'http://i980:5984' });
});

console.log("listening on port 5050")
server.listen(5050);
