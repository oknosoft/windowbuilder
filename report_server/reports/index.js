const tmp = async (ctx, next) => {


  /**
   * Формируем отчеты /r/{zone}/{type}/{uid}?{query}
   * @param zone - область данных
   * @param type - тип отчета
   * @param uid - идентификатор объекта, зависит от `type`
   * @param query - дополнительные необязательные параметры
   *
   * http://localhost:3000/r/11/0/ae6365b7-0585-4f4e-d5d2-59c4c588bf72
   * http://localhost:3000/report/debug.html?11/ae6365b7-0585-4f4e-d5d2-59c4c588bf72
   * http://localhost:3000/r/11/x/8f684a73-50bb-4f84-cb55-d5b1b10a5c31?att=svg
   */
  ctx.app.get('/r/:zone/:type/:uid', function(req, res, next) {

    const $p = engines[req.params.zone];

    function passthrough(url, att) {
      request.get(att ? url+'/'+att : url, {
        auth: {
          'user': config_init.dbServer.user,
          'pass': config_init.dbServer.password
        }
      })
        .pipe(res);
    }

    if(!$p)
      return next();

    switch (req.params.type){
      case '0':
        // получаем документ расчет объект
        return $p.doc.calc_order.get(req.params.uid, 'promise')
          .then(function(calc_order) {
            calc_order.print_data.then(function (print_data) {

              res.status(200).json(print_data);

              // calc_order.production.forEach(function (row) {
              // 	if(!row.characteristic.empty()){
              // 		row.characteristic.unload();
              // 	}
              // })
              // calc_order.unload();
            })
          })
          .catch(function(err) {
            console.log(err);
            return next(err);
          });

      case 'x':
        // проксируем характеристики и вложения характеристик
        passthrough($p.adapters.pouch.remote.doc._db_name + '/cat.characteristics|' + req.params.uid, req.query.att)
        break;

      case 'o':
        // проксируем организации и вложения организаций
        passthrough($p.adapters.pouch.remote.ram._db_name + '/cat.organizations|' + req.params.uid, req.query.att)
        break;

      default:
        return next();
    }

  });
}
