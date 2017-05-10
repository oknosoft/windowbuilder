
// дополняем прототип Object методами observe
require('./observe');

const debug = require('debug')('wb:meta');

// конструктор MetaEngine
const MetaEngine = require('../../node_modules/metadata-core').default
  .plugin(require('../../node_modules/metadata-pouchdb').default);
debug('required');

// создаём контекст MetaEngine
const $p = new MetaEngine();
debug('created');

// эмулируем излучатель событий dhtmlx
$p.eve = {

  cache: {},

  callEvent(type, args) {
    $p.md.emit(type, args);
  },

  attachEvent(type, listener) {
    $p.md.on(type, listener);
    const id = $p.utils.generate_guid();
    this.cache[id] = [type, listener];
    return id;
  },

  detachEvent(id) {
    const ev = this.cache[id];
    if(ev){
      $p.md.off(ev[0], ev[1]);
      delete this.cache[id];
    }
  }

};


// инициализируем параметры сеанса и метаданные
(async () => {

  // функция установки параметров сеанса
  const config_init = require('../../config/report.settings');

  // функция инициализации структуры метаданных
  const meta_init = require('../../src/metadata/init');

  // модификаторы data-объектов
  const modifiers = require('./modifiers');

  // реквизиты подключения к couchdb
  const {user_node} = config_init();

  // инициализируем метаданные
  $p.wsql.init(config_init, meta_init);

  // подключим модификаторы
  modifiers($p);
  debug('inited & modified');

  // загружаем кешируемые справочники в ram
  await $p.adapters.pouch.log_in(user_node.username, user_node.password);
  debug('logged in');

})();

module.exports = $p;




