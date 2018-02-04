// модуль создаёт и настраивает MetaEngine

// функция установки параметров сеанса
import settings from '../../config/app.settings';

// принудительный редирект и установка зоны для абонентов с выделенными серверами
import {patch_prm, patch_cnn} from '../../config/patch_cnn';

// генератор события META_LOADED для redux
import {metaActions} from 'metadata-redux';

// загружаем metadata.transition и экспортируем $p глобально
import $p from 'metadata-dhtmlx';

// подключаем react-специфичные методы
import plugin_react from 'metadata-react/plugin';
plugin_react.constructor.call($p);

import reset_cache from './reset_cache';

global.$p = $p;

// параметры сеанса и метаданные инициализируем без лишних проволочек
$p.wsql.init(patch_prm(settings));
patch_cnn();

// скрипт инициализации в привязке к store приложения
export function init(dispatch) {

  // читаем скрипт инициализации метаданных, полученный в результате выполнения meta:prebuild
  return import('./init')
    .then((meta_init) => {

      // выполняем скрипт инициализации метаданных
      meta_init($p);

      // сообщяем адаптерам пути, суффиксы и префиксы
      const {wsql, job_prm, adapters: {pouch}} = $p;
      pouch.init(wsql, job_prm);
      reset_cache(pouch);

      // читаем paperjs и deep-diff
      return $p.load_script('/dist/paperjs-deep-diff.min.js', 'script');
    })
    // читаем скрипт рисовалки
    .then(() => $p.load_script('/dist/windowbuilder.js', 'script'))

    // читаем скрипт расчетной части построителя
    .then(() => $p.load_script('/dist/wnd_debug.js', 'script'))

    // читаем скрипты модификаторов DataObj`s и DataManager`s
    .then(() => import('./modifiers'))
    .then((modifiers) => {

      // выполняем модификаторы
      modifiers.default($p);

      // информируем хранилище о готовности MetaEngine
      dispatch(metaActions.META_LOADED($p));

      // читаем локальные данные в ОЗУ
      const {adapters: {pouch}} = $p;
      return pouch.load_data()
        .then(() => pouch.attach_refresher());

    })
    .catch($p && $p.record_log);
}


