
/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */

const is_node = typeof process !== 'undefined' && process.versions && process.versions.node;

module.exports = function settings(prm = {}) {

  Object.defineProperty(prm, 'use_google_geo', {
    get() {
      return this.keys.google;
    }
  });

  return Object.assign(prm, {

    is_node,

    // разделитель для localStorage
    local_storage_prefix: 'wb_',

    // гостевые пользователи для демо-режима
    guests: [{
      username: 'Дилер',
      password: '1gNjzYQKBlcD',
    }],

    // расположение couchdb для сайта
    couch_path: process.env.COUCHPATH || "/couchdb/wb_",
    //couch_path: "https://light.oknosoft.ru/couchdb/wb_",
    //couch_path: 'http://cou200:5984/wb_',

    // расположение couchdb для nodejs
    couch_local: process.env.COUCHLOCAL || 'http://cou221:5984/wb_',

    // расположение адаптера postgres
    pg_path: process.env.PGPATH || "/r/postgres/wb_",

    // фильтр для репликации с CouchDB не используем
    pouch_filter: {
      meta: 'auth/meta',
    },

    // по умолчанию, обращаемся к зоне 1
    zone: process.env.ZONE || 1,

    // объявляем номер демо-зоны
    zone_demo: 1,

    // если use_meta === false, не используем базу meta в рантайме
    // см.: https://github.com/oknosoft/metadata.js/issues/255
    use_meta: false,

    // размер вложений 2Mb
    attachment_max_size: 2000000,

    // размер реплицируемых данных. если больше - включаем direct
    data_size_sync_limit: 160000000,

    // время до засыпания
    idle_timeout: 27 * 60 * 1000,

    // разрешаем сохранение пароля
    enable_save_pwd: true,

    // используем геокодер
    use_ip_geo: true,

    //
    keys: {
      dadata: 'bc6f1add49fc97e9db87781cd613235064dbe0f9',
      yandex: '0ab2c686-6aca-4311-ae5e-087829702ae7',
      google: 'AIzaSyAO-Jca5NTE5bQ7IY7BxFCl0jgW9OsJvuM',
      geonames: 'oknosoft',
    },

  }, is_node && {
    // авторизация couchdb
    user_node: {
      username: process.env.DBUSER || 'admin',
      password: process.env.DBPWD || 'admin',
    },
  });

};
