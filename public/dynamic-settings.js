/**
 * Здесь определяем специфичные для хоста параметры
 */

(() => {
  const keys21 = {
    google: '',
    yandex: '',
    yasuggest: '',
  };

  window._dynamic_patch_ = {

    predefined: {
      zone: 10,
      keys: keys21,
      ram_indexer: false,
    },

  };

})();


// при желании-необходимости, здесь можно разместить...
