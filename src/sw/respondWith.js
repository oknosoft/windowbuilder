
import {idbChannel, hasDiff} from './idbChannel';
import {PromisifiedChannel} from './messageChannel';

const regex = {
  common: /mdm\/\d+\/common/,
  zone: /mdm\/(.*?)\/common/,
  delimiter: '/couchdb/mdm/'
}

const context = {

  messages: new PromisifiedChannel(event => {
    const {data} = event;
    if(data.type === 'useOffline') {
      context.useOffline = data.value;
      idbChannel.set('useOffline', {value: data.value});
    }
  }),

  useOffline: false,
  stamp: 0,
  manifestTimeout: 60000,

  init() {
    idbChannel.get('useOffline').then(v => {
      if(v?.value) {
        context.useOffline = true;
      }
    });

    self.addEventListener('fetch', onFetch);
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
    const {slice, stamp, zone, manifestTimeout} = this;
    return this.openCache()
      .then(cache => {
        if(slice && Date.now() - stamp < manifestTimeout) {
          return Promise.resolve(this.slice);
        }

        const manifestURL = `/couchdb/mdm/${zone}/manifest`;
        if(navigator.onLine) {
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

  respond(event) {
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
            const {slice} = this;

            if(key.includes('common')) {
              if(!navigator.onLine || !hasDiff(slice.common, currentSlice.common)) {
                return {resp, cached: true};
              }
            }
            else {
              const type = url.search.split('=')[1];
              const id = type && (this.ids[type] || type);
              if(id && slice[id] && slice[id][0] === currentSlice[id]?.[0]) {
                return {resp, cached: true};
              }
              else if(currentSlice?.other && slice.other[0] === currentSlice.other[0]) {
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

};
context.init();

function onFetch(event) {
  if(context.useOffline) {
    const {url} = event.request;
    if(regex.common.test(url)) {
      context.parseZone(url);
      context.respond(event);
    }
  }
}



