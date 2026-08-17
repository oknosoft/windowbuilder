
function beforeCreate(MetaEngine) {
  // сюда можно подключить плагины, которые выполнятся внутри конструктора метадаты до создания экземпляра
  //MetaEngine.plugin({});

  // а эти, выполнятся при инициализации приложения
  Object.defineProperty(MetaEngine._plugins, 'external', {
    value: {
      beforeInit,
      beforeRamLoad,
      afterCommonLoad,
      beforeCompleteLoaded,
      afterCompleteLoaded,
    }
  });
}

/**
 * Перед выполнением метода init, конструирующего менеджеров данных
 * @param $p
 */
function beforeInit($p) {

}

/**
 * Перед загрузкой образа данных
 * @param $p
 */
function beforeRamLoad($p) {

}

/**
 * После загрузки общих данных, не требующих авторизации
 * @param $p
 */
function afterCommonLoad($p) {
  // import('./orderFrmObj.js')
  //   .then(({orderFrmObj}) => orderFrmObj($p))
  //   .then(() => import('./browserVersion.js'))
  //   .then(({browserVersion}) => browserVersion($p))
  //   .then(() => import('./defaultPartners.js'))
  //   .then(({defaultPartners}) => defaultPartners($p));
}

/**
 * После загрузки всех справочников, но до выполнения подписок complete_loaded
 * @param $p
 */
function beforeCompleteLoaded($p) {

}

/**
 * После загрузки всех справочников и после выполнения подписок complete_loaded
 * @param $p
 */
function afterCompleteLoaded($p) {

}

const pluginsEvent = new CustomEvent("externalPlugins", {detail: {beforeCreate}});
document.dispatchEvent(pluginsEvent);
