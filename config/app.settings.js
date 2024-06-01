
/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */

const is_node = typeof process !== 'undefined' && process.versions && process.versions.node;

function settings(prm = {}) {

  Object.defineProperties(prm, {
    use_google_geo: {
      get() {
        return this.keys.google;
      }
    },
    session_zone: {
      get() {
        return typeof sessionStorage === 'object' && sessionStorage.key('zone') ? sessionStorage.getItem('zone') : this.zone;
      }
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
    pg_path: process.env.PGPATH || '/r/postgres/wb_',

    // расположение файлов руководства пользователя
    docs_root: 'https://raw.githubusercontent.com/oknosoft/windowbuilder/master/doc/',

    // путь к 3d-рендеру
    d3d: 'http://localhost:3003',

    // фильтр для репликации с CouchDB не используем
    pouch_filter: {
      meta: 'auth/meta',
    },

    // по умолчанию, обращаемся к зоне 1
    zone: process.env.ZONE || 1,

    // объявляем номер демо-зоны
    zone_demo: 1,

    // по умолчанию, работаем в режиме auth-proxy
    use_ram: false,

    // если use_meta === false, не используем базу meta в рантайме - см.: https://github.com/oknosoft/metadata.js/issues/255
    use_meta: false,

    // размер вложений 2Mb
    attachment_max_size: 2000000,

    // размер реплицируемых данных. если больше - включаем direct
    data_size_sync_limit: 160000000,

    // время до засыпания
    idle_timeout: 57 * 60 * 1000,

    // разрешаем сохранение пароля
    enable_save_pwd: true,

    // используем геокодер
    use_ip_geo: true,

    // здесь можно перечислить имена параметров для включения в корень job_prm c подтягиванием значений из local_storage
    //additional_params: [],

    //
    keys: {
      geonames: 'oknosoft',
    },

  }, is_node && {
    // авторизация couchdb
    user_node: {
      username: process.env.DBUSER || 'admin',
      password: process.env.DBPWD || 'admin',
    },
  });

}

module.exports = settings;

// корректирует параметры до инициализации
settings.prm = (settings) =>{
  const {predefined} = _dynamic_patch_;
  return (prm) => {
    settings(prm);
    'zone,ram_indexer'.split(',').forEach((name) => {
      if(predefined.hasOwnProperty(name)) {
        prm[name] = predefined[name];
      }
    });
    if(predefined.host && !location.host.match(predefined.host)) {
      location.replace(predefined.host);
    }
    return prm;
  };
};

// корректируем параметры после инициализации
settings.cnn = ({job_prm, wsql}) => {
  const {predefined} = _dynamic_patch_;
  for(const name in predefined) {
    const v = predefined[name];
    if(name === 'zone') {
      wsql.get_user_param('zone') != v && wsql.set_user_param('zone', predefined.zone);
    }
    else if(name === 'use_ram') {
      wsql.set_user_param('use_ram', false);
      job_prm.use_ram = false;
    }
    else {
      if(typeof job_prm[name] === 'object') {
        Object.assign(job_prm[name], v);
      }
      else {
        job_prm[name] = v;
      }
    }

  }
};
