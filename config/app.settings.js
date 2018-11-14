
/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */

const env = (process && process.env) || {};

module.exports = function settings(prm) {

  if(!prm) {
    prm = {};
  };

  return Object.assign(prm, {

    // разделитель для localStorage
    local_storage_prefix: 'wb_',

    // гостевые пользователи для демо-режима
    guests: [{
      username: 'Дилер',
      password: '1gNjzYQKBlcD',
    }],

    // расположение couchdb для сайта
    couch_path: env.COUCHPATH || "/couchdb/wb_",
    //couch_path: "https://light.oknosoft.ru/couchdb/wb_",
    //couch_path: 'http://cou200:5984/wb_',

    // расположение couchdb для nodejs
    couch_local: env.COUCHLOCAL || 'http://cou221:5984/wb_',

    // фильтр для репликации с CouchDB не используем
    pouch_filter: {
      meta: 'auth/meta',
    },

    // по умолчанию, обращаемся к зоне 1
    zone: env.ZONE || 1,

    // объявляем номер демо-зоны
    zone_demo: 1,

    // если use_meta === false, не используем базу meta в рантайме
    // см.: https://github.com/oknosoft/metadata.js/issues/255
    use_meta: false,

    // размер вложений 2Mb
    attachment_max_size: 2000000,

    // размер реплицируемых данных. если больше - включаем direct
    data_size_sync_limit: 160000000,

    // разрешаем сохранение пароля
    enable_save_pwd: true,

    // используем геокодер
    use_ip_geo: true,

    // используем карты google
    use_google_geo: 'AIzaSyAO-Jca5NTE5bQ7IY7BxFCl0jgW9OsJvuM',

  });

};
