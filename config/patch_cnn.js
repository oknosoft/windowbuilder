
const keys21 = {
  google: '',
  yandex: '283f550e-8184-4c84-b0e3-bdc5c1dee693',
}

/**
 * предопределенные зоны
 */
export const predefined = {
  'aribaz.': {zone: 2, host: 'https://aribaz.oknosoft.ru/'},
  'ecookna.': {
    zone: 21,
    host: 'https://zakaz.ecookna.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    templates: true,
    keys: keys21,
    crazy_ram: true,
  },
  'start.ecookna.': {
    zone: 21,
    host: 'https://start.ecookna.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    templates: false,
    keys: keys21,
    crazy_ram: false,
    use_ram: false,
    ram_indexer: false,
  },
  'localhost': {
    zone: 21,
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    templates: true,
    //keys: {google: ''},
    crazy_ram: false,
  },
  'rusokon.': {
    zone: 19,
    host: 'https://rusokon.oknosoft.ru/',
    keys: keys21,
  },
  'kaleva.': {
    zone: 8,
    host: 'https://zakaz.kaleva.ru/',
    splash: {css: 'splash21', title: false},
    keys: keys21,
  },
  'tmk.': {zone: 23, host: 'https://tmk-online.ru/'},
  'crystallit.': {zone: 25, host: 'https://crystallit.oknosoft.ru/'},
}

/**
 * патч зоны по умолчанию
 */
export function patch_prm(settings) {
  return (prm) => {
    settings(prm);
    for (const elm in predefined) {
      if(location.host.match(elm)) {
        'zone,use_ram,ram_indexer'.split(',').forEach((name) => {
          if(predefined[elm].hasOwnProperty(name)) {
            prm[name] = predefined[elm][name];
          }
        });
      }
    }
    return prm;
  };
}

/**
 * патч параметров подключения
 */
export function patch_cnn() {

  const {job_prm, wsql} = $p;

  for (const elm in predefined) {
    const prm = predefined[elm];
    if(location.host.match(elm)) {
      prm.zone && wsql.get_user_param('zone') != prm.zone && wsql.set_user_param('zone', prm.zone);
      'log_level,splash,templates,keys,crazy_ram'.split(',').forEach((name) => {
        if(prm.hasOwnProperty(name)) {
          if(typeof job_prm[name] === 'object') {
            Object.assign(job_prm[name], prm[name]);
          }
          else {
            job_prm[name] = prm[name];
          }
        }
      });
    }
  }
}
