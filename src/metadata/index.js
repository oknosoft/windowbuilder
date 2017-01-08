// конструктор metadata.js

import MetaEngine from "metadata-core";
import metadata_pouchdb from "metadata-pouchdb";
import metadata_redux from "metadata-redux";
import metadata_ui from "metadata-abstract-ui";
import metadata_react_ui from "./react_ui_plugin";

// функция установки параметров сеанса
import settings from "../../config/app.settings";

// скрипт инициализации метаданных
import meta_init from "./init";

// методы и обработчики событий объектов и менеджеров данных
import modifiers from "./modifiers";

/* global __DEBUG__ */

MetaEngine
  .plugin(metadata_pouchdb)     // подключаем pouchdb-адаптер к прототипу metadata.js
  .plugin(metadata_redux)       // подключаем свойства redux к прототипу metadata.js
  .plugin(metadata_ui)          // подключаем общие методы интерфейса пользователя
  .plugin(metadata_react_ui)    // подключаем методы для работы с компонентами react

// создаём экземпляр MetaEngine
const $p = new MetaEngine()
export default $p

// скрипт инициализации в привязке к store приложения
export function init(store, subscriber) {

  return new Promise(function (resolve, reject) {

    setTimeout(() => {

      try {
        // инициализируем параметры сеанса и метаданные
        $p.wsql.init(settings, meta_init)

        // подключаем обработчики событий плагином metadata-redux
        $p.rx_events(store)

        // выполняем модификаторы
        modifiers($p)

        // информируем хранилище о готовности MetaEngine
        store.dispatch($p.rx_actions.META_LOADED($p))

        // читаем локальные данные в ОЗУ
        $p.adapters.pouch.load_data();

        // подписываемся на события хранилища
        store.subscribe(subscriber)

        resolve()

      } catch (err) {
        reject(err)
      }

    })

  })
}

// в отладочном режиме экспортируем $p и PouchDB глобально
if (__DEBUG__) {
  window.$p = $p
  //noinspection
  if (!window.PouchDB) {
    window.PouchDB = $p.classes.PouchDB
  }
}
