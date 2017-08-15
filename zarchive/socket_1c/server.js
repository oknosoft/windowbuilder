/**
 * Created by unpete on 02.04.2015.
 */

var
	// кеш гвидов, т.к. внутри вебсокета не сохраняются значения между сеансами
	uid_cache = {},

	// WebSocket для серверных событий на клиенте
	WebSocketServer = require('ws').Server,
	ws_md = new WebSocketServer({ port: 8001 })
		.on('connection', function(ws) {

			ws.on('message', function(data) {
				try{
					data = JSON.parse(data);

					if(data._mirror){
						var sec_key = ws.upgradeReq.headers["sec-websocket-key"],
							current_uid;

						if(!uid_cache[sec_key])
							uid_cache[sec_key] = {};
						current_uid = uid_cache[sec_key];

						if(data.hasOwnProperty("zone"))
							current_uid.zone = data.zone;
						if(data.hasOwnProperty("browser_uid"))
							current_uid.browser_uid = data.browser_uid;
						if(data.hasOwnProperty("socket_uid"))
							current_uid.socket_uid = data.socket_uid;
						if(data.hasOwnProperty("_side"))
							current_uid._side = data._side;

						console.log(sec_key + ":: " + JSON.stringify(current_uid || {}, 4));
					}

					ws_send(data, ws);

				}catch(err){
					console.log(err);
				}
			});
		}),

	// http-сервер статического содержимого (файлы приложения)
	static = require('node-static'),
	file_server = new static.Server("../", { gzip: true }),

	http = require("http"),
	//http_static = http.createServer(function (request, response) {
	//	request.addListener('end', function () {
	//		file_server.serve(request, response, function (e, res) {
	//			if (e && (e.status === 404)) { // If the file wasn't found
	//				file_server.serveFile('/README.md', 404, {}, request, response);
	//			}
	//		});
	//	}).resume();
	//}).listen(80),

	// http-сервер http для взаимодействия с 1С
	http_1c = http.createServer(msg_1c).listen(8003),

	// metadata.js
	$p = require('../lib/metadata.core.js');

// принимает post по http и перенаправляет странице по сокету
function msg_1c(request, response) {

	var rtext="", robj;

	request.on("data", function(chunk) {
		rtext+=chunk.toString();
	});

	request.on("end", function() {
		response.end("200: Ok");
		try {
			robj = JSON.parse(rtext);
		} catch (err){
			return console.error('JSON.parse', err);
		};
		ws_send(robj);
	});
}

function ws_send(data, ws) {
	var str_data = typeof data == "object" ? JSON.stringify(data) : data;

	ws_md.clients.forEach(function each(client) {

		var current_uid = uid_cache[client.upgradeReq.headers["sec-websocket-key"]];

		if(!current_uid){
			client.close();

		}else if((current_uid.socket_uid == data.socket_uid || current_uid.browser_uid == data.browser_uid)){

			console.log(current_uid._side  + " " + data._side);

			if((data._mirror && ws && client.upgradeReq.headers["sec-websocket-key"] == ws.upgradeReq.headers["sec-websocket-key"])
					|| (current_uid._side != data._side)){
				try{
					client.send(str_data);
				}catch(err){
					try{
						client.close();
					}catch(err){

					}
				}
			}
		}
	});
}

function ws_broadcast(data) {
	var str_data = typeof data == "object" ? JSON.stringify(data) : data;
	ws_md.clients.forEach(function each(client) {
		client.send(str_data);
	});
}




