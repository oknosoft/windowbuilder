
import {idbChannel, hasDiff} from './idbChannel';
import {PromisifiedChannel} from './messageChannel';
//import {imitator} from './respondDOC';

const regex = {
  common: /mdm\/\d+\/common/,
  zone: /mdm\/(.*?)\/common/,
  auth: /auth\/(.*?)|couchdb\/wb_\d+_(doc|ram)\/$/,
  delimiter: '/couchdb/mdm/',
  mdm: /couchdb\/mdm\/\d+\/$/,
  doc: /couchdb\/wb_\d+_doc/,
  find: /couchdb\/wb_\d+_doc.*?\/_find/,
  ram: /couchdb\/wb_\d+_ram/,
  templates: /couchdb\/mdm\/\d+\/templates\/.+/,
}

const context = {

  messages: new PromisifiedChannel(event => {
    const {data} = event;
    switch (data.type) {
      case 'useOffline':
      case 'forceOffline':
        context[data.type] = data.value;
        idbChannel.set(data.type, data.value);
        //imitator.init(context);
        break;

      case 'replicate':
        //imitator.replicate();
        break;
    }
  }),

  useOffline: false,  // кешируем и отвечаем при недоступности
  forceOffline: false,// отвечаем из локального кеша вне зависимости от доступности сервера
  stamp: 0,
  manifestTimeout: 60000,

  init() {
    return Promise.resolve(self.addEventListener('fetch', onFetch))
      .then(() => idbChannel.get('useOffline').then(v => {
        if(v) {
          context.useOffline = true;
        }
      }))
      .then(() => idbChannel.get('forceOffline').then(v => {
        if(v) {
          context.useOffline = true;
          context.forceOffline = true;
        }
      }));
  },

  get onLine() {
    return navigator.onLine && !this.forceOffline;
  },

  cyrb128(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return h;
  },

  async postUrl(request) {
    const {url, method} = request;
    if(request.method === 'POST') {
      const cloned = request.clone();
      const body = await cloned.text();
      const hash = this.cyrb128(body);
      return url + `${url.endsWith('/') ? '' : (url.includes('?') ? '&hash=' : '/')}${hash}`;
    }
    return url;
  },

  query(request, url) {
    return fetch(request)
      .then(async (resp) => {
        if(resp.status === 200) {
          await this.cache.put(url, resp.clone());
        }
        return resp;
      });
  },

  /**
   * Запоминает номер зоны
   * @param url
   * @return {string}
   */
  parseZone(url) {
    if(url) {
      const parts = regex.zone.exec(url);
      if(parts.length) {
        this.zone = parts[1];
      }
    }
    //imitator.init(context);
    return this.zone;
  },

  /**
   * Открывает кеш с учётом зоны
   * @return {Promise<context.cache>|Promise<Cache>}
   */
  openCache() {
    const {cache, zone} = this;
    return cache ? Promise.resolve(cache) :
      caches.open(`mdm-${zone}`).then(cache => this.cache = cache);
  },

  /**
   * Обновляет манифест образа данных
   * @return {Promise<T>}
   */
  refreshManifest() {
    const {slice, stamp, zone, manifestTimeout, onLine } = this;
    return this.openCache()
      .then(cache => {
        if(slice && Date.now() - stamp < manifestTimeout) {
          return Promise.resolve(this.slice);
        }

        const manifestURL = `/couchdb/mdm/${zone}/manifest`;
        if(onLine) {
          return fetch(`/couchdb/mdm/${zone}/common`, {method: 'HEAD'})
            .then((res) => {
              const {status, statusText} = res;
              if(status === 200) {
                return cache.put(manifestURL, res.clone()).then(() => res);
              }
              return res.text()
                .catch((err) => err)
                .then(body => {
                  const err = new Error(res.statusText || body || 'Network');
                  throw err;
                });
            });
        }
        return this.cache.match(manifestURL);
      })
      .then(res => {
        if(res instanceof Response) {
          this.stamp = Date.now();
          this.slice = JSON.parse(res.headers.get('manifest'));
          this.messages.postMessage({type: 'manifest', value: this.slice});
          return this.slice;
        }
        return res;
      });
  },

  respondMDM(event) {
    const {request} = event;
    const url = new URL(request.url);
    const key = url.pathname.split(regex.delimiter)[1];
    event.respondWith(this.refreshManifest()
      .then(() => this.cache.match(request, {ignoreVary: true}))
      .then((resp) => {
        if(resp) {
          const raw = resp.headers.get('manifest');
          if(raw) {
            const currentSlice = JSON.parse(raw);
            const {slice, onLine} = this;

            if(key.includes('common')) {
              if(onLine || !hasDiff(slice.common, currentSlice.common)) {
                return {resp, cached: true};
              }
            }
            else {
              const type = url.search.split('=')[1];
              const id = type && (this.ids[type] || type);
              if(id && slice[id] && !hasDiff(slice[id], currentSlice[id])) {
                return {resp, cached: true};
              }
              else if(currentSlice?.other && !hasDiff(slice.other, currentSlice.other)) {
                return {resp, cached: true};
              }
            }
          }
        }
        return fetch(request)
          .then((resp) => ({resp, cached: false}));
      })
      .then(({resp, cached}) => {
        return cached ? resp : this.cache.put(request, resp.clone()).then(() => resp);
      })
      .catch((err) => {
        throw err;
      })
    );
  },

  respondDefault(event) {
    const {request} = event;
    event.respondWith(
      this.openCache()
      .then(() => this.postUrl(request))
      .then((url) => {
        if(this.onLine) {
          // освежаем кеш
          return this.query(request, url);
        }
        else {
          // ищем в кеше и делаем запрос, если не нашли и сеть доступна
          return this.cache.match(url).then((resp) => {
            if(resp) {
              return resp;
            }
            else if(navigator.onLine) {
              return this.query(request, url);
            }
          })
        }
      })
    );
  },


};
context.init();

function onFetch(event) {
  if(context.useOffline) {
    const {url} = event.request;
    if(regex.common.test(url)) {
      context.parseZone(url);
      context.respondMDM(event);
    }
    else if(regex.auth.test(url) || regex.ram.test(url) || regex.templates.test(url)) {
      context.respondDefault(event);
    }
    else if(regex.mdm.test(url)) {
      context.respondMDM(event);
    }
    else if(regex.doc.test(url)) {
      //imitator.respond(event);
    }
  }
}



