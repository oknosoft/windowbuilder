/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */
module.exports = function settings(prm) {

  return Object.assign(prm || {}, {

    // разделитель для localStorage
    local_storage_prefix: "wb_",

    // гостевые пользователи для демо-режима
    guests: [],

    // если понадобится обратиться к 1С, будем использовать irest
    irest_enabled: true,

    // расположение rest-сервиса 1c по умолчанию
    rest_path: "",

    // расположение couchdb
    couch_path: "/couchdb/wb_",
    //couch_path: "https://light.oknosoft.ru/couchdb/wb_",

    // расположение couchdb для nodejs
    couch_local: "http://cou200:5984/wb_",

    pouch_filter: {
      meta: "auth/meta"
    },

    // по умолчанию, обращаемся к зоне 1
    zone: 1,

    // объявляем номер демо-зоны
    zone_demo: 1,

    // размер вложений
    attachment_max_size: 10000000,

    // разрешаем сохранение пароля
    enable_save_pwd: true

  })

}
