

// конструктор metadata.js
//const MetaEngine = require('metadata-core').default

import MetaEngine from 'metadata-core'
import metadata_pouchdb from 'metadata-pouchdb'
import metadata_redux from 'metadata-redux'
import metadata_react from 'metadata-react-ui/plugin'

MetaEngine
  .plugin(metadata_pouchdb)       // подключаем pouchdb-адаптер к прототипу metadata.js
  .plugin(metadata_redux)         // подключаем свойства redux к прототипу metadata.js
  .plugin(metadata_react)         // подключаем методы для работы с компонентами react к прототипу metadata.js

const $p = new MetaEngine()
export default $p

// в отладочном режиме экспортируем $p глобально
if (__DEBUG__) {
  window.$p = $p;
  //noinspection
  if(!window.PouchDB)
    window.PouchDB = $p.classes.PouchDB;
}
