
function beforeCreate(MetaEngine) {
  // сюда можно подключить плагины, которые выполнятся внутри конструктора метадаты до создания экземпляра
  //MetaEngine.plugin({});

  // а эти, выполнятся при инициализации приложения
  Object.defineProperty(MetaEngine._plugins, 'external', {
    value: {
      beforeInit,
      beforeRamLoad,
      afterCommonLoad,
      afterRamLoad,
    }
  });
}

function beforeInit($p) {

}

function beforeRamLoad($p) {

}

function afterCommonLoad($p) {
  import('./browserVersion.js')
    .then(({browserVersion}) => browserVersion($p));
    // .then(() => import('./defaultPartners.js'))
    // .then(({defaultPartners}) => defaultPartners($p));
}

function afterRamLoad($p) {

}

const pluginsEvent = new CustomEvent("externalPlugins", {detail: {beforeCreate}});
document.dispatchEvent(pluginsEvent);
