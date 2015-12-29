/**
 * Обработчик событий сокета
 *
 * Created 25.12.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author Evgeniy Malyarov
 * @module socket_msg
 */

// Слушаем сообщения сокета
dhx4.attachEvent("socket_msg", function(data){
	if(data.ping)
		$p.eve.socket.send({ping: data.ping});
	else if(data.action == "open" ){
		var ox = JSON.parse(data.obj);
		$p.cat.characteristics.load_array([ox]);
		ox = $p.cat.characteristics.get(ox.ref);
		$p._editor.open(ox);
	}
	else
		console.log(data);
});