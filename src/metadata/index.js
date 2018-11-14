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
import meta_init from './init';
import modifiers from './modifiers';

// загружаем metadata.transition и экспортируем $p глобально
import $p from 'metadata-dhtmlx';

if (process.env.NODE_ENV === 'development') {
  import('pouchdb-debug')
    .then((module) => $p.classes.PouchDB.plugin(module.default));
}

// подключаем react-специфичные методы
import plugin_react from 'metadata-react/plugin';
plugin_react.constructor.call($p);

// подключаем cron
import cron from 'metadata-abstract-ui/cron.min';
cron.constructor.call($p);

import reset_cache from './reset_cache';

global.$p = $p;

// параметры сеанса и метаданные инициализируем без лишних проволочек
$p.wsql.init(patch_prm(settings));
patch_cnn();

// со скрипом инициализации метаданных, так же - не затягиваем
meta_init($p);

// запускаем проверку единственности экземпляра
$p.utils.single_instance_checker.init();

// скрипт инициализации в привязке к store приложения
export function init(store) {

  try {

    const {dispatch} = store;

    // подключаем metaMiddleware
    addMiddleware(metaMiddleware($p));
    addMiddleware(customPouchMiddleware($p));

    // сообщяем адаптерам пути, суффиксы и префиксы
    const {wsql, job_prm, adapters: {pouch}} = $p;
    pouch.init(wsql, job_prm);
    reset_cache(pouch);

    // читаем paperjs и deep-diff
    $p.load_script('/dist/paperjs-deep-diff.min.js', 'script')

      // читаем скрипт рисовалки
      .then(() => $p.load_script('/dist/windowbuilder.js', 'script'))

      // читаем скрипт расчетной части построителя
      .then(() => $p.load_script('/dist/wnd_debug.js', 'script'))

      // читаем скрипты модификаторов DataObj`s и DataManager`s
      .then(() => {

        // выполняем модификаторы
        modifiers($p);

        // информируем хранилище о готовности MetaEngine
        dispatch(metaActions.META_LOADED($p));

        // читаем локальные данные в ОЗУ
        return pouch.load_data();

      })
      .catch((err) => {
        $p.record_log(err);
      });
  }
  catch (err) {
    $p && $p.record_log(err);
  }
}


