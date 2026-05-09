import MetaEngine from 'metadata-dhtmlx';
import plugin_react from 'metadata-react/plugin';
export function plugins() {

  return new Promise((resolve, reject) => {

    // подключаем react-специфичные методы
    MetaEngine.plugin(plugin_react);

    const timer = setTimeout(() => resolve(MetaEngine), 20000);

    const s = document.createElement('script');
    s.type = 'module';
    s.src = '/dist/patch/index.js';
    s.async = true;
    const listener = ({detail}) => {
      clearTimeout(timer);
      document.removeEventListener('externalPlugins', listener);
      detail?.beforeCreate(MetaEngine);
      resolve(MetaEngine);
    };
    document.addEventListener('externalPlugins', listener, false);
    document.head.appendChild(s);

  });
}
