
// конфигурация подключения к CouchDB
const config = require('./app.settings.js')

/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы по умолчанию из package.json
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */
module.exports = (prm) => {

  const base = config(prm);
  return Object.assign(base, {

    // авторизация couchdb
    user_node: {
      username: process.env.DBUSER || 'admin',
      password: process.env.DBPWD || 'admin'
    },

    couch_direct: true,

    couch_path: base.couch_local,

    // по умолчанию, обращаемся к зоне 0
    zone: process.env.ZONE || 2,

  })
}
