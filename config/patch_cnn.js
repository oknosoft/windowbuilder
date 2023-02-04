
const keys21 = {
  google: '',
  yandex: '283f550e-8184-4c84-b0e3-bdc5c1dee693',
};

/**
 * предопределенные зоны
 */
export const predefined = {
  'develop.ecookna.ru:2111': {
    zone: 11,
    host: 'https://develop.ecookna.ru:2111/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'develop.ecookna.': {
    zone: 10,
    host: 'https://develop.ecookna.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'tg.oknosoft.ru:2310': {
    zone: 10,
    host: 'https://tg.oknosoft.ru:2310/',
    keys: keys21,
    ram_indexer: false,
  },
  'tg.oknosoft.ru:2328': {
    zone: 28,
    host: 'https://tg.oknosoft.ru/',
    keys: keys21,
    ram_indexer: false,
  },
  'tg.oknosoft.ru': {
    zone: 28,
    host: 'https://tg.oknosoft.ru/',
    keys: keys21,
    ram_indexer: false,
  },
  'brusnika.oknosoft.ru:2227': {
    zone: 27,
    host: 'https://brusnika.oknosoft.ru:2227/',
    keys: keys21,
    ram_indexer: false,
  },
  'brusnika.oknosoft.ru:2210': {
    zone: 10,
    host: 'https://brusnika.oknosoft.ru:2210/',
    keys: keys21,
    ram_indexer: false,
  },
  'sandbox1.oknagc.': {
    zone: 21,
    host: 'http://sandbox1.oknagc.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'sandbox2.oknagc.': {
    zone: 21,
    host: 'https://sandbox2.oknagc.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'localhost:3000': {
    zone: 10,
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: {google: ''},
  },
  'localhost:2210': {
    zone: 10,
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: {google: ''},
  },
  'localhost:3030': {
    zone: 23,
    log_level: 'warn',
    keys: {google: ''},
  },
  'rusokon.': {
    zone: 19,
    host: 'https://rusokon.oknosoft.ru/',
    keys: keys21,
  },
  'ecookna.': {
    zone: 21,
    host: 'https://start.ecookna.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'phototech.': {
    zone: 22,
    host: 'https://start.phototech.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'kaleva.': {
    zone: 8,
    host: 'https://start.kaleva.ru/',
    splash: {css: 'splash21', title: false},
    log_level: 'warn',
    keys: keys21,
    ram_indexer: false,
  },
  'aribaz.': {zone: 2, host: 'https://aribaz.oknosoft.ru/'},
  'tmk.': {zone: 23, host: 'https://tmk-online.ru/'},
  'crystallit.': {zone: 25, host: 'https://crystallit.oknosoft.ru/'},
};

/**
 * патч зоны по умолчанию
 */
export function patch_prm(settings) {
  return (prm) => {
    settings(prm);
    for (const elm in predefined) {
      if(location.host.match(elm)) {
        'zone,ram_indexer'.split(',').forEach((name) => {
          if(predefined[elm].hasOwnProperty(name)) {
            prm[name] = predefined[elm][name];
          }
        });
        if(predefined[elm].host && !predefined[elm].host.match(elm)) {
          location.replace(predefined[elm].host);
        }
        break;
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
      'log_level,splash,keys'.split(',').forEach((name) => {
        if(prm.hasOwnProperty(name)) {
          if(typeof job_prm[name] === 'object') {
            Object.assign(job_prm[name], prm[name]);
          }
          else {
            job_prm[name] = prm[name];
          }
        }
      });
      break;
    }
  }

  if(job_prm.use_ram) {
    wsql.set_user_param('use_ram', false);
    job_prm.use_ram = false;
  }
}
