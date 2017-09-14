// модуль создаёт и настраивает MetaEngine

// подгрузим стили асинхронно
import('metadata-react/styles/react-data-grid.css');

// функция установки параметров сеанса
import settings from '../../config/app.settings';

// принудительный редирект и установка зоны для абонентов с выделенными серверами
import {patch_prm, patch_cnn} from '../../config/patch_cnn';

// скрипт инициализации метаданных
import meta_init from './init';

// скрипты модификаторов DataObj`s и DataManager`s
import modifiers from './modifiers';

// генератор события META_LOADED для redux
import {metaActions} from 'metadata-redux';

// загружаем metadata.transition и экспортируем $p глобально
import $p from 'metadata-dhtmlx';

// подключаем react-специфичные методы
import plugin_react from 'metadata-react/plugin';
plugin_react.constructor.call($p);

global.$p = $p;

// параметры сеанса и метаданные инициализируем без лишних проволочек
$p.wsql.init(patch_prm(settings), meta_init);
patch_cnn();

// скрипт инициализации в привязке к store приложения
export function init(store) {

  return $p.load_script('/dist/windowbuilder.js', 'script')
    .then(() => $p.load_script('/dist/wnd_debug.js', 'script'))
    .then(() => {

      // подгружаем дополнительные стили
      $p.utils.load_script('https://cdn.jsdelivr.net/fontawesome/4.7.0/css/font-awesome.min.css', 'link');
      $p.utils.load_script('https://fonts.googleapis.com/css?family=Roboto', 'link');

      // выполняем модификаторы
      modifiers($p);

      // информируем хранилище о готовности MetaEngine
      store.dispatch(metaActions.META_LOADED($p));

      // читаем локальные данные в ОЗУ
      return $p.adapters.pouch.load_data();

    });
}


