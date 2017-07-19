// конструктор metadata.js


// функция установки параметров сеанса
import settings from '../../config/app.settings';

// скрипт инициализации метаданных
import meta_init from './init';

import {metaActions} from 'metadata-redux';



// скрипт инициализации в привязке к store приложения
export function init(store) {

  return new Promise(function (resolve, reject) {

    setTimeout(() => {

      try {
        // инициализируем параметры сеанса и метаданные
        $p.wsql.init(settings, meta_init);

        // выполняем модификаторы
        //modifiers($p)

        // информируем хранилище о готовности MetaEngine
        store.dispatch(metaActions.META_LOADED($p));

        // читаем локальные данные в ОЗУ
        if ($p.wsql.get_user_param('couch_direct', 'boolean')) {
          $p.adapters.pouch.emit('pouch_data_loaded', {});
        }
        else {
          $p.adapters.pouch.load_data();
        }

        resolve();

      }
      catch (err) {
        reject(err);
      }
    });

  });
}

// экспортируем $p и PouchDB глобально
//global.$p = $p;
