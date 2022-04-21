// модуль создаёт и настраивает MetaEngine

// функция установки параметров сеанса
import settings from '../../config/app.settings';

// принудительный редирект и установка зоны для абонентов с выделенными серверами
import {patch_prm, patch_cnn} from '../../config/patch_cnn';

// генератор события META_LOADED для redux
import {addMiddleware} from 'redux-dynamic-middlewares';
// стандартные события pouchdb и метаданных
import {metaActions, metaMiddleware} from 'metadata-redux';
// дополнительные события pouchdb
import {customPouchMiddleware} from '../redux/reducers/pouchdb';

// читаем скрипт инициализации метаданных, полученный в результате выполнения meta:prebuild
import meta_init from 'wb-core/dist/init';
import modifiers from './modifiers';
import proxy_login, {load_ram, load_common} from 'metadata-superlogin/proxy';

// загружаем metadata.transition и экспортируем $p глобально
import $p from 'metadata-dhtmlx';

// подключаем react-специфичные методы
import plugin_react from 'metadata-react/plugin';
plugin_react.constructor.call($p);

// подключаем cron
import cron from 'metadata-abstract-ui/cron';
cron.constructor.call($p);

import reset_cache from './reset_cache';

global.$p = $p;

// параметры сеанса и метаданные инициализируем без лишних проволочек
$p.wsql.init(patch_prm(settings));
patch_cnn();

// со скрипом инициализации метаданных, так же - не затягиваем
meta_init($p);

// запускаем проверку единственности экземпляра
//$p.utils.single_instance_checker.init();

// скрипт инициализации в привязке к store приложения
export function init(store) {

  try {

    const {dispatch} = store;

    // подключаем metaMiddleware
    addMiddleware(metaMiddleware($p));
    addMiddleware(customPouchMiddleware($p));

    // сообщяем адаптерам пути, суффиксы и префиксы
    const {wsql, job_prm, classes, adapters: {pouch}, md} = $p;
    classes.PouchDB.plugin(proxy_login());
    pouch.init(wsql, job_prm);
    reset_cache(pouch);

    if(job_prm.use_ram === false) {
      pouch.remote.ram = new classes.PouchDB(pouch.dbpath('ram'), {auto_compaction: true, revs_limit: 3, owner: pouch, fetch: pouch.fetch});
      pouch.on({
        on_log_in() {
          return load_ram($p)
            .then(() => {
              const {roles} = $p.current_user || {};
              if(roles && (roles.includes('ram_editor') || roles.includes('doc_full'))) {
                pouch.local.sync.ram = pouch.remote.ram.changes({
                  since: 'now',
                  live: true,
                  include_docs: true
                })
                  .on('change', (change) => {
                    // информируем слушателей текущего сеанса об изменениях
                    if(change.doc.obj_delivery_state !== 'Шаблон') {
                      pouch.load_changes({docs: [change.doc]});
                      pouch.emit('ram_change', change);
                    }
                  })
                  .on('error', (err) => {
                    $p.record_log(err);
                  });
              }
            });
        },
      });
      md.once('predefined_elmnts_inited', () => pouch.emit('pouch_complete_loaded'));
    }

    // читаем paperjs и deep-diff
    $p.load_script('/dist/paperjs-deep-diff.min.js', 'script')

      // читаем базовый скрипт рисовалки
      .then(() => import('wb-core/dist/drawer'))

      .then((module) => {
        module.default({$p, paper});
      })

      // читаем дополнительный скрипт рисовалки
      .then(() => $p.load_script('/dist/windowbuilder.js', 'script'))

      // читаем скрипт расчетной части построителя
      .then(() => $p.load_script('/dist/wnd_debug.js', 'script'))

      // читаем скрипты модификаторов DataObj`s и DataManager`s
      .then(() => {

        // выполняем модификаторы
        modifiers($p);

        // информируем хранилище о готовности MetaEngine
        dispatch(metaActions.META_LOADED($p));

        // скрипт qrcode грузим асинхронно
        $p.load_script('/dist/qrcodejs/qrcode.min.js', 'script');
        $p.load_script('/dist/qrcodejs/qrcode.tosjis.min.js', 'script');

        // читаем локальные данные в ОЗУ
        return job_prm.use_ram === false ? load_common($p) : pouch.load_data();

      })
      .catch((err) => {
        $p.record_log(err);
      });
  }
  catch (err) {
    $p && $p.record_log(err);
  }
}


