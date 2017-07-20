// конструктор metadata.js

// функция установки параметров сеанса
import settings from '../../config/app.settings';

// скрипт инициализации метаданных
import meta_init from './init';

import {metaActions} from 'metadata-redux';


// скрипт инициализации в привязке к store приложения
export function init(store) {

  // инициализируем параметры сеанса и метаданные
  $p.wsql.init(settings, meta_init);

  return $p.load_script('/dist/windowbuilder.js', 'script')
    .then(() => $p.load_script('/dist/wnd_debug.js', 'script'))
    .then(() => {

      // выполняем модификаторы
      //modifiers($p)

      // информируем хранилище о готовности MetaEngine
      store.dispatch(metaActions.META_LOADED($p));

      // читаем локальные данные в ОЗУ
      return $p.adapters.pouch.load_data();

    });
}

// экспортируем $p и PouchDB глобально
//global.$p = $p;
